import React from 'react';
import { motion } from 'framer-motion';
import TypingText from './ui/TypingText';
import { useRouter } from 'next/navigation';
interface LandingProps {
  goToNextSection: () => void;
}

const Landing: React.FC<LandingProps> = () => {
  const router = useRouter();
  const handleNext = () => {
    router.push('/login');
  }
  return (
    <motion.div 
      className="flex justify-center items-center min-h-screen flex-col gap-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
        AI Journal App to gain control over your thoughts and what you experience on a daily basis.
      </div>
      <motion.button
        onClick={handleNext}
        className="mt-8 px-8 py-4 bg-black text-white rounded-full flex items-center hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="mr-2">Begin Your Journey</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>
      
      <div className="absolute bottom-10 w-full flex justify-center">
        <div className="animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default Landing;