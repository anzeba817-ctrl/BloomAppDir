export type Language = "fr" | "en" | "es";
export type DashboardMode = "build" | "quit";
export type AppearanceMode = "light" | "dark" | "system";
export type SunnyState =
  | "neutral"
  | "growing"
  | "blooming"
  | "wilting"
  | "struggling"
  | "overjoyed"
  | "shielded";

export type SunnyIteration = "A" | "B";
export type SunnyContext = "widget" | "notification" | "popup" | "onboarding";

export type Currency = {
  petales: number;
  crystalPetales: number;
};

export type HabitCard = {
  id: string;
  title: string;
  mode: DashboardMode;
  streak: number;
  todayChecked: boolean;
};

export type BloomDashboardData = {
  activeStreak: number;
  sobrietyDays: number;
  currency: Currency;
  heatmapValues: number[];
  habits: HabitCard[];
  shieldActive: boolean;
  missedDays: number;
};

export type Strings = {
  petals: string;
  crystalPetals: string;
  activeStreak: string;
  buildMode: string;
  quitMode: string;
  swipeHintBuild: string;
  swipeHintQuit: string;
  freedDays: string;
  checkboxes: string;
  heatmap: string;
  language: string;
  appearance: string;
  light: string;
  dark: string;
  system: string;
  onboardingTitle: string;
  onboardingCta: string;
};

export const ONBOARDING_TEXT =
  "Hello, my name is Sunny Bloom. You bloom when you build something new, and you bloom when you finally break free from what was holding you back. Come and bloom with me.";

export const PREF_KEYS = {
  language: "bloom-mobile-language",
  appearance: "bloom-mobile-appearance",
  lastMode: "bloom-mobile-last-dashboard-mode",
  seenOnboarding: "bloom-mobile-seen-onboarding",
} as const;

export const STRINGS: Record<Language, Strings> = {
  en: {
    petals: "Petales",
    crystalPetals: "Crystal Petales",
    activeStreak: "Active Streak",
    buildMode: "Build Mode",
    quitMode: "Quit Mode",
    swipeHintBuild: "Swipe left to open Quit Mode",
    swipeHintQuit: "Swipe right to open Build Mode",
    freedDays: "freed days",
    checkboxes: "Daily checkboxes",
    heatmap: "Activity heatmap",
    language: "Language",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
    onboardingTitle: "Welcome",
    onboardingCta: "Start blooming",
  },
  fr: {
    petals: "Petales",
    crystalPetals: "Petales de Cristal",
    activeStreak: "Serie active",
    buildMode: "Mode Ancrage",
    quitMode: "Mode Sevrage",
    swipeHintBuild: "Swipe a gauche pour ouvrir le Mode Sevrage",
    swipeHintQuit: "Swipe a droite pour ouvrir le Mode Ancrage",
    freedDays: "jours liberes",
    checkboxes: "Cases du jour",
    heatmap: "Heatmap d activite",
    language: "Langue",
    appearance: "Apparence",
    light: "Clair",
    dark: "Sombre",
    system: "Systeme",
    onboardingTitle: "Bienvenue",
    onboardingCta: "Commencer a bloom",
  },
  es: {
    petals: "Petalos",
    crystalPetals: "Petalos de Cristal",
    activeStreak: "Racha activa",
    buildMode: "Modo Build",
    quitMode: "Modo Quit",
    swipeHintBuild: "Desliza a la izquierda para abrir Quit Mode",
    swipeHintQuit: "Desliza a la derecha para abrir Build Mode",
    freedDays: "dias liberados",
    checkboxes: "Casillas diarias",
    heatmap: "Mapa de actividad",
    language: "Idioma",
    appearance: "Apariencia",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    onboardingTitle: "Bienvenido",
    onboardingCta: "Empezar a bloom",
  },
};

export type Palette = {
  bg: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  accentSoft: string;
};

export function buildPalette(
  mode: DashboardMode,
  appearance: AppearanceMode,
  systemScheme: "light" | "dark"
): Palette {
  const resolved = appearance === "system" ? systemScheme : appearance;
  const isDark = resolved === "dark";
  const accent = mode === "quit" ? "#6B4FA0" : "#3A7D4F";

  return {
    bg: isDark ? "#0E1116" : "#F5F6F8",
    card: isDark ? "#161C24" : "#FFFFFF",
    text: isDark ? "#F4F7FC" : "#171C23",
    mutedText: isDark ? "#A4AFBE" : "#5F6D7C",
    border: isDark ? "#2F3A47" : "#D9E0E8",
    accent,
    accentSoft: isDark ? "#2A3442" : "#EAF0F5",
  };
}

export function resolveSunnyIteration(context: SunnyContext): SunnyIteration {
  if (context === "widget" || context === "notification") return "A";
  return "B";
}

export type SunnyStateInput = {
  activeStreak: number;
  missedDays: number;
  shieldActive: boolean;
  milestoneReached: boolean;
};

export function determineSunnyState(input: SunnyStateInput): SunnyState {
  if (input.shieldActive) return "shielded";
  if (input.milestoneReached) return "overjoyed";
  if (input.missedDays >= 2) return "struggling";
  if (input.missedDays === 1) return "wilting";
  if (input.activeStreak >= 7) return "blooming";
  if (input.activeStreak >= 3) return "growing";
  return "neutral";
}

export function isMilestone(streak: number): boolean {
  return streak === 7 || streak === 30 || streak === 100;
}

export function getModeFromOffset(offsetX: number, pageWidth: number): DashboardMode {
  const nextIndex = Math.round(offsetX / Math.max(1, pageWidth));
  return nextIndex === 1 ? "quit" : "build";
}

export type PersistedPreferences = {
  language: Language;
  appearance: AppearanceMode;
  mode: DashboardMode;
  seenOnboarding: boolean;
};

export function resolvePersistedPreferences(raw: {
  language: string | null;
  appearance: string | null;
  mode: string | null;
  seenOnboarding: string | null;
}): PersistedPreferences {
  const language: Language =
    raw.language === "fr" || raw.language === "en" || raw.language === "es" ? raw.language : "fr";

  const appearance: AppearanceMode =
    raw.appearance === "light" || raw.appearance === "dark" || raw.appearance === "system"
      ? raw.appearance
      : "system";

  const mode: DashboardMode = raw.mode === "quit" ? "quit" : "build";

  return {
    language,
    appearance,
    mode,
    seenOnboarding: raw.seenOnboarding === "true",
  };
}
