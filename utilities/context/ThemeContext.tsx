// utilities/context/ThemeContext.tsx
"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define interfaces
export interface ColorOption {
  name: string;
  primary: string;
  hover: string;
  active: string;
  light: string;
  medium: string;
}

interface SavedTheme {
  colorName: string;
  darkMode: boolean;
}

interface ThemeContextType {
  colorOptions: ColorOption[];
  currentTheme: ColorOption;
  isDarkMode: boolean;
  setCurrentTheme: (color: ColorOption) => void;
  toggleDarkMode: () => void;
}

// Define color options
export const colorOptions: ColorOption[] = [
  { name: 'Red', primary: '#F43F5E', hover: '#E11D48', active: '#BE123C', light: 'rgba(244, 63, 94, 0.1)', medium: 'rgba(244, 63, 94, 0.3)' },
  { name: 'Orange', primary: '#F97316', hover: '#EA580C', active: '#C2410C', light: 'rgba(249, 115, 22, 0.1)', medium: 'rgba(249, 115, 22, 0.3)' },
  { name: 'Yellow', primary: '#FACC15', hover: '#EAB308', active: '#CA8A04', light: 'rgba(250, 204, 21, 0.1)', medium: 'rgba(250, 204, 21, 0.3)' },
  { name: 'Green', primary: '#10B981', hover: '#059669', active: '#047857', light: 'rgba(16, 185, 129, 0.1)', medium: 'rgba(16, 185, 129, 0.3)' },
  { name: 'Blue', primary: '#3B82F6', hover: '#2563EB', active: '#1D4ED8', light: 'rgba(59, 130, 246, 0.1)', medium: 'rgba(59, 130, 246, 0.3)' },
  { name: 'Indigo', primary: '#6366F1', hover: '#4F46E5', active: '#4338CA', light: 'rgba(99, 102, 241, 0.1)', medium: 'rgba(99, 102, 241, 0.3)' },
  { name: 'Violet', primary: '#8B5CF6', hover: '#7C3AED', active: '#6D28D9', light: 'rgba(139, 92, 246, 0.1)', medium: 'rgba(139, 92, 246, 0.3)' },
];

// Default values
const defaultTheme = colorOptions[4]; // Blue

// Create context with initial default value
export const ThemeContext = createContext<ThemeContextType>({
  colorOptions,
  currentTheme: defaultTheme,
  isDarkMode: false,
  setCurrentTheme: () => {},
  toggleDarkMode: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ColorOption>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Apply theme to document
  const applyTheme = (theme: ColorOption, darkMode: boolean) => {
    if (typeof window === 'undefined' || !theme) return;
    
    const root = document.documentElement;

    // Set theme color variables
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-hover', theme.hover);
    root.style.setProperty('--theme-primary-active', theme.active);
    root.style.setProperty('--theme-primary-light', theme.light);
    root.style.setProperty('--theme-primary-medium', theme.medium);

    // Dynamically adjust background and text colors based on dark mode
    if (darkMode) {
      document.body.classList.add('dark-mode');
      root.style.setProperty('--bg-page', '#1F2937'); // Darker background
      root.style.setProperty('--bg-primary', theme.primary); // Use theme color
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--text-primary', '#F9FAFB');
      root.style.setProperty('--text-secondary', '#D1D5DB');
    } else {
      document.body.classList.remove('dark-mode');
      root.style.setProperty('--bg-page', '#F7F9FC'); // Lighter background
      root.style.setProperty('--bg-primary', theme.primary); // Use theme color
      root.style.setProperty('--bg-secondary', '#F3F4F6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#4B5563');
    }

    // Save preferences
    localStorage.setItem('appTheme', JSON.stringify({ colorName: theme.name, darkMode }));
  };

  // Load saved theme from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadTheme = () => {
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme) {
        try {
          const { colorName, darkMode } = JSON.parse(savedTheme) as SavedTheme;
          const foundTheme = colorOptions.find(c => c.name === colorName) || defaultTheme;
          setCurrentTheme(foundTheme);
          setIsDarkMode(darkMode);
          applyTheme(foundTheme, darkMode);
        } catch (error) {
          console.error("Error loading theme from localStorage:", error);
          applyTheme(defaultTheme, false);
        }
      } else {
        applyTheme(defaultTheme, false);
      }
      setIsInitialized(true);
    };
    
    loadTheme();
  }, []);

  // Apply theme whenever theme or dark mode changes
  useEffect(() => {
    if (isInitialized) {
      applyTheme(currentTheme, isDarkMode);
    }
  }, [currentTheme, isDarkMode, isInitialized]);

  const handleColorChange = (color: ColorOption) => {
    setCurrentTheme(color);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        colorOptions,
        currentTheme,
        isDarkMode,
        setCurrentTheme: handleColorChange,
        toggleDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};