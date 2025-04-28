import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mood } from '../types';

interface MoodSelectorProps {
  showMood: boolean;
  setShowMood: (show: boolean) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
  moods: Mood[];
  styles: any;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  showMood,
  setShowMood,
  selectedMood,
  setSelectedMood,
  moods,
  styles
}) => {
  return (
    <>
      <button 
        onClick={() => setShowMood(!showMood)}
        className="p-2 rounded-full transition-all duration-300"
        style={{ 
          backgroundColor: selectedMood ? styles.primaryLight : 'transparent',
          color: styles.primaryColor 
        }}
        aria-label="Set mood"
      >
        {selectedMood ? (
          <span className="text-lg">{moods.find(m => m.id === selectedMood)?.emoji}</span>
        ) : (
          <MessageSquare size={16} style={{ color: styles.primaryColor }} />
        )}
      </button>
      
      <AnimatePresence>
        {showMood && (
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
              How are you feeling?
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setSelectedMood(mood.id);
                    setShowMood(false);
                  }}
                  className="flex flex-col items-center p-2 rounded-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: selectedMood === mood.id ? styles.primaryLight : 'transparent',
                    border: `1px solid ${selectedMood === mood.id ? styles.primaryColor : 'transparent'}`
                  }}
                >
                  <span className="text-xl mb-1">{mood.emoji}</span>
                  <span 
                    className="text-xs"
                    style={{ color: styles.textPrimary }}
                  >
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MoodSelector;