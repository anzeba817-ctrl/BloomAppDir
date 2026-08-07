"use client";

import { useNavigate } from "react-router-dom";
import { SunnyMascot } from "../components/sunny-mascot";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export function OnboardingWelcomeNew() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-8 py-12 text-center">
      <div className="flex-1 flex flex-col items-center justify-start w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-square flex items-center justify-center -mt-10"
        >
          <SunnyMascot mood="blooming" size={400} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 px-4 mt-8"
        >
          <h1 className="text-2xl font-bold text-[#1C1917]">
            {t("onboarding_welcome_hi_sunny") as string}
          </h1>
          <p className="text-base leading-relaxed text-[#1C1917] font-medium">
            {t("onboarding_welcome_subtext") as string}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-xs space-y-8 pb-10"
      >
        <button
          onClick={handleStart}
          className="w-full rounded-full bg-[#0085FF] py-4 text-2xl font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          {t("onboarding_welcome_cta") as string}
        </button>

        {!isAuthenticated && (
          <div className="space-y-4">
            <p className="text-lg text-[#1C1917]/70 font-medium">
              {t("onboarding_welcome_already_account") as string}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-full bg-[#F3E8FF] py-3 text-lg font-bold text-[#1C1917] transition-all active:scale-95"
            >
              {t("onboarding_welcome_signin") as string}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
