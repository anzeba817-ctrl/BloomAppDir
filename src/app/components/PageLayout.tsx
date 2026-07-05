"use client";

import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "./bottom-nav";
import { useAnimation } from "../contexts/AnimationContext";

export function PageLayout() {
  const location = useLocation();
  const { animationsEnabled } = useAnimation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(248,190,86,0.12),_transparent_32%),linear-gradient(135deg,_rgba(254,248,240,0.96),_rgba(253,250,244,1))] text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-6xl px-0 pb-24 sm:px-4 lg:px-6">
        {animationsEnabled ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.985 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="min-h-screen"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="min-h-screen">
            <Outlet />
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
