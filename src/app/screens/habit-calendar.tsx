"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import type { DayContentProps } from "react-day-picker";
import { format } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";
import type { Habit } from "../types/habit";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * SUIVI DES HABITUDES (CALENDRIER)
 */
export function HabitCalendar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const [habits] = useLocalStorage<Habit[]>("bloom-habits", []);

  const [currentView, setCurrentView] = useState<"build" | "quit">((searchParams.get("mode") as "build" | "quit") || "build");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam && (modeParam === "build" || modeParam === "quit")) {
      setCurrentView(modeParam as "build" | "quit");
    }
  }, [searchParams]);

  const setMode = (mode: "build" | "quit") => {
    setSearchParams({ mode }, { replace: true });
  };

  const checkInsByDate = useMemo(() => {
    const map: Record<string, { mode: "build" | "quit", name: string, count: number, total: number }[]> = {};
    habits.forEach(habit => {
      if (habit.mode !== currentView) return;
      habit.history.forEach(entry => {
        if (!map[entry.date]) map[entry.date] = [];
        map[entry.date].push({
          mode: habit.mode,
          name: habit.name,
          count: entry.completedCount ?? 1,
          total: habit.repetitionsPerDay || 1
        });
      });
    });
    return map;
  }, [habits, currentView]);

  const dateLocale = lang === "fr" ? fr : lang === "es" ? es : enUS;

  const DayContent = ({ date }: DayContentProps) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayCheckIns = checkInsByDate[dateKey] || [];
    const hasActivity = dayCheckIns.length > 0;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="z-10 text-sm">{date.getDate()}</span>
        {hasActivity && (
          <div className={`absolute bottom-1 w-1 h-1 rounded-full shadow-sm ${currentView === 'build' ? 'bg-green-500' : 'bg-purple-500'}`} />
        )}
      </div>
    );
  };

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const dayOfWeek = selectedDate.getDay();

  const selectedDayHabits = useMemo(() => {
    return habits.filter(h => {
      if (h.mode !== currentView) return false;

      if (h.frequency === "daily") return true;
      if (h.frequency === "weekly" || h.frequency === "custom") {
        return h.selectedDays?.includes(dayOfWeek) ?? true;
      }
      return true;
    }).map(h => {
      const entry = h.history.find(e => e.date === selectedDateKey);
      return {
        ...h,
        completedCount: entry?.completedCount ?? 0
      };
    });
  }, [habits, currentView, selectedDateKey, dayOfWeek]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917]">{t("habit_calendar_title") as string}</h1>
      </div>

      <div className="max-w-xl mx-auto px-6 py-6 pb-32">
        <div className="mb-8 bg-[#F3F4F6] p-1 rounded-full flex relative">
          <button
            onClick={() => setMode("build")}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${
              currentView === "build" ? "bg-[#10B981] text-white shadow-md" : "text-[#1C1917]/40"
            }`}
          >
            {t("build_mode") as string}
          </button>
          <button
            onClick={() => setMode("quit")}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${
              currentView === "quit" ? "bg-[#8B5CF6] text-white shadow-md" : "text-[#1C1917]/40"
            }`}
          >
            {t("quit_mode") as string}
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
          <DayPicker
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            selected={selectedDate}
            onDayClick={setSelectedDate}
            components={{ DayContent }}
            locale={dateLocale}
            className="!font-sans m-0"
            styles={{
              head_cell: { color: "#94979f", fontWeight: 700, fontSize: "0.75rem" },
              day: { borderRadius: "14px", width: "2.6rem", height: "2.6rem", fontWeight: 600 },
              selected: { backgroundColor: "#1C1917", color: "white" }
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="px-2">
            <h2 className="text-xs font-bold text-[#1C1917]/40 uppercase tracking-widest mb-4">
              {t("habits_of") as string} {format(selectedDate, "d MMMM", { locale: dateLocale })}
            </h2>

            {selectedDayHabits.length > 0 ? (
              <div className="space-y-3">
                {selectedDayHabits.map((h) => (
                  <div key={h.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${h.completedCount >= h.repetitionsPerDay ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${currentView === 'build' ? 'bg-green-500' : 'bg-purple-500'}`} />
                      <span className="font-bold text-[#1C1917]">{h.name}</span>
                    </div>
                    <span className={`text-xs font-bold ${h.completedCount >= h.repetitionsPerDay ? 'text-green-600' : 'text-[#1C1917]/40'}`}>
                      {h.completedCount}/{h.repetitionsPerDay} {t("completed") as string || "complété"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                <p className="text-[#1C1917]/30 text-sm font-medium">{t("no_habits_scheduled") as string}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
