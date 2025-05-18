"use client"
import React from 'react'
import { motion } from 'framer-motion'

// Active indicator component
interface ActiveIndicatorProps {
    isActive: boolean;
    color: string;
}

const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ isActive, color }) => {
    if (!isActive) return null;
    
    return (
        <motion.div
            className="absolute right-0 mr-[-4px] w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            layoutId="activeIndicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    );
};

export default ActiveIndicator
