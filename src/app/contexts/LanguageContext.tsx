"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "fr" | "en" | "es";

export const translations = {
  fr: {
    // Navigation
    nav_dashboard: "tableau de bord",
    nav_profile: "profil",
    nav_subscription: "abonnement",
    nav_journal: "journal",
    nav_widgets: "widgets",

    // Dashboard
    petals: "pétales",
    build_mode: "mode encrage",
    quit_mode: "mode sevrage",
    build_tagline: "construis",
    quit_tagline: "libère-toi",
    streak_days: "jours de série",
    freed_days: "jours libérés",
    done_today: "✓ fait aujourd'hui",
    freed_day: "✓ jour réussi",
    add_habit: "+ ajouter une habitude",
    no_build_habits: "aucune habitude en construction",
    no_quit_habits: "aucune habitude à quitter pour l'instant",
    swipe_build: "← swipe pour voir le mode encrage →",
    swipe_quit: "← swipe pour voir le mode sevrage",

    // Profile
    profile_title: "profil & historique",
    your_journey: "ton parcours bloom",
    member_since: "membre depuis mai 2026",
    active_habits: "habitudes actives",
    total_days: "jours totaux",
    petals_count: "pétales",
    year_activity: "activité de l'année",
    less: "moins",
    more: "plus",
    insights: "insights",
    longest_streak: "plus longue série",
    best_day: "meilleur jour",
    best_habit: "habitude la plus réussie",
    data_note: "💜 toutes tes données sont conservées avec bienveillance. même les jours manqués restent visibles pour t'aider à comprendre ton parcours.",
    days_label: ["l", "m", "m", "j", "v", "s", "d"],
    months_label: ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"],

    // Settings
    settings_title: "paramètres",
    appearance: "apparence",
    dark_mode: "mode sombre",
    dark_mode_on: "deep night activé",
    dark_mode_off: "sunbeam cream activé",
    sound_effects: "effets sonores",
    sound_effects_on_label: "activés",
    sound_effects_off_label: "désactivés",
    animations: "animations",
    animations_on_label: "activées",
    animations_off_label: "désactivées",
    notifications: "notifications",
    notif_examples: "exemples de rappels bienveillants :",
    integrations: "intégrations",
    gcal: "Google Calendar",
    gcal_desc: "synchronise tes habitudes avec ton calendrier",
    account: "compte",
    manage_sub: "gérer l'abonnement",
    manage_sub_desc: "version seedling (gratuite)",
    export_data: "exporter mes données",
    export_data_desc: "télécharge ton historique",
    about: "À propos de bloom",
    version: "version 1.0.0",
    support: "support",
    help_center: "centre d'aide",
    contact_us: "nous contacter",
    privacy: "politique de confidentialité",
    language: "langue",
    footer: "fait avec 💛 par l'équipe bloom",
    bloom_premium: "bloom premium",
    premium_desc: "habitudes illimitées • 7 émotions de sunny • zéro pub",
    discover: "découvrir bloom",

    // Journal
    journal_title: "journal intime",
    journal_subtitle: "tes pensées, ton espace",
    new_entry: "nouvelle entrée",
    today: "aujourd'hui",
    how_feeling: "comment tu te sens aujourd'hui ?",
    write_placeholder: "écris ici... sans pression, sans jugement.",
    save_entry: "enregistrer",
    entries: "entrées",
    no_entries: "pas encore d'entrées. commence à écrire 🌱",

    // Widgets
    widgets_title: "widgets",
    widgets_subtitle: "personnalise ton expérience",
    streak_widget: "widget série",
    streak_widget_desc: "affiche ta série quotidienne",
    heatmap_widget: "widget heatmap",
    heatmap_widget_desc: "aperçu de ton activité",
    sunny_widget: "widget sunny",
    sunny_widget_desc: "sunny sur ton écran d'accueil",
    add_widget: "ajouter",
    added: "ajouté ✓",
    coming_soon: "disponible bientôt",
    tutorial_step1: "Bienvenue dans Bloom. Suivez ce guide pour découvrir l’application.",
    tutorial_step2: "Ici, vous pouvez voir votre compteur de pétales et vos progrès.",
    tutorial_step3: "Cette liste regroupe vos habitudes à construire ou à quitter.",
    tutorial_step4: "Utilisez ce sélecteur pour passer rapidement du mode construction au mode sevrage.",
    tutorial_step5: "Ce hub vous donne accès au profil, au journal, aux widgets et à l’abonnement.",
    tutorial_step6: "Vous êtes prêt à commencer votre aventure Bloom.",

    // Common
    back: "retour",
    save: "enregistrer",
    cancel: "annuler",
    close: "fermer",
  },

  en: {
    // Navigation
    nav_dashboard: "dashboard",
    nav_profile: "profile",
    nav_subscription: "subscription",
    nav_journal: "journal",
    nav_widgets: "widgets",

    // Dashboard
    petals: "petals",
    build_mode: "build mode",
    quit_mode: "quit mode",
    build_tagline: "build",
    quit_tagline: "break free",
    streak_days: "day streak",
    freed_days: "days free",
    done_today: "✓ done today",
    freed_day: "✓ free day",
    add_habit: "+ add a habit",
    no_build_habits: "no habits being built yet",
    no_quit_habits: "no habits to quit for now",
    swipe_build: "← swipe to see build mode →",
    swipe_quit: "← swipe to see quit mode",

    // Profile
    profile_title: "profile & history",
    your_journey: "your bloom journey",
    member_since: "member since May 2026",
    active_habits: "active habits",
    total_days: "total days",
    petals_count: "petals",
    year_activity: "year activity",
    less: "less",
    more: "more",
    insights: "insights",
    longest_streak: "longest streak",
    best_day: "best day",
    best_habit: "most successful habit",
    data_note: "💜 all your data is kept with care. even missed days stay visible to help you understand your journey.",
    days_label: ["m", "t", "w", "t", "f", "s", "s"],
    months_label: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],

    // Settings
    settings_title: "settings",
    appearance: "appearance",
    dark_mode: "dark mode",
    dark_mode_on: "deep night enabled",
    dark_mode_off: "sunbeam cream enabled",
    sound_effects: "sound effects",
    sound_effects_on_label: "on",
    sound_effects_off_label: "off",
    animations: "animations",
    animations_on_label: "on",
    animations_off_label: "off",
    notifications: "notifications",
    notif_examples: "examples of gentle reminders:",
    integrations: "integrations",
    gcal: "Google Calendar",
    gcal_desc: "sync your habits with your calendar",
    account: "account",
    manage_sub: "manage subscription",
    manage_sub_desc: "seedling version (free)",
    export_data: "export my data",
    export_data_desc: "download your history",
    about: "about bloom",
    version: "version 1.0.0",
    support: "support",
    help_center: "help center",
    contact_us: "contact us",
    privacy: "privacy policy",
    language: "language",
    footer: "made with 💛 by the bloom team",
    bloom_premium: "bloom premium",
    premium_desc: "unlimited habits • 7 sunny emotions • zero ads",
    discover: "discover bloom",

    // Journal
    journal_title: "personal journal",
    journal_subtitle: "your thoughts, your space",
    new_entry: "new entry",
    today: "today",
    how_feeling: "how are you feeling today?",
    write_placeholder: "write here... no pressure, no judgment.",
    save_entry: "save",
    entries: "entries",
    no_entries: "no entries yet. start writing 🌱",

    // Widgets
    widgets_title: "widgets",
    widgets_subtitle: "customize your experience",
    streak_widget: "streak widget",
    streak_widget_desc: "shows your daily streak",
    heatmap_widget: "heatmap widget",
    heatmap_widget_desc: "activity overview",
    sunny_widget: "sunny widget",
    sunny_widget_desc: "sunny on your home screen",
    add_widget: "add",
    added: "added ✓",
    coming_soon: "coming soon",
    tutorial_step1: "Welcome to Bloom. Follow this guide to discover the app.",
    tutorial_step2: "Here you can track your petals and your progress.",
    tutorial_step3: "This list shows the habits you are building or quitting.",
    tutorial_step4: "Use this switcher to move quickly between build and quit modes.",
    tutorial_step5: "This hub gives you access to profile, journal, widgets, and subscription.",
    tutorial_step6: "You are ready to start your Bloom journey.",

    // Common
    back: "back",
    save: "save",
    cancel: "cancel",
    close: "close",
  },

  es: {
    // Navigation
    nav_dashboard: "inicio",
    nav_profile: "perfil",
    nav_subscription: "suscripción",
    nav_journal: "diario",
    nav_widgets: "widgets",

    // Dashboard
    petals: "pétalos",
    build_mode: "modo construcción",
    quit_mode: "modo abandono",
    build_tagline: "construye",
    quit_tagline: "libérate",
    streak_days: "días de racha",
    freed_days: "días libres",
    done_today: "✓ hecho hoy",
    freed_day: "✓ día libre",
    add_habit: "+ añadir hábito",
    no_build_habits: "sin hábitos en construcción",
    no_quit_habits: "sin hábitos que abandonar por ahora",
    swipe_build: "← desliza para ver modo construcción →",
    swipe_quit: "← desliza para ver modo abandono",

    // Profile
    profile_title: "perfil & historial",
    your_journey: "tu viaje bloom",
    member_since: "miembro desde mayo 2026",
    active_habits: "hábitos activos",
    total_days: "días totales",
    petals_count: "pétalos",
    year_activity: "actividad del año",
    less: "menos",
    more: "más",
    insights: "estadísticas",
    longest_streak: "racha más larga",
    best_day: "mejor día",
    best_habit: "hábito más exitoso",
    data_note: "💜 todos tus datos se guardan con cuidado. incluso los días perdidos son visibles para ayudarte a entender tu camino.",
    days_label: ["l", "m", "m", "j", "v", "s", "d"],
    months_label: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],

    // Settings
    settings_title: "ajustes",
    appearance: "apariencia",
    dark_mode: "modo oscuro",
    dark_mode_on: "noche profunda activado",
    dark_mode_off: "crema sunbeam activado",
    sound_effects: "efectos de sonido",
    sound_effects_on_label: "activados",
    sound_effects_off_label: "desactivados",
    animations: "animaciones",
    animations_on_label: "activadas",
    animations_off_label: "desactivadas",
    notifications: "notificaciones",
    notif_examples: "ejemplos de recordatorios amables:",
    integrations: "integraciones",
    gcal: "Google Calendar",
    gcal_desc: "sincroniza tus hábitos con tu calendario",
    account: "cuenta",
    manage_sub: "gestionar suscripción",
    manage_sub_desc: "versión seedling (gratuita)",
    export_data: "exportar mis datos",
    export_data_desc: "descarga tu historial",
    about: "sobre bloom",
    version: "versión 1.0.0",
    support: "soporte",
    help_center: "centro de ayuda",
    contact_us: "contáctanos",
    privacy: "política de privacidad",
    language: "idioma",
    footer: "hecho con 💛 por el equipo bloom",
    bloom_premium: "bloom premium",
    premium_desc: "hábitos ilimitados • 7 emociones de sunny • sin anuncios",
    discover: "descubrir bloom",

    // Journal
    journal_title: "diario personal",
    journal_subtitle: "tus pensamientos, tu espacio",
    new_entry: "nueva entrada",
    today: "hoy",
    how_feeling: "¿cómo te sientes hoy?",
    write_placeholder: "escribe aquí... sin presión, sin juicios.",
    save_entry: "guardar",
    entries: "entradas",
    no_entries: "aún no hay entradas. empieza a escribir 🌱",

    // Widgets
    widgets_title: "widgets",
    widgets_subtitle: "personaliza tu experiencia",
    streak_widget: "widget racha",
    streak_widget_desc: "muestra tu racha diaria",
    heatmap_widget: "widget heatmap",
    heatmap_widget_desc: "resumen de actividad",
    sunny_widget: "widget sunny",
    sunny_widget_desc: "sunny en tu pantalla de inicio",
    add_widget: "añadir",
    added: "añadido ✓",
    coming_soon: "próximamente",
    tutorial_step1: "Bienvenido a Bloom. Sigue esta guía para descubrir la aplicación.",
    tutorial_step2: "Aquí puedes ver tus pétalos y tu progreso.",
    tutorial_step3: "Esta lista muestra los hábitos que estás construyendo o dejando.",
    tutorial_step4: "Usa este selector para cambiar rápidamente entre los modos de construcción y abandono.",
    tutorial_step5: "Este hub te da acceso al perfil, diario, widgets y suscripción.",
    tutorial_step6: "Ya estás listo para empezar tu viaje Bloom.",

    // Common
    back: "volver",
    save: "guardar",
    cancel: "cancelar",
    close: "cerrar",
  },
} as const;

type TranslationKeys = keyof typeof translations.fr;

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  // AJOUT DE READONLY ICI POUR FIXER LA SIGNATURE DE L'INTERFACE
  t: (key: TranslationKeys) => string | readonly string[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bloom_lang") as Language) || "fr";
    }
    return "fr";
  });

  const setLang = (l: Language) => {
    localStorage.setItem("bloom_lang", l);
    setLangState(l);
  };

  const t = (key: TranslationKeys): string | readonly string[] => {
    return (translations[lang] as Record<string, string | readonly string[]>)[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}