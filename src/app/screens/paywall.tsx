"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, X, Crown, Sparkles, Shield } from "lucide-react";
import { SunnyMascot } from "../components/sunny-mascot";

export function Paywall() {
  const navigate = useNavigate();

  const features = {
    seedling: [
      { text: "jusqu'à 3 habitudes", included: true },
      { text: "sunny en 3 émotions (neutral, growing, wilting)", included: true },
      { text: "widget écran d'accueil", included: true },
      { text: "streak tracking basique", included: true },
      { text: "bannières publicitaires", included: true, isNegative: true },
      { text: "habitudes illimitées", included: false },
      { text: "7 émotions de sunny", included: false },
      { text: "bloom shield", included: false },
      { text: "pétales de cristal", included: false },
      { text: "cadences personnalisées", included: false },
    ],
    bloom: [
      { text: "habitudes illimitées", included: true },
      { text: "7 émotions de sunny", included: true },
      { text: "bloom shield (protection de série)", included: true },
      { text: "pétales de cristal", included: true },
      { text: "cadences personnalisées", included: true },
      { text: "widget écran d'accueil", included: true },
      { text: "statistiques avancées", included: true },
      { text: "zéro publicité", included: true },
      { text: "journal intime illimité", included: true },
      { text: "thèmes exclusifs", included: true },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FEF8F0]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FEF8F0]/95 backdrop-blur-sm border-b border-[#141D24]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#141D24]/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#141D24]" />
          </button>
          <h1 className="text-xl text-[#141D24]">passer à bloom</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <SunnyMascot mood="blooming" variant="expressive" size={140} />
          </div>
          <h1 className="text-4xl mb-4 text-[#141D24]">rayonne pleinement avec bloom</h1>
          <p className="text-lg text-[#141D24]/70 max-w-2xl mx-auto">
            débloque toutes les émotions de sunny, des habitudes illimitées, et une expérience sans pub
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Seedling */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-lg border-2 border-[#141D24]/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <h2 className="text-2xl text-[#141D24]">seedling</h2>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-[#141D24]">gratuit</div>
              <div className="text-sm text-[#141D24]/60">pour toujours</div>
            </div>

            <ul className="space-y-3 mb-8">
              {features.seedling.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  {feature.included ? (
                    feature.isNegative ? (
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Check className="w-5 h-5 text-[#3A7D4F] flex-shrink-0 mt-0.5" />
                    )
                  ) : (
                    <X className="w-5 h-5 text-[#141D24]/30 flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-sm ${
                      feature.included && !feature.isNegative
                        ? "text-[#141D24]"
                        : "text-[#141D24]/50"
                    }`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-4 rounded-2xl border-2 border-[#141D24]/20 text-[#141D24]/50 cursor-not-allowed"
            >
              version actuelle
            </button>
          </motion.div>

          {/* Bloom Premium */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#E8920A] to-[#F5C030] rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" />
                recommandé
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌻</span>
                <h2 className="text-2xl">bloom</h2>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold">4,99 €</div>
                <div className="text-sm text-white/80">par mois • résilie quand tu veux</div>
              </div>

              <ul className="space-y-3 mb-8">
                {features.bloom.slice(0, 6).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
                <li className="text-sm text-white/80 pl-8">et bien plus...</li>
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white text-[#E8920A] py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                commencer l'essai gratuit de 7 jours
              </motion.button>

              <p className="text-xs text-white/70 text-center mt-4">
                puis 4,99 €/mois • résilie à tout moment
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-[#6B4FA0]/10 to-[#6B4FA0]/5 rounded-2xl p-6">
            <Shield className="w-8 h-8 text-[#6B4FA0] mb-3" />
            <h3 className="font-semibold text-[#141D24] mb-2">bloom shield</h3>
            <p className="text-sm text-[#141D24]/70">
              protège ta série avec les pétales de cristal. un jour difficile ? sunny te couvre.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#F5C030]/10 to-[#F5C030]/5 rounded-2xl p-6">
            <Sparkles className="w-8 h-8 text-[#E8920A] mb-3" />
            <h3 className="font-semibold text-[#141D24] mb-2">7 émotions de sunny</h3>
            <p className="text-sm text-[#141D24]/70">
              vois sunny évoluer avec toi : neutral, growing, blooming, wilting, struggling, overjoyed, shielded.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#3A7D4F]/10 to-[#3A7D4F]/5 rounded-2xl p-6">
            <Crown className="w-8 h-8 text-[#3A7D4F] mb-3" />
            <h3 className="font-semibold text-[#141D24] mb-2">expérience premium</h3>
            <p className="text-sm text-[#141D24]/70">
              zéro publicité, habitudes illimitées, statistiques avancées et bien plus.
            </p>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-2xl mb-6 text-[#141D24]">questions fréquentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[#141D24] mb-2">
                puis-je annuler à tout moment ?
              </h3>
              <p className="text-sm text-[#141D24]/70">
                oui ! tu peux annuler ton abonnement quand tu veux. tu garderas l'accès jusqu'à 
                la fin de ta période de facturation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#141D24] mb-2">
                que se passe-t-il avec mes données si j'annule ?
              </h3>
              <p className="text-sm text-[#141D24]/70">
                toutes tes données restent sauvegardées. tu repasseras simplement aux limites 
                de la version gratuite (3 habitudes max).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#141D24] mb-2">
                l'essai gratuit est-il vraiment gratuit ?
              </h3>
              <p className="text-sm text-[#141D24]/70">
                oui ! 7 jours gratuits pour tout essayer. annule avant la fin pour ne pas être 
                facturé. zéro engagement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-sm text-[#141D24]/40 py-8">
          <p>des questions ? contacte-nous à support@bloomapp.com</p>
        </div>
      </div>
    </div>
  );
}

