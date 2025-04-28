
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  index?: number;
  className?: string;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  index = 0,
  className = ""
}: FeatureCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`relative backdrop-blur-sm bg-white/90 dark:bg-white/10 p-6 rounded-xl 
        border border-gray-100 dark:border-white/10 shadow-xl hover:shadow-2xl 
        group transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Background glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated border on hover */}
      <div className="absolute inset-0 border border-purple-200/50 dark:border-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {icon && (
          <motion.div 
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-purple-600 dark:text-purple-400 mb-4 text-2xl"
          >
            {icon}
          </motion.div>
        )}
        
        <motion.h3 
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 1, x: 3 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-semibold mb-2 text-gray-800 dark:text-white/90"
        >
          {title}
        </motion.h3>
        
        <p className="text-gray-600 dark:text-gray-300 relative z-10">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
