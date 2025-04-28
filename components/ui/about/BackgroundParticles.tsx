
import React from 'react';
import { motion } from 'framer-motion';

interface ParticleProps {
  count?: number;
  color?: string;
  variant?: 'default' | 'subtle' | 'intense';
  className?: string;
}

const BackgroundParticles: React.FC<ParticleProps> = ({ 
  count = 20, 
  color = "purple",
  variant = "default",
  className = "" 
}) => {
  // Generate particles based on count
  const particles = Array.from({ length: count }, (_, index) => index);
  
  // Define color classes
  const colorClasses = {
    purple: {
      default: 'bg-gradient-to-r from-purple-200/20 to-indigo-200/20 dark:from-purple-900/40 dark:to-indigo-900/20',
      subtle: 'bg-gradient-to-r from-purple-100/10 to-indigo-100/10 dark:from-purple-900/20 dark:to-indigo-900/10',
      intense: 'bg-gradient-to-r from-purple-300/30 to-indigo-300/30 dark:from-purple-700/50 dark:to-indigo-700/30'
    },
    blue: {
      default: 'bg-gradient-to-r from-blue-200/20 to-indigo-200/20 dark:from-blue-900/40 dark:to-indigo-900/20',
      subtle: 'bg-gradient-to-r from-blue-100/10 to-indigo-100/10 dark:from-blue-900/20 dark:to-indigo-900/10',
      intense: 'bg-gradient-to-r from-blue-300/30 to-indigo-300/30 dark:from-blue-700/50 dark:to-indigo-700/30'
    }
  };
  
  // Select color based on prop
  const colorClass = colorClasses[color === 'blue' ? 'blue' : 'purple'][variant];

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
      {particles.map((index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.6 + 0.5,
          }}
          animate={{
            opacity: Math.random() * 0.3 + 0.1,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.4 + 0.3,
          }}
          transition={{
            duration: Math.random() * 16 + 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className={`absolute w-40 h-40 md:w-64 md:h-64 rounded-full ${colorClass} blur-3xl`}
        />
      ))}
    </div>
  );
};

export default BackgroundParticles;
