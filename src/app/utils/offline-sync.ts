import { Habit } from "../types/habit";
import initSqlJs, { Database, SqlJsStatic } from "sql.js";

/**
 * GESTION DE LA PERSISTANCE LOCALE ET SYNCHRONISATION (OFFLINE-FIRST)
 * Ce module implémente la spécification 7.4 (Mode Hors-Ligne Absolu).
 * Toutes les données sont stockées en local via SQLite (sql.js) pour garantir
 * un fonctionnement fluide sans réseau (avion, métro).
 */

const SQLITE_STORAGE_KEY = "bloom-offline-sqlite";

// Opération en attente de synchronisation
type PendingOp = {
  id: string;
  type: "habit-upsert-v2" | "validation-create" | "currency-upsert" | "journal-create";
  payload: unknown;
  createdAtUtc: string;
};

export type ValidationInput = {
  habitId: string;
  mood?: string;
  note?: string;
  timestampUtc?: string;
};

// Modèle de données pour la monnaie (Tokenomics - Spécification 5.3)
type CurrencyRow = {
  petales: number;
  cristaux: number;
  shield_until_utc: string | null;
};

// Variables globales d'instance
let syncInFlight = false;
let sqlJsInitPromise: Promise<SqlJsStatic> | null = null;
let sqliteDb: Database | null = null;

// Spécification 7.2 : Marge de flexibilité pour les travailleurs de nuit (3h00 du matin)
const NIGHT_OWL_CUTOFF_HOUR = 3;

/**
 * Convertit une date en format ISO (YYYY-MM-DD)
 */
function dateToIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Détermine le jour "logique" pour une validation (Aware of Night Owl Cutoff)
 * Spécification 7.2 : Robustesse temporelle.
 */
export function getLogicalDayFromUtc(timestampUtc: string, cutoffHour = NIGHT_OWL_CUTOFF_HOUR): string {
  const localDate = new Date(timestampUtc);
  const shifted = new Date(localDate);

  // Si on est avant l'heure de coupure (ex: 2h du mat), on compte pour le jour précédent
  if (shifted.getHours() < cutoffHour) {
    shifted.setDate(shifted.getDate() - 1);
  }

  return dateToIsoDay(shifted);
}

// --- INITIALISATION DE LA BASE DE DONNÉES ---

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsInitPromise) {
    sqlJsInitPromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlJsInitPromise;
}

/**
 * Initialise ou récupère la base SQLite locale.
 * Implémente le stockage persistant aware des spécifications 5.1 à 7.4.
 */
async function getDb(): Promise<Database> {
  if (typeof window === "undefined") throw new Error("offline-sync is browser only");
  if (sqliteDb) return sqliteDb;

  const SQL = await getSqlJs();
  const raw = window.localStorage.getItem(SQLITE_STORAGE_KEY);
  sqliteDb = raw ? new SQL.Database(fromBase64(raw)) : new SQL.Database();

  sqliteDb.run("PRAGMA foreign_keys = ON;");

  // Table des Habitudes (Specs 5.1 & 5.2)
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS habitudes (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('build','quit')),
      cadence TEXT NOT NULL,
      date_creation TEXT NOT NULL
    );
  `);

  // Table des Validations (Check-ins) - Specs 7.2 (Timezone Aware)
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS validations (
      id TEXT PRIMARY KEY,
      habitude_id TEXT NOT NULL,
      timestamp_utc TEXT NOT NULL,
      timezone_offset INTEGER,
      date_logique TEXT NOT NULL,
      note_journal TEXT,
      humeur TEXT,
      completed_count INTEGER DEFAULT 1,
      FOREIGN KEY(habitude_id) REFERENCES habitudes (id) ON DELETE CASCADE,
      UNIQUE(habitude_id, date_logique)
    );
  `);

  // Table Monnaie (Tokenomics - Spec 5.3)
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS solde_monnaie (
      singleton_id INTEGER PRIMARY KEY CHECK(singleton_id = 1),
      petales INTEGER NOT NULL DEFAULT 0,
      cristaux INTEGER NOT NULL DEFAULT 0,
      shield_until_utc TEXT
    );
  `);

  // File de synchronisation (Sync Queue - Spec 7.4)
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp_utc TEXT NOT NULL
    );
  `);

  sqliteDb.run(`
    INSERT OR IGNORE INTO solde_monnaie (singleton_id, petales, cristaux, shield_until_utc)
    VALUES (1, 0, 0, NULL);
  `);

  return sqliteDb;
}

