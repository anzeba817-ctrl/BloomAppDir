"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Habit {
  id: string;
  name: string;
  mode: "build" | "quit";
  streak: number;
  lastCheckIn: string | null;
  history: Array<{ date: string; mood?: string; note?: string }>;
}

export function HabitCalendar() {
  const navigate = useNavigate();
  const location = useLocation();
  const habit = location.state?.habit as Habit | undefined;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedDates, setCompletedDates] = useState<string[]>(
    habit?.history.map(h => h.date) || []
  );

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);

    const dateStr = format(date, "yyyy-MM-dd");

    if (completedDates.includes(dateStr)) {
      // Uncheck
      setCompletedDates(completedDates.filter(d => d !== dateStr));
    } else {
      // Check
      setCompletedDates([...completedDates, dateStr]);
    }
  };

  const modifiers = {
    completed: completedDates.map(dateStr => new Date(dateStr)),
  };

  const modifiersStyles = {
    completed: {
      backgroundColor: habit?.mode === "build" ? "#3A7D4F" : "#6B4FA0",
      color: "white",
      fontWeight: 600,
    },
  };

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
            <div>
              <h1 className="text-xl text-[#141D24]">historique</h1>
              {habit && (
                <p className="text-sm text-[#141D24]/60">{habit.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#3A7D4F] text-white rounded-xl hover:bg-[#3A7D4F]/90 transition-colors"
          >
            sauvegarder
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <div className="mb-6">
            <h2 className="text-lg mb-2 text-[#141D24]">marque tes jours réussis</h2>
            <p className="text-sm text-[#141D24]/60">
              clique sur un jour pour le marquer comme complété ou le retirer
            </p>
          </div>

          <div className="flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onDayClick={handleDayClick}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={fr}
              className="!font-sans"
              styles={{
                caption: { color: "#141D24", fontWeight: 600, marginBottom: "1rem" },
                head_cell: { color: "#141D24", opacity: 0.6, fontWeight: 500 },
                cell: { padding: "0.5rem" },
                day: {
                  borderRadius: "0.75rem",
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "0.875rem",
                },
              }}
            />
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-[#141D24]/10 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: habit?.mode === "build" ? "#3A7D4F" : "#6B4FA0",
                  color: "white"
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-sm text-[#141D24]">
                jours complétés ({completedDates.length})
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#141D24]/5">
                <Circle className="w-5 h-5 text-[#141D24]/40" />
              </div>
              <div className="text-sm text-[#141D24]/60">
                jours non complétés
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 grid grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <div className="text-2xl mb-1 text-[#141D24]">{habit?.streak || 0}</div>
            <div className="text-xs text-[#141D24]/60">série actuelle</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <div className="text-2xl mb-1 text-[#141D24]">{completedDates.length}</div>
            <div className="text-xs text-[#141D24]/60">total jours</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <div className="text-2xl mb-1 text-[#141D24]">
              {completedDates.length > 0 ? Math.round((completedDates.length / 30) * 100) : 0}%
            </div>
            <div className="text-xs text-[#141D24]/60">ce mois</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

