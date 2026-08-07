"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { SunnyMascot } from "../components/sunny-mascot";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

export function OnboardingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const handleEnter = () => {
    navigate("/dashboard", { state: location.state });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white px-8 py-16 text-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="mb-12"
        >
          <SunnyMascot mood="overjoyed" size={320} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-bold tracking-tight text-[#1C1917]">
            {t("success_title") as string}
          </h1>
          <p className="text-xl leading-relaxed text-[#1C1917]/70 font-medium">
            {t("success_subtext") as string}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-xs"
      >
        <button
          onClick={handleEnter}
          className="w-full rounded-full bg-gradient-to-r from-[#F5C030] to-[#FF8A3D] py-4 text-xl font-bold text-white shadow-[0_8px_20px_rgba(245,192,48,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {t("success_cta") as string}
        </button>
      </motion.div>
    </div>
  );
}
