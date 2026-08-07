from uuid import uuid4

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token

from ..core.config import settings
from ..core.db import get_pool
from ..core.security import create_access_token, hash_password, verify_password
from ..schemas import AuthResponse, GoogleAuthRequest, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


def normalize_email(email: str) -> str:
    return email.strip().lower()


def generate_profile_id() -> str:
    return f"user-{uuid4().hex[:16]}"


def configured_google_client_ids() -> set[str]:
    raw = settings.google_client_ids.strip()
    if not raw:
        return set()
    return {item.strip() for item in raw.split(",") if item.strip()}


async def ensure_auth_schema(pool: asyncpg.Pool) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bloom_users (
                profile_id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT,
                google_sub TEXT UNIQUE,
                display_name TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )


@router.post("/register", response_model=AuthResponse)
async def register_with_email(
    body: RegisterRequest,
    pool: asyncpg.Pool = Depends(get_pool),
) -> AuthResponse:
    await ensure_auth_schema(pool)

    email = normalize_email(body.email)
    password = body.password

    if len(password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 chars")

    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")

    profile_id = generate_profile_id()
    display_name = (body.display_name or "").strip() or None

    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT profile_id FROM bloom_users WHERE email = $1;",
            email,
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        await conn.execute(
            """
            INSERT INTO bloom_users (profile_id, email, password_hash, display_name, role, updated_at)
            VALUES ($1, $2, $3, $4, 'user', NOW());
            """,
            profile_id,
            email,
            hash_password(password),
            display_name,
        )

    token = create_access_token(sub=profile_id, role="user")
    return AuthResponse(
        access_token=token,
        profile_id=profile_id,
        email=email,
        display_name=display_name,
    )


@router.post("/login", response_model=AuthResponse)
async def login_with_email(
    body: LoginRequest,
    pool: asyncpg.Pool = Depends(get_pool),
) -> AuthResponse:
    await ensure_auth_schema(pool)

    email = normalize_email(body.email)

    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            """
            SELECT profile_id, email, password_hash, display_name, role
            FROM bloom_users
            WHERE email = $1;
            """,
            email,
        )

    if user is None or user["password_hash"] is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(body.password, str(user["password_hash"])):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    role = str(user["role"] or "user")
    token = create_access_token(sub=str(user["profile_id"]), role=role)
    return AuthResponse(
        access_token=token,
        profile_id=str(user["profile_id"]),
        email=str(user["email"]),
        display_name=str(user["display_name"]) if user["display_name"] is not None else None,
    )


@router.post("/google", response_model=AuthResponse)
async def login_with_google(
    body: GoogleAuthRequest,
    pool: asyncpg.Pool = Depends(get_pool),
) -> AuthResponse:
    await ensure_auth_schema(pool)

    audiences = configured_google_client_ids()
    if not audiences:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google auth is not configured",
        )

    try:
        payload = google_id_token.verify_oauth2_token(
            body.id_token,
            GoogleRequest(),
            audience=list(audiences),
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token") from exc

    google_sub = str(payload.get("sub") or "")
    email = normalize_email(str(payload.get("email") or ""))
    display_name = str(payload.get("name") or "").strip() or None

    if not google_sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token missing sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token missing email")

    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            """
            SELECT profile_id, email, display_name, role, google_sub
            FROM bloom_users
            WHERE google_sub = $1 OR email = $2
            ORDER BY CASE WHEN google_sub = $1 THEN 0 ELSE 1 END
            LIMIT 1;
            """,
            google_sub,
            email,
        )

        if user is None:
            profile_id = generate_profile_id()
            role = "user"
            await conn.execute(
                """
                INSERT INTO bloom_users (profile_id, email, password_hash, google_sub, display_name, role, updated_at)
                VALUES ($1, $2, NULL, $3, $4, $5, NOW());
                """,
                profile_id,
                email,
                google_sub,
                display_name,
                role,
            )
            selected_name = display_name
        else:
            profile_id = str(user["profile_id"])
            role = str(user["role"] or "user")
            selected_name = str(user["display_name"]) if user["display_name"] is not None else display_name

            await conn.execute(
                """
                UPDATE bloom_users
                SET google_sub = COALESCE(google_sub, $2),
                    display_name = COALESCE(display_name, $3),
                    updated_at = NOW()
                WHERE profile_id = $1;
                """,
                profile_id,
                google_sub,
                display_name,
            )

    token = create_access_token(sub=profile_id, role=role)
    return AuthResponse(
        access_token=token,
        profile_id=profile_id,
        email=email,
        display_name=selected_name,
    )
