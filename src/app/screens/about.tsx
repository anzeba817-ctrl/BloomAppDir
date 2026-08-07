"use client";

// src/app/screens/about.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky  top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)} // Bouton pour revenir en arrière
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl text-foreground">{t("about_title") as string}</h1>
        </div>
      </div>

      {/* Contenu de la page */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-card p-8 rounded-3xl shadow-lg">
          <h2 className="text-2xl mb-4 text-card-foreground">{t("about_mission_title") as string}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("about_mission_text") as string}
          </p>
        </div>
        <div className="bg-card p-8 rounded-3xl shadow-lg">
          <h2 className="text-2xl mb-4 text-card-foreground">{t("about_version_title") as string}</h2>
          <p className="text-muted-foreground">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

