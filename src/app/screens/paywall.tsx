"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, X, Crown } from "lucide-react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * Écran Paywall : Présente les forfaits Seedling, Bloom et Bloom Forever.
 */
export function Paywall() {
  const navigate = useNavigate();
  const { session, upgradePlan } = useAuth();
  const { t } = useLanguage();
  const currentPlan = session.user?.plan || 'seedling';

  const handleUpgrade = (plan: 'bloom' | 'forever') => {
    upgradePlan(plan);
    navigate("/dashboard");
  };

  const plans = [
    {
      id: 'seedling',
      name: t("plan_seedling"),
      price: "0 €",
      period: t("period_free"),
      features: [
        { text: t("feature_limit_3"), included: true },
        { text: t("feature_basic_states"), included: true },
        { text: t("feature_sunny_classic"), included: true },
        { text: t("feature_basic_stats"), included: true },
        { text: t("feature_fixed_cadence"), included: true },
        { text: t("feature_ads_present"), included: true, isNegative: true },
      ],
      buttonText: t("version_current"),
      color: "border-gray-100 bg-white",
      textColor: "text-[#1C1917]",
      isCurrent: currentPlan === 'seedling'
    },
    {
      id: 'bloom',
      name: t("plan_bloom"),
      price: "4.99 $",
      period: t("period_monthly"),
      recommended: true,
      features: [
        { text: t("feature_unlimited_habits"), included: true },
        { text: t("feature_7_states"), included: true },
        { text: t("feature_all_widgets"), included: true },
        { text: t("feature_full_heatmap"), included: true },
        { text: t("feature_custom_cadence"), included: true },
        { text: t("feature_no_ads"), included: true },
        { text: t("feature_3_crystals"), included: true, isBonus: true },
      ],
      buttonText: t("pass_to_bloom"),
      color: "border-green-100 bg-green-50/20",
      textColor: "text-green-800",
      isCurrent: currentPlan === 'bloom'
    },
    {
      id: 'forever',
      name: t("plan_forever"),
      price: "79.99 $",
      period: t("period_once"),
      features: [
        { text: t("feature_all_bloom"), included: true },
        { text: t("feature_multiplier"), included: true, isBonus: true },
        { text: t("feature_skin_legend"), included: true, isBonus: true },
        { text: t("feature_founder_badge"), included: true, isBonus: true },
        { text: t("feature_lifetime"), included: true },
      ],
      buttonText: t("become_founder"),
      color: "border-purple-100 bg-purple-50/20",
      textColor: "text-purple-800",
      isCurrent: currentPlan === 'forever'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-32 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <h1 className="text-lg font-bold text-[#1C1917]">{t("paywall_title") as string}</h1>
        <div className="w-8" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <SunnyMascot mood="overjoyed" size={100} className="mx-auto mb-4" />
          <h1 className="text-3xl font-black text-[#1C1917] mb-2">{t("upgrade_title") as string}</h1>
          <p className="text-gray-500 font-medium">{t("upgrade_subtitle") as string}</p>
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
                  {t("recommended") as string}
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{plan.name as string}</h2>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${plan.textColor}`}>{plan.price}</span>
                  <span className="text-[10px] font-bold text-gray-400">{plan.period as string}</span>
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
                      {feature.text as string}
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
                {plan.isCurrent ? t("current_plan_label") : plan.buttonText as string}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
