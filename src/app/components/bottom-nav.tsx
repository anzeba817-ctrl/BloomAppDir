"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Home } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAnimation } from "../contexts/AnimationContext";

const dashboardTab = { path: "/dashboard", icon: Home, key: "nav_dashboard" as const };

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { animationsEnabled } = useAnimation();
  const active = location.pathname === dashboardTab.path;
  const label = t(dashboardTab.key) as string;
  const Icon = dashboardTab.icon;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/85 backdrop-blur-xl safe-area-bottom shadow-[0_-10px_40px_rgba(20,29,36,0.08)]">
      <div className="mx-auto flex max-w-sm justify-center px-4 py-2">
        <motion.button
          onClick={() => navigate(dashboardTab.path)}
          className={`relative flex min-w-[180px] items-center justify-center gap-2 rounded-2xl px-5 py-3 transition-all ${
            active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
          }`}
          aria-label={label}
          whileTap={animationsEnabled ? { scale: 0.96, y: -2 } : {}}
          transition={animationsEnabled ? { type: "spring", stiffness: 400, damping: 18 } : { duration: 0 }}
        >
          <motion.div animate={animationsEnabled ? { scale: active ? 1.06 : 1, y: active ? -1 : 0 } : {}}>
            <Icon
              className={`h-5 w-5 transition-all ${active ? "text-primary" : "text-muted-foreground"}`}
              strokeWidth={active ? 2.3 : 1.8}
            />
          </motion.div>
          <span className={`text-sm font-medium leading-tight ${active ? "text-primary" : "text-muted-foreground"}`}>
            {label}
          </span>
        </motion.button>
      </div>
    </nav>
  );
}

