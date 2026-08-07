"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Home, Plus, Settings } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const currentMode = searchParams.get("mode") || "build";

  const navItems = [
    { path: "/dashboard", icon: Home, label: t("nav_dashboard") },
    {
      path: "/habit-create",
      icon: Plus,
      isCenter: true,
      state: { mode: currentMode }
    },
    { path: "/settings-menu", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-6 pointer-events-none">
      <nav
        id="dashboard-navigation"
        className="pointer-events-auto w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex items-center justify-around px-2 py-2 h-20"
      >
        {navItems.map((item, index) => {
          const active = location.pathname === item.path || (item.path === "/settings-menu" && (location.pathname === "/settings" || location.pathname === "/journal" || location.pathname === "/profile"));
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={index} className="relative flex items-center justify-center -top-2">
                <motion.button
                  onClick={() => navigate(item.path, { state: item.state })}
                  className="bg-[#1C1917] text-white p-4.5 rounded-2xl shadow-xl shadow-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-7 w-7" strokeWidth={3} />
                </motion.button>
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center transition-all relative ${
                active ? "text-[#1C1917]" : "text-[#1C1917]/30"
              }`}
            >
              <div className="relative flex flex-col items-center gap-1">
                <Icon
                  className={`h-6 w-6 transition-all duration-300 ${active ? "scale-110" : "scale-100"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <motion.div
                    layoutId="active-dot"
                    className="w-1 h-1 bg-[#1C1917] rounded-full mt-0.5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
