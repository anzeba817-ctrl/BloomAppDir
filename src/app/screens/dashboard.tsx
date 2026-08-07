"use client";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import PullToRefresh from "react-pull-to-refresh";
import {
  Bell,
  Calendar as CalendarIcon,
  Check,
  Plus,
  Zap,
  Settings2,
  Shield,
  ShieldCheck,
  Crown
} from "lucide-react";

import { SunnyMascot, SunnyMood } from "../components/sunny-mascot";
import { CheckInModal } from "../components/check-in-modal";
import { MilestoneModal } from "../components/milestone-modal";
import { useLanguage } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import { useAuth } from "../contexts/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { playSound } from "../utils/audio";
import type { Habit } from "../types/habit";
import {
  incrementLocalPetals,
  queueHabitCheckIn,
  queueHabitUpsert,
  readLocalCurrency,
  startSyncOnReconnect,
  activateBloomShield
} from "../utils/offline-sync";
import { Tokenomics } from "../utils/tokenomics";
import { computeSunnyMood } from "../utils/mood-logic";
import { filterNotificationSpam } from "../utils/notifications";
import { toast } from "sonner";

/**
 * DASHBOARD PRINCIPAL - Cœur de l'expérience Bloom.
 * Gère le défilement entre Build et Quit mode (Spec 5.1).
 * Implémente la monétisation Seedling/Premium (Spec 6.0).
 */
