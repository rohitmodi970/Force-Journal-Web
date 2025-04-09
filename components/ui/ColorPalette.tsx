import React from 'react';
import { Check, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPaletteProps {
  showColorPalette: boolean;
  setShowColorPalette: (show: boolean) => void;
  accentColors: string[];
  selectedAccent: string;
  changeAccentColor: (color: string) => void;
  styles: any;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  showColorPalette,
  setShowColorPalette,
  accentColors,
  selectedAccent,
  changeAccentColor,
  styles
}) => {
  return (
    <>
      <button 
        onClick={() => setShowColorPalette(!showColorPalette)}
        className="p-2 rounded-full transition-all duration-300"
        style={{ 
          backgroundColor: showColorPalette ? styles.primaryLight : 'transparent',
          color: styles.primaryColor 
        }}
        aria-label="Color palette"
      >
        <Palette size={16} />
      </button>
      
      <AnimatePresence>
        {showColorPalette && (
          <motion.div 
            className="absolute right-5 top-14 bg-white rounded-lg shadow-lg p-3 z-10 border"
            style={{ 
              backgroundColor: styles.bgCard,
              borderColor: styles.borderColor,
              boxShadow: styles.shadowHover
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h4 
              className="text-xs font-medium mb-2"
              style={{ color: styles.textSecondary }}
            >
              Theme Color
            </h4>
            <div className="flex flex-wrap gap-2 max-w-xs">
              {accentColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    changeAccentColor(color);
                    setShowColorPalette(false);
                  }}
                  className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ 
                    backgroundColor: color,
                    transform: selectedAccent === color ? 'scale(1.1)' : 'scale(1)',
                    border: selectedAccent === color ? '2px solid white' : 'none',
                    boxShadow: selectedAccent === color ? '0 0 0 2px ' + color : 'none'
                  }}
                  aria-label={`Select ${color} as accent color`}
                >
                  {selectedAccent === color && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ColorPalette;