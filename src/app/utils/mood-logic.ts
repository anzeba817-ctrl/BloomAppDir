import { Habit } from "../types/habit";
import { SunnyMood } from "../components/sunny-mascot";

/**
 * Calcule l'humeur de Sunny en fonction de l'état global des habitudes
 * et du forfait de l'utilisateur (monétisation).
 *
 * @param habits Liste des habitudes
 * @param shieldUntilUtc Timestamp d'expiration du bouclier (optionnel)
 * @param plan Forfait de l'utilisateur (seedling, bloom, forever)
 */
export function computeSunnyMood(
  habits: Habit[],
  shieldUntilUtc: string | null,
  plan: 'seedling' | 'bloom' | 'forever' = 'seedling'
): SunnyMood {
  // 1. Priorité au bouclier (Shielded) - Disponible pour tous si un cristal est utilisé
  if (shieldUntilUtc && new Date(shieldUntilUtc) > new Date()) {
    return "shielded";
  }

  if (habits.length === 0) return "neutral";

  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  const today = new Date().toISOString().split('T')[0];
  let daysSinceLastValidation = 999;

  habits.forEach(h => {
    if (h.lastCheckIn) {
      const last = new Date(h.lastCheckIn);
      const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < daysSinceLastValidation) daysSinceLastValidation = diff;
    }
  });

  // 2. États Premium : Overjoyed, Wilting, Struggling
  // Ces états ne sont affichés que pour les forfaits Bloom et Forever.
  if (plan !== 'seedling') {
    // Jalons d'or
    const milestones = [7, 30, 100];
    if (milestones.includes(maxStreak) && habits.some(h => h.lastCheckIn === today)) {
      return "overjoyed";
    }

    // Manquements
    if (daysSinceLastValidation >= 2 && habits.some(h => h.lastCheckIn !== null)) {
      return "struggling";
    }
    if (daysSinceLastValidation === 1 && habits.some(h => h.lastCheckIn !== null)) {
      return "wilting";
    }
  }

  // 3. États Basiques : Blooming, Growing, Neutral
  // Toujours disponibles pour Seedling
  if (maxStreak >= 7) return "blooming";
  if (maxStreak >= 3) return "growing";

  return "neutral";
}
