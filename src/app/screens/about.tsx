"use client";

// src/app/screens/about.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)} // Bouton pour revenir en arrière
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl text-foreground">À propos de Bloom</h1>
        </div>
      </div>

      {/* Contenu de la page */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-card p-8 rounded-3xl shadow-lg">
          <h2 className="text-2xl mb-4 text-card-foreground">Notre Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Chez Bloom, notre mission est de vous aider à cultiver des habitudes saines
            et à vous épanouir jour après jour. Nous croyons que de petits pas
            constants mènent à de grandes transformations.
          </p>
        </div>
        <div className="bg-card p-8 rounded-3xl shadow-lg">
          <h2 className="text-2xl mb-4 text-card-foreground">Version de l'application</h2>
          <p className="text-muted-foreground">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

