"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip from './Tooltip'
import ActiveIndicator from './ActiveIndicator'
import Link from 'next/link'

interface DockItemProps {
    icon: React.ReactNode
    label: string
    isActive: boolean
    onClick: () => void
    currentTheme: {
        primary: string
    }
    isDarkMode: boolean
    hasSubItems?: boolean
}

const DockItem: React.FC<DockItemProps> = ({ 
    icon, 
    label, 
    isActive, 
    onClick, 
    currentTheme, 
    isDarkMode,
    hasSubItems 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Dynamic background for active items
    const bgColor = isDarkMode 
        ? isActive ? "rgba(255, 255, 255, 0.1)" : "transparent"
        : isActive ? "rgba(0, 0, 0, 0.06)" : "transparent";
    
    // Dynamic text color
    const textColor = isActive 
        ? currentTheme.primary 
        : (isDarkMode ? "#f3f4f6" : "#111827");
    
    return (
        <motion.div
            onClick={onClick}
            className="flex items-center justify-center rounded-full transition-all w-12 h-12 relative"
            style={{
                color: textColor,
                backgroundColor: bgColor
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            role="button"
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            {icon}
            
            {/* Tooltip component */}
            <AnimatePresence>
                {isHovered && (
                    <Tooltip 
                        show={isHovered} 
                        label={label} 
                        hasSubItems={hasSubItems} 
                        isDarkMode={isDarkMode} 
                    />
                )}
            </AnimatePresence>
            
            {/* Active indicator component */}
            <ActiveIndicator isActive={isActive} color={currentTheme.primary} />
        </motion.div>
    );
};

export default DockItem
