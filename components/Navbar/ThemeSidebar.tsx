'use client';

import React, { useState } from 'react';
import { useTheme, ColorOption } from'@/utilities/context/ThemeContext';
import { Settings,Palette , X, Moon, Sun, RefreshCw } from 'lucide-react';

// Define font options
const fontOptions = [
  { name: 'Inter', value: 'inter' },
  { name: 'Roboto', value: 'roboto' },
  { name: 'Poppins', value: 'poppins' },
  { name: 'Open Sans', value: 'open-sans' },
  { name: 'Montserrat', value: 'montserrat' },
];

const ThemeSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'elements'>('theme');
  const {
    colorOptions,
    currentTheme,
    isDarkMode,
    setCurrentTheme,
    toggleDarkMode,
    resetToDefaults,
    updateElementColor,
    elementColors,
    currentFont,
    setFont,
  } = useTheme();

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleColorSelect = (color: ColorOption) => {
    setCurrentTheme(color);
  };

  const handleElementColorChange = (element: keyof typeof elementColors, color: string) => {
    updateElementColor(element, color);
  };

  return (
    <>
      {/* Settings Toggle Button */}
    <button
      onClick={toggleSidebar}
      className="fixed top-[20vh] right-4 p-2.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 z-30 group"
      aria-label="Toggle Theme Settings"
      style={{ 
        backgroundColor: isDarkMode ? 'var(--bg-secondary)' : 'white',
        color: currentTheme.primary 
      }}
    >
      <Palette size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
    </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Theme Settings</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-3 px-2 text-sm font-medium ${
              activeTab === 'theme'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Main Theme
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex-1 py-3 px-2 text-sm font-medium ${
              activeTab === 'elements'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            UI Elements
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'theme' && (
            <>
              {/* Mode Toggles */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Mode</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => isDarkMode && toggleDarkMode()}
                    className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
                      !isDarkMode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun size={16} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => !isDarkMode && toggleDarkMode()}
                    className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon size={16} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Color Theme Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                  Theme Color
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {colorOptions.map((color: ColorOption) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        currentTheme.name === color.name
                          ? 'border-gray-800 dark:border-white'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.primary }}
                      aria-label={`${color.name} theme`}
                      title={color.name}
                    >
                      {currentTheme.name === color.name && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                  Font Family
                </h3>
                <select
                  value={currentFont}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => resetToDefaults()}
                className="flex items-center justify-center w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw size={16} className="mr-2" />
                Reset to Defaults
              </button>
            </>
          )}

          {activeTab === 'elements' && (
            <>
              {/* Element Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                  UI Elements
                </h3>
                
                {/* Button Colors */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Button Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color: ColorOption) => (
                      <button
                        key={`button-${color.name}`}
                        onClick={() => handleElementColorChange('button', color.primary)}
                        className={`w-10 h-10 rounded-full border ${
                          elementColors.button === color.primary
                            ? 'border-2 border-gray-800 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.primary }}
                        aria-label={`${color.name} for buttons`}
                      />
                    ))}
                  </div>
                </div>

                {/* Background Color */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Background Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color: ColorOption) => (
                      <button
                        key={`bg-${color.name}`}
                        onClick={() => handleElementColorChange('background', color.light)}
                        className={`w-10 h-10 rounded-full border ${
                          elementColors.background === color.light
                            ? 'border-2 border-gray-800 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.light }}
                        aria-label={`${color.name} light for background`}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Text Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color: ColorOption) => (
                      <button
                        key={`text-${color.name}`}
                        onClick={() => handleElementColorChange('text', color.primary)}
                        className={`w-10 h-10 rounded-full border ${
                          elementColors.text === color.primary
                            ? 'border-2 border-gray-800 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.primary }}
                        aria-label={`${color.name} for text`}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color: ColorOption) => (
                      <button
                        key={`accent-${color.name}`}
                        onClick={() => handleElementColorChange('accent', color.medium)}
                        className={`w-10 h-10 rounded-full border ${
                          elementColors.accent === color.medium
                            ? 'border-2 border-gray-800 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.medium }}
                        aria-label={`${color.name} medium for accent`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Reset Element Colors */}
                <button
                  onClick={() => resetToDefaults('elements')}
                  className="flex items-center justify-center w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset UI Elements
                </button>
              </div>
            </>
          )}
        </div>

        {/* Preview Section */}
        <div 
          className="p-4 border-t border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: elementColors.background || 'var(--bg-secondary)' }}
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Preview</h3>
          <div className="flex flex-col space-y-2">
            <button 
              className="px-4 py-2 rounded-md text-white" 
              style={{ backgroundColor: elementColors.button || currentTheme.primary }}
            >
              Button
            </button>
            <p 
              className="text-sm" 
              style={{ color: elementColors.text || 'var(--text-primary)' }}
            >
              Sample text with current settings
            </p>
            <div 
              className="h-4 rounded" 
              style={{ backgroundColor: elementColors.accent || currentTheme.medium }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeSidebar;