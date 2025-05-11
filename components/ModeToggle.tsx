import React, { useEffect } from 'react';
import { Button } from './ui/button2';
import { Sun, Moon, SunMoon } from "lucide-react";
import { useTheme } from '../utilities/context/ThemeContext';

export function ModeToggle() {
  const { isDarkMode, toggleDarkMode, currentTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      className="rounded-full w-8 h-8 transition-all duration-300 hover:bg-primary/10"
    >
      {!isDarkMode ? (
        <Sun className={`h-4 w-4 text-[${currentTheme.primary}]`} />
      ) : (
        <Moon className={`h-4 w-4 text-[${currentTheme.primary}]`} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}