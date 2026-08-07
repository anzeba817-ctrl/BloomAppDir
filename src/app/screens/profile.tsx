"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, Sparkles, Lock, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Habit } from "../types/habit";
import { readLocalCurrency } from "../utils/offline-sync";
import { useEffect, useState, useMemo } from "react";
import { format, subDays, startOfToday, eachDayOfInterval } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

/**
 * Écran Profil : Affiche les statistiques utilisateur et l'historique d'activité.
 */
export function Profile() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { session, logout } = useAuth();
  const user = session.user;
  const userPlan = user?.plan || 'seedling';
  const isPremium = userPlan !== 'seedling';

  const [habits] = useLocalStorage<Habit[]>("bloom-habits", []);
  const [petals, setPetals] = useState(0);

  useEffect(() => {
    void (async () => {
      const currency = await readLocalCurrency();
      setPetals(currency.petales);
    })();
  }, []);

  const dateLocale = lang === "fr" ? fr : lang === "es" ? es : enUS;

  const stats = useMemo(() => {
    const activeHabits = habits.length;

    const allDates = new Set<string>();
    habits.forEach(h => {
      h.history.forEach(entry => allDates.add(entry.date));
    });
    const totalDays = allDates.size;

    const today = startOfToday();
    const startDate = subDays(today, 364);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const heatmapData = dateRange.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      let totalCompletions = 0;
      habits.forEach(h => {
        const entry = h.history.find(e => e.date === dateStr);
        if (entry) totalCompletions += entry.completedCount ?? 1;
      });
      const intensity = totalCompletions === 0 ? 0 : Math.min(Math.ceil(totalCompletions / 2), 4);
      return { date: dateStr, intensity };
    });

    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;
    const rawDaysLabel = t("days_label");
    const rawMonthsLabel = t("months_label");
    const daysLabel = Array.isArray(rawDaysLabel) ? (rawDaysLabel as string[]) : [];
    const monthsLabel = Array.isArray(rawMonthsLabel) ? (rawMonthsLabel as string[]) : [];

    return {
      activeHabits,
      totalDays,
      heatmapData,
      longestStreak,
      daysLabel,
      monthsLabel
    };
  }, [habits, t]);

  const getColorForIntensity = (intensity: number) => {
    if (intensity === 0) return "bg-gray-100";
    if (intensity === 1) return "bg-green-100";
    if (intensity === 2) return "bg-green-300";
    if (intensity === 3) return "bg-green-500";
    return "bg-green-700";
  };

  const weeks: Array<Array<{ date: string; intensity: number }>> = [];
  for (let i = 0; i < stats.heatmapData.length; i += 7) {
    weeks.push(stats.heatmapData.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-white text-foreground pb-40 overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-gray-50 bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t("nav_profile") as string}</p>
            <h1 className="text-xl font-bold text-[#1C1917]">{t("profile_title") as string}</h1>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold text-[#1C1917]/60 transition-colors hover:text-[#1C1917]"
          >
            {t("settings_button") as string}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-5 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-sm"
        >
          <SunnyMascot mood="blooming" size={104} className="mx-auto mb-6" />
          <h2 className="mb-2 text-2xl font-bold text-[#1C1917]">{user?.displayName || t("your_journey")}</h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{userPlan}</span>
            {!isPremium && (
              <button
                onClick={() => navigate("/upgrade")}
                className="text-[10px] font-black bg-[#F5C030] text-white px-2 py-0.5 rounded-full uppercase"
              >
                {t("pass_pro") as string}
              </button>
            )}
          </div>

          <div className="grid gap-3 grid-cols-3">
            <div className="rounded-[24px] bg-gray-50 p-4 border border-gray-100">
              <div className="text-2xl font-black text-[#1C1917]">{stats.activeHabits}</div>
              <div className="mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{t("active_habits") as string}</div>
            </div>
            <div className="rounded-[24px] bg-gray-50 p-4 border border-gray-100">
              <div className="text-2xl font-black text-[#1C1917]">{stats.totalDays}</div>
              <div className="mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{t("total_days") as string}</div>
            </div>
            <div className="rounded-[24px] bg-[#F5C030]/10 p-4 border border-[#F5C030]/20">
              <div className="text-2xl font-black text-[#F5C030]">{petals}</div>
              <div className="mt-1 text-[9px] font-bold text-[#F5C030]/60 uppercase tracking-widest leading-tight">{t("petals_count") as string}</div>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate("/"); }}
            className="mt-10 text-xs font-bold text-red-400 uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            {t("logout") as string}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917]">{t("year_activity") as string}</h3>
            </div>
          </div>

          <div className={`overflow-x-auto pb-4 hide-scrollbar ${!isPremium ? 'filter blur-[4px] pointer-events-none opacity-40 select-none' : ''}`}>
            <div className="inline-flex flex-col gap-1.5">
              <div className="mb-2 ml-8 flex gap-1">
                {stats.monthsLabel.map((month, i) => (
                    <div key={i} className="text-[10px] font-bold text-[#1C1917]/20 uppercase" style={{ width: `${(weeks.length / 12) * 13}px`, textAlign: "left" }}>
                      {i % 2 === 0 ? month : ""}
                    </div>
                ))}
              </div>

              {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => (
                <div key={dayOfWeek} className="flex gap-1.5 items-center">
                  <div className="w-6 text-[10px] font-bold text-[#1C1917]/20 uppercase text-right mr-1">
                    {stats.daysLabel[dayOfWeek === 0 ? 6 : dayOfWeek - 1]}
                  </div>
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => {
                      const day = week[dayOfWeek];
                      return day ? (
                        <div key={weekIndex} className={`w-3 h-3 rounded-[3px] ${getColorForIntensity(day.intensity)} transition-colors duration-300`} />
                      ) : ( <div key={weekIndex} className="w-3 h-3" /> );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/10 backdrop-blur-[1px]">
               <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl max-w-[240px]">
                  <Lock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-black text-[#1C1917] text-sm mb-1 uppercase tracking-tight">{t("heatmap_locked_title") as string}</h4>
                  <p className="text-[10px] text-gray-500 font-medium mb-4 leading-relaxed">{t("heatmap_locked_desc") as string}</p>
                  <button onClick={() => navigate("/upgrade")} className="w-full bg-blue-500 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">{t("unlock") as string}</button>
               </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="insights" className="border-none">
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-data-[state=open]:rotate-12 transition-transform">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#1C1917]">{t("insights") as string}</h3>
                    <p className="text-xs font-medium text-[#1C1917]/40">{t("insights_desc") as string}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 relative">
                <div className={`space-y-3 ${!isPremium ? 'filter blur-[4px] opacity-40 select-none' : ''}`}>
                  <div className="rounded-[22px] bg-gray-50 border border-gray-100 p-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1C1917]/60">{t("longest_streak") as string}</span>
                    <span className="text-sm font-black text-[#1C1917]">{stats.longestStreak} {t("streak_days") as string}</span>
                  </div>
                  <div className="rounded-[22px] bg-purple-50/50 border border-purple-100 p-5 text-center mt-4">
                    <p className="text-xs font-medium leading-relaxed text-purple-700/70">{t("data_note") as string}</p>
                  </div>
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
                    <button onClick={() => navigate("/upgrade")} className="flex items-center gap-2 bg-[#1C1917] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                      <Lock size={12} /> {t("unlock_insights") as string}
                    </button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
