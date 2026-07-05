"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { SunnyMascot } from "../components/sunny-mascot";

export function CalendarSync() {
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate OAuth flow
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
          <h1 className="text-xl text-[#141D24]">synchronisation calendrier</h1>
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
                  {isConnected ? "connecté" : "non connecté"}
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
              {isConnecting ? "connexion en cours..." : "connecter avec Google"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                <div>
                  <div className="font-medium text-[#141D24]">synchronisation automatique</div>
                  <div className="text-sm text-[#141D24]/60">
                    ajoute tes habitudes à Google Calendar
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
                  dernière synchro : {lastSync.toLocaleTimeString("fr-FR")}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={isConnecting}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-[#3A7D4F] py-3 rounded-xl border-2 border-[#3A7D4F]/20 hover:bg-[#3A7D4F]/5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isConnecting ? "animate-spin" : ""}`} />
                  synchroniser maintenant
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-6 py-3 bg-[#141D24]/5 text-[#141D24]/60 rounded-xl hover:bg-[#141D24]/10 transition-colors"
                >
                  déconnecter
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
          <h2 className="text-lg mb-4 text-[#141D24]">fonctionnalités</h2>
          <div className="space-y-4">
            {[
              {
                icon: "📅",
                title: "événements automatiques",
                desc: "tes habitudes quotidiennes sont ajoutées à ton calendrier",
              },
              {
                icon: "🔔",
                title: "rappels synchronisés",
                desc: "reçois des notifications au bon moment",
              },
              {
                icon: "✅",
                title: "check-in rapide",
                desc: "marque tes habitudes terminées directement depuis Google Calendar",
              },
              {
                icon: "📊",
                title: "vue d'ensemble",
                desc: "visualise toutes tes habitudes en un coup d'œil",
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
                tes données restent privées
              </div>
              <div className="text-sm text-[#141D24]/70">
                bloom accède uniquement à ton calendrier pour ajouter et mettre à jour tes
                événements d'habitudes. nous ne lisons jamais tes autres événements personnels.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

