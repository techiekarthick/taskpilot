
"use client";

import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-provider";

const ThemeToggleButton: FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  // Ensure resolvedTheme is available before rendering
  if (!resolvedTheme) {
    return <Button variant="ghost" size="icon" className="h-8 w-8" disabled />; // Or some placeholder
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="h-8 w-8 text-foreground hover:bg-accent/50"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggleButton;
