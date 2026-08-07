"use client";

import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Bell } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Habit } from "../types/habit";
import { SunnyMascot } from "../components/sunny-mascot";
import { queueHabitCheckIn, getLogicalDayFromUtc } from "../utils/offline-sync";
import { playSound } from "../utils/audio";
import { useAudio } from "../contexts/AudioContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Tokenomics } from "../utils/tokenomics";
import { MilestoneModal } from "../components/milestone-modal";
import { filterNotificationSpam } from "../utils/notifications";
import { toast } from "sonner";
import { useState, useMemo } from "react";

/**
 * Écran d'Action de Validation : S'affiche au clic d'une notification.
 * Gère la validation rapide avec feedback visuel, sonore et gestion des jalons.
 */
export function HabitValidationAction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { soundEnabled } = useAudio();
  const { t } = useLanguage();
  const { session } = useAuth();
  const userPlan = session.user?.plan || 'seedling';

  const [habits, setHabits] = useLocalStorage<Habit[]>("bloom-habits", []);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);

  // Utilisation de useMemo pour trouver l'habitude et éviter des re-calculs inutiles
  const habit = useMemo(() => habits.find(h => h.id === id), [habits, id]);

  /**
   * Action de validation de l'habitude.
   */
  const handleValidate = async () => {
    if (!habit) return;

    // Détermination de la date logique (Spec 7.2)
    const nowUtc = new Date().toISOString();
    const logicalDate = getLogicalDayFromUtc(nowUtc);

    try {
      // 1. Enregistrement en base locale SQLite (Offline First - Spec 7.4)
      const result = await queueHabitCheckIn({
        habitId: habit.id,
        date: logicalDate,
      });

      // 2. Mise à jour de l'état local React (Propagated to LocalStorage via hook)
      let habitDoneToday = false;

      setHabits((prev) => {
        return prev.map((h) => {
          if (h.id !== habit.id) return h;

          const existingEntryIndex = h.history.findIndex((entry) => entry.date === result.logicalDate);
          let nextHistory = [...h.history];

          if (existingEntryIndex >= 0) {
            nextHistory[existingEntryIndex] = {
              ...nextHistory[existingEntryIndex],
              completedCount: result.currentCount,
            };
          } else {
            nextHistory.push({
              date: result.logicalDate,
              completedCount: result.currentCount,
            });
          }

          const updated = {
            ...h,
            streak: result.streak,
            lastCheckIn: result.lastCheckIn,
            history: nextHistory,
          };

          habitDoneToday = result.currentCount >= (h.repetitionsPerDay || 1);

          // 3. Suppression immédiate de la notification si l'objectif est atteint (Anti-Spam Spec 7.3)
          void filterNotificationSpam(updated, habitDoneToday);

          return updated;
        });
      });

      // 4. Attribution des pétales (Tokenomics Spec 5.3)
      const isForever = userPlan === 'forever';
      await Tokenomics.earnForValidation(isForever);

      // 5. Gestion des jalons (Milestones)
      if ([7, 30, 100].includes(result.streak)) {
        await Tokenomics.earnForMilestone(result.streak, isForever);
        setMilestoneStreak(result.streak);
        setShowMilestone(true);
        playSound("sounds/success-chime.mp3", soundEnabled);
      } else {
        // Feedback standard
        playSound("sounds/success-chime.mp3", soundEnabled);
        toast.success((t("habit_validated_success") as string).replace("{{name}}", habit.name));

        // Redirection vers le dashboard après un court délai
        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      }
    } catch (error) {
      console.error("Bloom: Erreur lors de la validation rapide", error);
      toast.error("Oups, une erreur est survenue lors de la validation.");
    }
  };

  const handleIgnore = () => {
    navigate("/dashboard");
  };

  if (!habit) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <Bell className="w-12 h-12 text-gray-200 mb-4" />
        <h1 className="text-xl font-bold text-[#1C1917]">{t("error_oops") as string}</h1>
        <p className="text-gray-500 mb-8">{t("error_habit_not_found") as string}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3 bg-[#1C1917] text-white rounded-2xl font-bold active:scale-95 transition-all"
        >
          {t("back_to_dashboard") as string}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex justify-center">
            <SunnyMascot mood="blooming" size={160} />
          </div>

          <h1 className="text-3xl font-black text-[#1C1917] mb-2">{t("its_time") as string}</h1>
          <p className="text-lg font-medium text-[#1C1917]/60 mb-8 leading-relaxed">
            {t("did_you_realize") as string} <br/>
            <span className="text-[#1C1917] font-extrabold text-xl">"{habit.name}"</span> ?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleIgnore}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-[32px] bg-gray-50 border border-gray-100 active:scale-95 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-active:bg-gray-100 transition-colors">
                <X className="w-7 h-7 text-gray-400" />
              </div>
              <span className="font-bold text-gray-400">{t("ignore") as string}</span>
            </button>

            <button
              onClick={handleValidate}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[32px] border active:scale-95 transition-all group ${
                habit.mode === 'build' ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                habit.mode === 'build' ? 'bg-green-500' : 'bg-purple-500'
              }`}>
                <Check className="w-7 h-7 text-white" />
              </div>
              <span className={`font-bold ${
                habit.mode === 'build' ? 'text-green-600' : 'text-purple-600'
              }`}>{t("validate") as string}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modale de jalon (Milestone) en cas de succès majeur */}
      <AnimatePresence>
        {showMilestone && (
          <MilestoneModal
            streak={milestoneStreak}
            onClose={() => navigate("/dashboard")}
          />
        )}
      </AnimatePresence>
    </>
  );
}
