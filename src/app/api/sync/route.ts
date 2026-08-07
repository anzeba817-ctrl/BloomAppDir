import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../server/postgres";
import type { PoolClient } from "pg";

export const runtime = "nodejs";

type HabitUpsertV2Payload = {
  id: string;
  titre: string;
  type: "build" | "quit";
  cadence: string;
  date_creation: string;
};

type ValidationCreatePayload = {
  id: string;
  habitude_id: string;
  timestamp_utc: string;
  date_logique: string;
  note_journal?: string | null;
  humeur?: string | null;
};

type CurrencyPayload = {
  petales: number;
  cristaux: number;
};

type PendingOp = {
  id: string;
  type: "habit-upsert-v2" | "validation-create" | "currency-upsert";
  payload: HabitUpsertV2Payload | ValidationCreatePayload | CurrencyPayload;
  createdAtUtc: string;
};

type SyncSnapshot = {
  habits?: HabitUpsertV2Payload[];
  validations?: ValidationCreatePayload[];
  currency?: CurrencyPayload;
};

let schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (schemaReady) return;

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS bloom_habitudes (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        titre TEXT NOT NULL,
        type TEXT NOT NULL,
        cadence TEXT NOT NULL,
        date_creation TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bloom_validations (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        habitude_id TEXT NOT NULL,
        timestamp_utc TIMESTAMPTZ NOT NULL,
        date_logique DATE NOT NULL,
        note_journal TEXT,
        humeur TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (profile_id, habitude_id, date_logique)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bloom_solde_monnaie (
        profile_id TEXT PRIMARY KEY,
        petales INTEGER NOT NULL DEFAULT 0,
        cristaux INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bloom_validations_profile_habit
      ON bloom_validations(profile_id, habitude_id);
    `);

    schemaReady = true;
  } finally {
    client.release();
  }
}

function normalizeOps(body: unknown): PendingOp[] {
  if (!body || typeof body !== "object") return [];
  const maybe = body as {
    ops?: unknown;
    type?: unknown;
    payload?: unknown;
    id?: unknown;
    createdAtUtc?: unknown;
  };

  if (Array.isArray(maybe.ops)) {
    return maybe.ops as PendingOp[];
  }

  if (typeof maybe.type === "string" && maybe.payload) {
    return [
      {
        id: typeof maybe.id === "string" ? maybe.id : crypto.randomUUID(),
        type: maybe.type as PendingOp["type"],
        payload: maybe.payload as PendingOp["payload"],
        createdAtUtc:
          typeof maybe.createdAtUtc === "string"
            ? maybe.createdAtUtc
            : new Date().toISOString(),
      },
    ];
  }

  return [];
}

async function upsertHabit(
  client: PoolClient,
  profileId: string,
  payload: HabitUpsertV2Payload
): Promise<void> {
  await client.query(
    `
      INSERT INTO bloom_habitudes (
        id, profile_id, titre, type, cadence, date_creation, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE
      SET
        profile_id = EXCLUDED.profile_id,
        titre = EXCLUDED.titre,
        type = EXCLUDED.type,
        cadence = EXCLUDED.cadence,
        date_creation = EXCLUDED.date_creation,
        updated_at = NOW();
    `,
    [
      payload.id,
      profileId,
      payload.titre,
      payload.type,
      payload.cadence,
      payload.date_creation,
    ]
  );
}

async function upsertValidation(
  client: PoolClient,
  profileId: string,
  payload: ValidationCreatePayload
): Promise<void> {
  await client.query(
    `
      INSERT INTO bloom_validations (
        id, profile_id, habitude_id, timestamp_utc, date_logique, note_journal, humeur
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (profile_id, habitude_id, date_logique)
      DO UPDATE
      SET
        id = EXCLUDED.id,
        timestamp_utc = EXCLUDED.timestamp_utc,
        note_journal = EXCLUDED.note_journal,
        humeur = EXCLUDED.humeur;
    `,
    [
      payload.id,
      profileId,
      payload.habitude_id,
      payload.timestamp_utc,
      payload.date_logique,
      payload.note_journal ?? null,
      payload.humeur ?? null,
    ]
  );
}

async function upsertCurrency(
  client: PoolClient,
  profileId: string,
  payload: CurrencyPayload
): Promise<void> {
  await client.query(
    `
      INSERT INTO bloom_solde_monnaie (profile_id, petales, cristaux, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (profile_id)
      DO UPDATE
      SET
        petales = EXCLUDED.petales,
        cristaux = EXCLUDED.cristaux,
        updated_at = NOW();
    `,
    [profileId, payload.petales, payload.cristaux]
  );
}

async function applySnapshot(
  client: PoolClient,
  profileId: string,
  snapshot: SyncSnapshot | undefined
): Promise<void> {
  if (!snapshot) return;

  // Client-local-truth: server reconciles up from the full local snapshot and fills gaps.
  if (Array.isArray(snapshot.habits)) {
    for (const habit of snapshot.habits) {
      await upsertHabit(client, profileId, habit);
    }
  }

  if (Array.isArray(snapshot.validations)) {
    for (const validation of snapshot.validations) {
      await upsertValidation(client, profileId, validation);
    }
  }

  if (snapshot.currency) {
    await upsertCurrency(client, profileId, snapshot.currency);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();

    const body = (await request.json().catch(() => ({}))) as {
      profileId?: unknown;
      snapshot?: SyncSnapshot;
      syncStrategy?: unknown;
    };

    const ops = normalizeOps(body);
    const profileId =
      request.headers.get("x-profile-id") ||
      (typeof body.profileId === "string" ? body.profileId : "local-user");

    if (ops.length === 0 && !body.snapshot) {
      return NextResponse.json(
        { ok: false, error: "No sync operations provided." },
        { status: 400 }
      );
    }

    const pool = getPool();
    const client = await pool.connect();
    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    try {
      await client.query("BEGIN");

      await applySnapshot(client, profileId, body.snapshot);

      for (const op of ops) {
        try {
          if (op.type === "habit-upsert-v2") {
            await upsertHabit(client, profileId, op.payload as HabitUpsertV2Payload);
          } else if (op.type === "validation-create") {
            await upsertValidation(client, profileId, op.payload as ValidationCreatePayload);
          } else if (op.type === "currency-upsert") {
            await upsertCurrency(client, profileId, op.payload as CurrencyPayload);
          } else {
            throw new Error(`Unsupported op type: ${String(op.type)}`);
          }

          results.push({ id: op.id, ok: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown sync error";
          results.push({ id: op.id, ok: false, error: message });
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const failed = results.filter((r) => !r.ok);

    return NextResponse.json({
      ok: failed.length === 0,
      profileId,
      syncStrategy:
        typeof body.syncStrategy === "string" ? body.syncStrategy : "client-local-truth",
      processed: results.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync route failed";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: "Set DATABASE_URL (or POSTGRES_URL) to enable remote sync.",
      },
      { status: 500 }
    );
  }
}
