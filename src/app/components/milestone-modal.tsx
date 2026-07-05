"use client";

import { motion } from "motion/react";
import { SunnyMascot } from "./sunny-mascot";
import { Share2, X, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

interface MilestoneModalProps {
  streak: number;
  onClose: () => void;
}

export function MilestoneModal({ streak, onClose }: MilestoneModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#F5C030", "#E8920A", "#3A7D4F"],
      } as any);

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#F5C030", "#E8920A", "#3A7D4F"],
      } as any);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getMessage = () => {
    if (streak === 7) return "sunny is growing strong!";
    if (streak === 30) return "sunny is FULLY bloomed. tu did that.";
    if (streak === 100) return "sunny is legendary now. incroyable.";
    return "incroyable ! continue comme ça.";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-[#E8920A]/20 via-[#F5C030]/20 to-[#3A7D4F]/20 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[#141D24]/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-[#141D24]" />
        </button>

        {/* Celebration badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-block bg-gradient-to-r from-[#E8920A] to-[#F5C030] text-white px-6 py-2 rounded-full text-sm mb-6"
        >
          🎉 jalon atteint !
        </motion.div>

        {/* Sunny mascot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6 flex justify-center"
        >
          <SunnyMascot mood="overjoyed" variant="expressive" size={160} />
        </motion.div>

        {/* Streak number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <div className="text-6xl font-bold text-[#E8920A] mb-2">{streak}</div>
          <div className="text-xl text-[#141D24]">jours de série</div>
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#141D24]/80 mb-8 leading-relaxed"
        >
          {getMessage()}
        </motion.p>

        {/* Action buttons */}
        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-[#E8920A] to-[#F5C030] text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            onClick={() => {
              onClose();
              navigate("/celebration-dance", { state: { milestone: { streak, type: "week" } } });
            }}
          >
            <Sparkles className="w-5 h-5" />
            danser avec sunny !
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white text-[#E8920A] py-4 rounded-2xl flex items-center justify-center gap-2 border-2 border-[#E8920A]/20"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Bloom Achievement",
                  text: `${streak} jours de série sur Bloom ! 🌻`,
                });
              }
            }}
          >
            <Share2 className="w-5 h-5" />
            partager mon succès
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#F5C030] rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#3A7D4F] rounded-full blur-3xl opacity-20" />
      </motion.div>
    </motion.div>
  );
}

