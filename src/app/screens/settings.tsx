"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { Bell, Moon, Sun, Sparkles, Crown, Globe, Volume2, VolumeX, Zap, ZapOff, ChevronLeft } from "lucide-react";
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

const THEME_DETAILS: Record<Theme, { labelKey: string; icon: string }> = {
  system: { labelKey: "theme_system", icon: "📱" },
  light: { labelKey: "dark_mode_off", icon: "☀️" },
  dark: { labelKey: "dark_mode_on", icon: "🌙" },
};

function PremiumBannerContent({ t }: { t: any }) {
  return (
    <>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-white" />
          <span className="text-sm font-bold text-white uppercase tracking-wider">{t("bloom_premium") as string}</span>
        </div>
        <p className="text-sm text-white/90 mb-4 font-medium">
          {t("premium_desc") as string}
        </p>
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-sm font-bold text-white backdrop-blur-md border border-white/10">
          <Sparkles className="w-4 h-4" />
          <span>{t("discover") as string}</span>
        </div>
      </div>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-xl" />
    </>
  );
}

function SettingsAccordion({
  t, setTheme, theme, customColors, setCustomColor, soundEnabled, toggleSound, animationsEnabled, toggleAnimations, notifications, setNotifications, notificationExamples, navigate, lang, setLang
}: any) {
  return (
    <Accordion type="multiple" defaultValue={["appearance"]} className="w-full">
      <AccordionItem value="appearance" className="border-none">
        <AccordionTrigger className="px-2 py-2 hover:no-underline">
          <div className="text-left">
            <h2 className="text-sm font-bold text-foreground">{t("appearance") as string}</h2>
            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{t("appearance_desc") as string}</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <div className="grid grid-cols-3 gap-2">
            {themes.map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setTheme(themeKey)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-center transition-all active:scale-95 ${
                  theme === themeKey
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/40 bg-muted/20 hover:border-border hover:bg-muted/40"
                }`}
              >
                <span className="text-xl">{THEME_DETAILS[themeKey].icon}</span>
                <span className={`text-[8px] font-black uppercase tracking-tighter leading-tight ${theme === themeKey ? "text-primary" : "text-muted-foreground"}`}>
                  {t(THEME_DETAILS[themeKey].labelKey as any) as string}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/5 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center">
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-bold text-foreground text-xs">{t("sound_effects") as string}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{soundEnabled ? (t("sound_effects_on_label") as string) : (t("sound_effects_off_label") as string)}</div>
                </div>
              </div>
              <button onClick={toggleSound} className={`relative h-6 w-10 rounded-full transition-colors ${soundEnabled ? "bg-primary" : "bg-muted"}`}>
                {animationsEnabled ? (
                  <motion.div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md" animate={{ left: soundEnabled ? "calc(100% - 20px)" : "4px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                ) : (
                  <div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md" style={{ left: soundEnabled ? "calc(100% - 20px)" : "4px" }} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/5 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center">
                  {animationsEnabled ? <Zap className="h-4 w-4 text-foreground" /> : <ZapOff className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-bold text-foreground text-xs">{t("animations") as string}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{animationsEnabled ? t("animations_on_label") as string : t("animations_off_label") as string}</div>
                </div>
              </div>
              <button onClick={toggleAnimations} className={`relative h-6 w-10 rounded-full transition-colors ${animationsEnabled ? "bg-primary" : "bg-muted"}`}>
                {animationsEnabled ? (
                  <motion.div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md" animate={{ left: animationsEnabled ? "calc(100% - 20px)" : "4px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                ) : (
                  <div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md" style={{ left: animationsEnabled ? "calc(100% - 20px)" : "4px" }} />
                )}
              </button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="notifications" className="border-t border-border/30">
        <AccordionTrigger className="px-2 py-2.5 hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t("notifications") as string}</h2>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{t("notif_examples") as string}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/5 px-4 py-2 mb-2">
            <div>
              <div className="font-bold text-foreground text-xs">{t("notifications") as string}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{t("notif_toggle_desc") as string}</div>
            </div>
            <button onClick={() => setNotifications(!notifications)} className={`relative h-6 w-10 rounded-full transition-colors ${notifications ? "bg-primary" : "bg-muted"}`}>
              {animationsEnabled ? (
                <motion.div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md" animate={{ left: notifications ? "calc(100% - 20px)" : "4px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              ) : (
                <div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md" style={{ left: notifications ? "calc(100% - 20px)" : "4px" }} />
              )}
            </button>
          </div>

          {notifications && (
            <div className="space-y-2">
              {notificationExamples.map((example: string, i: number) => (
                <div key={i} className="rounded-xl bg-muted/5 border border-border/10 p-3 text-[10px] italic text-foreground/70 font-medium leading-relaxed">
                  “{example}”
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="account" className="border-t border-border/30">
        <AccordionTrigger className="px-2 py-2.5 hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center">
              <Crown className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t("account_integrations") as string}</h2>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{t("account_integrations_desc") as string}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <div className="space-y-2">
            <button onClick={() => navigate("/calendar-sync")} className="w-full rounded-xl border border-border/40 bg-muted/5 p-3 text-left transition-all active:scale-[0.98] hover:bg-muted/10">
              <div className="font-bold text-foreground text-xs">{t("gcal") as string}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{t("gcal_desc") as string}</div>
            </button>
            <button className="w-full rounded-xl border border-border/40 bg-muted/5 p-3 text-left transition-all active:scale-[0.98] hover:bg-muted/10">
              <div className="font-bold text-foreground text-xs">{t("manage_sub") as string}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{t("manage_sub_desc") as string}</div>
            </button>
            <button className="w-full rounded-xl border border-border/40 bg-muted/5 p-3 text-left transition-all active:scale-[0.98] hover:bg-muted/10">
              <div className="font-bold text-foreground text-xs">{t("export_data") as string}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{t("export_data_desc") as string}</div>
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="language" className="border-t border-border/30">
        <AccordionTrigger className="px-2 py-2.5 hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t("language") as string}</h2>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{t("language_desc") as string}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all active:scale-95 ${
                  lang === code ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <span className="text-xl">{flag}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${lang === code ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme, resolvedTheme, customColors, setCustomColor } = useTheme();
  const { soundEnabled, toggleSound } = useAudio();
  const { animationsEnabled, toggleAnimations } = useAnimation();
  const [notifications, setNotifications] = useState(true);

  const notificationExamples = [
    t("notif_example_1"),
    t("notif_example_2"),
    t("notif_example_3"),
  ];

  return (
    <div className="min-h-dvh bg-background pb-20">
      <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-muted/50 transition-colors active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">{t("settings_title") as string}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Bloom Premium Banner */}
        {animationsEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#E8920A] to-[#F5C030] p-4 text-white shadow-xl shadow-orange-500/10 cursor-pointer transition-all active:scale-[0.99]"
            onClick={() => navigate("/upgrade")}
            whileHover={{ y: -1 }}
          >
            <PremiumBannerContent t={t} />
          </motion.div>
        ) : (
          <div
            className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#E8920A] to-[#F5C030] p-4 text-white shadow-xl shadow-orange-500/10 cursor-pointer"
            onClick={() => navigate("/upgrade")}
          >
            <PremiumBannerContent t={t} />
          </div>
        )}

        <div className="rounded-[24px] border border-border/40 bg-card p-2 shadow-lg shadow-black/5">
          <SettingsAccordion t={t} setTheme={setTheme} theme={theme} customColors={customColors} setCustomColor={setCustomColor} soundEnabled={soundEnabled} toggleSound={toggleSound} animationsEnabled={animationsEnabled} toggleAnimations={toggleAnimations} notifications={notifications} setNotifications={setNotifications} notificationExamples={notificationExamples} navigate={navigate} lang={lang} setLang={setLang} />
        </div>

        <div className="py-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("footer") as string}</p>
          <p className="mt-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">v1.0.0 • Bloom</p>
        </div>
      </div>
    </div>
  );
}
