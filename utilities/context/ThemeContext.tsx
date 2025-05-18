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
  elementColors?: {
    button?: string;
    background?: string;
    text?: string;
    accent?: string;
  };
  font?: string;
}

interface ElementColors {
  button: string;
  background: string;
  text: string;
  accent: string; 
}

interface ThemeContextType {
  colorOptions: ColorOption[];
  currentTheme: ColorOption;
  isDarkMode: boolean;
  elementColors: ElementColors;
  currentFont: string;
  setCurrentTheme: (color: ColorOption) => void;
  toggleDarkMode: () => void;
  resetToDefaults: (elementsOnly?: 'elements') => void;
  updateElementColor: (element: keyof ElementColors, color: string) => void;
  setFont: (font: string) => void;
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
  { name: 'Pink', primary: '#ED64A6', hover: '#D53F8C', active: '#B83280', light: 'rgba(237, 100, 166, 0.1)', medium: 'rgba(237, 100, 166, 0.3)' },
  { name: 'Teal', primary: '#38B2AC', hover: '#319795', active: '#2C7A7B', light: 'rgba(56, 178, 172, 0.1)', medium: 'rgba(56, 178, 172, 0.3)' },
  { name: 'Cyan', primary: '#0BC5EA', hover: '#00B5D8', active: '#00A3C4', light: 'rgba(11, 197, 234, 0.1)', medium: 'rgba(11, 197, 234, 0.3)' },
];
export { colorOptions };

// Default values
const defaultTheme = colorOptions[4]; // Blue
const defaultFont = 'inter';
const defaultElementColors: ElementColors = {
  button: defaultTheme.primary,
  background: defaultTheme.light,
  text: '#111827', // Default text color (will be overridden by dark mode if needed)
  accent: defaultTheme.medium,
};

// Create context with initial default value
export const ThemeContext = createContext<ThemeContextType>({
  colorOptions,
  currentTheme: defaultTheme,
  isDarkMode: false,
  elementColors: defaultElementColors,
  currentFont: defaultFont,
  setCurrentTheme: () => {},
  toggleDarkMode: () => {},
  resetToDefaults: () => {},
  updateElementColor: () => {},
  setFont: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ColorOption>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [elementColors, setElementColors] = useState<ElementColors>({...defaultElementColors});
  const [currentFont, setCurrentFont] = useState<string>(defaultFont);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Apply theme to document
  const applyTheme = (
    theme: ColorOption,
    darkMode: boolean,
    elements: ElementColors,
    font: string
  ) => {
    if (typeof window === 'undefined' || !theme) return;
    
    const root = document.documentElement;

    // Set theme color variables
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-hover', theme.hover);
    root.style.setProperty('--theme-primary-active', theme.active);
    root.style.setProperty('--theme-primary-light', theme.light);
    root.style.setProperty('--theme-primary-medium', theme.medium);
    
    // Set element-specific colors
    root.style.setProperty('--element-button', elements.button);
    root.style.setProperty('--element-background', elements.background);
    root.style.setProperty('--element-text', elements.text);
    root.style.setProperty('--element-accent', elements.accent);

    // Set font family
    root.style.setProperty('--font-family', font);
    document.body.className = document.body.className.replace(/font-\w+/g, `font-${font}`);

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

    // Update text color based on dark mode if not custom set
    const textColor = elements.text === defaultElementColors.text 
      ? (darkMode ? '#F9FAFB' : '#111827')
      : elements.text;
    root.style.setProperty('--element-text', textColor);

    // Save preferences
    localStorage.setItem('appTheme', JSON.stringify({ 
      colorName: theme.name, 
      darkMode,
      elementColors: elements,
      font
    }));
  };

  // Load saved theme from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadTheme = () => {
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme) {
        try {
          const { colorName, darkMode, elementColors: savedElements, font } = JSON.parse(savedTheme) as SavedTheme;
          const foundTheme = colorOptions.find(c => c.name === colorName) || defaultTheme;
          
          setCurrentTheme(foundTheme);
          setIsDarkMode(darkMode);
          
          // Load saved element colors or use defaults
          const loadedElements = {
            button: savedElements?.button || foundTheme.primary,
            background: savedElements?.background || foundTheme.light,
            text: savedElements?.text || (darkMode ? '#F9FAFB' : '#111827'),
            accent: savedElements?.accent || foundTheme.medium
          };
          setElementColors(loadedElements);
          
          // Load saved font or use default
          const loadedFont = font || defaultFont;
          setCurrentFont(loadedFont);
          
          applyTheme(foundTheme, darkMode, loadedElements, loadedFont);
        } catch (error) {
          console.error("Error loading theme from localStorage:", error);
          applyTheme(defaultTheme, false, defaultElementColors, defaultFont);
        }
      } else {
        applyTheme(defaultTheme, false, defaultElementColors, defaultFont);
      }
      setIsInitialized(true);
    };
    
    loadTheme();
  }, []);

  // Apply theme whenever theme or dark mode changes
  useEffect(() => {
    if (isInitialized) {
      applyTheme(currentTheme, isDarkMode, elementColors, currentFont);
    }
  }, [currentTheme, isDarkMode, elementColors, currentFont, isInitialized]);

  const handleColorChange = (color: ColorOption) => {
    setCurrentTheme(color);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateElementColor = (element: keyof ElementColors, color: string) => {
    setElementColors(prev => ({
      ...prev,
      [element]: color
    }));
  };

  const setFont = (font: string) => {
    setCurrentFont(font);
  };

  const resetToDefaults = (elementsOnly?: 'elements') => {
    if (elementsOnly === 'elements') {
      // Reset only UI element colors to current theme defaults
      const resetElements = {
        button: currentTheme.primary,
        background: currentTheme.light,
        text: isDarkMode ? '#F9FAFB' : '#111827',
        accent: currentTheme.medium
      };
      setElementColors(resetElements);
    } else {
      // Reset everything
      setCurrentTheme(defaultTheme);
      setIsDarkMode(false);
      setElementColors({...defaultElementColors});
      setCurrentFont(defaultFont);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        colorOptions,
        currentTheme,
        isDarkMode,
        elementColors,
        currentFont,
        setCurrentTheme: handleColorChange,
        toggleDarkMode,
        resetToDefaults,
        updateElementColor,
        setFont
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};