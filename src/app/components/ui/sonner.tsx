"use client";

import React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const toasterTheme: ToasterProps["theme"] = theme === "dark" ? "dark" : "light";

  return (
    <Sonner
      theme={toasterTheme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties}
      {...props}
    />
  );
};

export { Toaster };
