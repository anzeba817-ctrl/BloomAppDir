"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";

export function CalendarSync() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsConnecting(false);
    setSyncEnabled(true);
    setLastSync(new Date());
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSyncEnabled(false);
    setLastSync(null);
  };

  const handleSync = async () => {
    if (!isConnected) return;
    setIsConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastSync(new Date());
    setIsConnecting(false);
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
          <h1 className="text-xl text-[#141D24]">{t("calendar_sync_title") as string}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Mascot */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <SunnyMascot mood={isConnected ? "blooming" : "neutral"} size={120} />
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 shadow-lg ${
            isConnected
              ? "bg-gradient-to-br from-[#3A7D4F]/10 to-[#3A7D4F]/5"
              : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isConnected ? "bg-[#3A7D4F]" : "bg-[#141D24]/10"}`}>
                <Calendar className={`w-6 h-6 ${isConnected ? "text-white" : "text-[#141D24]/60"}`} />
              </div>
              <div>
                <div className="font-semibold text-[#141D24]">Google Calendar</div>
                <div className="text-sm text-[#141D24]/60">
                  {isConnected ? (t("calendar_sync_connected") as string) : (t("calendar_sync_disconnected") as string)}
                </div>
              </div>
            </div>
            {isConnected ? (
              <CheckCircle2 className="w-6 h-6 text-[#3A7D4F]" />
            ) : (
              <AlertCircle className="w-6 h-6 text-[#141D24]/30" />
            )}
          </div>

          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#3A7D4F] text-white py-4 rounded-xl hover:bg-[#3A7D4F]/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (t("calendar_sync_connecting") as string) : (t("calendar_sync_connect_google") as string)}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                <div>
                  <div className="font-medium text-[#141D24]">{t("calendar_sync_auto_label") as string}</div>
                  <div className="text-sm text-[#141D24]/60">
                    {t("calendar_sync_auto_desc") as string}
                  </div>
                </div>
                <button
                  onClick={() => setSyncEnabled(!syncEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    syncEnabled ? "bg-[#3A7D4F]" : "bg-[#141D24]/20"
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ left: syncEnabled ? "calc(100% - 28px)" : "4px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {lastSync && (
                <div className="text-sm text-[#141D24]/60 text-center">
                  {t("calendar_sync_last") as string} : {lastSync.toLocaleTimeString(lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US")}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={isConnecting}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-[#3A7D4F] py-3 rounded-xl border-2 border-[#3A7D4F]/20 hover:bg-[#3A7D4F]/5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isConnecting ? "animate-spin" : ""}`} />
                  {t("calendar_sync_now") as string}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-6 py-3 bg-[#141D24]/5 text-[#141D24]/60 rounded-xl hover:bg-[#141D24]/10 transition-colors"
                >
                  {t("calendar_sync_disconnect") as string}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <h2 className="text-lg mb-4 text-[#141D24]">{t("features_title") as string}</h2>
          <div className="space-y-4">
            {[
              {
                icon: "📅",
                title: t("feature_1_title"),
                desc: t("feature_1_desc"),
              },
              {
                icon: "🔔",
                title: t("feature_2_title"),
                desc: t("feature_2_desc"),
              },
              {
                icon: "✅",
                title: t("feature_3_title"),
                desc: t("feature_3_desc"),
              },
              {
                icon: "📊",
                title: t("feature_4_title"),
                desc: t("feature_4_desc"),
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-[#141D24] mb-1">{feature.title}</div>
                  <div className="text-sm text-[#141D24]/60">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#6B4FA0]/10 to-[#6B4FA0]/5 rounded-3xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <div className="font-semibold text-[#141D24] mb-2">
                {t("privacy_title") as string}
              </div>
              <div className="text-sm text-[#141D24]/70">
                {t("privacy_desc") as string}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
