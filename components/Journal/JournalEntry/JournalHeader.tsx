import React from 'react';
import { 
  Calendar, 
  Moon, 
  Sun, 
  ChevronDown, 
  Settings,
  ArrowLeft,
  X,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewMode } from './types';
import MoodSelector from './MoodSelector';
import ColorPalette from '../../ui/ColorPalette';
import { useTheme } from '@/utilities/context/ThemeContext';

interface JournalHeaderProps {
  title: string;
  date: string;
  setDate: (date: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  isHeaderCollapsed: boolean;
  setIsHeaderCollapsed: (collapsed: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showMood: boolean;
  setShowMood: (show: boolean) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
  moods: any[];
  journalType: string;
  journalTypes: any[];
  showColorPalette: boolean;
  setShowColorPalette: (show: boolean) => void;
  accentColors: string[];
  selectedAccent: string;
  changeAccentColor: (color: string) => void;
  revealAnimation: boolean;
  wordCount: number;
  lastSaved: Date | null;
  isUnsaved: boolean;
  viewModes: ViewMode[];
  styles: any;
  getFormattedTime: (date: Date | null) => string;
}

const JournalHeader: React.FC<JournalHeaderProps> = ({
  title,
  date,
  setDate,
  viewMode,
  setViewMode,
  isHeaderCollapsed,
  setIsHeaderCollapsed,
  showSettings,
  setShowSettings,
  showMood,
  setShowMood,
  selectedMood,
  setSelectedMood,
  moods,
  journalType,
  journalTypes,
  showColorPalette,
  setShowColorPalette,
  accentColors,
  selectedAccent,
  changeAccentColor,
  revealAnimation,
  wordCount,
  lastSaved,
  isUnsaved,
  viewModes,
  styles,
  getFormattedTime
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Animation variants
  const headerVariants = {
    expanded: { height: 'auto', opacity: 1 },
    collapsed: { height: '60px', opacity: 1 }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="relative px-6 py-4 border-b flex flex-col transition-all duration-300"
      style={{ 
        backgroundColor: revealAnimation 
          ? styles.primaryColor 
          : styles.bgCard,
        borderColor: styles.borderColor,
        color: revealAnimation 
          ? '#FFFFFF' 
          : styles.textPrimary
      }}
      variants={headerVariants}
      animate={isHeaderCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3 }}
    >
      {/* Top header bar with main controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {viewMode === 'focus' ? (
            <button 
              onClick={() => setViewMode('writing')}
              className="mr-3 rounded-full p-1 transition-all duration-300"
              style={{ backgroundColor: styles.primaryLight }}
            >
              <ArrowLeft size={18} style={{ color: styles.primaryColor }} />
            </button>
          ) : null}
          
          <motion.h2 
            className="text-xl font-semibold transition-all duration-300"
            style={{ 
              color: revealAnimation 
                ? '#FFFFFF' 
                : styles.textPrimary 
            }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {revealAnimation ? "Journal" : (viewMode === 'focus' ? "" : "My Journal")}
          </motion.h2>
          
          {!isHeaderCollapsed && !revealAnimation && viewMode !== 'focus' && (
            <div 
              className="ml-4 flex items-center text-xs rounded-full px-3 py-1 transition-all duration-300"
              style={{ 
                backgroundColor: styles.primaryLight,
                color: styles.primaryColor,
              }}
            >
              <span className="font-medium">{journalTypes.find(t => t.id === journalType)?.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Date selector - hidden in focus mode */}
          {viewMode !== 'focus' && (
            <div className="flex items-center space-x-2">
              <Calendar size={16} style={{ color: styles.primaryColor }} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md focus:outline-none focus:ring-1 px-2 py-1 text-sm transition-all duration-300"
                style={{ 
                  backgroundColor: styles.bgInput,
                  color: styles.textPrimary,
                  borderColor: styles.borderColor,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                aria-label="Select date"
              />
            </div>
          )}
          
          {/* Header controls - different for each view mode */}
          {viewMode !== 'focus' ? (
            <>
              {/* Mood tracking button */}
              <MoodSelector 
                showMood={showMood}
                setShowMood={setShowMood}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                moods={moods}
                styles={styles}
              />
              
              {/* Theme toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: 'transparent' }}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? 
                  <Sun size={16} style={{ color: styles.primaryColor }} /> : 
                  <Moon size={16} style={{ color: styles.primaryColor }} />
                }
              </button>
              
              {/* Palette button */}
              <ColorPalette 
                showColorPalette={showColorPalette}
                setShowColorPalette={setShowColorPalette}
                accentColors={accentColors}
                selectedAccent={selectedAccent}
                changeAccentColor={changeAccentColor}
                styles={styles}
              />
              
              {/* Collapse/expand header */}
              <button 
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="p-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: 'transparent',
                  color: styles.primaryColor,
                  transform: isHeaderCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
                aria-label={isHeaderCollapsed ? "Expand header" : "Collapse header"}
              >
                <ChevronDown size={16} />
              </button>
              
              {/* Settings button */}
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: showSettings ? styles.primaryLight : 'transparent',
                  color: styles.primaryColor 
                }}
                aria-label="Journal settings"
              >
                <Settings size={16} />
              </button>
            </>
          ) : (
            <>
              {/* Focus mode only shows minimal controls */}
              <div className="flex items-center space-x-2 text-xs font-medium py-1 px-3 rounded-full" style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}>
                <span>{wordCount} words</span>
              </div>
              
              <button 
                onClick={() => setViewMode('writing')}
                className="p-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: 'transparent' }}
                aria-label="Exit focus mode"
              >
                <X size={16} style={{ color: styles.primaryColor }} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom section of header - only visible when not collapsed */}
      {!isHeaderCollapsed && !revealAnimation && viewMode !== 'focus' && (
        <motion.div 
          className="mt-3 flex justify-between items-center"
          variants={inputVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center space-x-2 text-xs" style={{ color: styles.textSecondary }}>
            {lastSaved && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>Last saved: {getFormattedTime(lastSaved)}</span>
              </div>
            )}
            {isUnsaved && (
              <div className="ml-3 px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: '#F59E0B' }}>
                Unsaved
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {viewModes.map(mode => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className="flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ 
                  backgroundColor: viewMode === mode.id ? styles.primaryLight : 'transparent',
                  color: viewMode === mode.id ? styles.primaryColor : styles.textSecondary,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: viewMode === mode.id ? styles.primaryColor : 'transparent'
                }}
              >
                {mode.id === 'writing' && (
                  <span className="mr-1">✏️</span>
                )}
                {mode.id === 'focus' && (
                  <span className="mr-1">👁️‍🗨️</span>
                )}
                {mode.id === 'preview' && (
                  <span className="mr-1">👁️</span>
                )}
                {mode.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JournalHeader;