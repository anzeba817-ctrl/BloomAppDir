"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const themes = ["light", "dark", "system", "forest", "ocean", "custom"] as const;
export type Theme = (typeof themes)[number];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | "forest" | "ocean" | "custom";
  customColors: Record<string, string>;
  setCustomColor: (variable: string, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useLocalStorage<Theme>("bloom-theme", "system");
  const [customColors, setCustomColors] = useLocalStorage<Record<string, string>>("bloom-custom-colors", {
    "--primary": "#E8920A",
    "--background": "#FFF9F2",
    "--foreground": "#1C1917",
    "--card": "#FFFCF8",
  });

  const resolvedTheme = useMemo(() => {
    if (theme !== "system") return theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "forest", "ocean", "custom");
    root.classList.add(resolvedTheme);

    if (resolvedTheme === "custom") {
      for (const [variable, value] of Object.entries(customColors)) {
        root.style.setProperty(variable, value);
      }
    } else {
      for (const variable of Object.keys(customColors)) {
        root.style.removeProperty(variable);
      }
    }
  }, [resolvedTheme, customColors]);

  const setCustomColor = (variable: string, value: string) => {
    setCustomColors((prev) => ({ ...prev, [variable]: value }));
  };

  const value = useMemo(() => ({ theme, setTheme, resolvedTheme, customColors, setCustomColor }), [theme, resolvedTheme, customColors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};