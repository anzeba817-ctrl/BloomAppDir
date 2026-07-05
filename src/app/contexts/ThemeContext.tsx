"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const themes = ["light", "dark", "forest", "ocean", "custom"] as const;
export type Theme = (typeof themes)[number];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColors: Record<string, string>;
  setCustomColor: (variable: string, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useLocalStorage<Theme>("bloom-theme", "light");
  const [customColors, setCustomColors] = useLocalStorage<Record<string, string>>("bloom-custom-colors", {
    "--primary": "#E8920A",
    "--background": "#FEF8F0",
    "--foreground": "#141D24",
    "--card": "#FFFFFF",
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...themes);
    root.classList.add(theme);

    if (theme === "custom") {
      for (const [variable, value] of Object.entries(customColors)) {
        root.style.setProperty(variable, value);
      }
    } else {
      // Nettoyer les styles inline quand on n'est pas en mode custom
      for (const variable of Object.keys(customColors)) {
        root.style.removeProperty(variable);
      }
    }
  }, [theme, customColors]);

  const setCustomColor = (variable: string, value: string) => {
    setCustomColors((prev) => ({ ...prev, [variable]: value }));
  };

  const value = useMemo(() => ({ theme, setTheme, customColors, setCustomColor }), [theme, customColors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};