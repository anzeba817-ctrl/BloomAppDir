"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Pause, RotateCcw, Calendar, TrendingUp, Lightbulb, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { SunnyMascot } from "../components/sunny-mascot";
import type { Habit } from "../types/habit";
import { getEffortLabel, getEffortScore } from "../utils/habit-effort";
import { useLanguage } from "../contexts/LanguageContext";

export function HabitDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const habit = location.state?.habit as Habit | undefined;

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(10);
  const [showTip, setShowTip] = useState(0);

  useEffect(() => {
    if (habit?.durationMinutes && habit.durationMinutes > 0) {
      setTargetMinutes(habit.durationMinutes);
    }
  }, [habit?.durationMinutes]);

  const effortScore = useMemo(() => (habit ? getEffortScore(habit) : 0), [habit]);
  const effortLabel = useMemo(() => getEffortLabel(effortScore), [effortScore]);

  const encouragement = useMemo(() => {
    if (!habit) return "";
    if (habit.streak >= 14) {
      return (t("encourage_strong") as string)
        .replace("{{streak}}", habit.streak.toString())
        .replace("{{effort}}", effortLabel);
    }
    if (habit.streak >= 3) {
      return (t("encourage_steady") as string).replace("{{effort}}", effortLabel);
    }
    return (t("encourage_start") as string).replace("{{effort}}", effortLabel);
  }, [effortLabel, habit, t]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
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

  const tips = (habit?.mode === "build" ? t("tips_build") : t("tips_quit")) as string[];

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTip(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (!habit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#1C1917]/60 font-bold">{t("no_habit_selected") as string}</p>
      </div>
    );
  }

  const modeColor = habit.mode === "build" ? "#10B981" : "#8B5CF6";

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-50 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1C1917]">{habit.name}</h1>
          <p className={`text-[10px] font-black uppercase tracking-widest ${habit.mode === 'build' ? 'text-green-600' : 'text-purple-600'}`}>
            {habit.mode === "build" ? t("build_mode_label") : t("quit_mode_label")} • {habit.streak} {t("streak_days") as string}
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <SunnyMascot mood={timerSeconds > 0 ? "growing" : "neutral"} size={140} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-gray-100 bg-gray-50/50 p-6 text-sm shadow-sm"
        >
          <p className="text-[#1C1917]/80 font-medium leading-relaxed">
            <span className="font-bold text-[#F5C030]">Sunny:</span> {encouragement}
          </p>
          <p className="mt-3 text-[10px] font-black text-[#1C1917]/30 uppercase tracking-widest">
            {t("current_level") as string}: {effortLabel}
          </p>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-50"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${modeColor}15` }}>
               <Clock className="w-5 h-5" style={{ color: modeColor }} />
            </div>
            <h2 className="text-xl font-bold text-[#1C1917]">{t("timer") as string}</h2>
          </div>

          <div className="relative w-56 h-56 mx-auto mb-10">
            <svg className="transform -rotate-90 w-full h-full">
              <circle cx="112" cy="112" r="100" className="stroke-gray-100 fill-none" strokeWidth="12" />
              <motion.circle
                cx="112" cy="112" r="100" className="fill-none" style={{ stroke: modeColor }} strokeWidth="12"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 100}
                initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-black text-[#1C1917]">
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-xs font-bold text-[#1C1917]/30 mt-2 uppercase tracking-widest">
                  / {targetMinutes} min
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }}
              className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-[#1C1917]/40 active:scale-90 transition-all border border-gray-100"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-24 h-24 rounded-[32px] shadow-2xl transition-all active:scale-95 flex items-center justify-center"
              style={{ backgroundColor: modeColor, boxShadow: `0 20px 40px ${modeColor}30` }}
            >
              {isTimerRunning ? <Pause className="w-10 h-10 text-white" fill="white" /> : <Play className="w-10 h-10 text-white ml-1" fill="white" />}
            </button>
            <div className="w-16" />
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {[5, 10, 15, 20, 30].map(mins => (
              <button
                key={mins} onClick={() => setTargetMinutes(mins)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  targetMinutes === mins
                    ? "text-white shadow-md shadow-gray-200"
                    : "bg-gray-50 text-[#1C1917]/40 hover:bg-gray-100"
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
          className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
               <Lightbulb className="w-4 h-4 text-[#F5C030]" />
            </div>
            <h2 className="text-lg font-bold text-[#1C1917]">{t("tip_of_the_day") as string}</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showTip} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}
              className="text-[#1C1917]/60 font-medium italic text-sm leading-relaxed"
            >
              "{tips[showTip]}"
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 mt-6 justify-center">
            {tips.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === showTip ? "w-6 bg-[#F5C030]" : "w-2 bg-gray-100"}`} />
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/habit-calendar", { state: { habit } })}
            className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-active:scale-90" style={{ backgroundColor: `${modeColor}10` }}>
               <Calendar className="w-6 h-6" style={{ color: modeColor }} />
            </div>
            <div className="font-bold text-[#1C1917] mb-1">{t("history") as string}</div>
            <div className="text-[11px] font-bold text-[#1C1917]/30 uppercase tracking-tight">{t("see_calendar") as string}</div>
          </button>

          <button className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-active:scale-90" style={{ backgroundColor: `${modeColor}10` }}>
               <TrendingUp className="w-6 h-6" style={{ color: modeColor }} />
            </div>
            <div className="font-bold text-[#1C1917] mb-1">{t("stats") as string}</div>
            <div className="text-[11px] font-bold text-[#1C1917]/30 uppercase tracking-tight">{t("see_progress") as string}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
