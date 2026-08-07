"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export function OnboardingMode() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<"build" | "quit" | "guided" | null>(null);
  const [answers, setAnswers] = useState({
    motivation: "build" as "build" | "quit" | "both",
    focus: "small" as "small" | "daily" | "weekly",
  });

  const handleContinue = () => {
    const mode = selectedMode === "guided" ? "build" : (selectedMode ?? (answers.motivation === "quit" ? "quit" : "build"));
    navigate("/onboarding/habit", { state: { mode, guided: selectedMode === "guided" } });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground sm:px-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 max-w-2xl text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-primary">{t("onboarding_brand_step") as string}</p>
        <h1 className="mb-2 text-3xl font-semibold">{t("onboarding_mode_title") as string}</h1>
        <p className="text-muted-foreground">{t("onboarding_mode_subtitle") as string}</p>
      </motion.div>

      <div className="mb-6 w-full max-w-2xl space-y-5 rounded-[28px] border border-border/70 bg-card/80 p-6 shadow-sm">
        <div>
          <p className="mb-3 font-medium text-foreground">{t("onboarding_mode_question1") as string}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { value: "build", label: t("onboarding_mode_build") as string, desc: t("onboarding_mode_build_desc") as string },
              { value: "quit", label: t("onboarding_mode_quit") as string, desc: t("onboarding_mode_quit_desc") as string },
              { value: "guided", label: t("onboarding_mode_guided") as string, desc: t("onboarding_mode_guided_desc") as string },
              { value: "both", label: t("onboarding_mode_both") as string, desc: t("onboarding_mode_both_desc") as string },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, motivation: option.value as typeof prev.motivation }));
                  setSelectedMode(option.value === "both" ? null : (option.value as "build" | "quit" | "guided"));
                }}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  answers.motivation === option.value ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background/70"
                }`}
              >
                <div className="font-semibold text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-medium text-foreground">{t("onboarding_mode_question2") as string}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { value: "small", label: t("onboarding_focus_small") as string, desc: t("onboarding_focus_small_desc") as string },
              { value: "daily", label: t("onboarding_focus_daily") as string, desc: t("onboarding_focus_daily_desc") as string },
              { value: "weekly", label: t("onboarding_focus_weekly") as string, desc: t("onboarding_focus_weekly_desc") as string },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setAnswers((prev) => ({ ...prev, focus: option.value as typeof prev.focus }))}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  answers.focus === option.value ? "border-secondary bg-secondary/10 shadow-sm" : "border-border bg-background/70"
                }`}
              >
                <div className="font-semibold text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 w-full max-w-2xl rounded-[24px] border border-border/70 bg-background/70 p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium text-foreground">{t("onboarding_mode_suggestion") as string}</p>
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <p className="font-semibold text-foreground">{selectedMode === "guided" ? (t("onboarding_suggest_guided") as string) : answers.motivation === "quit" ? (t("onboarding_suggest_quit") as string) : (t("onboarding_suggest_build") as string)}</p>
          <p className="text-sm text-muted-foreground">{answers.focus === "small" ? (t("onboarding_suggest_small") as string) : answers.focus === "daily" ? (t("onboarding_suggest_daily") as string) : (t("onboarding_suggest_weekly") as string)}</p>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleContinue}
        className="rounded-2xl bg-primary px-10 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20"
      >
        {t("onboarding_continue") as string}
      </motion.button>
    </div>
  );
}

