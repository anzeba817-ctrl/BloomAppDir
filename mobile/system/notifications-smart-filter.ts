import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { HabitCard } from "../navigation/logic";
import { hasHabitValidatedForLogicalDay } from "../data/mobile-offline-sqlite";

const SCHEDULED_KEY = "bloom-mobile-notif-ids";

type ScheduledMap = Record<string, string[]>;

async function readScheduledMap(): Promise<ScheduledMap> {
  const raw = await AsyncStorage.getItem(SCHEDULED_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ScheduledMap;
  } catch {
    return {};
  }
}

async function writeScheduledMap(value: ScheduledMap): Promise<void> {
  await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(value));
}

export async function configureSmartNotificationFilter(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async (notification: any) => {
      const habitId = String(notification.request.content.data?.habitId ?? "");

      if (habitId) {
        const alreadyDone = await hasHabitValidatedForLogicalDay(habitId);
        if (alreadyDone) {
          // Abort visual notification to prevent spam when already validated.
          try {
            await Notifications.dismissNotificationAsync(notification.request.identifier);
          } catch {
            // Ignore dismiss errors on platforms where id is not currently visible.
          }

          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
      }

      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}

async function scheduleReminderForHabit(habit: HabitCard, hour: number, minute: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Bloom Reminder",
      body: `Take one tiny action for ${habit.title} today.`,
      data: { habitId: habit.id, mode: habit.mode },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleMorningAndEveningHabitReminders(habits: HabitCard[]): Promise<void> {
  const map = await readScheduledMap();

  for (const ids of Object.values(map)) {
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Ignore stale IDs.
      }
    }
  }

  const next: ScheduledMap = {};

  for (const habit of habits) {
    const morningId = await scheduleReminderForHabit(habit, 8, 30);
    const eveningId = await scheduleReminderForHabit(habit, 20, 30);
    next[habit.id] = [morningId, eveningId];
  }

  await writeScheduledMap(next);
}
