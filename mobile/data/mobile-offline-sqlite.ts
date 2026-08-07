import * as SQLite from "expo-sqlite";
import {
  activateBloomShield,
  BloomPlan,
  createInitialRewardCounters,
  createInitialWallet,
  isShieldActive,
  rewardAction,
  RewardCounters,
  ShieldState,
  WalletState,
} from "../domain/currency-engine";
import { isMilestone } from "../navigation/logic";

type QueueOp = {
  id: string;
  type: "habit-upsert-v2" | "validation-create" | "currency-upsert" | "shield-activate";
  payload: unknown;
  createdAtUtc: string;
};

type WalletRow = {
  ordinary_petales: number;
  crystal_petales: number;
  pending_bg_petales: number;
  plan: string;
};

type RewardLimitsRow = {
  journal_day_key: string | null;
  social_week_key: string | null;
  video_day_key: string | null;
  video_day_count: number;
};

type QueueRow = {
  id: string;
  action_type: string;
  payload: string;
  timestamp_utc: string;
};

const DB_NAME = "bloom-mobile-offline.db";
const dbPromise = SQLite.openDatabaseAsync(DB_NAME);

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getLogicalDayFromUtc(timestampUtc: string, cutoffHour = 3): string {
  const localDate = new Date(timestampUtc);
  const shifted = new Date(localDate);
  if (shifted.getHours() < cutoffHour) {
    shifted.setDate(shifted.getDate() - 1);
  }
  return toDayKey(shifted);
}

