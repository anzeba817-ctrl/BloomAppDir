"use client";

import { createBrowserRouter } from "react-router-dom";
import { PageLayout } from "./components/PageLayout";
import { OnboardingWelcome } from "./screens/onboarding-welcome";
import { OnboardingMode } from "./screens/onboarding-mode";
import { OnboardingHabit } from "./screens/onboarding-habit";
import { Dashboard } from "./screens/dashboard";
import { Profile } from "./screens/profile";
import { Settings } from "./screens/settings";
import { Paywall } from "./screens/paywall";
import { HabitCalendar } from "./screens/habit-calendar";
import { HabitDetail } from "./screens/habit-detail";
import { HabitCreate } from "./screens/habit-create";
import { CalendarSync } from "./screens/calendar-sync";
import { CelebrationDance } from "./screens/celebration-dance";
import { Journal } from "./screens/journal";
import { Widgets } from "./screens/widgets";
import { About } from "./screens/about";

export const router = createBrowserRouter([
  {
    element: <PageLayout />, // Utiliser PageLayout comme wrapper
    children: [
      {
        path: "/",
        Component: OnboardingWelcome,
      },
      {
        path: "/onboarding/mode",
        Component: OnboardingMode,
      },
      {
        path: "/onboarding/habit",
        Component: OnboardingHabit,
      },
      {
        path: "/dashboard",
        Component: Dashboard,
      },
      {
        path: "/profile",
        Component: Profile,
      },
      {
        path: "/settings",
        Component: Settings,
      },
      {
        path: "/upgrade",
        Component: Paywall,
      },
      {
        path: "/habit-calendar",
        Component: HabitCalendar,
      },
      {
        path: "/habit-detail",
        Component: HabitDetail,
      },
      {
        path: "/habit-create",
        Component: HabitCreate,
      },
      {
        path: "/calendar-sync",
        Component: CalendarSync,
      },
      {
        path: "/celebration-dance",
        Component: CelebrationDance,
      },
      {
        path: "/journal",
        Component: Journal,
      },
      {
        path: "/widgets",
        Component: Widgets,
      },
      {
        path: "/about",
        Component: About,
      },
    ],
  },
]);

