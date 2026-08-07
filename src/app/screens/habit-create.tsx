"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Target, Calendar, Clock, Bell, Repeat, Plus, Check, Zap, AlertCircle, Trash2, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import type { Habit, EffortLevel } from "../types/habit";
import { requestNotificationPermission, scheduleHabitReminder } from "../utils/notifications";
import { toast } from "sonner";

const WEEKDAYS = [
  { id: 1, label: "L", full: "Lundi" },
  { id: 2, label: "M", full: "Mardi" },
  { id: 3, label: "M", full: "Mercredi" },
  { id: 4, label: "J", full: "Jeudi" },
  { id: 5, label: "V", full: "Vendredi" },
  { id: 6, label: "S", full: "Samedi" },
  { id: 0, label: "D", full: "Dimanche" },
];

export function HabitCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { session, isPremium } = useAuth();
  const userPlan = session.user?.plan || 'seedling';

  const editingHabit = location.state?.habit as Habit | undefined;
  const isEditing = !!editingHabit;

  const [mode, setMode] = useState<"build" | "quit">("build");
  const [habitName, setHabitName] = useState("");
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [repetitionsPerDay, setRepetitionsPerDay] = useState(1);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [customReminder, setCustomReminder] = useState("");
  const [enableReminder, setEnableReminder] = useState(true);
  const [hasDuration, setHasDuration] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>("steady");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [hasTargetExecutions, setHasTargetExecutions] = useState(false);
  const [targetExecutions, setTargetExecutions] = useState(30);

  useEffect(() => {
    if (editingHabit) {
      setMode(editingHabit.mode);
      setHabitName(editingHabit.name);
      setGoal(editingHabit.goal || "");
      setFrequency(editingHabit.frequency || "daily");
      setSelectedDays(editingHabit.selectedDays || []);
      setRepetitionsPerDay(editingHabit.repetitionsPerDay || 1);
      setReminderTime(editingHabit.reminderTime || "09:00");
      setEnableReminder(!!editingHabit.reminderTime);
      setCustomReminder(editingHabit.customReminder || "");
      setHasDuration(!!editingHabit.durationMinutes);
      setDurationMinutes(editingHabit.durationMinutes || 10);
      setEffortLevel(editingHabit.effortLevel || "steady");
      setStartDate(editingHabit.startDate || new Date().toISOString().split("T")[0]);
      setHasEndDate(!!editingHabit.endDate);
      setEndDate(editingHabit.endDate || "");
      setHasTargetExecutions(!!editingHabit.targetTotalExecutions);
      setTargetExecutions(editingHabit.targetTotalExecutions || 30);
    } else if (location.state?.mode) {
      setMode(location.state.mode);
    }
  }, [editingHabit, location.state]);

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleFrequencyChange = (f: "daily" | "weekly" | "custom") => {
    if (userPlan === 'seedling' && f !== 'daily') {
      toast.error("Fonctionnalité Premium", {
        description: "Les cadences personnalisées sont réservées aux abonnés Bloom.",
        action: {
          label: "Découvrir",
          onClick: () => navigate("/upgrade")
        }
      });
      return;
    }
    setFrequency(f);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedHabit: Habit = {
      id: isEditing ? editingHabit.id : crypto.randomUUID(),
      name: habitName,
      mode,
      streak: isEditing ? editingHabit.streak : 0,
      lastCheckIn: isEditing ? editingHabit.lastCheckIn : null,
      history: isEditing ? editingHabit.history : [],
      goal,
      frequency,
      selectedDays: frequency !== "daily" ? selectedDays : undefined,
      repetitionsPerDay,
      reminderTime: enableReminder ? reminderTime : null,
      customReminder: customReminder || undefined,
      durationMinutes: hasDuration ? durationMinutes : null,
      effortLevel,
      startDate,
      endDate: hasEndDate ? endDate : null,
      targetTotalExecutions: hasTargetExecutions ? targetExecutions : null,
    };

    if (enableReminder) {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        await scheduleHabitReminder(updatedHabit);
      }
    }

    navigate(`/dashboard?mode=${mode}`, {
      state: {
        [isEditing ? 'updatedHabit' : 'newHabit']: updatedHabit,
        showSuccess: true
      },
    });
  };

  const handleDelete = () => {
    if (!isEditing) return;
    navigate(`/dashboard?mode=${mode}`, {
      state: { deleteHabitId: editingHabit.id },
    });
  };

  const isFormValid = habitName.trim().length > 0 && (frequency === "daily" || selectedDays.length > 0);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917]">
          {isEditing ? "Modifier l'habitude" : "Nouvelle habitude"}
        </h1>
        {isEditing ? (
          <button onClick={handleDelete} className="p-1.5 bg-red-50 rounded-full text-red-500 active:scale-90 transition-all">
            <Trash2 size={20} />
          </button>
        ) : <div className="w-8" />}
      </div>

      <div className="max-w-xl mx-auto px-6 py-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mascot */}
          <div className="flex justify-center">
            <SunnyMascot mood="neutral" size={60} />
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold mb-3 text-[#1C1917]/40 uppercase tracking-widest">Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("build")}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  mode === "build"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-50 bg-gray-50 text-gray-400"
                }`}
              >
                <Plus size={14} />
                <span className="font-bold text-sm">Encrage</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("quit")}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  mode === "quit"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-50 bg-gray-50 text-gray-400"
                }`}
              >
                <Zap size={14} />
                <span className="font-bold text-sm">Sevrage</span>
              </button>
            </div>
          </div>

          {/* Habit Name */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
            <label className="block text-xs font-bold mb-2 text-[#1C1917]/40 uppercase tracking-widest">
              {mode === "build" ? "Quoi ?" : "Arrêter quoi ?"}
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder={mode === "build" ? "Méditer, Courir..." : "Sucre, Tabac..."}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500/20 text-[#1C1917] font-medium text-sm"
            />
          </div>

          {/* Frequency & Time */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 space-y-4">
            <label className="block text-xs font-bold text-[#1C1917]/40 uppercase tracking-widest flex items-center justify-between">
              Fréquence & Temps
              {userPlan === 'seedling' && <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Seedling (Fixe)</span>}
            </label>

            <div className="grid grid-cols-3 gap-2">
              {["daily", "weekly", "custom"].map((f) => {
                const isLocked = userPlan === 'seedling' && f !== 'daily';
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => handleFrequencyChange(f as any)}
                    className={`py-2 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      frequency === f
                        ? "border-[#1C1917] bg-[#1C1917] text-white shadow-sm"
                        : isLocked ? "border-gray-50 bg-gray-50 text-gray-200" : "border-gray-50 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {isLocked && <Lock size={10} />}
                    {f === "daily" ? "Quotidien" : f === "weekly" ? "Hebdo" : "Perso"}
                  </button>
                );
              })}
            </div>

            {/* Weekly/Custom Days Selection */}
            {frequency !== "daily" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-2"
              >
                <p className="text-[11px] font-bold text-[#1C1917]/40 uppercase mb-2">Choisir les jours</p>
                <div className="flex justify-between gap-1">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all border-2 ${
                        selectedDays.includes(day.id)
                          ? "bg-[#0085FF] border-[#0085FF] text-white shadow-sm"
                          : "bg-gray-50 border-gray-50 text-gray-400"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
               {/* Repetition per day */}
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                     <Repeat size={16} className="text-gray-400" />
                     <span className="font-bold text-sm text-[#1C1917]">Répétition / jour</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button
                      type="button"
                      onClick={() => setRepetitionsPerDay(Math.max(1, repetitionsPerDay - 1))}
                      className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 text-[#1C1917] font-bold"
                     >-</button>
                     <span className="font-bold text-[#1C1917] text-sm">{repetitionsPerDay}</span>
                     <button
                      type="button"
                      onClick={() => setRepetitionsPerDay(repetitionsPerDay + 1)}
                      className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 text-[#1C1917] font-bold"
                     >+</button>
                  </div>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                     <Clock size={16} className="text-gray-400" />
                     <span className="font-bold text-sm text-[#1C1917]">Durée (min)</span>
                  </div>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-12 bg-transparent text-right font-bold text-[#1C1917] focus:outline-none text-sm"
                  />
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2">
                        <Bell size={16} className="text-gray-400" />
                        <span className="font-bold text-sm text-[#1C1917]">Rappel</span>
                     </div>
                     <button
                        type="button"
                        onClick={() => setEnableReminder(!enableReminder)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${enableReminder ? 'bg-green-500' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${enableReminder ? 'left-4.5' : 'left-0.5'}`} />
                     </button>
                  </div>
                  {enableReminder && (
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="bg-transparent text-right font-bold text-[#1C1917] focus:outline-none text-sm"
                    />
                  )}
               </div>

               {/* End Conditions */}
               <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="font-bold text-sm text-[#1C1917]">Fin de l'habitude ?</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">Par date</label>
                    <button
                      type="button"
                      onClick={() => setHasEndDate(!hasEndDate)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${hasEndDate ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${hasEndDate ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {hasEndDate && (
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm text-[#1C1917] focus:outline-none"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">Par nombre de fois</label>
                    <button
                      type="button"
                      onClick={() => setHasTargetExecutions(!hasTargetExecutions)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${hasTargetExecutions ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${hasTargetExecutions ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {hasTargetExecutions && (
                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-1">
                      <input
                        type="number"
                        value={targetExecutions}
                        onChange={(e) => setTargetExecutions(Number(e.target.value))}
                        className="flex-1 bg-transparent text-sm font-bold text-[#1C1917] focus:outline-none"
                      />
                      <span className="text-xs text-gray-400">exécutions totales</span>
                    </div>
                  )}
               </div>

               {/* Custom reminder text */}
               <AnimatePresence>
                 {(frequency === "custom" || enableReminder) && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="p-3 bg-gray-50 rounded-xl"
                   >
                      <div className="flex items-center gap-2 mb-2">
                         <AlertCircle size={16} className="text-gray-400" />
                         <span className="font-bold text-sm text-[#1C1917]">Message de rappel</span>
                      </div>
                      <input
                        type="text"
                        value={customReminder}
                        onChange={(e) => setCustomReminder(e.target.value)}
                        placeholder="Ex: 'N'oublie pas de boire de l'eau !'"
                        className="w-full bg-transparent border-b border-gray-200 py-1 focus:border-[#0085FF] focus:outline-none text-sm text-[#1C1917]"
                      />
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 pb-8">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg ${
                isFormValid
                  ? "bg-[#0085FF] text-white shadow-blue-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isEditing ? "Mettre à jour" : "Enregistrer l'habitude"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 Broadway: Broadway
