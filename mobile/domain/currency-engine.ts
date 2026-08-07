export type BloomAction =
  | "checkin"
  | "journal-note"
  | "milestone-7"
  | "milestone-30"
  | "social-share"
  | "referral"
  | "video-ad";

export type BloomPlan = "free" | "bloom-forever";

export type WalletState = {
  ordinaryPetales: number;
  crystalPetales: number;
  pendingBackgroundPetales: number;
};

export type RewardCounters = {
  journalDayKey: string | null;
  socialWeekKey: string | null;
  videoDayKey: string | null;
  videoDayCount: number;
};

export type RewardResult = {
  accepted: boolean;
  reason?: string;
  gainedPetales: number;
  wallet: WalletState;
  counters: RewardCounters;
};

export type ShieldState = {
  activeUntilUtc: string | null;
};

const AWARD_TABLE: Record<BloomAction, number> = {
  checkin: 1,
  "journal-note": 2,
  "milestone-7": 3,
  "milestone-30": 5,
  "social-share": 2,
  referral: 3,
  "video-ad": 1,
};

const CRYSTAL_THRESHOLD = 10;
const CRYSTAL_CAP = 3;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function applyMultiplier(base: number, plan: BloomPlan): number {
  if (plan === "bloom-forever") {
    return round2(base * 1.5);
  }
  return base;
}

function convertToCrystals(wallet: WalletState): WalletState {
  let ordinary = wallet.ordinaryPetales;
  let crystals = wallet.crystalPetales;
  let background = wallet.pendingBackgroundPetales;

  while (ordinary >= CRYSTAL_THRESHOLD) {
    if (crystals < CRYSTAL_CAP) {
      ordinary = round2(ordinary - CRYSTAL_THRESHOLD);
      crystals += 1;
    } else {
      const convertible = Math.floor(ordinary / CRYSTAL_THRESHOLD) * CRYSTAL_THRESHOLD;
      if (convertible <= 0) break;
      ordinary = round2(ordinary - convertible);
      background = round2(background + convertible);
      break;
    }
  }

  return {
    ordinaryPetales: ordinary,
    crystalPetales: crystals,
    pendingBackgroundPetales: background,
  };
}

export function createInitialWallet(): WalletState {
  return {
    ordinaryPetales: 0,
    crystalPetales: 0,
    pendingBackgroundPetales: 0,
  };
}

export function createInitialRewardCounters(): RewardCounters {
  return {
    journalDayKey: null,
    socialWeekKey: null,
    videoDayKey: null,
    videoDayCount: 0,
  };
}

export function rewardAction(params: {
  action: BloomAction;
  dayKey: string;
  weekKey: string;
  plan: BloomPlan;
  wallet: WalletState;
  counters: RewardCounters;
}): RewardResult {
  const { action, dayKey, weekKey, plan } = params;
  let { wallet, counters } = params;

  if (action === "journal-note" && counters.journalDayKey === dayKey) {
    return { accepted: false, reason: "journal_daily_cap", gainedPetales: 0, wallet, counters };
  }

  if (action === "social-share" && counters.socialWeekKey === weekKey) {
    return { accepted: false, reason: "social_weekly_cap", gainedPetales: 0, wallet, counters };
  }

  if (action === "video-ad") {
    if (counters.videoDayKey !== dayKey) {
      counters = { ...counters, videoDayKey: dayKey, videoDayCount: 0 };
    }
    if (counters.videoDayCount >= 3) {
      return { accepted: false, reason: "video_daily_cap", gainedPetales: 0, wallet, counters };
    }
  }

  const base = AWARD_TABLE[action];
  const gained = applyMultiplier(base, plan);

  wallet = {
    ...wallet,
    ordinaryPetales: round2(wallet.ordinaryPetales + gained),
  };

  if (action === "journal-note") {
    counters = { ...counters, journalDayKey: dayKey };
  }

  if (action === "social-share") {
    counters = { ...counters, socialWeekKey: weekKey };
  }

  if (action === "video-ad") {
    const count = counters.videoDayKey === dayKey ? counters.videoDayCount + 1 : 1;
    counters = { ...counters, videoDayKey: dayKey, videoDayCount: count };
  }

  wallet = convertToCrystals(wallet);

  return {
    accepted: true,
    gainedPetales: gained,
    wallet,
    counters,
  };
}

export function activateBloomShield(params: {
  nowUtc: string;
  wallet: WalletState;
  shield: ShieldState;
}): { activated: boolean; reason?: string; wallet: WalletState; shield: ShieldState } {
  const now = new Date(params.nowUtc);
  const activeUntil = params.shield.activeUntilUtc ? new Date(params.shield.activeUntilUtc) : null;

  if (activeUntil && activeUntil.getTime() > now.getTime()) {
    return {
      activated: false,
      reason: "shield_already_active",
      wallet: params.wallet,
      shield: params.shield,
    };
  }

  if (params.wallet.crystalPetales < 1) {
    return {
      activated: false,
      reason: "not_enough_crystals",
      wallet: params.wallet,
      shield: params.shield,
    };
  }

  const next = new Date(now);
  next.setUTCHours(next.getUTCHours() + 24);

  let wallet: WalletState = {
    ...params.wallet,
    crystalPetales: params.wallet.crystalPetales - 1,
  };

  // If crystals are no longer full, flush convertible background petals back into conversion.
  if (wallet.pendingBackgroundPetales > 0) {
    wallet = {
      ...wallet,
      ordinaryPetales: round2(wallet.ordinaryPetales + wallet.pendingBackgroundPetales),
      pendingBackgroundPetales: 0,
    };
    wallet = convertToCrystals(wallet);
  }

  return {
    activated: true,
    wallet,
    shield: { activeUntilUtc: next.toISOString() },
  };
}

export function isShieldActive(shield: ShieldState, nowUtc: string): boolean {
  if (!shield.activeUntilUtc) return false;
  return new Date(shield.activeUntilUtc).getTime() > new Date(nowUtc).getTime();
}
