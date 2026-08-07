"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SunnyMascot } from "../components/sunny-mascot";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function OnboardingSurvey() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    reason: "",
    type: "",
    frequency: ""
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else navigate("/onboarding/success", { state: { surveyAnswers: answers } });
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/auth");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevStep}
          className="p-2 rounded-full bg-white border border-gray-100 shadow-sm active:scale-90 transition-all"
        >
          <ChevronLeft size={24} className="text-[#1C1917]" />
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${s === step ? "bg-[#F5C030]" : "bg-[#F5C030]/20"}`}
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Sunny Mascot */}
        <motion.div
          key={step}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <SunnyMascot mood="growing" size={160} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-[#1C1917]">
                {step === 1 && t("survey_step1_title")}
                {step === 2 && t("survey_step2_title")}
                {step === 3 && t("survey_step3_title")}
              </h1>
              <p className="text-[#1C1917]/60 font-medium">
                {step === 1 && t("survey_step1_sub")}
                {step === 2 && t("survey_step2_sub")}
                {step === 3 && t("survey_step3_sub")}
              </p>

              <div className="inline-block px-4 py-2 bg-[#F5C030]/10 rounded-2xl">
                <p className="text-[#F5C030] font-bold text-sm">
                   {step === 1 && t("survey_step1_quote")}
                   {step === 2 && t("survey_step2_quote")}
                   {step === 3 && t("survey_step3_quote")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <SurveyOption
                    text={t("survey_option_build_habits") as string}
                    onClick={() => { setAnswers({...answers, reason: "build"}); nextStep(); }}
                  />
                  <SurveyOption
                    text={t("survey_option_break_habit") as string}
                    onClick={() => { setAnswers({...answers, reason: "quit"}); nextStep(); }}
                  />
                  <SurveyOption
                    text={t("survey_option_control") as string}
                    onClick={() => { setAnswers({...answers, reason: "control"}); nextStep(); }}
                  />
                  <SurveyOption
                    text={t("survey_option_explore") as string}
                    onClick={() => { setAnswers({...answers, reason: "explore"}); nextStep(); }}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <SurveyOption
                    text={t("survey_option_build_mode") as string}
                    onClick={() => { setAnswers({...answers, type: "build"}); nextStep(); }}
                    color="bg-green-50 border-green-100 text-green-700 hover:bg-green-100"
                  />
                  <SurveyOption
                    text={t("survey_option_quit_mode") as string}
                    onClick={() => { setAnswers({...answers, type: "quit"}); nextStep(); }}
                    color="bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100"
                  />
                  <SurveyOption
                    text={t("survey_option_both") as string}
                    onClick={() => { setAnswers({...answers, type: "both"}); nextStep(); }}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <SurveyOption
                    text={t("survey_option_daily") as string}
                    onClick={() => { setAnswers({...answers, frequency: "daily"}); nextStep(); }}
                  />
                  <SurveyOption
                    text={t("survey_option_often") as string}
                    onClick={() => { setAnswers({...answers, frequency: "often"}); nextStep(); }}
                  />
                  <SurveyOption
                    text={t("survey_option_weekly") as string}
                    onClick={() => { setAnswers({...answers, frequency: "weekly"}); nextStep(); }}
                  />
                  <SurveyOption
                    text={t("survey_option_unsure") as string}
                    onClick={() => { setAnswers({...answers, frequency: "unsure"}); nextStep(); }}
                  />
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SurveyOption({ text, onClick, color = "bg-white border-gray-100 text-[#1C1917] hover:bg-gray-50" }: { text: string, onClick: () => void, color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-3xl border-2 text-lg font-bold shadow-sm transition-all active:scale-[0.98] ${color} text-left flex items-center justify-between group`}
    >
      <span>{text}</span>
      <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
    </button>
  );
}
