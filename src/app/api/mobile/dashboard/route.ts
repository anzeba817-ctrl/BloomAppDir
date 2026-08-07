import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../server/postgres";

export const runtime = "nodejs";

type HabitRow = {
  id: string;
  titre: string;
  type: "build" | "quit";
  cadence: string;
  date_creation: string;
};

function dateToIsoDay(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousDayIso(day: string): string {
  const dt = new Date(`${day}T12:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dateToIsoDay(dt);
}

function computeStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const uniqueSorted = [...new Set(days)].sort((a, b) => (a < b ? 1 : -1));
  let streak = 1;
  let cursor = uniqueSorted[0];

  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const expected = previousDayIso(cursor);
    if (uniqueSorted[i] !== expected) break;
    streak += 1;
    cursor = uniqueSorted[i];
  }

  return streak;
}

function logicalTodayUtc(cutoffHour = 3): string {
  const now = new Date();
  const shifted = new Date(now);
  if (shifted.getUTCHours() < cutoffHour) {
    shifted.setUTCDate(shifted.getUTCDate() - 1);
  }
  return dateToIsoDay(shifted);
}

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId") ?? "local-user";
    const pool = getPool();

    const habitsResult = await pool.query<{
      id: string;
      titre: string;
      type: "build" | "quit";
      cadence: string;
      date_creation: string;
    }>(
      `
        SELECT id, titre, type, cadence, date_creation::text
        FROM bloom_habitudes
        WHERE profile_id = $1
        ORDER BY date_creation ASC;
      `,
      [profileId]
    );

    const validationsResult = await pool.query<{
      habitude_id: string;
      date_logique: string;
    }>(
      `
        SELECT habitude_id, date_logique::text
        FROM bloom_validations
        WHERE profile_id = $1
        ORDER BY date_logique DESC;
      `,
      [profileId]
    );

    const currencyResult = await pool.query<{ petales: number; cristaux: number }>(
      `
        SELECT petales, cristaux
        FROM bloom_solde_monnaie
        WHERE profile_id = $1
        LIMIT 1;
      `,
      [profileId]
    );

    const habits = habitsResult.rows as HabitRow[];
    const today = logicalTodayUtc();

    const datesByHabit = new Map<string, string[]>();
    for (const row of validationsResult.rows) {
      const list = datesByHabit.get(row.habitude_id) ?? [];
      list.push(row.date_logique);
      datesByHabit.set(row.habitude_id, list);
    }

    const habitView = habits.map((habit) => {
      const days = datesByHabit.get(habit.id) ?? [];
      const streak = computeStreak(days);
      return {
        ...habit,
        streak,
        today_checked: days.includes(today),
      };
    });

    const activeStreak = habitView.reduce((max, h) => Math.max(max, h.streak), 0);
    const sobrietyDays = habitView
      .filter((h) => h.type === "quit")
      .reduce((max, h) => Math.max(max, h.streak), 0);

    const allDays = validationsResult.rows.map((row) => row.date_logique);
    const uniqueAllDays = [...new Set(allDays)];

    const heatmapValues = Array.from({ length: 35 }, (_, i) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - (34 - i));
      const key = dateToIsoDay(date);
      const count = uniqueAllDays.filter((d) => d === key).length;
      return Math.min(100, count * 40);
    });

    const currency = currencyResult.rows[0] ?? { petales: 0, cristaux: 0 };

    const missedDays = Math.max(0, 2 - Math.min(2, activeStreak > 0 ? 0 : 2));

    return NextResponse.json({
      activeStreak,
      sobrietyDays,
      shieldActive: false,
      missedDays,
      currency: {
        petales: Number(currency.petales ?? 0),
        crystalPetales: Number(currency.cristaux ?? 0),
      },
      heatmapValues,
      habits: habitView,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dashboard API failure";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
