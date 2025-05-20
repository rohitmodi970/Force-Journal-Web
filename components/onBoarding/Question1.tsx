"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext';
import { FormData } from './OnboardingForm';

interface Question1Props {
  value: string;
  handleInputChange: (value: string) => void;
  goToNextSection: () => void;
}

const Question1: React.FC<Question1Props> = ({
  value,
  handleInputChange,
  goToNextSection
}) => {
  const { currentTheme, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const canProceed = value.trim().length > 0;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        What are you hoping to gain from Force?
      </h2>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        This helps us personalize your experience and provide the right resources for you.
      </p>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="I want to improve my productivity, find more balance in life..."
          className={`w-full p-4 rounded-lg border transition duration-200 focus:ring-2 focus:outline-none min-h-32 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
          style={{
            borderColor: isFocused ? currentTheme.primary : isDarkMode ? '#4B5563' : '#D1D5DB',
            boxShadow: isFocused ? `0 0 0 3px ${currentTheme.light}` : 'none'
          }}
        />
        
        {/* Word count indicator */}
        <div 
          className={`absolute bottom-3 right-3 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {value.length > 0 ? `${value.length} characters` : ''}
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={goToNextSection}
          disabled={!canProceed}
          className="flex items-center px-6 py-2 rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: canProceed ? currentTheme.primary : isDarkMode ? '#4B5563' : '#9CA3AF',
            color: 'white',
            opacity: canProceed ? 1 : 0.6,
            cursor: canProceed ? 'pointer' : 'not-allowed'
          }}
        >
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default Question1;