export async function hasHabitValidatedForLogicalDay(
  habitId: string,
  timestampUtc = new Date().toISOString()
): Promise<boolean> {
  const db = await dbPromise;
  const logicalDay = getLogicalDayFromUtc(timestampUtc);
  const row = (await db.getFirstAsync(
    `
      SELECT COUNT(*) AS c
      FROM habit_checkins
      WHERE habit_id = ? AND logical_day = ?;
    `,
    [habitId, logicalDay]
  )) as { c: number } | null;
  return Number(row?.c ?? 0) > 0;
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function initMobileOfflineStore(): Promise<void> {
  const db = await dbPromise;

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp_utc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallet_state (
      singleton_id INTEGER PRIMARY KEY CHECK(singleton_id = 1),
      ordinary_petales REAL NOT NULL DEFAULT 0,
      crystal_petales INTEGER NOT NULL DEFAULT 0,
      pending_bg_petales REAL NOT NULL DEFAULT 0,
      plan TEXT NOT NULL DEFAULT 'free'
    );

    CREATE TABLE IF NOT EXISTS reward_limits (
      singleton_id INTEGER PRIMARY KEY CHECK(singleton_id = 1),
      journal_day_key TEXT,
      social_week_key TEXT,
      video_day_key TEXT,
      video_day_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS shield_state (
      singleton_id INTEGER PRIMARY KEY CHECK(singleton_id = 1),
      active_until_utc TEXT
    );

    CREATE TABLE IF NOT EXISTS habit_checkins (
      habit_id TEXT NOT NULL,
      logical_day TEXT NOT NULL,
      timestamp_utc TEXT NOT NULL,
      mood TEXT,
      note TEXT,
      PRIMARY KEY (habit_id, logical_day)
    );

    INSERT OR IGNORE INTO wallet_state (singleton_id, ordinary_petales, crystal_petales, pending_bg_petales, plan)
    VALUES (1, 0, 0, 0, 'free');

    INSERT OR IGNORE INTO reward_limits (singleton_id, video_day_count)
    VALUES (1, 0);

    INSERT OR IGNORE INTO shield_state (singleton_id, active_until_utc)
    VALUES (1, NULL);
  `);
}

async function putOp(op: QueueOp): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    `
      INSERT OR REPLACE INTO sync_queue (id, action_type, payload, timestamp_utc)
      VALUES (?, ?, ?, ?);
    `,
    [op.id, op.type, JSON.stringify(op.payload), op.createdAtUtc]
  );
}

export async function readWalletState(): Promise<WalletState & { plan: BloomPlan }> {
  const db = await dbPromise;
  const row = (await db.getFirstAsync(
    `
      SELECT ordinary_petales, crystal_petales, pending_bg_petales, plan
      FROM wallet_state
      WHERE singleton_id = 1;
    `
  )) as WalletRow | null;

  if (!row) {
    return { ...createInitialWallet(), plan: "free" };
  }

  return {
    ordinaryPetales: Number(row.ordinary_petales ?? 0),
    crystalPetales: Number(row.crystal_petales ?? 0),
    pendingBackgroundPetales: Number(row.pending_bg_petales ?? 0),
    plan: row.plan === "bloom-forever" ? "bloom-forever" : "free",
  };
}

async function writeWalletState(wallet: WalletState, plan: BloomPlan): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    `
      UPDATE wallet_state
      SET ordinary_petales = ?, crystal_petales = ?, pending_bg_petales = ?, plan = ?
      WHERE singleton_id = 1;
    `,
    [wallet.ordinaryPetales, wallet.crystalPetales, wallet.pendingBackgroundPetales, plan]
  );
}

async function readRewardCounters(): Promise<RewardCounters> {
  const db = await dbPromise;
  const row = (await db.getFirstAsync(
    `
      SELECT journal_day_key, social_week_key, video_day_key, video_day_count
      FROM reward_limits
      WHERE singleton_id = 1;
    `
  )) as RewardLimitsRow | null;

  if (!row) return createInitialRewardCounters();

  return {
    journalDayKey: row.journal_day_key,
    socialWeekKey: row.social_week_key,
    videoDayKey: row.video_day_key,
    videoDayCount: Number(row.video_day_count ?? 0),
  };
}

async function writeRewardCounters(counters: RewardCounters): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    `
      UPDATE reward_limits
      SET journal_day_key = ?, social_week_key = ?, video_day_key = ?, video_day_count = ?
      WHERE singleton_id = 1;
    `,
    [counters.journalDayKey, counters.socialWeekKey, counters.videoDayKey, counters.videoDayCount]
  );
}

async function readShieldState(): Promise<ShieldState> {
  const db = await dbPromise;
  const row = (await db.getFirstAsync(
    `SELECT active_until_utc FROM shield_state WHERE singleton_id = 1;`
  )) as { active_until_utc: string | null } | null;
  return { activeUntilUtc: row?.active_until_utc ?? null };
}

async function writeShieldState(shield: ShieldState): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    `UPDATE shield_state SET active_until_utc = ? WHERE singleton_id = 1;`,
    [shield.activeUntilUtc]
  );
}

async function queueCurrencySync(wallet: WalletState): Promise<void> {
  await putOp({
    id: `currency-${uuid()}`,
    type: "currency-upsert",
    payload: {
      petales: wallet.ordinaryPetales,
      cristaux: wallet.crystalPetales,
      pending_bg_petales: wallet.pendingBackgroundPetales,
    },
    createdAtUtc: new Date().toISOString(),
  });
}

async function rewardAndQueue(action: Parameters<typeof rewardAction>[0]["action"], plan: BloomPlan): Promise<void> {
  const now = new Date();
  const dayKey = toDayKey(now);
  const weekKey = toWeekKey(now);

  const walletData = await readWalletState();
  const counters = await readRewardCounters();

  const result = rewardAction({
    action,
    dayKey,
    weekKey,
    plan,
    wallet: {
      ordinaryPetales: walletData.ordinaryPetales,
      crystalPetales: walletData.crystalPetales,
      pendingBackgroundPetales: walletData.pendingBackgroundPetales,
    },
    counters,
  });

  if (!result.accepted) return;

  await writeWalletState(result.wallet, plan);
  await writeRewardCounters(result.counters);
  await queueCurrencySync(result.wallet);
}

export async function setBloomPlan(plan: BloomPlan): Promise<void> {
  const wallet = await readWalletState();
  await writeWalletState(
    {
      ordinaryPetales: wallet.ordinaryPetales,
      crystalPetales: wallet.crystalPetales,
      pendingBackgroundPetales: wallet.pendingBackgroundPetales,
    },
    plan
  );
}

export async function queueMobileCheckIn(params: {
  profileId: string;
  habitId: string;
  mood?: string;
  note?: string;
  newStreak: number;
}): Promise<void> {
  const nowUtc = new Date().toISOString();
  const logicalDay = getLogicalDayFromUtc(nowUtc);

  const shield = await readShieldState();
  if (isShieldActive(shield, nowUtc)) {
    return;
  }

  const db = await dbPromise;
  await db.runAsync(
    `
      INSERT OR IGNORE INTO habit_checkins (habit_id, logical_day, timestamp_utc, mood, note)
      VALUES (?, ?, ?, ?, ?);
    `,
    [params.habitId, logicalDay, nowUtc, params.mood ?? null, params.note ?? null]
  );

  await putOp({
    id: `${params.habitId}:${logicalDay}`,
    type: "validation-create",
    payload: {
      id: `${params.habitId}:${logicalDay}`,
      habitude_id: params.habitId,
      timestamp_utc: nowUtc,
      date_logique: logicalDay,
      note_journal: params.note ?? null,
      humeur: params.mood ?? null,
    },
    createdAtUtc: nowUtc,
  });

  const walletData = await readWalletState();
  const plan = walletData.plan;

  await rewardAndQueue("checkin", plan);

  if (isMilestone(params.newStreak)) {
    await rewardAndQueue(params.newStreak === 30 ? "milestone-30" : "milestone-7", plan);
  }
}

export async function rewardJournalNote(): Promise<void> {
  const wallet = await readWalletState();
  await rewardAndQueue("journal-note", wallet.plan);
}

export async function rewardSocialShare(): Promise<void> {
  const wallet = await readWalletState();
  await rewardAndQueue("social-share", wallet.plan);
}

export async function rewardReferral(): Promise<void> {
  const wallet = await readWalletState();
  await rewardAndQueue("referral", wallet.plan);
}

export async function rewardVideoAd(): Promise<void> {
  const wallet = await readWalletState();
  await rewardAndQueue("video-ad", wallet.plan);
}

export async function activateShieldWithCrystal(): Promise<{ activated: boolean; reason?: string }> {
  const nowUtc = new Date().toISOString();
  const walletData = await readWalletState();
  const shield = await readShieldState();

  const result = activateBloomShield({
    nowUtc,
    wallet: {
      ordinaryPetales: walletData.ordinaryPetales,
      crystalPetales: walletData.crystalPetales,
      pendingBackgroundPetales: walletData.pendingBackgroundPetales,
    },
    shield,
  });

  if (!result.activated) {
    return { activated: false, reason: result.reason };
  }

  await writeWalletState(result.wallet, walletData.plan);
  await writeShieldState(result.shield);

  await putOp({
    id: `shield-${uuid()}`,
    type: "shield-activate",
    payload: {
      active_until_utc: result.shield.activeUntilUtc,
    },
    createdAtUtc: nowUtc,
  });

  await queueCurrencySync(result.wallet);

  return { activated: true };
}

export async function getShieldStatus(): Promise<ShieldState & { active: boolean }> {
  const nowUtc = new Date().toISOString();
  const shield = await readShieldState();
  return {
    ...shield,
    active: isShieldActive(shield, nowUtc),
  };
}

export async function trySyncMobileQueue(profileId = "local-user", authToken?: string): Promise<void> {
  const db = await dbPromise;
  const rows = (await db.getAllAsync(
    `
      SELECT id, action_type, payload, timestamp_utc
      FROM sync_queue
      ORDER BY timestamp_utc ASC;
    `
  )) as QueueRow[];

  if (rows.length === 0) return;
  if (!authToken) {
    throw new Error("Missing auth token for /sync");
  }

  const ops = rows.map((row) => ({
    id: row.id,
    type: row.action_type,
    payload: JSON.parse(row.payload),
    createdAtUtc: row.timestamp_utc,
  }));

  const wallet = await readWalletState();

  const baseUrl = process.env.EXPO_PUBLIC_BLOOM_API_URL ?? "http://localhost:8010";
  const response = await fetch(`${baseUrl}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      profileId,
      syncStrategy: "client-local-truth",
      snapshot: {
        currency: {
          petales: wallet.ordinaryPetales,
          cristaux: wallet.crystalPetales,
          pending_bg_petales: wallet.pendingBackgroundPetales,
        },
      },
      ops,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  const body = (await response.json()) as { results?: Array<{ id: string; ok: boolean }> };
  const successIds = Array.isArray(body.results)
    ? body.results.filter((result) => result.ok).map((result) => result.id)
    : [];

  if (successIds.length === 0) return;

  const placeholders = successIds.map(() => "?").join(",");
  await db.runAsync(
    `DELETE FROM sync_queue WHERE id IN (${placeholders});`,
    successIds
  );
}
