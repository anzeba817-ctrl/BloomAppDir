"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { Lock } from "lucide-react";

export function OnboardingHabit() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || "build";
  const guided = location.state?.guided === true;
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState("daily");

  const modeColor = guided ? "#F59E0B" : mode === "build" ? "#3A7D4F" : "#6B4FA0";
  const modeTitle = guided ? "mode assisté" : mode === "build" ? "mode encrage" : "mode sevrage";

  const handleCreate = () => {
    if (habitName.trim()) {
      navigate("/dashboard", { 
        state: { 
          mode, 
          firstHabit: habitName,
          frequency 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div 
          className="inline-block px-4 py-2 rounded-full text-white text-sm mb-4"
          style={{ backgroundColor: modeColor }}
        >
          {modeTitle}
        </div>
        <h1 className="text-3xl mb-2">crée ta première habitude</h1>
        <p className="text-muted-foreground">
          {guided
            ? "on commence par une seule petite action, très simple à tenir."
            : mode === "build"
              ? "quelle habitude veux-tu construire ?"
              : "de quelle habitude veux-tu te libérer ?"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md space-y-6"
      >
        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            {mode === "build" ? "nom de l'habitude" : "habitude à quitter"}
          </label>
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder={mode === "build" ? "ex: méditer 10 minutes" : "ex: fumer"}
            className="w-full bg-card border-2 border-border rounded-2xl px-6 py-4 text-card-foreground focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">cadence</label>
          <div className="space-y-3">
            <button
              onClick={() => setFrequency("daily")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                frequency === "daily"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-card-foreground">quotidienne</div>
                  <div className="text-sm text-muted-foreground">tous les jours</div>
                </div>
                {frequency === "daily" && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>

            <button
              disabled
              className="w-full p-4 rounded-2xl border-2 border-border bg-muted/50 text-left opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-muted-foreground">cadence personnalisée</div>
                  <div className="text-sm text-muted-foreground/80">disponible en version bloom</div>
                </div>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: habitName.trim() ? 1.02 : 1 }}
          whileTap={{ scale: habitName.trim() ? 0.98 : 1 }}
          onClick={handleCreate}
          disabled={!habitName.trim()}
          className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          créer et commencer
        </motion.button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate(-1)}
        className="mt-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        ← retour
      </motion.button>
    </div>
  );
}

