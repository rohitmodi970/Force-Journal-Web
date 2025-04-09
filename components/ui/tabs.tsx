import React, { ReactNode, createContext, useState, useContext } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/utilities/context/ThemeContext';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  currentTheme?: any; // From ThemeContext
}

const TabsContext = createContext<TabsContextType>({
  activeTab: '',
  setActiveTab: () => {},
});

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const { currentTheme } = useTheme();

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, currentTheme }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className, children }) => (
  <div className={clsx('flex space-x-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800', className)}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const { activeTab, setActiveTab, currentTheme } = useContext(TabsContext);
  const isActive = activeTab === value;

  // Apply theme color to active tab
  const activeStyles = isActive 
    ? `bg-white text-black shadow dark:bg-gray-900 dark:text-white ${
        isActive ? 'border-b-2' : ''
      }`
    : `text-gray-500 hover:text-black dark:hover:text-white`;

  // Dynamic style for the active indicator using theme color
  const activeIndicatorStyle = isActive
    ? { borderBottomColor: currentTheme?.primary || '#3B82F6' }
    : {};

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={clsx(
        'flex-1 text-sm px-4 py-2 rounded-lg font-medium transition-all',
        activeStyles,
        className
      )}
      style={activeIndicatorStyle}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div className={className}>{children}</div> : null;
};

// ThemedButton component that uses the theme context
interface ButtonProps {
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  className,
  type = 'button',
  size = 'md'
}) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const baseStyles = clsx(
    'inline-flex items-center justify-center font-medium rounded-xl transition',
    sizeClasses[size]
  );
  
  // Create variant styles using theme colors
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return `bg-[${currentTheme.primary}] text-white hover:bg-[${currentTheme.hover}] active:bg-[${currentTheme.active}]`;
      case 'outline':
        return `border border-[${currentTheme.primary}] text-[${currentTheme.primary}] bg-transparent hover:bg-[${currentTheme.light}]`;
      case 'ghost':
        return `text-[${currentTheme.primary}] hover:bg-[${currentTheme.light}]`;
      case 'link':
        return `text-[${currentTheme.primary}] underline hover:text-[${currentTheme.hover}] p-0`;
      default:
        return `bg-[${currentTheme.primary}] text-white hover:bg-[${currentTheme.hover}]`;
    }
  };

  const variantClasses = getVariantClasses();
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Use inline style for dynamic theme colors
  const getButtonStyle = () => {
    if (variant === 'default') {
      return {
        backgroundColor: disabled ? '' : currentTheme.primary,
        color: 'white',
        ':hover': { backgroundColor: disabled ? '' : currentTheme.hover }
      };
    } else if (variant === 'outline') {
      return {
        borderColor: currentTheme.primary,
        color: isDarkMode ? 'white' : currentTheme.primary
      };
    } else if (variant === 'ghost' || variant === 'link') {
      return {
        color: currentTheme.primary
      };
    }
    return {};
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseStyles, disabledClasses, className)}
      style={getButtonStyle()}
    >
      {children}
    </button>
  );
};