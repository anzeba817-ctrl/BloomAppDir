"use client";

import { useState, useEffect } from "react";

function getSavedValue<T>(key: string, initialValue: T | (() => T)): T {
  try {
    const savedValue = localStorage.getItem(key);
    if (savedValue) {
      return JSON.parse(savedValue);
    }
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
  }

  if (initialValue instanceof Function) {
    return initialValue();
  }
  return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getSavedValue(key, initialValue);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}