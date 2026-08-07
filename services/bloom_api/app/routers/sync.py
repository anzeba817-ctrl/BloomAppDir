from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request

from ..core.crypto import CryptoService
from ..core.db import get_pool
from ..core.security import UserContext, require_roles
from ..schemas import (
    CurrencyPayload,
    HabitUpsertPayload,
    ShieldPayload,
    SyncOperation,
    SyncOperationResult,
    SyncRequest,
    SyncResponse,
    ValidationCreatePayload,
)

router = APIRouter(prefix="/sync", tags=["sync"])


async def ensure_schema(pool: asyncpg.Pool) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bloom_habitudes (
                profile_id TEXT NOT NULL,
                id TEXT NOT NULL,
                titre TEXT NOT NULL,
                type TEXT NOT NULL,
                cadence TEXT NOT NULL,
                date_creation TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (profile_id, id)
            );

            CREATE TABLE IF NOT EXISTS bloom_validations (
                profile_id TEXT NOT NULL,
                id TEXT NOT NULL,
                habitude_id TEXT NOT NULL,
                timestamp_utc TIMESTAMPTZ NOT NULL,
                date_logique DATE NOT NULL,
                note_journal_enc TEXT,
                humeur_enc TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (profile_id, id),
                UNIQUE (profile_id, habitude_id, date_logique)
            );

            CREATE TABLE IF NOT EXISTS bloom_solde_monnaie (
                profile_id TEXT PRIMARY KEY,
                petales NUMERIC NOT NULL DEFAULT 0,
                cristaux INTEGER NOT NULL DEFAULT 0,
                pending_bg_petales NUMERIC NOT NULL DEFAULT 0,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS bloom_shield (
                profile_id TEXT PRIMARY KEY,
                active_until_utc TIMESTAMPTZ,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )


async def apply_snapshot(
    conn: asyncpg.Connection,
    profile_id: str,
    snapshot_currency: CurrencyPayload | None,
) -> None:
    if snapshot_currency is None:
        return

    await conn.execute(
        """
        INSERT INTO bloom_solde_monnaie (profile_id, petales, cristaux, pending_bg_petales, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (profile_id)
        DO UPDATE SET
            petales = EXCLUDED.petales,
            cristaux = EXCLUDED.cristaux,
            pending_bg_petales = EXCLUDED.pending_bg_petales,
            updated_at = NOW();
        """,
        profile_id,
        snapshot_currency.petales,
        snapshot_currency.cristaux,
        snapshot_currency.pending_bg_petales or 0,
    )


async def apply_operation(
    conn: asyncpg.Connection,
    operation: SyncOperation,
    profile_id: str,
    crypto: CryptoService,
) -> None:
    if operation.type == "habit-upsert-v2":
        payload = HabitUpsertPayload.model_validate(operation.payload)
        await conn.execute(
            """
            INSERT INTO bloom_habitudes (
                id, profile_id, titre, type, cadence, date_creation, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (profile_id, id)
            DO UPDATE SET
                profile_id = EXCLUDED.profile_id,
                titre = EXCLUDED.titre,
                type = EXCLUDED.type,
                cadence = EXCLUDED.cadence,
                date_creation = EXCLUDED.date_creation,
                updated_at = NOW();
            """,
            payload.id,
            profile_id,
            payload.titre,
            payload.type,
            payload.cadence,
            payload.date_creation,
        )
        return

    if operation.type == "validation-create":
        payload = ValidationCreatePayload.model_validate(operation.payload)
        await conn.execute(
            """
            INSERT INTO bloom_validations (
                id, profile_id, habitude_id, timestamp_utc, date_logique, note_journal_enc, humeur_enc
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (profile_id, habitude_id, date_logique)
            DO UPDATE SET
                id = EXCLUDED.id,
                timestamp_utc = EXCLUDED.timestamp_utc,
                note_journal_enc = EXCLUDED.note_journal_enc,
                humeur_enc = EXCLUDED.humeur_enc;
            """,
            payload.id,
            profile_id,
            payload.habitude_id,
            payload.timestamp_utc,
            payload.date_logique,
            crypto.encrypt(payload.note_journal),
            crypto.encrypt(payload.humeur),
        )
        return

    if operation.type == "currency-upsert":
        payload = CurrencyPayload.model_validate(operation.payload)
        await conn.execute(
            """
            INSERT INTO bloom_solde_monnaie (
                profile_id, petales, cristaux, pending_bg_petales, updated_at
            )
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (profile_id)
            DO UPDATE SET
                petales = EXCLUDED.petales,
                cristaux = EXCLUDED.cristaux,
                pending_bg_petales = EXCLUDED.pending_bg_petales,
                updated_at = NOW();
            """,
            profile_id,
            payload.petales,
            payload.cristaux,
            payload.pending_bg_petales or 0,
        )
        return

    if operation.type == "shield-activate":
        payload = ShieldPayload.model_validate(operation.payload)
        await conn.execute(
            """
            INSERT INTO bloom_shield (profile_id, active_until_utc, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (profile_id)
            DO UPDATE SET
                active_until_utc = EXCLUDED.active_until_utc,
                updated_at = NOW();
            """,
            profile_id,
            payload.active_until_utc,
        )
        return

    raise HTTPException(status_code=400, detail=f"Unsupported operation type: {operation.type}")


@router.post("", response_model=SyncResponse)
async def sync_queue(
    body: SyncRequest,
    request: Request,
    user: Annotated[UserContext, Depends(require_roles("user", "service", "admin"))],
    pool: Annotated[asyncpg.Pool, Depends(get_pool)],
) -> SyncResponse:
    await ensure_schema(pool)

    crypto: CryptoService = request.state.crypto
    if user.role in {"admin", "service"} and body.profileId:
        profile_id = body.profileId
    else:
        profile_id = user.sub

    results: list[SyncOperationResult] = []

    async with pool.acquire() as conn:
        async with conn.transaction():
            await apply_snapshot(conn, profile_id, body.snapshot.currency if body.snapshot else None)

            for operation in body.ops:
                try:
                    await apply_operation(conn, operation, profile_id, crypto)
                    results.append(SyncOperationResult(id=operation.id, ok=True))
                except Exception as exc:  # noqa: BLE001
                    results.append(SyncOperationResult(id=operation.id, ok=False, error=str(exc)))

    failed = [result for result in results if not result.ok]

    return SyncResponse(
        ok=len(failed) == 0,
        profileId=profile_id,
        processed=len(results),
        failed=len(failed),
        results=results,
    )


@router.get("/validations/{habit_id}")
async def read_validations(
    habit_id: str,
    request: Request,
    user: Annotated[UserContext, Depends(require_roles("user", "service", "admin"))],
    pool: Annotated[asyncpg.Pool, Depends(get_pool)],
    limit: int = 20,
) -> dict[str, object]:
    crypto: CryptoService = request.state.crypto

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, timestamp_utc::text AS timestamp_utc, date_logique::text AS date_logique,
                   note_journal_enc, humeur_enc
            FROM bloom_validations
            WHERE profile_id = $1 AND habitude_id = $2
            ORDER BY timestamp_utc DESC
            LIMIT $3;
            """,
            user.sub,
            habit_id,
            max(1, min(limit, 200)),
        )

    data = [
        {
            "id": row["id"],
            "timestamp_utc": row["timestamp_utc"],
            "date_logique": row["date_logique"],
            "note_journal": crypto.decrypt(row["note_journal_enc"]),
            "humeur": crypto.decrypt(row["humeur_enc"]),
        }
        for row in rows
    ]

    return {"habit_id": habit_id, "count": len(data), "validations": data}
