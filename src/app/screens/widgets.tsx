"use client";

import { JSX, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Flame, CalendarDays, Sun, Lock, Info, Crown } from "lucide-react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../contexts/AuthContext";
import type { Habit } from "../types/habit";
import { useNavigate } from "react-router-dom";

/**
 * ÉCRAN DES WIDGETS
 * Permet de prévisualiser et de comprendre comment installer les widgets Bloom.
 * Spécification 6.0 : Accès restreint selon le forfait.
 */

interface Widget {
  id: string;
  titleKey: "streak_widget" | "heatmap_widget" | "sunny_widget";
  descKey: "streak_widget_desc" | "heatmap_widget_desc" | "sunny_widget_desc";
  icon: typeof Flame;
  color: string;
  bg: string;
  premium?: boolean;
  preview: () => JSX.Element;
}

export function Widgets() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const [habits] = useLocalStorage<Habit[]>("bloom-habits", []);
  const [added, setAdded] = useState<string[]>([]);

  const stats = useMemo(() => {
    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;
    return { longestStreak };
  }, [habits]);

  const handleToggle = (id: string, premium: boolean) => {
    if (premium && !isPremium) {
      navigate("/upgrade");
      return;
    }
    setAdded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const widgets: Widget[] = [
    {
      id: "streak",
      titleKey: "streak_widget",
      descKey: "streak_widget_desc",
      icon: Flame,
      color: "#F5C030",
      bg: "rgba(245, 192, 48, 0.1)",
      preview: () => (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-[#F5C030]/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#F5C030]" />
          </div>
          <div>
            <div className="text-3xl font-black text-[#1C1917]">{stats.longestStreak}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("streak_days") as string}</div>
          </div>
        </div>
      ),
    },
    {
      id: "heatmap",
      titleKey: "heatmap_widget",
      descKey: "heatmap_widget_desc",
      icon: CalendarDays,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.1)",
      premium: true,
      preview: () => (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-[3px] ${ Math.random() > 0.4 ? "bg-green-500" : "bg-gray-100" }`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "sunny",
      titleKey: "sunny_widget",
      descKey: "sunny_widget_desc",
      icon: Sun,
      color: "#0085FF",
      bg: "rgba(0, 133, 255, 0.1)",
      premium: true,
      preview: () => (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 flex items-center justify-center shadow-sm border border-blue-100">
          <SunnyMascot mood="blooming" size={64} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground pb-40 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1917]">{t("widgets_title") as string}</h1>
          <p className="text-sm font-medium text-gray-400">{t("widgets_subtitle") as string}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex gap-4 items-start shadow-sm">
           <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
           <div>
             <h4 className="font-bold text-blue-900 text-sm mb-1">{t("how_to_install") as string}</h4>
             <p className="text-xs font-medium text-blue-700/70 leading-relaxed">
               {t("install_instructions") as string}
             </p>
           </div>
        </div>

        {widgets.map((widget, i) => {
          const isAdded = added.includes(widget.id);
          const isLocked = widget.premium && !isPremium;

          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white border rounded-[32px] p-6 shadow-sm transition-all ${isLocked ? 'border-gray-100 opacity-60' : 'border-gray-100'}`}
            >
              <div className="mb-6">{widget.preview()}</div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: widget.bg }}>
                    <widget.icon className="w-6 h-6" style={{ color: widget.color }} />
                  </div>
                  <div>
                    <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                      {t(widget.titleKey) as string}
                      {widget.premium && <Crown size={12} className="text-[#F5C030]" />}
                    </div>
                    <div className="text-xs font-medium text-gray-400">{t(widget.descKey) as string}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(widget.id, !!widget.premium)}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                    isLocked ? "bg-gray-50 text-gray-300 border border-gray-100" :
                    isAdded ? "bg-green-50 text-green-600 border border-green-100" : "bg-[#1C1917] text-white shadow-lg shadow-[#1C1917]/20"
                  }`}
                >
                  {isLocked ? <Lock size={12} /> : isAdded ? (t("added") as string) : (t("add_widget") as string)}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
