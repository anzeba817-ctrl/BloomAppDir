"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Target, Calendar, Clock, Bell, Repeat } from "lucide-react";
import { useState } from "react";
import { SunnyMascot } from "../components/sunny-mascot";

export function HabitCreate() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"build" | "quit">("build");
  const [habitName, setHabitName] = useState("");
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [enableReminder, setEnableReminder] = useState(true);
  const [duration, setDuration] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHabit = {
      id: Math.random().toString(36).substr(2, 9),
      name: habitName,
      mode,
      streak: 0,
      lastCheckIn: null,
      history: [],
      goal,
      frequency,
      reminderTime: enableReminder ? reminderTime : null,
      duration,
      startDate,
    };

    console.log("New habit created:", newHabit);

    // Navigate back with success state
    navigate("/dashboard", {
      state: { newHabit, showSuccess: true },
    });
  };

  const isFormValid = habitName.trim().length > 0;

  const modeColor = mode === "build" ? "#3A7D4F" : "#6B4FA0";

  return (
    <div className="min-h-screen bg-[#FEF8F0]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FEF8F0]/95 backdrop-blur-sm border-b border-[#141D24]/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#141D24]/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#141D24]" />
            </button>
            <h1 className="text-xl text-[#141D24]">nouvelle habitude</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-xl text-white transition-all ${
              isFormValid
                ? "opacity-100 hover:scale-105"
                : "opacity-40 cursor-not-allowed"
            }`}
            style={{ backgroundColor: modeColor }}
          >
            créer
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mascot */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <SunnyMascot mood="neutral" size={120} />
          </motion.div>

          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-lg"
          >
            <h2 className="text-lg mb-4 text-[#141D24]">type d'habitude</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode("build")}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  mode === "build"
                    ? "border-[#3A7D4F] bg-[#3A7D4F]/5"
                    : "border-[#141D24]/10 hover:border-[#3A7D4F]/30"
                }`}
              >
                <div className="text-3xl mb-2">🌱</div>
                <div className="font-semibold text-[#141D24] mb-1">encrage</div>
                <div className="text-sm text-[#141D24]/60">construire une habitude</div>
              </button>
              <button
                type="button"
                onClick={() => setMode("quit")}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  mode === "quit"
                    ? "border-[#6B4FA0] bg-[#6B4FA0]/5"
                    : "border-[#141D24]/10 hover:border-[#6B4FA0]/30"
                }`}
              >
                <div className="text-3xl mb-2">💎</div>
                <div className="font-semibold text-[#141D24] mb-1">sevrage</div>
                <div className="text-sm text-[#141D24]/60">se libérer d'une habitude</div>
              </button>
            </div>
          </motion.div>

          {/* Habit Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-lg"
          >
            <label className="block text-lg mb-3 text-[#141D24]">
              {mode === "build" ? "qu'aimerais-tu faire ?" : "de quoi veux-tu te libérer ?"}
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder={
                mode === "build"
                  ? "ex: méditer 10 minutes, lire, courir..."
                  : "ex: réseaux sociaux, cigarette, sucre..."
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-[#141D24]/10 focus:border-[#3A7D4F] focus:outline-none transition-colors text-[#141D24]"
              maxLength={60}
            />
            <div className="text-xs text-[#141D24]/40 mt-2 text-right">
              {habitName.length}/60
            </div>
          </motion.div>

          {/* Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5" style={{ color: modeColor }} />
              <label className="text-lg text-[#141D24]">pourquoi ?</label>
            </div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="ton objectif t'aidera à rester motivé(e) dans les moments difficiles..."
              className="w-full px-4 py-3 rounded-xl border-2 border-[#141D24]/10 focus:border-[#3A7D4F] focus:outline-none transition-colors text-[#141D24] resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-[#141D24]/40 mt-2 text-right">
              {goal.length}/200
            </div>
          </motion.div>

          {/* Frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <Repeat className="w-5 h-5" style={{ color: modeColor }} />
              <label className="text-lg text-[#141D24]">fréquence</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "daily", label: "quotidien", icon: "📅" },
                { value: "weekly", label: "hebdo", icon: "📆" },
                { value: "custom", label: "perso", icon: "⚙️" },
              ].map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value as typeof frequency)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    frequency === freq.value
                      ? "border-current bg-current/5"
                      : "border-[#141D24]/10 hover:border-current/30"
                  }`}
                  style={frequency === freq.value ? { color: modeColor } : {}}
                >
                  <div className="text-2xl mb-1">{freq.icon}</div>
                  <div className="text-sm font-medium">{freq.label}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Duration */}
          {mode === "build" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5" style={{ color: modeColor }} />
                <label className="text-lg text-[#141D24]">durée souhaitée</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1"
                  style={{
                    accentColor: modeColor,
                  }}
                />
                <div className="text-xl font-semibold text-[#141D24] min-w-[4rem]">
                  {duration} min
                </div>
              </div>
            </motion.div>
          )}

          {/* Reminder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" style={{ color: modeColor }} />
                <label className="text-lg text-[#141D24]">rappel quotidien</label>
              </div>
              <button
                type="button"
                onClick={() => setEnableReminder(!enableReminder)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  enableReminder ? "bg-current" : "bg-[#141D24]/20"
                }`}
                style={enableReminder ? { color: modeColor } : {}}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: enableReminder ? "calc(100% - 28px)" : "4px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            {enableReminder && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#141D24]/10 focus:border-[#3A7D4F] focus:outline-none transition-colors text-[#141D24]"
              />
            )}
          </motion.div>

          {/* Start Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5" style={{ color: modeColor }} />
              <label className="text-lg text-[#141D24]">date de début</label>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#141D24]/10 focus:border-[#3A7D4F] focus:outline-none transition-colors text-[#141D24]"
            />
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-[#F5C030]/10 to-[#E8920A]/10 rounded-3xl p-6"
          >
            <div className="text-sm text-[#141D24]/70 italic">
              💡 conseil : commence petit pour garantir le succès. il vaut mieux méditer 2 minutes
              tous les jours que 30 minutes une fois par semaine.
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

