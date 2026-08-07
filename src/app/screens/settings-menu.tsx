"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Settings, BookOpen, User, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function SettingsMenu() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    {
      title: "Les réglages",
      subtitle: "Thèmes, sons et notifications",
      icon: Settings,
      path: "/settings",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Le journal",
      subtitle: "Tes pensées, ton espace",
      icon: BookOpen,
      path: "/journal",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Le profil & historique",
      subtitle: "Tes statistiques et ton parcours",
      icon: User,
      path: "/profile",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-[#1C1917] mb-8">Paramètres</h1>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(item.path)}
              className="w-full bg-white border border-gray-100 rounded-[28px] p-5 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className={`w-12 h-12 ${item.bgColor} rounded-2xl flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-[#1C1917] text-lg">{item.title}</h3>
                <p className="text-sm text-[#1C1917]/40 font-medium">{item.subtitle}</p>
              </div>
              <ChevronRight className="text-[#1C1917]/20" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
