"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SunnyMascot } from "../components/sunny-mascot";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

export function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      toast.error(t("error_all_fields_required") as string);
      return;
    }
    // Simulate login
    login(email);
    navigate("/dashboard");
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
            {t("login_title") as string}
          </h1>

          <div className="space-y-3">
            <input
              type="email"
              placeholder={t("login_email_placeholder") as string}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base focus:border-[#F5C030] focus:outline-none transition-all"
            />
            <input
              type="password"
              placeholder={t("login_password_placeholder") as string}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base focus:border-[#F5C030] focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-[#F3E8FF] py-3.5 text-lg font-bold text-[#1C1917] transition-all active:scale-95 shadow-sm"
          >
            {t("login_cta") as string}
          </button>

          <button className="text-sm font-semibold text-[#1C1917]/40 underline decoration-gray-200 underline-offset-4 w-full px-2">
            {t("login_forgot_password") as string}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
