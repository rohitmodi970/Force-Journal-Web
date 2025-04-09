import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/utilities/context/ThemeContext';
interface ProgressProps {
  value?: number;
  className?: string;
  color?: string;
  useThemeColor?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value = 0, 
  className = '', 
  color = '', 
  useThemeColor = true 
}) => {
  const { currentTheme } = useTheme();
  
  // Use theme color if useThemeColor is true and no specific color is provided
  const barColor = useThemeColor && !color 
    ? `bg-[${currentTheme.primary}]` 
    : color || 'bg-blue-600';

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div
        className={`${barColor} h-full transition-all duration-300`}
        style={{ width: `${value}%`, height: '8px' }}
      />
    </div>
  );
};