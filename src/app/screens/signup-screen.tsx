"use client";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SunnyMascot } from "../components/sunny-mascot";
import { ChevronLeft, Info } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function SignupScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  const isPasswordStrong = (pw: string) => {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
  };

  const handleSignup = () => {
    if (!email || !password || !displayName) {
      toast.error(t("error_all_fields_required") as string);
      return;
    }
    if (!isPasswordStrong(password)) {
      toast.error(t("password_requirements") as string);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("error_passwords_mismatch") as string);
      return;
    }

    signup(email, displayName);
    navigate("/onboarding/survey");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center bg-white px-8 pt-4 pb-8 text-center relative overflow-hidden">
      <button
        onClick={() => navigate("/auth")}
        className="absolute left-6 top-6 p-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm active:scale-95 transition-all z-10"
      >
        <ChevronLeft size={24} className="text-[#1C1917]" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-square flex items-center justify-center -mt-4"
        >
          <SunnyMascot mood="blooming" size={80} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full space-y-4 mt-2 text-center"
        >
          <h1 className="text-2xl font-bold text-[#1C1917] leading-tight text-center">
            {t("signup_title") as string}
          </h1>

          <div className="space-y-3 relative text-left">
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

            <div className="relative">
              <AnimatePresence>
                {showPasswordHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute -top-12 left-0 right-0 z-20 bg-[#1C1917] text-white text-[10px] py-2 px-3 rounded-xl shadow-xl flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Info size={12} className="text-[#F5C030]" />
                      <span className="font-bold">{t("password_requirements") as string}</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1C1917] rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="password"
                placeholder={t("signup_password_placeholder") as string}
                value={password}
                onFocus={() => setShowPasswordHint(true)}
                onBlur={() => setShowPasswordHint(false)}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-base focus:outline-none transition-all ${
                  password && !isPasswordStrong(password) ? "border-red-200" : "border-gray-100 focus:border-[#F5C030]"
                }`}
              />
            </div>

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
            className="w-full rounded-2xl bg-[#F3F4F6] py-3.5 text-lg font-bold text-[#1C1917] transition-all active:scale-95 shadow-sm"
          >
            {t("signup_cta") as string}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 space-y-3"
        >
          <p className="text-center text-xs font-semibold text-[#F5C030] text-justify px-4">
            “{t("onboarding_auth_safe") as string}”
          </p>
        </motion.div>
      </div>
    </div>
  );
}
