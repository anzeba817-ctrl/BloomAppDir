import { LocalNotifications } from "@capacitor/local-notifications";
import type { Habit } from "../types/habit";
import { translations, Language } from "../contexts/LanguageContext";

/**
 * GESTION NATIVE DES NOTIFICATIONS ET ÉVITEMENT DU SPAM
 * Ce module implémente la spécification 7.3.
 * Les rappels sont planifiés localement.
 * Filtre en temps réel : si l'habitude est faite, la notification est annulée.
 */

function getTranslation(key: keyof typeof translations.fr): string {
  let lang: Language = "fr";
  if (typeof window !== "undefined") {
    lang = (localStorage.getItem("bloom_lang") as Language) || "fr";
  }
  return (translations[lang] as any)[key] || (translations.fr as any)[key] || key;
}

/**
 * Demande la permission d'afficher des notifications.
 */
export async function requestNotificationPermission() {
  const status = await LocalNotifications.checkPermissions();
  if (status.display === "granted") return true;

  const request = await LocalNotifications.requestPermissions();
  return request.display === "granted";
}

/**
 * Programme les rappels pour une habitude donnée (Spec 7.3).
 * Gère les répétitions quotidiennes et hebdomadaires.
 */
export async function scheduleHabitReminder(habit: Habit) {
  // On nettoie d'abord les anciens rappels pour cette habitude
  await cancelHabitReminder(habit.id);

  const timesToSchedule = habit.reminderTimes && habit.reminderTimes.length > 0
    ? habit.reminderTimes
    : (habit.reminderTime ? [habit.reminderTime] : []);

  if (timesToSchedule.length === 0) return;

  const notifications: any[] = [];
  const buildTitle = getTranslation("notif_build_title" as any) || "C'est l'heure d'ancrer ! 🌻";
  const quitTitle = getTranslation("notif_quit_title" as any) || "Reste fort(e) ! 🕊️";
  const bodyPrefix = getTranslation("notif_body_prefix" as any) || "C'est le moment pour : ";

  timesToSchedule.forEach((time, index) => {
    const [hours, minutes] = time.split(":").map(Number);

    const baseNotification = {
      title: habit.mode === 'build' ? buildTitle : quitTitle,
      body: habit.customReminder || `${bodyPrefix}${habit.name}`,
      sound: "sounds/success-chime.mp3",
      extra: {
        habitId: habit.id,
        reminderIndex: index
      }
    };

    // Planification Quotidienne
    if (habit.frequency === "daily") {
      notifications.push({
        ...baseNotification,
        id: stringToId(`${habit.id}-${index}`),
        schedule: {
          on: { hour: hours, minute: minutes },
          repeats: true,
          allowWhileIdle: true
        }
      });
    }
    // Planification Hebdomadaire / Personnalisée
    else if (habit.selectedDays && habit.selectedDays.length > 0) {
      habit.selectedDays.forEach(day => {
        // Mapping Capacitor: Dimanche=1, Lundi=2...
        const capacitorWeekday = day === 0 ? 1 : day + 1;

        notifications.push({
          ...baseNotification,
          id: stringToId(`${habit.id}-${day}-${index}`),
          schedule: {
            on: {
              weekday: capacitorWeekday,
              hour: hours,
              minute: minutes
            },
            repeats: true,
            allowWhileIdle: true
          }
        });
      });
    }
  });

  if (notifications.length > 0) {
    await LocalNotifications.schedule({
      notifications
    });
  }
}

/**
 * Annule les rappels pour une habitude spécifique.
 * Utilisé pour l'évitement du spam (Spec 7.3) quand une habitude est complétée.
 */
export async function cancelHabitReminder(habitId: string) {
  const ids = [];

  // On génère une large plage d'IDs possibles (jusqu'à 10 répétitions par jour)
  for (let index = 0; index < 10; index++) {
    ids.push(stringToId(`${habitId}-${index}`));
    for (let day = 0; day <= 6; day++) {
      ids.push(stringToId(`${habitId}-${day}-${index}`));
    }
  }

  await LocalNotifications.cancel({
    notifications: ids.map(id => ({ id }))
  });
}

/**
 * Filtre logique en temps réel (Spec 7.3) :
 * Interroge l'état local et annule la notification si l'habitude est déjà faite.
 */
export async function filterNotificationSpam(habit: Habit, completedToday: boolean) {
  if (completedToday) {
    // Si l'habitude est faite, on annule le rappel pour éviter de spammer l'utilisateur
    await cancelHabitReminder(habit.id);
  } else {
    // Sinon on s'assure qu'il est bien planifié
    await scheduleHabitReminder(habit);
  }
}

/**
 * Convertit un identifiant texte en nombre pour Capacitor.
 */
function stringToId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
