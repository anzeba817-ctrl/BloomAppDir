"use client";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "./bottom-nav";
import { useAnimation } from "../contexts/AnimationContext";
import { useEffect, useRef } from "react";

export function PageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { animationsEnabled } = useAnimation();
  const touchStartX = useRef<number | null>(null);

  const hideNavPaths = [
    "/",
    "/auth",
    "/login",
    "/signup",
    "/onboarding/survey",
    "/onboarding/success",
    "/onboarding/mode",
    "/onboarding/habit",
  ];

  const shouldHideNav = hideNavPaths.some(p =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p)
  );

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX.current;

      // Swipe from left edge (> distance 100, start < 50px from edge)
      if (diff > 100 && touchStartX.current < 50) {
        navigate(-1);
      }

      touchStartX.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-foreground">
      <div className="relative mx-auto min-h-screen max-w-6xl px-0 pb-32 sm:px-4 lg:px-6">
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
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
