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
const colorOptions: ColorOption[] = [
  { name: 'Red', primary: '#E53E3E', hover: '#C53030', active: '#9B2C2C', light: 'rgba(229, 62, 62, 0.1)', medium: 'rgba(229, 62, 62, 0.3)' },
  { name: 'Orange', primary: '#ED8936', hover: '#DD6B20', active: '#C05621', light: 'rgba(237, 137, 54, 0.1)', medium: 'rgba(237, 137, 54, 0.3)' },
  { name: 'Yellow', primary: '#ECC94B', hover: '#D69E2E', active: '#B7791F', light: 'rgba(236, 201, 75, 0.1)', medium: 'rgba(236, 201, 75, 0.3)' },
  { name: 'Green', primary: '#48BB78', hover: '#38A169', active: '#2F855A', light: 'rgba(72, 187, 120, 0.1)', medium: 'rgba(72, 187, 120, 0.3)' },
  { name: 'Blue', primary: '#4299E1', hover: '#3182CE', active: '#2B6CB0', light: 'rgba(66, 153, 225, 0.1)', medium: 'rgba(66, 153, 225, 0.3)' },
  { name: 'Indigo', primary: '#667EEA', hover: '#5A67D8', active: '#4C51BF', light: 'rgba(102, 126, 234, 0.1)', medium: 'rgba(102, 126, 234, 0.3)' },
  { name: 'Purple', primary: '#9F7AEA', hover: '#805AD5', active: '#6B46C1', light: 'rgba(159, 122, 234, 0.1)', medium: 'rgba(159, 122, 234, 0.3)' },
];
export { colorOptions };

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