"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Settings,
  BookOpen,
  User,
  ChevronRight,
  LayoutGrid,
  ShieldQuestion
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * MENU DES RÉGLAGES : Point d'entrée pour les sous-sections.
 */
export function SettingsMenu() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    {
      id: "settings",
      path: "/settings",
      icon: Settings,
      title: t("menu_settings_title"),
      subtitle: t("menu_settings_sub"),
      color: "bg-blue-50 text-blue-500"
    },
    {
      id: "journal",
      path: "/journal",
      icon: BookOpen,
      title: t("menu_journal_title"),
      subtitle: t("menu_journal_sub"),
      color: "bg-purple-50 text-purple-500"
    },
    {
      id: "profile",
      path: "/profile",
      icon: User,
      title: t("menu_profile_title"),
      subtitle: t("menu_profile_sub"),
      color: "bg-green-50 text-green-500"
    },
    {
      id: "widgets",
      path: "/widgets",
      icon: LayoutGrid,
      title: t("widgets_title"),
      subtitle: t("widgets_subtitle"),
      color: "bg-orange-50 text-orange-500"
    },
    {
      id: "about",
      path: "/about",
      icon: ShieldQuestion,
      title: t("about"),
      subtitle: t("version"),
      color: "bg-gray-50 text-gray-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-40">
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-black text-[#1C1917] mb-2">
          {t("settings_menu_title") as string}
        </h1>
        <p className="text-gray-400 font-medium">{t("manage_sub_desc") as string}</p>
      </div>

      <div className="px-6 space-y-4">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(item.path)}
            className="w-full bg-white border border-gray-100 rounded-[28px] p-5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-inner`}>
                <item.icon size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#1C1917] text-base leading-tight">
                   {item.title as string}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                   {item.subtitle as string}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
