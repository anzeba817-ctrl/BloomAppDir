"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SunnyMascot } from "../components/sunny-mascot";
import { Check, ChevronLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function SignupScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signup } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    if (!email || !password || !displayName) {
      toast.error(t("error_all_fields_required") as string);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("error_passwords_mismatch") as string);
      return;
    }
    if (!agreed) {
      toast.error(t("signup_consent_error") as string);
      return;
    }

    signup(email, displayName);
    navigate("/onboarding/survey");
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-8 py-8 text-center relative overflow-hidden">
      <button
        onClick={() => navigate("/auth")}
        className="absolute left-6 top-6 p-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm active:scale-95 transition-all z-10"
      >
        <ChevronLeft size={24} className="text-[#1C1917]" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-square flex items-center justify-center -mt-12"
        >
          <SunnyMascot mood="blooming" size={240} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full space-y-4 -mt-4"
        >
          <h1 className="text-2xl font-bold text-[#1C1917]">
            {t("signup_title") as string}
          </h1>

          <div className="space-y-3">
            <input
              type="text"
              placeholder={t("full_name_placeholder") as string}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base focus:border-[#F5C030] focus:outline-none transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base focus:border-[#F5C030] focus:outline-none transition-all"
            />
            <input
              type="password"
              placeholder={t("signup_password_placeholder") as string}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base focus:border-[#F5C030] focus:outline-none transition-all"
            />
            <input
              type="password"
              placeholder={t("signup_confirm_password_placeholder") as string}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base focus:border-[#F5C030] focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={handleSignup}
            className="w-full rounded-2xl bg-[#F3E8FF] py-3.5 text-lg font-bold text-[#1C1917] transition-all active:scale-95 shadow-sm"
          >
            {t("signup_cta") as string}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 space-y-3 text-left w-full"
        >
          <div className="flex gap-3 items-start cursor-pointer" onClick={() => setAgreed(!agreed)}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${agreed ? "bg-[#10B981] border-[#10B981]" : "border-gray-200 bg-white"}`}>
              {agreed && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
            <p className="text-xs font-medium text-[#1C1917]/60 leading-snug">
              “{t("onboarding_consent_footer") as string}”
            </p>
          </div>

          <p className="text-center text-xs font-semibold text-[#F5C030]">
            “{t("onboarding_auth_safe") as string}”
          </p>
        </motion.div>
      </div>
    </div>
  );
}
