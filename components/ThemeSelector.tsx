// components/ThemeSelector.tsx
import { useTheme } from "@/utilities/context/ThemeContext";

export default function ThemeSelector() {
  const { colorOptions, currentTheme, isDarkMode, setCurrentTheme, toggleDarkMode } = useTheme();

  return (
    <div className="bg-bg-secondary p-6 rounded-lg shadow-md">
      <h2 className="text-text-primary text-xl font-semibold mb-4">Theme Settings</h2>
      
      {/* Color Selection */}
      <div className="mb-6">
        <h3 className="text-text-primary text-lg mb-2">Colors</h3>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              onClick={() => setCurrentTheme(color)}
              className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                currentTheme.name === color.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: color.primary }}
              aria-label={`Select ${color.name} theme`}
            />
          ))}
        </div>
      </div>
      
      {/* Dark Mode Toggle */}
      <div>
        <h3 className="text-text-primary text-lg mb-2">Mode</h3>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded-md transition-colors"
          style={{ 
            backgroundColor: isDarkMode ? 'var(--theme-primary)' : 'var(--bg-secondary)',
            color: isDarkMode ? 'white' : 'var(--text-primary)',
            border: isDarkMode ? 'none' : '1px solid var(--text-secondary)'
          }}
        >
          {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
    </div>
  );
}