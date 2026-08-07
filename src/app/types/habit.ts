export interface HabitHistoryEntry {
  date: string;
  mood?: string;
  note?: string;
  completedCount?: number;
}

export type HabitMode = "build" | "quit";

export type EffortLevel = "light" | "steady" | "intense";

export interface Habit {
  id: string;
  name: string;
  mode: HabitMode;
  streak: number;
  lastCheckIn: string | null;
  history: HabitHistoryEntry[];
  goal?: string;
  frequency?: "daily" | "weekly" | "custom";
  repetitionsPerDay: number;
  selectedDays?: number[];
  reminderTime?: string | null;
  customReminder?: string;
  durationMinutes?: number | null;
  effortLevel?: EffortLevel;
  startDate?: string;
  endDate?: string | null;
  targetTotalExecutions?: number | null;
}
