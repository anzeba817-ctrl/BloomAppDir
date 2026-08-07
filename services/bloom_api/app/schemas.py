from typing import Literal

from pydantic import BaseModel, Field


class HabitUpsertPayload(BaseModel):
    id: str
    titre: str
    type: Literal["build", "quit"]
    cadence: str
    date_creation: str


class ValidationCreatePayload(BaseModel):
    id: str
    habitude_id: str
    timestamp_utc: str
    date_logique: str
    note_journal: str | None = None
    humeur: str | None = None


class CurrencyPayload(BaseModel):
    petales: float
    cristaux: int
    pending_bg_petales: float | None = 0


class ShieldPayload(BaseModel):
    active_until_utc: str | None


class SyncOperation(BaseModel):
    id: str
    type: Literal["habit-upsert-v2", "validation-create", "currency-upsert", "shield-activate"]
    payload: dict
    createdAtUtc: str


class SyncSnapshot(BaseModel):
    currency: CurrencyPayload | None = None


class SyncRequest(BaseModel):
    profileId: str | None = None
    syncStrategy: str = Field(default="client-local-truth")
    snapshot: SyncSnapshot | None = None
    ops: list[SyncOperation]


class SyncOperationResult(BaseModel):
    id: str
    ok: bool
    error: str | None = None


class SyncResponse(BaseModel):
    ok: bool
    profileId: str
    processed: int
    failed: int
    results: list[SyncOperationResult]


class PersonalizedQuoteRequest(BaseModel):
    profile_id: str
    active_streak: int = 0
    mood: str | None = None


class PersonalizedQuoteResponse(BaseModel):
    quote: str
    tone: str
    strategy: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile_id: str
    email: str
    display_name: str | None = None
