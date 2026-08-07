"use client";

import { useNavigate } from "react-router-dom";
import { SunnyMascot } from "../components/sunny-mascot";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

export function OnboardingIntro() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white px-8 py-16">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10"
        >
          <SunnyMascot mood="blooming" size={320} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-bold tracking-tight text-[#1C1917]">
            {t("onboarding_intro_title") as string}
          </h1>
          <div className="space-y-4">
            <p className="text-xl font-medium text-[#1C1917]">
              {t("onboarding_intro_subtitle1") as string}
            </p>
            <p className="text-base leading-relaxed text-[#1C1917]/70">
              {t("onboarding_intro_subtitle2") as string}
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-xs"
      >
        <button
          onClick={() => navigate("/auth")}
          className="w-full rounded-full border border-gray-200 bg-[#F3E8FF] py-4 text-lg font-semibold text-[#6B4FA0] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all active:scale-95"
        >
          {t("onboarding_intro_cta") as string}
        </button>
      </motion.div>
    </div>
  );
}
