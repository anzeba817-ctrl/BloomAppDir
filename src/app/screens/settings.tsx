"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { Bell, Moon, Sun, Sparkles, Crown, Globe, Volume2, VolumeX, Zap, ZapOff } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useTheme, themes, Theme } from "../contexts/ThemeContext";
import { useAudio } from "../contexts/AudioContext";
import { useAnimation } from "../contexts/AnimationContext";

const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const THEME_DETAILS: Record<Theme, { label: string; icon: string }> = {
  light: { label: "Sunbeam", icon: "☀️" },
  dark: { label: "Deep Night", icon: "🌙" },
  forest: { label: "Forest", icon: "🌲" },
  ocean: { label: "Ocean", icon: "🌊" },
  custom: { label: "Custom", icon: "🎨" },
};

export function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme, customColors, setCustomColor } = useTheme();
  const { soundEnabled, toggleSound } = useAudio();
  const { animationsEnabled, toggleAnimations } = useAnimation();
  const [notifications, setNotifications] = useState(true); // Ceci reste un état local

  const notificationExamples = [
    "good morning. sunny's up and waiting — don't leave them on read.",
    "hey, juste un petit rappel doux. sunny croit en toi 🌻",
    "tu as construit une belle série. viens valider ta journée ?",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/90 backdrop-blur-xl px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{t("settings_title") as string}</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">{t("settings_title") as string}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-[#E8920A] to-[#F5C030] p-5 text-white shadow-2xl shadow-orange-500/10 cursor-pointer"
          onClick={() => navigate("/upgrade")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="text-sm font-semibold">{t("bloom_premium") as string}</span>
            </div>
            <p className="text-sm text-white/90 mb-3">
              {t("premium_desc") as string}
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t("discover") as string}</span>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[28px] border border-border/60 bg-card/90 p-4 shadow-lg"
        >
          <Accordion type="multiple" defaultValue={["appearance"]} className="w-full">
            <AccordionItem value="appearance" className="border-none">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">{t("appearance") as string}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">thèmes, sons et animations dans un seul espace</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {themes.map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey)}
                      className={`flex flex-col items-center gap-2 rounded-[20px] border-2 p-3 text-center transition-all ${
                        theme === themeKey
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-muted hover:border-primary/80 hover:bg-muted/80"
                      }`}
                    >
                      <span className="text-2xl">{THEME_DETAILS[themeKey].icon}</span>
                      <span className={`text-xs font-medium ${theme === themeKey ? "text-primary" : "text-muted-foreground"}`}>
                        {THEME_DETAILS[themeKey].label}
                      </span>
                    </button>
                  ))}
                </div>

                {theme === "custom" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4">
                    <h3 className="text-sm font-medium text-card-foreground">Couleurs personnalisées</h3>
                    <div className="flex items-center justify-between">
                      <label htmlFor="primary-color" className="text-sm text-muted-foreground">Couleur principale</label>
                      <input id="primary-color" type="color" value={customColors['--primary']} onChange={(e) => setCustomColor('--primary', e.target.value)} className="h-10 w-10 cursor-pointer rounded-md border border-border bg-card p-1"/>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="background-color" className="text-sm text-muted-foreground">Arrière-plan</label>
                      <input id="background-color" type="color" value={customColors['--background']} onChange={(e) => setCustomColor('--background', e.target.value)} className="h-10 w-10 cursor-pointer rounded-md border border-border bg-card p-1"/>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="text-color" className="text-sm text-muted-foreground">Texte</label>
                      <input id="text-color" type="color" value={customColors['--foreground']} onChange={(e) => setCustomColor('--foreground', e.target.value)} className="h-10 w-10 cursor-pointer rounded-md border border-border bg-card p-1"/>
                    </div>
                  </motion.div>
                )}

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      {soundEnabled ? <Volume2 className="h-5 w-5 text-foreground" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <div className="font-medium text-card-foreground">{t("sound_effects") as string}</div>
                        <div className="text-sm text-muted-foreground">{soundEnabled ? (t("sound_effects_on_label") as string) : (t("sound_effects_off_label") as string)}</div>
                      </div>
                    </div>
                    <button onClick={toggleSound} className={`relative h-8 w-14 rounded-full transition-colors ${soundEnabled ? "bg-primary" : "bg-muted"}`}>
                      <motion.div className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md" animate={{ left: soundEnabled ? "calc(100% - 28px)" : "4px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      {animationsEnabled ? <Zap className="h-5 w-5 text-foreground" /> : <ZapOff className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <div className="font-medium text-card-foreground">{t("animations") as string}</div>
                        <div className="text-sm text-muted-foreground">{animationsEnabled ? t("animations_on_label") as string : t("animations_off_label") as string}</div>
                      </div>
                    </div>
                    <button onClick={toggleAnimations} className={`relative h-8 w-14 rounded-full transition-colors ${animationsEnabled ? "bg-primary" : "bg-muted"}`}>
                      <motion.div className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md" animate={{ left: animationsEnabled ? "calc(100% - 28px)" : "4px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                    </button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications" className="border-t border-border/60">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">{t("notifications") as string}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">rappels doux et exemples de messages</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                  <div>
                    <div className="font-medium text-card-foreground">{t("notifications") as string}</div>
                    <div className="text-sm text-muted-foreground">active ou coupe les rappels bienveillants</div>
                  </div>
                  <button onClick={() => setNotifications(!notifications)} className={`relative h-8 w-14 rounded-full transition-colors ${notifications ? "bg-secondary" : "bg-muted"}`}>
                    <motion.div className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md" animate={{ left: notifications ? "calc(100% - 28px)" : "4px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </button>
                </div>

                {notifications && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">{t("notif_examples") as string}</p>
                    {notificationExamples.map((example, i) => (
                      <div key={i} className="rounded-2xl bg-secondary/10 p-4 text-sm italic text-foreground/80">
                        "{example}"
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account" className="border-t border-border/60">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">compte & intégrations</h2>
                  <p className="mt-1 text-sm text-muted-foreground">abonnement, export et connexion calendrier</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="space-y-2">
                  <button onClick={() => navigate("/calendar-sync")} className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("gcal") as string}</div>
                    <div className="text-sm text-muted-foreground">{t("gcal_desc") as string}</div>
                  </button>
                  <button className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("manage_sub") as string}</div>
                    <div className="text-sm text-muted-foreground">{t("manage_sub_desc") as string}</div>
                  </button>
                  <button className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("export_data") as string}</div>
                    <div className="text-sm text-muted-foreground">{t("export_data_desc") as string}</div>
                  </button>
                  <button onClick={() => navigate("/about")} className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("about") as string}</div>
                    <div className="text-sm text-muted-foreground">{t("version") as string}</div>
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support" className="border-t border-border/60">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">{t("support") as string}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">aide, contact et confidentialité</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="space-y-2">
                  <button className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("help_center") as string}</div>
                  </button>
                  <button className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("contact_us") as string}</div>
                  </button>
                  <button className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition-colors hover:bg-muted">
                    <div className="font-medium text-card-foreground">{t("privacy") as string}</div>
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="language" className="border-t border-border/60">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">{t("language") as string}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">change la langue sans quitter la page</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="grid grid-cols-3 gap-3">
                  {LANGS.map(({ code, label, flag }) => (
                    <button
                      key={code}
                      onClick={() => setLang(code)}
                      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all ${
                        lang === code ? "border-primary bg-primary/10" : "border-transparent bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <span className="text-2xl">{flag}</span>
                      <span className={`text-xs font-medium ${lang === code ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>

        <div className="py-4 text-center text-sm text-muted-foreground">
          {t("footer") as string}
        </div>
      </div>
    </div>
  );
}

