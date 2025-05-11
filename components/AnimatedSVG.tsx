import React from 'react';
import { cn } from "@/lib/utils";
import { useTheme } from '@/utilities/context/ThemeContext';

interface AnimatedSVGProps {
  type: 'journal' | 'writing' | 'thinking' | 'celebration' | 'morning' | 'afternoon' | 'evening';
  className?: string;
}

const AnimatedSVG: React.FC<AnimatedSVGProps> = ({ type, className }) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  // Get theme colors from context
  const primaryColor = currentTheme.primary;
  const primaryLight = currentTheme.light;
  const primaryMedium = currentTheme.medium;
  
  // Time of day colors - could be adapted to use theme colors
  const journalYellow = "#ECC94B";
  const journalOrange = "#ED8936";
  const journalPurple = "#9F7AEA";
  
  // SVG illustrations with animations
  const renderSVG = () => {
    switch (type) {
      case 'journal':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" 
            className={cn("animate-float", className)}>
            <path d="M30 20H90C93.3137 20 96 22.6863 96 26V94C96 97.3137 93.3137 100 90 100H30C26.6863 100 24 97.3137 24 94V26C24 22.6863 26.6863 20 30 20Z" fill={primaryLight} />
            <path d="M40 35H80" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M40 50H70" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M40 65H75" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M40 80H60" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="85" cy="80" r="8" fill={primaryColor} className="animate-pulse-gentle" />
            <path d="M24 30C24 28.8954 24.8954 28 26 28C27.1046 28 28 28.8954 28 30V94C28 97.3137 25.3137 100 22 100V100C18.6863 100 16 97.3137 16 94V38C16 33.5817 19.5817 30 24 30V30Z" fill={primaryColor} fillOpacity="0.2" className="animate-pulse-gentle" style={{animationDelay: "0.5s"}} />
          </svg>
        );
      case 'writing':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-float", className)}>
            <path d="M35 35L85 35C87.7614 35 90 37.2386 90 40V80C90 82.7614 87.7614 85 85 85H35C32.2386 85 30 82.7614 30 80V40C30 37.2386 32.2386 35 35 35Z" fill={primaryLight} />
            <path className="animate-write" d="M90 25L70 45M90 25L90 35L80 35M90 25L100 25" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M45 50H75" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M45 60H65" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M45 70H70" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="95" r="6" fill={primaryColor} fillOpacity="0.3" className="animate-pulse-gentle" />
          </svg>
        );
      case 'thinking':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-float", className)}>
            <circle cx="60" cy="60" r="25" fill={primaryLight} />
            <path d="M50 60C50 60 55 55 60 55C65 55 70 60 70 60" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="45" cy="45" r="5" fill={primaryColor} className="animate-pulse-gentle" />
            <circle cx="75" cy="45" r="5" fill={primaryColor} className="animate-pulse-gentle" />
            <path d="M35 30C35 30 42 40 60 40C78 40 85 30 85 30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" />
            <path d="M60 75C60 75 45 80 40 90C39 95 45 100 60 98C75 100 81 95 80 90C75 80 60 75 60 75Z" fill={primaryLight} stroke={primaryColor} strokeWidth="1" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDuration: "8s"}} />
          </svg>
        );
      case 'celebration':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-float", className)}>
            <path d="M60 30V50" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" className="animate-pulse-gentle" />
            <path d="M75 35L70 55" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" className="animate-pulse-gentle" />
            <path d="M45 35L50 55" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" className="animate-pulse-gentle" />
            <circle cx="60" cy="70" r="20" fill={primaryLight} />
            <path d="M50 70C50 70 55 75 60 75C65 75 70 70 70 70" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="65" r="2.5" fill={primaryColor} />
            <circle cx="70" cy="65" r="2.5" fill={primaryColor} />
            <circle cx="30" cy="40" r="5" fill={primaryColor} fillOpacity="0.3" className="animate-pulse-gentle" style={{animationDuration: "5s"}} />
            <circle cx="90" cy="40" r="5" fill={primaryColor} fillOpacity="0.3" className="animate-pulse-gentle" style={{animationDuration: "7s"}} />
            <circle cx="35" cy="90" r="4" fill={primaryColor} fillOpacity="0.3" className="animate-pulse-gentle" style={{animationDuration: "6s"}} />
            <circle cx="85" cy="90" r="4" fill={primaryColor} fillOpacity="0.3" className="animate-pulse-gentle" style={{animationDuration: "8s"}} />
          </svg>
        );
      case 'morning':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-float", className)}>
            <circle cx="20" cy="20" r="8" fill={journalYellow} className="animate-pulse-gentle" />
            <path className="animate-pulse-gentle" style={{animationDelay: "0.5s"}} d="M20 5V9" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "0.6s"}} d="M20 31V35" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "0.7s"}} d="M9.17 9.17L12 12" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "0.8s"}} d="M28 28L30.83 30.83" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "0.9s"}} d="M5 20H9" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "1s"}} d="M31 20H35" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "1.1s"}} d="M9.17 30.83L12 28" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
            <path className="animate-pulse-gentle" style={{animationDelay: "1.2s"}} d="M28 12L30.83 9.17" stroke={journalYellow} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'afternoon':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-float", className)}>
            <circle cx="20" cy="22" r="8" fill={journalOrange} className="animate-pulse-gentle" />
            <path d="M32 14C32 14 27 18 20 18C13 18 8 14 8 14" stroke={journalOrange} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "0.5s"}} />
            <path className="animate-pulse-gentle" style={{animationDelay: "0.7s"}} d="M10 27C10 27 15 30 20 30C25 30 30 27 30 27" stroke={journalOrange} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'evening':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-float", className)}>
            <path d="M25 20C25 22.7614 22.7614 25 20 25C17.2386 25 15 22.7614 15 20C15 17.2386 17.2386 15 20 15C22.7614 15 25 17.2386 25 20Z" fill={journalPurple} className="animate-pulse-gentle" />
            <path d="M18 10L17 7" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "0.3s"}} />
            <path d="M29 15L32 13" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "0.6s"}} />
            <path d="M31 25L34 26" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "0.9s"}} />
            <path d="M25 33L26 36" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "1.2s"}} />
            <path d="M14 33L12 35" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "1.5s"}} />
            <path d="M8 24L5 25" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "1.8s"}} />
            <path d="M6 14L3 12" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "2.1s"}} />
            <path d="M11 7L10 4" stroke={journalPurple} strokeWidth="2" strokeLinecap="round" className="animate-pulse-gentle" style={{animationDelay: "2.4s"}} />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {renderSVG()}
    </div>
  );
};

export default AnimatedSVG;