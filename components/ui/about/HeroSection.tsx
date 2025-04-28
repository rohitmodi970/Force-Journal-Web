"use client"
import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useState } from "react";
const HeroSection = () => {
  
  const [mode, setMode] = useState("")
  const { currentTheme, isDarkMode } = useTheme();
  return (
    <section className={`relative min-h-[80vh] md:min-h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden ${
      mode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black' 
        : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-white'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className={`backdrop-blur-sm px-6 py-3 rounded-full ${
          mode === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/80 border-purple-100'
        } border mb-8 shadow-lg shadow-purple-100/10 hover:shadow-xl hover:shadow-purple-200/20 transition-all duration-300`}
      >
        <span className="text-purple-600 text-lg font-semibold tracking-wide">Elevate your consciousness</span>
      </motion.div>
      
      {/* Rest of the component remains the same */}
      
      <div className="relative z-10 flex flex-col items-center">
        <AnimatedText
          text="About Force"
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent max-w-4xl mb-4 drop-shadow-lg"
          highlight
        />
        <AnimatedText
          text="Reimagining personal growth through AI-driven analysis of your thoughts and experiences."
          className={`text-xl md:text-2xl font-medium ${
            mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          } mb-10 max-w-3xl leading-relaxed`}
          delay={4}
        />

        {/* Buttons section */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-4"
        >
          <motion.a
            href="#vision"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white drop-shadow-lg font-semibold tracking-wide hover:shadow-xl hover:shadow-purple-500/30 transform transition focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Our Vision
          </motion.a>
          <motion.a
            href="#approach"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-block px-8 py-4 rounded-lg border ${
              mode === 'dark' ? 'border-purple-700 bg-gray-900 text-white hover:bg-purple-800/40' : 'border-purple-200 bg-white/90 text-gray-900 hover:bg-purple-50'
            } font-semibold shadow hover:shadow-lg transition`}
          >
            Our Approach
          </motion.a>
        </motion.div>
      </div>

      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {Array.from({ length: 24 }).map((_, index) => (
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
            className={`absolute w-40 h-40 md:w-64 md:h-64 rounded-full ${
              mode === 'dark' 
                ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/20' 
                : 'bg-gradient-to-r from-purple-200/20 to-indigo-200/20'
            } blur-3xl`}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-0">
        <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${
          mode === 'dark' ? 'from-purple-900/10 to-transparent' : 'from-purple-100/30 to-transparent'
        }`} />
        <div className={`absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t ${
          mode === 'dark' ? 'from-indigo-900/10 to-transparent' : 'from-indigo-100/30 to-transparent'
        }`} />
      </div>
    </section>
  );
};

export default HeroSection;
