import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AudioContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage("bloom-sound-enabled", true);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const value = useMemo(() => ({ soundEnabled, toggleSound }), [soundEnabled]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};