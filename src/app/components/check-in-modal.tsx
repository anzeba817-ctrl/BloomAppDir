"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";

interface CheckInModalProps {
  habit: { name: string; mode: "build" | "quit" };
  onClose: () => void;
  onComplete: (mood: string, note: string) => void;
}

const moods = [
  { emoji: "😊", label: "excellent", value: "excellent" },
  { emoji: "🙂", label: "bien", value: "good" },
  { emoji: "😐", label: "neutre", value: "neutral" },
  { emoji: "😕", label: "difficile", value: "hard" },
  { emoji: "😢", label: "très dur", value: "struggling" },
];

export function CheckInModal({ habit, onClose, onComplete }: CheckInModalProps) {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");

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
          <h2 className="text-2xl text-[#141D24]">validation quotidienne</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#141D24]/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#141D24]" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[#141D24]/70 mb-2">
            bravo pour <span className="font-semibold text-[#141D24]">{habit.name}</span> !
          </p>
          <p className="text-sm text-[#141D24]/60">comment te sens-tu aujourd'hui ?</p>
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
                className={`text-xs ${
                  selectedMood === mood.value ? "text-white" : "text-[#141D24]/60"
                }`}
              >
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm text-[#141D24]/70 mb-2">
            note personnelle (optionnel)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="qu'as-tu ressenti ? qu'as-tu appris ?"
            className="w-full bg-[#141D24]/5 rounded-2xl px-4 py-3 text-[#141D24] resize-none focus:outline-none focus:ring-2 focus:ring-[#E8920A] transition-all"
            rows={3}
          />
        </div>

        <motion.button
          whileHover={{ scale: selectedMood ? 1.02 : 1 }}
          whileTap={{ scale: selectedMood ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full bg-[#E8920A] text-white py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          valider la journée
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
