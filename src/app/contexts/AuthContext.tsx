"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * Contexte d'Authentification : Gère la session utilisateur,
 * l'inscription, la connexion et la persistence des données du profil.
 */

export type UserPlan = 'seedling' | 'bloom' | 'forever';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  plan: UserPlan;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  session: AuthSession;
  login: (email: string, displayName?: string) => void;
  signup: (email: string, displayName: string) => void;
  logout: () => void;
  upgradePlan: (plan: UserPlan) => void;
  isAuthenticated: boolean;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INITIAL_SESSION: AuthSession = {
  user: null,
  token: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useLocalStorage<AuthSession>("bloom-session", INITIAL_SESSION);

  const login = (email: string, displayName?: string) => {
    const user: User = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      plan: 'seedling',
    };
    setSession({
      user,
      token: "mock-jwt-token-" + Date.now(),
    });
  };

  const signup = (email: string, displayName: string) => {
    const user: User = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      plan: 'seedling',
    };
    setSession({
      user,
      token: "mock-jwt-token-" + Date.now(),
    });
  };

  const upgradePlan = (plan: UserPlan) => {
    if (session.user) {
      setSession({
        ...session,
        user: { ...session.user, plan }
      });
    }
  };

  const logout = () => {
    setSession(INITIAL_SESSION);
  };

  const isAuthenticated = !!session.user;
  const isPremium = session.user?.plan === 'bloom' || session.user?.plan === 'forever';

  return (
    <AuthContext.Provider value={{ session, login, signup, logout, upgradePlan, isAuthenticated, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
