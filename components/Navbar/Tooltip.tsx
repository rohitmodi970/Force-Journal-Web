"use client"
import React from 'react'
import { motion } from 'framer-motion'

// Interface for Tooltip component props
interface TooltipProps {
    show: boolean;
    label: string;
    hasSubItems?: boolean;
    isDarkMode: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ show, label, hasSubItems, isDarkMode }) => {
    if (!show) return null;
    
    return (
        <motion.div
            className={`absolute left-full ml-3 px-2 py-1 text-xs rounded-md whitespace-nowrap z-50 shadow-lg ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-gray-800 text-white"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
        >
            {label}
            {hasSubItems && (
                <span className="ml-1 text-xs">▶</span>
            )}
        </motion.div>
    );
};

export default Tooltip
