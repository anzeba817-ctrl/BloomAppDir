"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, ChevronLeft } from "lucide-react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";

export function AuthScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGoogleSignIn = async () => {
    // Note: Utilisation des identifiants du projet (.env.development)
    // Client ID Web: 312746932018-9lqf82ue8ault4709h5olqf9mhj4f9j8.apps.googleusercontent.com
    try {
      // Mock de la logique de connexion Google pour la démo
      // Dans un environnement réel avec @capacitor-community/google-auth :
      // const user = await GoogleAuth.signIn();
      console.log("Tentative de connexion Google...");
      setTimeout(() => {
        navigate("/onboarding/survey");
      }, 1000);
    } catch (error) {
      console.error("Erreur Google Sign-In:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-8 py-12 text-center relative">
      <button
        onClick={() => navigate("/")}
        className="absolute left-6 top-10 p-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm active:scale-95 transition-all z-10"
      >
        <ChevronLeft size={24} className="text-[#1C1917]" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-start w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-square flex items-center justify-center -mt-20"
        >
          <SunnyMascot mood="blooming" size={450} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 px-4 mt-4"
        >
          <h1 className="text-2xl font-bold text-[#1C1917]">
            {t("onboarding_auth_title") as string}
          </h1>
          <p className="text-lg leading-relaxed text-[#1C1917] font-medium">
            {t("onboarding_auth_subtitle") as string}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-sm space-y-4 pb-6"
      >
        <AuthButton
          icon={<GoogleIcon />}
          text={t("onboarding_auth_google") as string}
          onClick={handleGoogleSignIn}
        />
        <AuthButton
          icon={<Mail size={22} className="text-[#1C1917]" />}
          text={t("onboarding_auth_email") as string}
          onClick={() => navigate("/signup")}
        />

        <p className="mt-6 text-[#1C1917] font-medium">
          {t("onboarding_auth_footer") as string} <button onClick={() => navigate("/login")} className="text-[#0085FF] font-bold">{t("onboarding_auth_login") as string}</button>
        </p>
      </motion.div>
    </div>
  );
}

function AuthButton({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-gray-100 py-4 text-lg font-bold text-[#1C1917] shadow-sm transition-all active:scale-95"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
