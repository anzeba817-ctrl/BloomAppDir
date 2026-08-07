import { Habit } from "../types/habit";

export function getEffortScore(habit: Habit, now = new Date()): number {
  const start = habit.startDate ? new Date(habit.startDate) : now;
  const elapsedDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86400000));

  if (habit.durationMinutes && habit.durationMinutes > 0) {
    const consistency = Math.min(1, habit.streak / Math.max(1, elapsedDays));
    const timeFactor = Math.min(1.5, habit.durationMinutes / 20);
    return Math.max(0.05, Math.min(1, consistency * 0.7 + (timeFactor / 1.5) * 0.3));
  }

  // No duration configured: infer effort from long-term consistency and longevity.
  const consistency = Math.min(1, habit.streak / Math.max(1, elapsedDays));
  const longevity = Math.min(1, elapsedDays / 90);
  return Math.max(0.05, Math.min(1, consistency * 0.75 + longevity * 0.25));
}

export function getEffortLabel(score: number): string {
  if (score >= 0.75) return "effort intense";
  if (score >= 0.4) return "effort stable";
  return "effort léger";
}
