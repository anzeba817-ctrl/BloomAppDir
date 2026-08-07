"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface CheckInModalProps {
  habit: { name: string; mode: "build" | "quit" };
  onClose: () => void;
  onComplete: (mood: string, note: string) => void;
}

export function CheckInModal({ habit, onClose, onComplete }: CheckInModalProps) {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");

  const moods = [
    { emoji: "😊", label: t("mood_excellent"), value: "excellent" },
    { emoji: "🙂", label: t("mood_good_label"), value: "good" },
    { emoji: "😐", label: t("mood_neutral_label"), value: "neutral" },
    { emoji: "😕", label: t("mood_hard_label"), value: "hard" },
    { emoji: "😢", label: t("mood_struggling_label"), value: "struggling" },
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      onComplete(selectedMood, note);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#141D24]">{t("daily_validation") as string}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#141D24]/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#141D24]" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[#141D24]/70 mb-2">
            {t("bravo_for") as string} <span className="font-semibold text-[#141D24]">{habit.name}</span> !
          </p>
          <p className="text-sm text-[#141D24]/60">{t("how_feeling_today") as string}</p>
        </div>

        {/* Mood Selector */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                selectedMood === mood.value
                  ? "bg-[#E8920A] scale-110 shadow-lg"
                  : "bg-[#141D24]/5 hover:bg-[#141D24]/10"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-tight text-center ${
                  selectedMood === mood.value ? "text-white" : "text-[#141D24]/60"
                }`}
              >
                {mood.label as string}
              </span>
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm text-[#141D24]/70 mb-2">
            {t("personal_note_optional") as string}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("note_placeholder") as string}
            className="w-full bg-[#141D24]/5 rounded-2xl px-4 py-3 text-[#141D24] resize-none focus:outline-none focus:ring-2 focus:ring-[#E8920A] transition-all"
            rows={3}
          />
        </div>

        <motion.button
          whileHover={{ scale: selectedMood ? 1.02 : 1 }}
          whileTap={{ scale: selectedMood ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full bg-[#E8920A] text-white py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-bold"
        >
          {t("validate_day") as string}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
