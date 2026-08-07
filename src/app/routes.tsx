"use client";

import { createBrowserRouter } from "react-router-dom";
import { PageLayout } from "./components/PageLayout";
import { OnboardingWelcomeNew } from "./screens/onboarding-welcome-new";
import { AuthScreen } from "./screens/auth-screen";
import { LoginScreen } from "./screens/login-screen";
import { SignupScreen } from "./screens/signup-screen";
import { OnboardingSurvey } from "./screens/onboarding-survey";
import { OnboardingSuccess } from "./screens/onboarding-success";
import { OnboardingWelcome } from "./screens/onboarding-welcome";
import { OnboardingMode } from "./screens/onboarding-mode";
import { OnboardingHabit } from "./screens/onboarding-habit";
import { Dashboard } from "./screens/dashboard";
import { Profile } from "./screens/profile";
import { Settings } from "./screens/settings";
import { SettingsMenu } from "./screens/settings-menu";
import { Paywall } from "./screens/paywall";
import { HabitCalendar } from "./screens/habit-calendar";
import { HabitDetail } from "./screens/habit-detail";
import { HabitCreate } from "./screens/habit-create";
import { CalendarSync } from "./screens/calendar-sync";
import { CelebrationDance } from "./screens/celebration-dance";
import { Journal } from "./screens/journal";
import { Widgets } from "./screens/widgets";
import { About } from "./screens/about";
import { Notifications } from "./screens/notifications";
import { HabitValidationAction } from "./screens/habit-validation-action";

export const router = createBrowserRouter([
  {
    element: <PageLayout />, // Utiliser PageLayout comme wrapper
    children: [
      {
        path: "/",
        Component: OnboardingWelcomeNew,
      },
      {
        path: "/auth",
        Component: AuthScreen,
      },
      {
        path: "/login",
        Component: LoginScreen,
      },
      {
        path: "/signup",
        Component: SignupScreen,
      },
      {
        path: "/onboarding/survey",
        Component: OnboardingSurvey,
      },
      {
        path: "/onboarding/success",
        Component: OnboardingSuccess,
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
        path: "/settings-menu",
        Component: SettingsMenu,
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
        path: "/notifications",
        Component: Notifications,
      },
      {
        path: "/habit-action/:id",
        Component: HabitValidationAction,
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