async function persistDb(): Promise<void> {
  if (!sqliteDb || typeof window === "undefined") return;
  const bytes = sqliteDb.export();
  window.localStorage.setItem(SQLITE_STORAGE_KEY, toBase64(bytes));
}

// --- LOGIQUE MÉTIER HORS-LIGNE ---

/**
 * Valide une habitude (Check-in).
 * Enregistre avec Timestamp UTC et Timezone locale (Spec 7.2).
 */
export async function queueHabitCheckIn(payload: {
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mood?: string;
  note?: string;
}): Promise<{ logicalDate: string; currentCount: number; streak: number; lastCheckIn: string | null }> {
  const db = await getDb();

  // Spec 7.2 : Timestamp UTC + Timezone Awareness
  const now = new Date();
  const timestampUtc = now.toISOString();
  const timezoneOffset = now.getTimezoneOffset(); // en minutes

  // Calcul du jour logique selon l'heure de coupure (Spec 7.2)
  const logicalDate = getLogicalDayFromUtc(timestampUtc);
  const validationId = `${payload.habitId}:${logicalDate}`;

  // Récupération de l'état actuel pour incrémenter
  const existing = db.exec(`SELECT completed_count FROM validations WHERE id = ?`, [validationId]);
  let currentCount = 0;

  if (existing.length > 0 && existing[0].values.length > 0) {
    currentCount = Number(existing[0].values[0][0]) + 1;
    db.run(
      `UPDATE validations SET completed_count = ?, timestamp_utc = ?, note_journal = ?, humeur = ? WHERE id = ?`,
      [currentCount, timestampUtc, payload.note ?? null, payload.mood ?? null, validationId]
    );
  } else {
    currentCount = 1;
    db.run(
      `INSERT INTO validations (id, habitude_id, timestamp_utc, timezone_offset, date_logique, note_journal, humeur, completed_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [validationId, payload.habitId, timestampUtc, timezoneOffset, logicalDate, payload.note ?? null, payload.mood ?? null, currentCount]
    );
  }

  await persistDb();

  // Mise à jour de la queue de synchronisation (Spec 7.4)
  await putOp({
    id: `${payload.habitId}:${logicalDate}:${Date.now()}`,
    type: "validation-create",
    payload: {
      id: validationId,
      habitude_id: payload.habitId,
      timestamp_utc: timestampUtc,
      timezone_offset: timezoneOffset,
      date_logique: logicalDate,
      note_journal: payload.note ?? null,
      humeur: payload.mood ?? null,
      completed_count: currentCount
    },
    createdAtUtc: timestampUtc,
  });

  const streakState = await getHabitStreakState(payload.habitId);
  return { logicalDate, currentCount, ...streakState };
}

/**
 * Incrémente les pétales (Tokenomics Spec 5.3).
 * Conversion auto 10 pétales -> 1 cristal (max 3).
 */
export async function incrementLocalPetals(by = 1): Promise<CurrencyRow> {
  const db = await getDb();
  const current = await readLocalCurrency();

  let newPetales = current.petales + by;
  let newCristaux = current.cristaux;

  while (newPetales >= 10 && newCristaux < 3) {
    newPetales -= 10;
    newCristaux += 1;
  }

  const next = { ...current, petales: Math.max(0, newPetales), cristaux: newCristaux };
  db.run(`UPDATE solde_monnaie SET petales = ?, cristaux = ? WHERE singleton_id = 1;`, [next.petales, next.cristaux]);
  await persistDb();

  await putOp({ id: `cur:${Date.now()}`, type: "currency-upsert", payload: next, createdAtUtc: new Date().toISOString() });
  return next;
}

/**
 * Active le Bloom Shield (Spec 5.3).
 */
export async function activateBloomShield(): Promise<CurrencyRow> {
  const db = await getDb();
  const current = await readLocalCurrency();
  if (current.cristaux <= 0) return current;

  const shieldUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const next = { ...current, cristaux: current.cristaux - 1, shield_until_utc: shieldUntil };
  db.run(`UPDATE solde_monnaie SET cristaux = ?, shield_until_utc = ? WHERE singleton_id = 1;`, [next.cristaux, next.shield_until_utc]);
  await persistDb();

  await putOp({ id: `shield:${Date.now()}`, type: "currency-upsert", payload: next, createdAtUtc: new Date().toISOString() });
  return next;
}

export async function readLocalCurrency(): Promise<CurrencyRow> {
  const db = await getDb();
  const res = db.exec(`SELECT petales, cristaux, shield_until_utc FROM solde_monnaie WHERE singleton_id = 1;`);
  if (res.length === 0 || res[0].values.length === 0) return { petales: 0, cristaux: 0, shield_until_utc: null };
  return { petales: Number(res[0].values[0][0]), cristaux: Number(res[0].values[0][1]), shield_until_utc: res[0].values[0][2] as string | null };
}

// --- GESTION DE LA FILE DE SYNCHRO ---

async function putOp(op: PendingOp): Promise<void> {
  const db = await getDb();
  db.run(`INSERT OR REPLACE INTO sync_queue (id, action_type, payload, timestamp_utc) VALUES (?, ?, ?, ?);`, [op.id, op.type, JSON.stringify(op.payload), op.createdAtUtc]);
  await persistDb();
}

/**
 * Calcule la série à partir de l'historique local (Offline Logic).
 */
async function getHabitStreakState(habitId: string): Promise<{ streak: number; lastCheckIn: string | null }> {
  const db = await getDb();
  const result = db.exec(`SELECT date_logique FROM validations WHERE habitude_id = ? ORDER BY date_logique DESC;`, [habitId]);
  if (result.length === 0) return { streak: 0, lastCheckIn: null };

  const dates = result[0].values.map((row) => String(row[0]));
  return { streak: computeStreakFromLogicalDates(dates), lastCheckIn: dates[0] };
}

function computeStreakFromLogicalDates(logicalDates: string[]): number {
  if (logicalDates.length === 0) return 0;
  const uniqueSorted = [...new Set(logicalDates)].sort((a, b) => (a < b ? 1 : -1));
  let streak = 1;
  let cursor = uniqueSorted[0];
  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const dt = new Date(`${cursor}T12:00:00`);
    dt.setDate(dt.getDate() - 1);
    const expectedPrev = dateToIsoDay(dt);
    if (uniqueSorted[i] !== expectedPrev) break;
    streak += 1;
    cursor = uniqueSorted[i];
  }
  return streak;
}

// Helpers base64
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}
function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) { bytes[i] = binary.charCodeAt(i); }
  return bytes;
}

/**
 * Tente de synchroniser les opérations en attente dès que le réseau revient (Spec 7.4).
 */
export function startSyncOnReconnect(): () => void {
  const onOnline = async () => {
    // Ici on ferait le fetch vers le backend Bloom central
    console.log("Bloom: Réseau détecté, tentative de synchronisation...");
  };
  window.addEventListener("online", onOnline);
  return () => window.removeEventListener("online", onOnline);
}

export async function queueHabitUpsert(habit: Habit): Promise<void> {
  const db = await getDb();
  db.run(`INSERT INTO habitudes (id, titre, type, cadence, date_creation) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET titre=excluded.titre;`, [habit.id, habit.name, habit.mode, habit.frequency || "daily", habit.startDate || new Date().toISOString()]);
  await persistDb();
  await putOp({ id: crypto.randomUUID(), type: "habit-upsert-v2", payload: habit, createdAtUtc: new Date().toISOString() });
}
