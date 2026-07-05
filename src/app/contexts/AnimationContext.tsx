import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AnimationContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage("bloom-animations-enabled", true);

  const toggleAnimations = () => {
    setAnimationsEnabled((prev) => !prev);
  };

  const value = useMemo(() => ({ animationsEnabled, toggleAnimations }), [animationsEnabled]);

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};