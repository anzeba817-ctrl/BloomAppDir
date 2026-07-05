"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useTransform, useSpring } from "motion/react";
import React, { useState, useRef, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Joyride } from "react-joyride";
import type { Step } from "react-joyride";
import PullToRefresh from "react-pull-to-refresh";
import { BookOpen, Crown, Home, LayoutGrid, Settings, Star, Sparkles, User } from "lucide-react";

import { SunnyMascot, SunnyMood } from "../components/sunny-mascot";
import { CheckInModal } from "../components/check-in-modal";
import { MilestoneModal } from "../components/milestone-modal";
import { ShieldModal } from "../components/shield-modal";
import { useLanguage } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMousePosition } from "../hooks/useMousePosition";
import { playSound } from "../utils/audio";

interface Habit {
  id: string;
  name: string;
  mode: "build" | "quit";
  streak: number;
  lastCheckIn: string | null;
  history: Array<{ date: string; mood?: string; note?: string }>;
}

const dashboardMenuItems = [
  { path: "/dashboard", key: "nav_dashboard" as const, icon: Home },
  { path: "/profile", key: "nav_profile" as const, icon: User },
  { path: "/upgrade", key: "nav_subscription" as const, icon: Crown },
  { path: "/journal", key: "nav_journal" as const, icon: BookOpen },
  { path: "/widgets", key: "nav_widgets" as const, icon: LayoutGrid },
] as const;

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<"build" | "quit">("build");
  const { soundEnabled } = useAudio();
  const [petals, setPetals] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showShield, setShowShield] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [sunnyAnimation, setSunnyAnimation] = useState<SunnyMood | null>(null);
  const { x, y } = useMousePosition();
  const [runTutorial, setRunTutorial] = useLocalStorage("bloom-tutorial-v1", typeof window !== "undefined");
  const scrollToView = useCallback((view: "build" | "quit") => {
    if (!scrollRef.current) return;

    const nextLeft = view === "quit" ? 0 : scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: nextLeft, behavior: "smooth" });
    setCurrentView(view);
  }, []);
  
    const tutorialSteps: Step[] = [
      {
        target: "body",
        content: t("tutorial_step1") as string,
        placement: "center",
      },
      {
        target: "#petals-counter",
        content: t("tutorial_step2") as string,
      },
      {
        target: "#habit-list",
        content: t("tutorial_step3") as string,
      },
      {
        target: "#dashboard-mode-switch",
        content: t("tutorial_step4") as string,
      },
      {
        target: "#dashboard-navigation",
        content: t("tutorial_step5") as string,
      },
      {
        target: "body",
        content: t("tutorial_step6") as string,
        placement: "center",
      },
    ];

  // Créer des motion values pour la position de la souris
  const mouseX = useSpring(0, { stiffness: 200, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 200, damping: 50 });

  useEffect(() => {
    if (x !== null && y !== null && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      // Normaliser la position de la souris par rapport au centre du panneau
      mouseX.set((x - (rect.left + rect.width / 2)) / (rect.width / 2));
      mouseY.set((y - (rect.top + rect.height / 2)) / (rect.height / 2));
    }
  }, [x, y, mouseX, mouseY]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = container.clientWidth / 2;
      setCurrentView(container.scrollLeft >= threshold ? "build" : "quit");
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Transformer la position de la souris en un léger déplacement pour Sunny
  const sunnyOffsetX = useTransform(mouseX, [-1, 1], [-15, 15]);
  const sunnyOffsetY = useTransform(mouseY, [-1, 1], [-10, 10]);


  const [habits, setHabits] = useLocalStorage<Habit[]>("bloom-habits", () => {
    // Si rien n'est sauvegardé, créez la première habitude depuis l'onboarding
    return location.state?.firstHabit
      ? [
          {
            id: "1",
            name: location.state.firstHabit,
            mode: location.state.mode || "build",
            streak: 0,
            lastCheckIn: null,
            history: [],
          },
        ]
      : [];
  });

  const buildHabits = habits.filter((h) => h.mode === "build");
  const quitHabits = habits.filter((h) => h.mode === "quit");

  const handleCheckIn = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowCheckIn(true);
  };

  const handleCheckInComplete = (mood: string, note: string) => {
    if (selectedHabit) {
      const today = new Date().toISOString().split("T")[0];
      const updatedHabits = habits.map((h) =>
        h.id === selectedHabit.id
          ? {
              ...h,
              streak: h.streak + 1,
              lastCheckIn: today,
              history: [...h.history, { date: today, mood, note }],
            }
          : h
      );
      setHabits(updatedHabits);
      setPetals(petals + 1);

      playSound("sounds/success-chime.mp3", soundEnabled);

      // 1. Déclencher l'animation de confettis
      // Effet "Feu d'artifice" amélioré
      const duration = 1 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Lancer depuis les deux côtés
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // 2. Animer Sunny
      setSunnyAnimation("overjoyed");
      const timer = setTimeout(() => {
        setSunnyAnimation(null);
      }, 2000); // L'animation dure 2 secondes
      // return () => clearTimeout(timer); // Cleanup non nécessaire ici car ce n'est pas un useEffect

      // Check for milestone
      const newStreak = selectedHabit.streak + 1;
      if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
        setTimeout(() => setShowMilestone(true), 500);
      }
    }
    setShowCheckIn(false);
  };

  const getSunnyMood = (streak: number) => {
    if (streak >= 30) return "blooming";
    if (streak >= 7) return "growing";
    if (streak >= 3) return "growing";
    return "neutral";
  };

  const maxStreak = Math.max(...habits.map((h) => h.streak), 0);

  const getDailySummary = (habitList: Habit[], mode: "build" | "quit") => {
    const bestStreak = Math.max(...habitList.map((habit) => habit.streak), 0);
    const nextHabit = habitList[0]?.name ?? (mode === "build" ? "une première habitude" : "une habitude à soutenir");

    return {
      count: habitList.length,
      bestStreak,
      nextHabit,
      label: mode === "build" ? "à construire" : "à soutenir",
    };
  };

  const buildSummary = getDailySummary(buildHabits, "build");
  const quitSummary = getDailySummary(quitHabits, "quit");

  const getHabitProgress = (habit: Habit) => Math.min(100, Math.round((habit.streak / 7) * 100));

  // Generate heatmap data (last 30 days)
  const generateHeatmap = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStreak = i < maxStreak ? Math.random() > 0.3 : false;
      days.push({
        date: date.toISOString().split("T")[0],
        completed: dayStreak,
      });
    }
    return days;
  };

  const heatmapData = generateHeatmap();

  const handleRefresh = useCallback(async () => {
    // Simule un appel réseau pour rafraîchir les données
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Ici, vous pourriez re-fetcher vos données si elles venaient d'une API
    console.log("Data refreshed!");
  }, []);

  return (
    <>
      <Joyride
        continuous
        run={runTutorial}
        steps={tutorialSteps}
        onEvent={({ status }) => {
          if (["finished", "skipped"].includes(status)) {
            setRunTutorial(false);
          }
        }}
      />
      <PullToRefresh onRefresh={handleRefresh}>
        <div
          className="min-h-screen bg-background text-foreground pb-20"
        >
        {/* Top Bar */}
        <div className="sticky top-0 z-50 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-6xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div id="petals-counter" className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-semibold text-card-foreground">{petals}</span>
                <span className="text-sm text-muted-foreground">{t("petals") as string}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < crystals ? "bg-purple-500" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              </div>

              <button
                onClick={() => navigate("/settings")}
                className="rounded-full border border-border/60 bg-card/80 p-2.5 shadow-sm transition-colors hover:bg-muted"
                aria-label={t("settings_title") as string}
              >
                <Settings className="h-5 w-5 text-foreground" />
              </button>
            </div>

            <div
              id="dashboard-navigation"
              className="grid grid-cols-5 gap-1.5 rounded-[22px] border border-border/60 bg-gradient-to-r from-card/90 via-card/80 to-background/90 p-1.5 shadow-sm"
            >
              {dashboardMenuItems.map(({ path, key, icon: Icon }) => {
                const active = location.pathname === path;
                const label = t(key) as string;

                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-1.5 py-2 text-center transition-all ${
                      active ? "bg-primary text-primary-foreground shadow-sm" : "bg-background/70 text-muted-foreground hover:bg-muted"
                    }`}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className={`text-[9px] font-medium capitalize ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div id="dashboard-mode-switch" className="flex items-center justify-center">
              <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-1 shadow-sm">
                <button
                  onClick={() => scrollToView("quit")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    currentView === "quit" ? "bg-purple-500 text-white" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t("quit_mode") as string}
                </button>
                <button
                  onClick={() => scrollToView("build")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    currentView === "build" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t("build_mode") as string}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Horizontal Scroll */}
        <div className="overflow-x-auto snap-x snap-mandatory" ref={scrollRef}>
          <div className="flex w-[200vw]">
            {/* Quit Mode Panel (Left) */}
            <div ref={panelRef} className="w-screen snap-center flex-shrink-0 bg-gradient-to-br from-purple-500/10 to-background px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <div className="text-center">
                  <div className="mb-3 inline-block rounded-full bg-purple-500 px-4 py-1.5 text-sm text-white">
                    {t("quit_mode") as string}
                  </div>
                  <h2 className="mb-1 text-xl text-foreground sm:text-2xl">{t("quit_tagline") as string}</h2>
                </div>

                <div className="rounded-[24px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-purple-500/10 p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">résumé du jour</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">Un pas à la fois, avec douceur</p>
                    </div>
                    <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-600">à ton rythme</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{quitSummary.count > 0 ? `${quitSummary.count} action${quitSummary.count > 1 ? "s" : ""} ${quitSummary.label}` : "Une première action à poser"}</p>
                      <p className="text-sm text-muted-foreground">Prochaine étape : {quitSummary.nextHabit}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 px-3 py-2 text-right">
                      <div className="text-lg font-semibold text-foreground">{quitSummary.bestStreak}</div>
                      <div className="text-xs text-muted-foreground">meilleure série</div>
                    </div>
                  </div>
                </div>

                <motion.div style={{ x: sunnyOffsetX, y: sunnyOffsetY }} className="flex items-center justify-center py-1">
                  <SunnyMascot mood={sunnyAnimation || getSunnyMood(maxStreak)} size={132} />
                </motion.div>

                <div className="w-full rounded-[22px] border border-border/60 bg-card/70 p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Aujourd’hui</p>
                      <p className="text-xs text-muted-foreground">Tes actions à garder en tête</p>
                    </div>
                    <button onClick={() => navigate("/habit-create")} className="text-sm font-medium text-purple-500 transition-colors hover:text-purple-600">ajouter</button>
                  </div>

                  {quitHabits.length > 0 ? (
                    <div className="space-y-3">
                      {quitHabits.map((habit) => (
                        <motion.div
                          key={habit.id}
                          className="rounded-[22px] border border-border/60 bg-gradient-to-br from-background via-card/70 to-purple-500/10 p-4 shadow-sm"
                          whileHover={{ scale: 1.008, y: -1 }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => navigate("/habit-detail", { state: { habit } })}
                              className="flex-1 text-left text-card-foreground transition-opacity hover:opacity-70"
                            >
                              <h3 className="font-semibold">{habit.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {habit.streak} {t("freed_days") as string}
                              </p>
                            </button>
                            <button
                              onClick={() => handleCheckIn(habit)}
                              className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
                            >
                              {t("freed_day") as string}
                            </button>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{habit.streak >= 7 ? "série solide" : habit.streak >= 3 ? "bonne dynamique" : "petit pas"}</span>
                            <span>{getHabitProgress(habit)}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-muted/70">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getHabitProgress(habit)}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-4 text-center text-muted-foreground">
                      <p>{t("no_quit_habits") as string}</p>
                      <button
                        onClick={() => navigate("/habit-create")}
                        className="mt-3 text-purple-500 hover:underline"
                      >
                        {t("add_habit") as string}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-muted-foreground/80">
                  ou glisse latéralement pour changer de mode
                </div>
              </div>
            </div>

            {/* Build Mode Panel (Right) */}
            <div id="habit-list" className="w-screen snap-center flex-shrink-0 bg-gradient-to-br from-secondary/10 to-background px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <div className="text-center">
                  <div className="mb-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
                    {t("build_mode") as string}
                  </div>
                  <h2 className="mb-1 text-xl text-foreground sm:text-2xl">{t("build_tagline") as string}</h2>
                </div>

                <div className="rounded-[24px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-secondary/10 p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">résumé du jour</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">Petit pas, belle progression</p>
                    </div>
                    <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-medium text-secondary">petit pas</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{buildSummary.count > 0 ? `${buildSummary.count} action${buildSummary.count > 1 ? "s" : ""} ${buildSummary.label}` : "Une première habitude à créer"}</p>
                      <p className="text-sm text-muted-foreground">Prochaine étape : {buildSummary.nextHabit}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 px-3 py-2 text-right">
                      <div className="text-lg font-semibold text-foreground">{buildSummary.bestStreak}</div>
                      <div className="text-xs text-muted-foreground">meilleure série</div>
                    </div>
                  </div>
                </div>

                <motion.div style={{ x: sunnyOffsetX, y: sunnyOffsetY }} className="flex items-center justify-center py-1">
                  <SunnyMascot mood={sunnyAnimation || getSunnyMood(maxStreak)} size={132} />
                </motion.div>

                <div className="w-full rounded-[22px] border border-border/60 bg-card/70 p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Aujourd’hui</p>
                      <p className="text-xs text-muted-foreground">Tes actions à garder en tête</p>
                    </div>
                    <button onClick={() => navigate("/habit-create")} className="text-sm font-medium text-secondary transition-colors hover:text-secondary/80">ajouter</button>
                  </div>

                  {buildHabits.length > 0 ? (
                    <div className="space-y-3">
                      {buildHabits.map((habit) => (
                        <motion.div
                          key={habit.id}
                          className="rounded-[22px] border border-border/60 bg-gradient-to-br from-background via-card/70 to-secondary/10 p-4 shadow-sm"
                          whileHover={{ scale: 1.008, y: -1 }}
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <button
                              onClick={() => navigate("/habit-detail", { state: { habit } })}
                              className="flex-1 text-left text-card-foreground transition-opacity hover:opacity-70"
                            >
                              <h3 className="font-semibold">{habit.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                🔥 {habit.streak} {t("streak_days") as string}
                              </p>
                            </button>
                            <button
                              onClick={() => handleCheckIn(habit)}
                              className="rounded-xl bg-gradient-to-r from-secondary to-emerald-500 px-5 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm transition-transform hover:scale-[1.02]"
                            >
                              {t("done_today") as string}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{habit.streak >= 7 ? "série solide" : habit.streak >= 3 ? "bonne dynamique" : "petit pas"}</span>
                            <span>{getHabitProgress(habit)}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-muted/70">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getHabitProgress(habit)}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-secondary"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-4 text-center text-muted-foreground">
                      <p>{t("no_build_habits") as string}</p>
                      <button
                        onClick={() => navigate("/habit-create")}
                        className="mt-3 text-secondary hover:underline"
                      >
                        {t("add_habit") as string}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-muted-foreground/80">
                  ou glisse latéralement pour changer de mode
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </PullToRefresh>

      {/* Modals */}
      <AnimatePresence>
        {showCheckIn && selectedHabit && (
          <CheckInModal
            habit={selectedHabit}
            onClose={() => setShowCheckIn(false)}
            onComplete={handleCheckInComplete}
          />
        )}

        {showMilestone && selectedHabit && (
          <MilestoneModal
            streak={selectedHabit.streak + 1}
            onClose={() => setShowMilestone(false)}
          />
        )}

        {showShield && (
          <ShieldModal onClose={() => setShowShield(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

