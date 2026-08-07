"use client";

import { Suspense, useEffect, useState } from "react";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AudioProvider } from "./contexts/AudioContext";
import { AnimationProvider } from "./contexts/AnimationContext";
import { Toaster, toast } from "sonner";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SplashScreen } from "./components/splash-screen";
import { AnimatePresence } from "motion/react";
import { AuthProvider } from "./contexts/AuthContext";

/**
 * Composant Racine de l'application Bloom.
 * Gère les fournisseurs de contexte globaux, l'écran de démarrage (Splash)
 * et les écouteurs d'événements système (notifications).
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Masque l'écran de démarrage après 3 secondes
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    // Configuration des écouteurs pour les notifications locales
    const setupNotificationListeners = async () => {
      // Cas : Notification reçue alors que l'application est ouverte (Foreground)
      await LocalNotifications.addListener('localNotificationReceived', (notification) => {
        toast.info(notification.title, {
          description: notification.body,
          duration: 5000,
        });
      });

      // Cas : Utilisateur clique sur une notification dans la barre système
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const { habitId } = action.notification.extra;
        if (habitId) {
          // Redirige l'utilisateur vers l'écran de validation spécifique à l'habitude
          router.navigate(`/habit-action/${habitId}`);
        }
      });
    };

    setupNotificationListeners();

    // Nettoyage au démontage
    return () => {
      LocalNotifications.removeAllListeners();
      clearTimeout(timer);
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Chargement de Bloom...
        </div>
      }
    >
      {/* Hiérarchie des contextes (fournisseurs de données) */}
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <AudioProvider>
              <AnimationProvider>
                <AnimatePresence>
                  {showSplash && <SplashScreen />}
                </AnimatePresence>

                {/* Point d'entrée de la navigation (React Router) */}
                <RouterProvider router={router} />

                {/* Gestionnaire de notifications Toast (UI) */}
                <Toaster position="top-center" expand={true} richColors closeButton />
              </AnimationProvider>
            </AudioProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </Suspense>
  );
}
