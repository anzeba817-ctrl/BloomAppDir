BEGIN;

-- Core habits table with strong integrity and profile isolation.
CREATE TABLE IF NOT EXISTS bloom_habitudes (
    profile_id TEXT NOT NULL,
    id TEXT NOT NULL,
    titre TEXT NOT NULL CHECK (length(trim(titre)) > 0),
    type TEXT NOT NULL CHECK (type IN ('build', 'quit')),
    cadence TEXT NOT NULL CHECK (length(trim(cadence)) > 0),
    date_creation TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (profile_id, id)
);

-- Validations with encrypted private fields.
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
    CONSTRAINT fk_validation_habitude
        FOREIGN KEY (profile_id, habitude_id)
        REFERENCES bloom_habitudes(profile_id, id)
        ON DELETE CASCADE,
    CONSTRAINT uq_validation_logical_day UNIQUE (profile_id, habitude_id, date_logique)
);

-- Closed dual-currency wallet.
CREATE TABLE IF NOT EXISTS bloom_solde_monnaie (
    profile_id TEXT PRIMARY KEY,
    petales NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (petales >= 0),
    cristaux INTEGER NOT NULL DEFAULT 0 CHECK (cristaux >= 0 AND cristaux <= 3),
    pending_bg_petales NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (pending_bg_petales >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shield state, one active shield at most.
CREATE TABLE IF NOT EXISTS bloom_shield (
    profile_id TEXT PRIMARY KEY,
    active_until_utc TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Useful indexes for mobile dashboard and sync merge patterns.
CREATE INDEX IF NOT EXISTS idx_habitudes_profile_updated
    ON bloom_habitudes(profile_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_validations_profile_habit_date
    ON bloom_validations(profile_id, habitude_id, date_logique DESC);

CREATE INDEX IF NOT EXISTS idx_validations_profile_timestamp
    ON bloom_validations(profile_id, timestamp_utc DESC);

CREATE INDEX IF NOT EXISTS idx_shield_active_until
    ON bloom_shield(active_until_utc);

COMMIT;
