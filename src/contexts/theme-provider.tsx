
"use client";

import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light", // Default resolved theme, will be updated on client
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
  storageKey = "swift-task-theme",
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme; // Return default for SSR, actual value determined on client
    }
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      return storedTheme || defaultTheme;
    } catch (e) {
      console.error("Error reading theme from localStorage", e);
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedThemeState] = useState<"light" | "dark">("light");

  const applyTheme = useCallback((selectedTheme: Theme) => {
    if (typeof window === 'undefined') return;

    let currentResolvedTheme: "light" | "dark";
    const root = window.document.documentElement;

    if (selectedTheme === "system") {
      currentResolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      currentResolvedTheme = selectedTheme;
    }

    root.classList.remove("dark", "light"); // Clean up any existing classes

    if (currentResolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light"); // Explicitly add light for clarity, or remove if :root is implicitly light
    }
    setResolvedThemeState(currentResolvedTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listener for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        console.error("Error setting theme to localStorage", e);
      }
    }
    setThemeState(newTheme);
  };

  // Ensure resolvedTheme is set on initial client load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let initialResolved: "light" | "dark";
      if (theme === "system") {
        initialResolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        initialResolved = theme;
      }
      setResolvedThemeState(initialResolved);
    }
  }, [theme]);


  return (
    <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
