"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, X, Crown, Sparkles, Shield, Infinity, Zap, Award } from "lucide-react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useAuth } from "../contexts/AuthContext";

/**
 * Écran Paywall : Présente les forfaits Seedling, Bloom et Bloom Forever.
 */
export function Paywall() {
  const navigate = useNavigate();
  const { session, upgradePlan } = useAuth();
  const currentPlan = session.user?.plan || 'seedling';

  const handleUpgrade = (plan: 'bloom' | 'forever') => {
    upgradePlan(plan);
    navigate("/dashboard");
  };

  const plans = [
    {
      id: 'seedling',
      name: "SEEDLING",
      price: "0 €",
      period: "gratuit",
      features: [
        { text: "Limité à 3 habitudes simultanées", included: true },
        { text: "États basiques (Neutral, Growing, Blooming)", included: true },
        { text: "Widget d'écran d'accueil (Sunny Classic)", included: true },
        { text: "Statistiques élémentaires", included: true },
        { text: "Cadence fixe (Quotidienne)", included: true },
        { text: "Bannières publicitaires présentes", included: true, isNegative: true },
      ],
      buttonText: "Version actuelle",
      color: "border-gray-100 bg-white",
      textColor: "text-[#1C1917]",
      isCurrent: currentPlan === 'seedling'
    },
    {
      id: 'bloom',
      name: "BLOOM (Premium)",
      price: "4.99 $",
      period: "/ mois (ou 34.99$/an)",
      recommended: true,
      features: [
        { text: "Nombre d'habitudes illimité", included: true },
        { text: "Les 7 états émotionnels inclus", included: true },
        { text: "Widgets Accueil + Verrouillage", included: true },
        { text: "Heatmap complète & historique", included: true },
        { text: "Cadence personnalisée (Hebdo, etc.)", included: true },
        { text: "Aucune publicité", included: true },
        { text: "+3 Cristaux offerts / mois", included: true, isBonus: true },
      ],
      buttonText: "Passer à Bloom",
      color: "border-green-100 bg-green-50/20",
      textColor: "text-green-800",
      isCurrent: currentPlan === 'bloom'
    },
    {
      id: 'forever',
      name: "BLOOM FOREVER",
      price: "79.99 $",
      period: "paiement unique",
      features: [
        { text: "Tout le forfait BLOOM", included: true },
        { text: "Multiplicateur Pétales x1.5", included: true, isBonus: true },
        { text: "Skin exclusive \"Legend\"", included: true, isBonus: true },
        { text: "Badge Fondateur", included: true, isBonus: true },
        { text: "Accès à vie illimité", included: true },
      ],
      buttonText: "Devenir Fondateur",
      color: "border-purple-100 bg-purple-50/20",
      textColor: "text-purple-800",
      isCurrent: currentPlan === 'forever'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-32 overflow-y-auto">
      {/* En-tête */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917]">Forfaits Bloom</h1>
        <div className="w-8" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <SunnyMascot mood="overjoyed" size={100} className="mx-auto mb-4" />
          <h1 className="text-3xl font-black text-[#1C1917] mb-2">Passe à la vitesse supérieure</h1>
          <p className="text-gray-500 font-medium">Libère Sunny et débloque toutes tes capacités</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-[32px] border-2 p-6 transition-all ${plan.color} ${plan.recommended ? 'ring-2 ring-green-500 ring-offset-4' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Conseillé
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${plan.textColor}`}>{plan.price}</span>
                  <span className="text-[10px] font-bold text-gray-400">{plan.period}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    {feature.isNegative ? (
                      <X className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                    ) : (
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.id === 'forever' ? 'text-purple-500' : plan.id === 'bloom' ? 'text-green-500' : 'text-gray-300'}`} />
                    )}
                    <span className={`text-[11px] font-bold leading-tight ${feature.isBonus ? 'text-[#E8920A]' : 'text-[#1C1917]/70'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => plan.id !== 'seedling' && handleUpgrade(plan.id as any)}
                disabled={plan.isCurrent}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  plan.isCurrent
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                    : plan.id === 'forever'
                      ? "bg-[#1C1917] text-white shadow-xl shadow-[#1C1917]/20"
                      : plan.id === 'bloom'
                        ? "bg-green-500 text-white shadow-xl shadow-green-200"
                        : "bg-white border-2 border-gray-100 text-[#1C1917]"
                }`}
              >
                {plan.isCurrent ? "Actuel" : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
 Broadway: Broadway
