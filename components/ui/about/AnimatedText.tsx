
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
  delay?: number;
  highlight?: boolean;
  highlightColor?: string;
  highlightWords?: string[];
}

const AnimatedText = ({ 
  text, 
  className = "", 
  once = false, 
  delay = 0,
  highlight = false,
  highlightColor = "bg-gradient-to-r from-purple-600 to-indigo-600",
  highlightWords = []
}: AnimatedTextProps) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * 0.1 },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={className}
    >
      {words.map((word, index) => {
        const shouldHighlight = highlight && 
          (highlightWords.length === 0 || highlightWords.includes(word));
        
        return (
          <motion.span
            variants={child}
            key={index}
            className={`inline-block mr-1 ${shouldHighlight ? `${highlightColor} bg-clip-text text-transparent` : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
};

export default AnimatedText;
