import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import TypingText from './ui/TypingText';

interface PreAuthLandingProps {
  onComplete: () => void;
}

const PreAuthLanding = ({ onComplete }: PreAuthLandingProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBeginClick = () => {
    setIsLoading(true);
    
    // Simulate loading for 3 seconds before proceeding
    setTimeout(() => {
      // Call the onComplete callback to move to the next step
      if (onComplete) onComplete();
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {!isLoading ? (
        <div className="flex justify-center items-center min-h-screen flex-col gap-3 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center text-4xl font-bold leading-tight relative">
            <span className="text-7xl relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">F</span>
            <span className="relative z-10">O</span>
            <span className="relative z-10">R</span>
            <span className="relative z-10">C</span>
            <span className="relative z-10">E</span>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20 blur-xl rounded-full -z-10"></div>
          </div>
          
          <div className="leading-relaxed mt-2">
            <span className="font-medium text-2xl">meet your </span>
            <TypingText
              texts={["like minded community", "soul", "motivator", "growth catalyst"]}
              typingSpeed={100}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="_"
              mainClassName="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              cursorClassName="text-blue-500 animate-pulse"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-700 font-light leading-snug hover:font-normal transition-all max-w-xs text-center">
            The First AI Journal App & your Personal Companion on the journey to self-discovery
          </div>
          
          <button
            onClick={handleBeginClick}
            className="mt-8 px-8 py-4 bg-black text-white rounded-full flex items-center hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg group"
          >
            <span className="mr-2">Begin Your Journey</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="absolute bottom-10 w-full flex justify-center">
            <div className="animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          className="flex justify-center items-center min-h-screen flex-col bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white opacity-20"
                style={{
                  width: Math.random() * 6 + 2 + 'px',
                  height: Math.random() * 6 + 2 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: Math.random() * 8 + 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <motion.div
            className="flex flex-col items-center z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-9xl font-bold text-center relative"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              F
              <motion.div
                className="absolute inset-0 blur-xl bg-blue-500 opacity-30"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
            </motion.div>
            
            <div className="mt-6 h-2 w-36 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              ></motion.div>
            </div>
            
            <div className="mt-3 text-sm text-gray-300 flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing your experience...
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PreAuthLanding;