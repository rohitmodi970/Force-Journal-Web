
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GradientTextProps {
  children: ReactNode;
  from?: string;
  to?: string;
  className?: string;
  animate?: boolean;
}

const GradientText = ({ 
  children, 
  from = "from-purple-600", 
  to = "to-indigo-600", 
  className = "",
  animate = false
}: GradientTextProps) => {
  if (animate) {
    return (
      <motion.span 
        className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent inline-block ${className}`}
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ 
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ 
          duration: 8, 
          ease: "easeInOut", 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;
