"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Pause, RotateCcw, Calendar, TrendingUp, Lightbulb, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { SunnyMascot } from "../components/sunny-mascot";

interface Habit {
  id: string;
  name: string;
  mode: "build" | "quit";
  streak: number;
  lastCheckIn: string | null;
  history: Array<{ date: string; mood?: string; note?: string }>;
}

export function HabitDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const habit = location.state?.habit as Habit | undefined;

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(10);
  const [showTip, setShowTip] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = Math.min((timerSeconds / (targetMinutes * 60)) * 100, 100);

  const tips = habit?.mode === "build"
    ? [
        "commence petit : 2 minutes valent mieux que 0 minute",
        "fais-le à la même heure chaque jour pour créer une routine",
        "prépare ton environnement la veille pour éliminer les frictions",
        "relie cette habitude à une habitude existante (ex: après le café)",
        "célèbre chaque victoire, même minuscule 🌻",
      ]
    : [
        "identifie le déclencheur qui précède l'habitude à quitter",
        "remplace l'habitude par quelque chose de positif",
        "évite les environnements qui déclenchent l'envie",
        "rappelle-toi pourquoi tu veux arrêter (écris-le)",
        "chaque jour sans rechute est une victoire 💎",
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTip(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (!habit) {
    return (
      <div className="min-h-screen bg-[#FEF8F0] flex items-center justify-center">
        <p className="text-[#141D24]/60">aucune habitude sélectionnée</p>
      </div>
    );
  }

  const modeColor = habit.mode === "build" ? "#3A7D4F" : "#6B4FA0";

  return (
    <div className="min-h-screen bg-[#FEF8F0]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FEF8F0]/95 backdrop-blur-sm border-b border-[#141D24]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#141D24]/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#141D24]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl text-[#141D24]">{habit.name}</h1>
            <p className="text-sm text-[#141D24]/60">
              {habit.mode === "build" ? "encrage" : "sevrage"} • {habit.streak} jours
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Sunny Mascot */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <SunnyMascot
            mood={timerSeconds > 0 ? "growing" : "neutral"}
            size={140}
          />
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5" style={{ color: modeColor }} />
            <h2 className="text-lg text-[#141D24]">minuteur</h2>
          </div>

          {/* Progress Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#141D24"
                strokeOpacity="0.1"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke={modeColor}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-semibold text-[#141D24]">
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-sm text-[#141D24]/60 mt-1">
                  / {targetMinutes} min
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setTimerSeconds(0);
                setIsTimerRunning(false);
              }}
              className="p-4 bg-[#141D24]/5 rounded-full hover:bg-[#141D24]/10 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-[#141D24]" />
            </button>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-6 rounded-full shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: modeColor }}
            >
              {isTimerRunning ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>
            <div className="w-16" />
          </div>

          {/* Duration Selector */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[5, 10, 15, 20, 30].map(mins => (
              <button
                key={mins}
                onClick={() => setTargetMinutes(mins)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  targetMinutes === mins
                    ? "text-white"
                    : "bg-[#141D24]/5 text-[#141D24]/60 hover:bg-[#141D24]/10"
                }`}
                style={targetMinutes === mins ? { backgroundColor: modeColor } : {}}
              >
                {mins}m
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-[#F5C030]" />
            <h2 className="text-lg text-[#141D24]">conseil du jour</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showTip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="text-[#141D24]/80 italic"
            >
              "{tips[showTip]}"
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1 mt-4 justify-center">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === showTip ? "bg-[#F5C030]" : "bg-[#141D24]/10"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate("/habit-calendar", { state: { habit } })}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <Calendar className="w-6 h-6 mb-3" style={{ color: modeColor }} />
            <div className="font-medium text-[#141D24] mb-1">historique</div>
            <div className="text-sm text-[#141D24]/60">voir le calendrier</div>
          </button>

          <button className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left">
            <TrendingUp className="w-6 h-6 mb-3" style={{ color: modeColor }} />
            <div className="font-medium text-[#141D24] mb-1">statistiques</div>
            <div className="text-sm text-[#141D24]/60">vois ta progression</div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

