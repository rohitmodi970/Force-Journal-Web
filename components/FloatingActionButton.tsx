import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button2';
import { Plus, PenLine, MessageCircleQuestion, X, Bell, BookOpen } from "lucide-react";
import { useToast } from './ui/quilted-gallery/ui/use-toast';
import { useTheme } from '../utilities/context/ThemeContext';

const FloatingActionButton = () => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { currentTheme } = useTheme();

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleNewEntry = () => {
    router.push('/user/journal-entry');
    setExpanded(false);
  };

  const handleAskAI = () => {
    router.push('/user/assistant');
    setExpanded(false);
  };

  const handleJournal = () => {
    router.push('/user/journal/my-diary');
    setExpanded(false);
  };

  const showNotification = () => {
    toast({
      title: "Daily Reminder",
      description: "Don't forget to write about your day!",
    });
    setExpanded(false);
  };

  // Define colors using theme
  const primaryColor = currentTheme.primary;
  const primaryColorLight = currentTheme.light;
  
  // Custom colors - could be added to theme context if needed
  const journalPurple = "#9F7AEA";
  const journalGreen = "#48BB78";
  const journalYellow = "#ECC94B";
  const destructiveColor = "#E53E3E"; // Red by default

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-2">
      {expanded && (
        <>
          <div className="flex flex-col gap-2 items-end animate-fade-in" style={{ transformOrigin: 'bottom right' }}>
            <div className="flex items-center gap-2">
              <span className="bg-white dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                New Entry
              </span>
              <Button
                onClick={handleNewEntry}
                size="icon"
                className="rounded-full w-12 h-12 shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in relative overflow-hidden"
                style={{ 
                  backgroundColor: `${primaryColor}E6`, // 90% opacity
                  animationDelay: '0.1s'
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                <PenLine className="h-5 w-5" />
                <span className="sr-only">New Entry</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-white dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                AI Assistant
              </span>
              <Button
                onClick={handleAskAI}
                size="icon" 
                className="rounded-full w-12 h-12 shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in relative overflow-hidden"
                style={{ 
                  backgroundColor: `${journalPurple}E6`, // 90% opacity
                  animationDelay: '0.2s' 
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                <MessageCircleQuestion className="h-5 w-5" />
                <span className="sr-only">Ask AI</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-white dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                Journal View
              </span>
              <Button
                onClick={handleJournal}
                size="icon" 
                className="rounded-full w-12 h-12 shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in relative overflow-hidden"
                style={{ 
                  backgroundColor: `${journalGreen}E6`, // 90% opacity
                  animationDelay: '0.3s' 
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                <BookOpen className="h-5 w-5" />
                <span className="sr-only">Journal</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-white dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                Reminder
              </span>
              <Button
                onClick={showNotification}
                size="icon" 
                className="rounded-full w-12 h-12 shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in relative overflow-hidden"
                style={{ 
                  backgroundColor: `${journalYellow}E6`, // 90% opacity
                  animationDelay: '0.4s' 
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                <Bell className="h-5 w-5" />
                <span className="sr-only">Reminder</span>
              </Button>
            </div>
          </div>
        </>
      )}
      <Button
        onClick={toggleExpand}
        size="icon"
        className={`rounded-full w-14 h-14 shadow-lg transition-all duration-500 hover:scale-105 ${expanded ? 'rotate-45' : ''} relative overflow-hidden`}
        style={{ 
          backgroundColor: expanded ? destructiveColor : primaryColor
        }}
      >
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
        {expanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        <span className="sr-only">More actions</span>
        {!expanded && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-journal-purple rounded-full animate-pulse"></span>
        )}
        <div className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ 
          backgroundColor: primaryColor,
          animationDuration: '3s' 
        }}></div>
        
        {/* Ripple effect on click */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <circle cx="50%" cy="50%" r="10" fill="rgba(255,255,255,0.3)" className="animate-ping" style={{ animationDelay: '0.5s', animationDuration: '1s' }}></circle>
        </svg>
      </Button>
    </div>
  );
};

export default FloatingActionButton;