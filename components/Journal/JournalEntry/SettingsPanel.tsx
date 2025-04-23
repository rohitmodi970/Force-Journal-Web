import React from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalType, ViewMode } from './types';

interface SettingsPanelProps {
  showSettings: boolean;
  viewMode: string;
  journalType: string;
  setJournalType: (type: string) => void;
  setViewMode: (mode: string) => void;
  journalTypes: JournalType[];
  viewModes: ViewMode[];
  styles: any;
  isDarkMode: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showSettings,
  viewMode,
  journalType,
  setJournalType,
  setViewMode,
  journalTypes,
  viewModes,
  styles,
  isDarkMode
}) => {
  return (
    <AnimatePresence>
      {showSettings && viewMode !== 'focus' && (
        <motion.div 
          className="px-6 py-4 border-b transition-all duration-300"
          style={{ backgroundColor: styles.bgCard, borderColor: styles.borderColor }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Journal type selector */}
            <div>
              <h3 
                className="text-sm font-medium mb-3 transition-all duration-300"
                style={{ color: styles.textSecondary }}
              >
                Journal Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {journalTypes.map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setJournalType(type.id)}
                    className="flex flex-col items-start p-3 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ 
                      backgroundColor: journalType === type.id ? styles.primaryLight : isDarkMode ? '#2D3748' : '#F3F4F6',
                      color: journalType === type.id ? styles.primaryColor : styles.textPrimary,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: journalType === type.id ? styles.primaryColor : 'transparent'
                    }}
                  >
                    <div className="flex items-center w-full mb-1">
                      <span className="mr-2" style={{ color: journalType === type.id ? styles.primaryColor : styles.textSecondary }}>
                        {type.icon}
                      </span>
                      <span>{type.name}</span>
                      {journalType === type.id && (
                        <Check size={14} className="ml-auto" style={{ color: styles.primaryColor }} />
                      )}
                    </div>
                    <span 
                      className="text-xs font-normal"
                      style={{ color: styles.textSecondary }}
                    >
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* View mode selector */}
            <div>
              <h3 
                className="text-sm font-medium mb-3 transition-all duration-300"
                style={{ color: styles.textSecondary }}
              >
                View Mode
              </h3>
              <div className="flex flex-col gap-2">
                {viewModes.map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ 
                      backgroundColor: viewMode === mode.id ? styles.primaryLight : isDarkMode ? '#2D3748' : '#F3F4F6',
                      color: viewMode === mode.id ? styles.primaryColor : styles.textPrimary,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: viewMode === mode.id ? styles.primaryColor : 'transparent'
                    }}
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span>{mode.name}</span>
                      <span 
                        className="text-xs font-normal"
                        style={{ color: styles.textSecondary }}
                      >
                        {mode.description}
                      </span>
                    </div>
                    {viewMode === mode.id && (
                      <Check size={16} style={{ color: styles.primaryColor }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;