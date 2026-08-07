# Bloom FastAPI Microservice

## Features

- Account auth: POST /auth/register, POST /auth/login, POST /auth/google.
- Secure POST /sync with RBAC and queue merge into PostgreSQL.
- Encrypted storage for journal notes and mood fields.
- AI personalization endpoint at POST /ai/personalize.
- Centralized mobile dashboard endpoint at GET /dashboard.

## Environment

Create .env in services/bloom_api:

DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=change_me
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=43200
ENCRYPTION_KEY=<fernet_key>
GOOGLE_CLIENT_IDS=<comma-separated-google-client-ids>

You can generate ENCRYPTION_KEY with:
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

## Run

1. cd services/bloom_api
2. pip install -r requirements.txt
3. uvicorn app.main:app --reload --port 8010

## Production SQL Migration

Apply the dedicated migration script:

1. psql "$DATABASE_URL" -f sql/001_init_production.sql

This script adds hardened constraints and indexes for production load.

## Authentication

Use Authorization: Bearer <jwt>
Required claim payload:
- sub: profile id
- role: user | service | admin

Auth endpoints:
- POST /auth/register (email/password)
- POST /auth/login (email/password)
- POST /auth/google (Google id_token)

## RBAC

- POST /sync requires role user, service, or admin.
- GET /sync/validations/{habit_id} requires role user, service, or admin and returns decrypted payloads.
- POST /ai/personalize requires role user, service, or admin.
- GET /dashboard supports JWT in production and can fallback in dev via DASHBOARD_DEV_FALLBACK=true.

## Confidential Data

- Journal notes and mood are encrypted at write-time into note_journal_enc and humeur_enc.
- Decryption is performed only in protected endpoints using the CryptoService middleware context.
