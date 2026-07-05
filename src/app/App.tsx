"use client";

import { Suspense } from "react";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AudioProvider } from "./contexts/AudioContext";
import { AnimationProvider } from "./contexts/AnimationContext";

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Chargement...
        </div>
      }
    >
      <LanguageProvider>
        <ThemeProvider>
          <AudioProvider>
            <AnimationProvider>
              <RouterProvider router={router} />
            </AnimationProvider>
          </AudioProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Suspense>
  );
}
