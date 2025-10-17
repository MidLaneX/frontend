/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ENV } from "@/config/env";

export type ThemeMode = "light" | "dark";

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme-mode") as ThemeMode;
    if (saved) return saved;

    // Check system preference if auto-detect is enabled
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    // Use environment default
    return ENV.DEFAULT_THEME as ThemeMode;
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
