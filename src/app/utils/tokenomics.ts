import { incrementLocalPetals } from "./offline-sync";

/**
 * Gère les gains de pétales selon les règles métiers.
 */
export const Tokenomics = {
  // Constantes de gain
  VAL_HABIT: 1,
  JOURNAL_NOTE: 2,
  MILESTONE_7: 3,
  MILESTONE_30: 5,
  SOCIAL_SHARE: 2,
  REFERRAL: 3,

  /**
   * Ajoute des pétales pour une validation d'habitude.
   * @param isPremium Applique le multiplicateur x1.5 si vrai
   */
  async earnForValidation(isPremium = false): Promise<number> {
    const amount = this.VAL_HABIT * (isPremium ? 1.5 : 1);
    const next = await incrementLocalPetals(amount);
    return next.petales;
  },

  /**
   * Ajoute des pétales pour une note de journal.
   */
  async earnForJournal(isPremium = false): Promise<number> {
    const amount = this.JOURNAL_NOTE * (isPremium ? 1.5 : 1);
    const next = await incrementLocalPetals(amount);
    return next.petales;
  },

  /**
   * Ajoute des pétales pour un jalon.
   */
  async earnForMilestone(streak: number, isPremium = false): Promise<number> {
    let base = 0;
    if (streak === 7) base = this.MILESTONE_7;
    else if (streak === 30) base = this.MILESTONE_30;

    if (base === 0) return 0;

    const amount = base * (isPremium ? 1.5 : 1);
    const next = await incrementLocalPetals(amount);
    return next.petales;
  }
};
