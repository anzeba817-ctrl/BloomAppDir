"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Star, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { SunnyMascot } from "../components/sunny-mascot";
import confetti from "canvas-confetti";

interface DanceStep {
  id: string;
  emoji: string;
  text: string;
  animation: string;
}

const danceSteps: DanceStep[] = [
  { id: "wave", emoji: "👋", text: "salue sunny!", animation: "wave" },
  { id: "jump", emoji: "🦘", text: "saute de joie!", animation: "jump" },
  { id: "spin", emoji: "🌀", text: "tourne!", animation: "spin" },
  { id: "celebrate", emoji: "🎉", text: "célèbre!", animation: "celebrate" },
];

export function CelebrationDance() {
  const navigate = useNavigate();
  const location = useLocation();
  const milestone = location.state?.milestone || { streak: 7, type: "week" };

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    // AJOUT DE "as any" ICI pour le premier confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F5C030", "#E8920A", "#3A7D4F", "#6B4FA0"],
    } as any);
  }, []);

  const handleStepComplete = (step: DanceStep) => {
    if (completedSteps.includes(step.id)) return;

    setCompletedSteps([...completedSteps, step.id]);

    // AJOUT DE "as any" ICI pour le deuxième confetti
    confetti({
      particleCount: 50,
      angle: 60 + Math.random() * 60,
      spread: 55,
      origin: { x: Math.random(), y: Math.random() * 0.6 },
      colors: ["#F5C030", "#E8920A"],
    } as any);

    // Move to next step
    if (currentStep < danceSteps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 500);
    }
  };

  const handlePlayDance = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setCompletedSteps([]);

    // Auto-play through all steps
    danceSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        handleStepComplete(step);
      }, index * 1500);
    });

    // Finish
    setTimeout(() => {
      setIsPlaying(false);
      // AJOUT DE "as any" ICI pour le troisième confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#F5C030", "#E8920A", "#3A7D4F", "#6B4FA0"],
      } as any);
    }, danceSteps.length * 1500 + 500);
  };

  const getAnimationVariant = (animationType: string) => {
    switch (animationType) {
      case "wave":
        return {
          animate: {
            rotate: [0, 15, -15, 15, 0],
            transition: { duration: 1, repeat: 2 },
          },
        };
      case "jump":
        return {
          animate: {
            y: [0, -30, 0, -30, 0],
            transition: { duration: 1, repeat: 2 },
          },
        };
      case "spin":
        return {
          animate: {
            rotate: [0, 360],
            transition: { duration: 1.5, repeat: 1 },
          },
        };
      case "celebrate":
        return {
          animate: {
            scale: [1, 1.2, 1, 1.2, 1],
            transition: { duration: 1, repeat: 2 },
          },
        };
      default:
        return {};
    }
  };

  const allStepsComplete = completedSteps.length === danceSteps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5C030]/20 via-[#FEF8F0] to-[#E8920A]/20 relative overflow-hidden">
      {/* Floating elements */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-20"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800)],
            x: [null, Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000)],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {["🌻", "⭐", "💛", "✨"][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}

      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
      >
        <X className="w-5 h-5 text-[#141D24]" />
      </button>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Crown className="w-12 h-12 text-[#F5C030]" />
          </motion.div>
          <h1 className="text-3xl mb-2 text-[#141D24]">
            {milestone.streak} jours de série !
          </h1>
          <p className="text-lg text-[#141D24]/70">
            c'est le moment de danser avec sunny 🎉
          </p>
        </motion.div>

        {/* Sunny Dancing */}
        <motion.div
          {...getAnimationVariant(danceSteps[currentStep]?.animation)}
          className="mb-8"
        >
          <SunnyMascot mood="overjoyed" size={200} />
        </motion.div>

        {/* Current Step */}
        <AnimatePresence mode="wait">
          {!allStepsComplete && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8 text-center max-w-md"
            >
              <div className="text-6xl mb-4">{danceSteps[currentStep]?.emoji}</div>
              <div className="text-2xl font-semibold text-[#141D24] mb-4">
                {danceSteps[currentStep]?.text}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStepComplete(danceSteps[currentStep])}
                disabled={completedSteps.includes(danceSteps[currentStep]?.id)}
                className="px-8 py-4 bg-gradient-to-r from-[#E8920A] to-[#F5C030] text-white rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completedSteps.includes(danceSteps[currentStep]?.id)
                  ? "fait ! ✓"
                  : "c'est parti !"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Auto Dance */}
        {!isPlaying && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayDance}
            className="mb-8 px-6 py-3 bg-white/80 backdrop-blur-sm text-[#141D24] rounded-2xl shadow-lg hover:bg-white transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-[#F5C030]" />
            voir la danse automatique
          </motion.button>
        )}

        {/* Progress */}
        <div className="flex gap-2">
          {danceSteps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-3 h-3 rounded-full transition-colors ${
                completedSteps.includes(step.id)
                  ? "bg-[#3A7D4F]"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Completion Message */}
        <AnimatePresence>
          {allStepsComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-gradient-to-r from-[#3A7D4F] to-[#6B4FA0] text-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
            >
              <Star className="w-16 h-16 mx-auto mb-4 fill-current" />
              <h2 className="text-2xl font-semibold mb-3">
                incroyable !
              </h2>
              <p className="text-white/90 mb-6">
                tu as terminé la danse de la victoire. sunny est super fier(e) de toi ! 🌻
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 bg-white text-[#3A7D4F] rounded-2xl font-semibold hover:bg-white/90 transition-colors"
              >
                retour au dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
