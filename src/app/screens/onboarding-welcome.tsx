"use client";

import { useNavigate } from "react-router-dom";
import { SunnyMascot } from "../components/sunny-mascot";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
// @ts-ignore: allow importing image asset without type declaration
import LogoImg from "../../imports/Logo.png";

export function OnboardingWelcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md rounded-[32px] border border-border/70 bg-white/80 p-7 shadow-[0_20px_80px_rgba(20,29,36,0.08)] backdrop-blur-xl"
      >
        <div className="mb-6 flex justify-center">
          <SunnyMascot mood="neutral" variant="expressive" size={160} />
        </div>

        <div className="space-y-5 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Bloom</p>
            <h1 className="text-2xl font-semibold text-foreground">hello, je m'appelle sunny bloom.</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Une expérience douce pour suivre tes habitudes, te célébrer et avancer à ton rythme, sans pression.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/onboarding/mode")}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-[#F5C030] px-6 py-4 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl"
          >
            commencer doucement
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <ImageWithFallback src={LogoImg} alt="Bloom logo" style={{ width: 24, height: 24 }} />
          <span>bloom • v1.0</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

