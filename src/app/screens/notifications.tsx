"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Bell, BellOff, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Habit } from "../types/habit";
import { useMemo } from "react";

export function Notifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [habits] = useLocalStorage<Habit[]>("bloom-habits", []);

  // Generate some "simulated" recent notifications based on habits
  const notifications = useMemo(() => {
    return habits.map(h => {
      const entry = h.history.find(e => e.date === new Date().toISOString().split('T')[0]);
      const done = (entry?.completedCount ?? 0) >= h.repetitionsPerDay;

      return {
        id: h.id,
        title: done ? t("notif_well_done") : t("notif_its_time"),
        body: done
          ? (t("notif_body_done") as string).replace("{{name}}", h.name)
          : (t("notif_body_todo") as string).replace("{{name}}", h.name).replace("{{streak}}", h.streak.toString()),
        time: h.reminderTime ? `${t("today")} ${t("at_time")} ${h.reminderTime}` : t("today"),
        read: done,
        habitId: h.id
      };
    }).sort((a, b) => (a.read === b.read) ? 0 : a.read ? 1 : -1);
  }, [habits, t]);

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917]">{t("notifications_title") as string}</h1>
      </div>

      <div className="max-w-xl mx-auto px-6 py-6">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => !n.read && navigate(`/habit-action/${n.habitId}`)}
                className={`p-5 rounded-[28px] border transition-all cursor-pointer active:scale-[0.98] ${
                  n.read ? "bg-gray-50/50 border-gray-50 opacity-60" : "bg-white border-blue-100 shadow-sm"
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.read ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-500"
                  }`}>
                    {n.read ? <CheckCircle2 size={20} /> : <Bell size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-sm ${n.read ? "text-[#1C1917]/50" : "text-[#1C1917]"}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] font-bold text-[#1C1917]/20 uppercase">{n.time}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${n.read ? "text-[#1C1917]/40" : "text-[#1C1917]/60"}`}>
                      {n.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BellOff className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-medium">{t("no_notifications") as string}</p>
          </div>
        )}
      </div>
    </div>
  );
}