export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { soundEnabled } = useAudio();
  const { session, isPremium } = useAuth();
  const userPlan = session.user?.plan || 'seedling';

  // --- Logique du "Double Mode" (Spec 5.1) ---
  const currentViewFromSurvey = location.state?.surveyAnswers?.type === "quit" ? "quit" : "build";
  const initialView = (searchParams.get("mode") as "build" | "quit") || currentViewFromSurvey;
  const [currentView, setCurrentView] = useState<"build" | "quit">(initialView);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam && (modeParam === "build" || modeParam === "quit")) {
      setCurrentView(modeParam as "build" | "quit");
    }
  }, [searchParams]);

  const setCurrentViewWithParam = (mode: "build" | "quit") => {
    setSearchParams({ mode }, { replace: true });
  };

  // --- États et Monnaie (Tokenomics Spec 5.3) ---
  const [petals, setPetals] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [shieldUntil, setShieldUntil] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [sunnyAnimation, setSunnyAnimation] = useState<SunnyMood | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const userName = session.user?.displayName || "User";

  // --- Logique Métier et Persistance (Offline-First Spec 7.4) ---
  const [habits, setHabits] = useLocalStorage<Habit[]>("bloom-habits", []);

  // Calcul de l'état émotionnel de Sunny (Spec 4.2)
  const currentMood = useMemo(() => {
    if (sunnyAnimation) return sunnyAnimation;
    return computeSunnyMood(habits, shieldUntil, userPlan);
  }, [habits, shieldUntil, sunnyAnimation, userPlan]);

  useEffect(() => {
    // Démarre la surveillance réseau pour la synchro (Spec 7.4)
    const cleanup = startSyncOnReconnect();
    return cleanup;
  }, []);

  const refreshCurrency = async () => {
    const currency = await readLocalCurrency();
    setPetals(currency.petales);
    setCrystals(currency.cristaux);
    setShieldUntil(currency.shield_until_utc);
  };

  useEffect(() => {
    void refreshCurrency();
  }, [location.pathname, location.key]);

  /**
   * Action : Activer le Bouclier Bloom Shield (Spec 5.3).
   */
  const handleActivateShield = async () => {
    if (crystals > 0) {
      const next = await activateBloomShield();
      setPetals(next.petales);
      setCrystals(next.cristaux);
      setShieldUntil(next.shield_until_utc);
      playSound("sounds/shield-activate.mp3", soundEnabled);
      toast.success("Bouclier activé pour 24h !");
    }
  };

  /**
   * Filtrage des habitudes pour le jour sélectionné (Aware of Timezone Spec 7.2).
   */
  const filteredHabits = useMemo(() => {
    const dayOfWeek = new Date(selectedDate).getDay();
    return habits
      .filter((h) => {
        if (h.mode !== currentView) return false;
        if (h.frequency === "daily") return true;
        if (h.frequency === "weekly" || h.frequency === "custom") {
          return h.selectedDays?.includes(dayOfWeek) ?? true;
        }
        return true;
      })
      .sort((a, b) => habits.indexOf(b) - habits.indexOf(a));
  }, [habits, currentView, selectedDate]);

  // Calcule la progression quotidienne basée sur les répétitions.
  const stats = useMemo(() => {
    let totalReps = 0;
    let completedReps = 0;
    let fullyCompletedCount = 0;

    filteredHabits.forEach(h => {
      totalReps += h.repetitionsPerDay || 1;
      const entry = h.history.find(e => e.date === selectedDate);
      const count = entry?.completedCount ?? 0;
      completedReps += Math.min(count, h.repetitionsPerDay || 1);
      if (count >= (h.repetitionsPerDay || 1)) {
        fullyCompletedCount++;
      }
    });

    return {
      totalReps,
      completedReps,
      fullyCompletedCount,
      totalHabits: filteredHabits.length,
      percent: totalReps > 0 ? Math.round((completedReps / totalReps) * 100) : 0
    };
  }, [filteredHabits, selectedDate]);

  const progressPercent = stats.percent;

  /**
   * Validation Rapide (Check-in Spec 5.2).
   * Intègre le filtre anti-spam des notifications (Spec 7.3).
   */
  const handleQuickCheckIn = (habit: Habit) => {
    void (async () => {
      const result = await queueHabitCheckIn({ habitId: habit.id, date: selectedDate });

      // Mise à jour de l'état local
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habit.id) return h;
          const existingEntryIndex = h.history.findIndex((entry) => entry.date === result.logicalDate);
          let nextHistory = [...h.history];
          if (existingEntryIndex >= 0) {
            nextHistory[existingEntryIndex] = { ...nextHistory[existingEntryIndex], completedCount: result.currentCount };
          } else {
            nextHistory.push({ date: result.logicalDate, completedCount: result.currentCount });
          }
          const updatedHabit = { ...h, streak: result.streak, lastCheckIn: result.lastCheckIn, history: nextHistory };

          // Spec 7.3 : Filtre de notification en temps réel
          const isDoneToday = result.currentCount >= (h.repetitionsPerDay || 1);
          void filterNotificationSpam(updatedHabit, isDoneToday);

          return updatedHabit;
        })
      );

      // Tokenomics (Spec 5.3)
      const isForever = userPlan === 'forever';
      const nextPetals = await Tokenomics.earnForValidation(isForever);
      setPetals(nextPetals);
      await refreshCurrency();

      playSound("sounds/success-chime.mp3", soundEnabled);
      setSunnyAnimation("growing");
      setTimeout(() => setSunnyAnimation(null), 1500);
    })();
  };

  /**
   * Check-in Détaillé (Humeur + Note Spec 5.2).
   */
  const handleCheckInComplete = (mood: string, note: string) => {
    if (selectedHabit) {
      void (async () => {
        const result = await queueHabitCheckIn({ habitId: selectedHabit.id, date: selectedDate, mood, note });

        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== selectedHabit.id) return h;
            const existingEntryIndex = h.history.findIndex((entry) => entry.date === result.logicalDate);
            let nextHistory = [...h.history];
            if (existingEntryIndex >= 0) {
              nextHistory[existingEntryIndex] = { ...nextHistory[existingEntryIndex], completedCount: result.currentCount, mood, note };
            } else {
              nextHistory.push({ date: result.logicalDate, completedCount: result.currentCount, mood, note });
            }
            const updatedHabit = { ...h, streak: result.streak, lastCheckIn: result.lastCheckIn, history: nextHistory };

            // Spec 7.3 : Évitement du spam
            const isDoneToday = result.currentCount >= (h.repetitionsPerDay || 1);
            void filterNotificationSpam(updatedHabit, isDoneToday);

            return updatedHabit;
          })
        );

        const isForever = userPlan === 'forever';
        await Tokenomics.earnForValidation(isForever);
        if (note.trim()) await Tokenomics.earnForJournal(isForever);

        // Jalons d'or (Spec 4.2)
        const newStreak = selectedHabit.streak + 1;
        if ([7, 30, 100].includes(newStreak)) {
           await Tokenomics.earnForMilestone(newStreak, isForever);
           setTimeout(() => setShowMilestone(true), 500);
        }

        await refreshCurrency();
      })();

      playSound("sounds/success-chime.mp3", soundEnabled);
      setSunnyAnimation("overjoyed");
      setTimeout(() => setSunnyAnimation(null), 3000);
    }
    setShowCheckIn(false);
  };

  // --- Affichage ---
  const modeColor = currentView === "build" ? "#10B981" : "#8B5CF6";
  const buildCount = habits.filter(h => h.mode === "build").length;
  const quitCount = habits.filter(h => h.mode === "quit").length;

  const itemsPerPage = 3;
  const paginatedHabits = filteredHabits.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const displayedHabits = showAll ? filteredHabits : paginatedHabits;
  const totalPages = Math.ceil(filteredHabits.length / itemsPerPage);

  return (
    <>
      <PullToRefresh onRefresh={async () => { await new Promise(r => setTimeout(r, 1000)); }}>
        <div className="min-h-screen bg-white text-foreground pb-40 overflow-x-hidden">
          {/* Header */}
          <header className="px-6 pt-4 pb-4">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => navigate("/habit-calendar")} className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-all">
                <CalendarIcon className="w-6 h-6 text-[#1C1917]" />
              </button>

              <div className="flex items-center gap-3">
                <button onClick={handleActivateShield} disabled={crystals === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                    shieldUntil && new Date(shieldUntil) > new Date() ? "bg-purple-100 border-purple-200 text-purple-600" :
                    crystals > 0 ? "bg-white border-gray-200 text-gray-400" : "bg-gray-50 border-transparent text-gray-300"
                  }`}>
                  {shieldUntil && new Date(shieldUntil) > new Date() ? <ShieldCheck size={16} /> : <Shield size={16} />}
                  <span className="text-xs font-bold">{crystals}</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5C030]/10 rounded-full border border-[#F5C030]/20">
                  <div className="w-2.5 h-2.5 bg-[#F5C030] rounded-full shadow-sm shadow-[#F5C030]/40" />
                  <span className="text-xs font-bold text-[#F5C030]">{petals}/10</span>
                </div>

                <button onClick={() => navigate("/notifications")} className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 relative active:scale-95 transition-all">
                  <Bell className="w-6 h-6 text-[#1C1917]" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <button onClick={() => navigate("/profile")} className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center p-0 active:scale-95 transition-all">
                  {session.user?.avatarUrl ? (
                    <img src={session.user.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <img src="imports/Logo.png" alt="Sunny Bloom" className="w-8 h-8 object-contain" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-[#1C1917]">
                  {(t("hi_user") as string).replace("{{name}}", userName)} <span className="inline-block animate-wave">👋</span>
                </h1>
                <p className="text-[#1C1917]/60 font-medium text-sm mt-1">
                   {currentView === 'build' ? '🚀 On ancre ensemble ?' : '🧘 Douceur et liberté...'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${currentView === 'build' ? 'text-green-600' : 'text-purple-600'}`}>
                    {currentView === 'build' ? '🔥 Mode Encrage' : '🕊️ Mode Sevrage'}
                  </p>
                  {isPremium && <Crown size={10} className="text-[#F5C030]" />}
                </div>
              </div>
            </div>

            <div className="flex justify-center py-4">
               <SunnyMascot mood={currentMood} size={160} />
            </div>

            <div className="mt-4 bg-[#F3F4F6] p-1.5 rounded-full flex relative">
              <button
                onClick={() => { setCurrentViewWithParam("build"); setCurrentPage(0); setShowAll(false); }}
                className={`flex-1 py-3 rounded-full text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${
                  currentView === "build" ? "bg-[#10B981] text-white shadow-md" : "text-[#1C1917]/40"
                }`}
              >
                {t("build_mode") as string}
                {buildCount > 0 && <span className="text-[10px] font-bold opacity-80">{buildCount}</span>}
              </button>
              <button
                onClick={() => { setCurrentViewWithParam("quit"); setCurrentPage(0); setShowAll(false); }}
                className={`flex-1 py-3 rounded-full text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${
                  currentView === "quit" ? "bg-[#8B5CF6] text-white shadow-md" : "text-[#1C1917]/40"
                }`}
              >
                {t("quit_mode") as string}
                {quitCount > 0 && <span className="text-[10px] font-bold opacity-80">{quitCount}</span>}
              </button>
            </div>
          </header>

          {/* Pub Modérée (Spec 6.1) : Aucune pub sur Check-in ou Journal, seulement ici pour Seedling */}
          {userPlan === 'seedling' && (
            <div className="px-6 mb-6">
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-4 text-center border-dashed">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Espace Partenaire</p>
                <p className="text-[11px] text-gray-400 font-bold">Passe à Bloom Forever pour supprimer les publicités 🌻</p>
              </div>
            </div>
          )}

          <div className="px-6 pb-6 overflow-x-auto hide-scrollbar mt-2">
            <div className="flex gap-4">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d.fullDate)}
                  className={`flex flex-col items-center justify-center min-w-[58px] h-20 rounded-[20px] border-2 transition-all active:scale-95 ${
                    selectedDate === d.fullDate
                      ? "border-[#1C1917] bg-white shadow-md"
                      : "border-transparent bg-white shadow-sm opacity-60"
                  }`}
                >
                  <span className={`text-lg font-bold ${selectedDate === d.fullDate ? "text-[#1C1917]" : "text-[#1C1917]/30"}`}>{d.day}</span>
                  <span className={`text-[10px] font-bold tracking-tight ${selectedDate === d.fullDate ? "text-[#1C1917]" : "text-[#1C1917]/20"}`}>{d.label}</span>
                  {d.isToday && <div className="w-1 h-1 bg-[#0085FF] rounded-full mt-1" />}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className={`rounded-[32px] p-6 text-white shadow-xl flex items-center gap-6 transition-all duration-500`} style={{ backgroundColor: modeColor }}>
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-white/20 fill-none" strokeWidth="4" />
                  <motion.circle
                    cx="32" cy="32" r="28" className="stroke-white fill-none" strokeWidth="4"
                    strokeDasharray="176" initial={{ strokeDashoffset: 176 }}
                    animate={{ strokeDashoffset: 176 - (176 * progressPercent) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute text-sm font-bold">%{progressPercent}</span>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-lg leading-tight">{t("daily_goals_title") as string}</h3>
                <p className="text-white/80 text-sm font-medium">
                  {(t("daily_goals_subtitle") as string)
                    .replace("{{completed}}", stats.fullyCompletedCount.toString())
                    .replace("{{total}}", stats.totalHabits.toString())}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1C1917]">{t("habits_title") as string}</h2>
              <button onClick={() => setShowAll(!showAll)} className="text-[#1C1917]/40 text-xs font-bold uppercase tracking-widest">
                {showAll ? t("show_less") : t("view_all")}
              </button>
            </div>

            <div className="space-y-3">
              {displayedHabits.length > 0 ? displayedHabits.map((habit) => {
                const entry = habit.history.find(e => e.date === selectedDate);
                const count = entry?.completedCount ?? 0;
                const isFullyDone = count >= habit.repetitionsPerDay;

                return (
                  <motion.div
                    key={habit.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-[24px] p-4 flex items-center justify-between shadow-sm border transition-all ${
                      isFullyDone ? "border-green-100 bg-green-50/10" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1" onClick={() => !isFullyDone && handleCheckIn(habit)}>
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 relative">
                         <Zap size={20} style={{ color: modeColor }} />
                         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                            <circle cx="24" cy="24" r="22" className="stroke-gray-100 fill-none" strokeWidth="2" />
                            <motion.circle
                              cx="24" cy="24" r="22" className="fill-none" style={{ stroke: modeColor }} strokeWidth="2"
                              strokeDasharray="138" initial={{ strokeDashoffset: 138 }}
                              animate={{ strokeDashoffset: 138 - (138 * Math.min(count / habit.repetitionsPerDay, 1)) }}
                            />
                         </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1C1917] text-base leading-tight">{habit.name}</h4>
                        <p className="text-[11px] font-bold text-[#1C1917]/30 uppercase tracking-wide mt-1">
                          {count} / {habit.repetitionsPerDay} {t("habit_done")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); navigate("/habit-create", { state: { habit } }); }} className="p-2 rounded-xl bg-gray-50 text-gray-400">
                        <Settings2 size={18} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); !isFullyDone && handleQuickCheckIn(habit); }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                          isFullyDone ? "bg-green-500 text-white" : "bg-white text-[#1C1917]/20 border border-gray-100"
                        }`}
                      >
                        {isFullyDone ? <Check size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="text-center py-10 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                   <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Aucune habitude</p>
                </div>
              )}
            </div>

            <button
              onClick={handleAddHabit}
              className="w-full mt-6 py-4 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Ajouter une habitude
            </button>
          </div>
        </div>
      </PullToRefresh>

      <AnimatePresence>
        {showCheckIn && selectedHabit && (
          <CheckInModal habit={selectedHabit} onClose={() => setShowCheckIn(false)} onComplete={handleCheckInComplete} />
        )}
        {showMilestone && selectedHabit && (
          <MilestoneModal streak={selectedHabit.streak + 1} onClose={() => setShowMilestone(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
