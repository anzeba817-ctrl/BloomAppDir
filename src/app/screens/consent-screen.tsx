"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

export function ConsentScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-white px-8 py-16">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-64 w-full"
        >
          {/* Stylized graphic similar to the user's sketch */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-64 h-64 border-[12px] border-[#F5C030] rounded-full opacity-20 transform -translate-x-10 translate-y-10" />
             <div className="w-64 h-64 border-[12px] border-[#F5C030] rounded-full opacity-10 transform translate-x-20 -translate-y-5" />
          </div>
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-[#F5C030]/10 border-2 border-[#F5C030]/20 flex items-center justify-center">
               <span className="text-4xl">🔐</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 space-y-6 text-center"
        >
          <h1 className="text-3xl font-bold text-[#1C1917]">
            {t("onboarding_consent_title") as string}
          </h1>
          <p className="text-lg text-[#1C1917]/70 leading-relaxed">
            {t("onboarding_consent_subtitle") as string}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="space-y-4"
      >
        <button
          onClick={() => navigate("/")}
          className="w-full rounded-full bg-gradient-to-r from-[#F5C030] to-[#FF8A3D] py-4 text-lg font-bold text-white shadow-lg shadow-[#F5C030]/20 active:scale-95 transition-all"
        >
          {t("onboarding_consent_cta") as string}
        </button>
        <p className="text-center text-sm text-[#1C1917]/50">
          {t("onboarding_consent_footer") as string}
        </p>
      </motion.div>
    </div>
  );
}
