"use client";

import { useNavigate } from "react-router-dom";
import { SunnyMascot } from "../components/sunny-mascot";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export function OnboardingWelcomeNew() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-dvh flex-col items-center bg-white px-8 pt-4 pb-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-square flex items-center justify-center -mt-4"
        >
          <SunnyMascot mood="blooming" size={100} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 px-4 mt-4"
        >
          <h1 className="text-2xl font-bold text-[#1C1917] leading-tight text-center">
            {t("onboarding_welcome_hi_sunny").toString().replace("🌻", "")}
          </h1>
          <p className="text-base leading-relaxed text-[#1C1917]/70 font-medium text-justify">
            {t("onboarding_welcome_subtext") as string}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full max-w-xs mb-8"
      >
        <div className="flex gap-3 items-start cursor-pointer text-left" onClick={() => setAgreed(!agreed)}>
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${agreed ? "bg-[#10B981] border-[#10B981]" : "border-gray-200 bg-white"}`}>
            {agreed && <Check size={14} className="text-white" strokeWidth={4} />}
          </div>
          <p className="text-xs font-medium text-[#1C1917]/60 leading-snug">
            {t("onboarding_consent_footer") as string}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-xs space-y-4 pb-10"
      >
        {!isAuthenticated ? (
          <div className="space-y-4">
            <button
              onClick={() => agreed && navigate("/auth")}
              disabled={!agreed}
              className={`w-full rounded-full py-4 text-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                agreed ? "bg-[#F5C030] shadow-orange-100" : "bg-gray-300 shadow-none cursor-not-allowed"
              }`}
            >
              {t("create_account") as string}
            </button>
            <button
              onClick={() => agreed && navigate("/login")}
              disabled={!agreed}
              className={`w-full rounded-full py-3 text-lg font-bold text-[#1C1917] transition-all active:scale-95 ${
                agreed ? "bg-[#F3F4F6]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {t("onboarding_welcome_signin") as string}
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-full bg-[#F5C030] py-4 text-xl font-bold text-white shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            {t("nav_dashboard") as string}
          </button>
        )}
      </motion.div>
    </div>
  );
}
