"use client"

import React, { useState } from 'react';
import { 
  Info, Check, Edit, Sparkles, 
  Medal, CalendarCheck, Compass, 
  Lightbulb, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button2';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming you have a utility function for class names
import { LucideIcon } from 'lucide-react';

const MotionDiv = motion.div;

type TailwindColor = 'purple' | 'blue' | 'green' | 'amber' | string;
type TipId = 'prompt' | 'insights' | 'quickLinks' | 'entries';

interface OnboardingStepProps {
  title: string;
  description: string;
  index: number;
  onDismiss: () => void;
  icon: LucideIcon;
  color: TailwindColor;
  active?: boolean;
}

// New OnboardingStep component with animations and more color
const OnboardingStep = ({ 
  title, 
  description, 
  index, 
  onDismiss, 
  icon: Icon, 
  color, 
  active = true 
}: OnboardingStepProps) => {
  if (!active) return null;
  
  // Using a color mapping object instead of string interpolation
  const colorMap: Record<string, { 
    gradientFrom: string, 
    gradientTo: string, 
    iconBg: string, 
    iconColor: string, 
    borderColor: string 
  }> = {
    purple: {
      gradientFrom: "from-purple-100 dark:from-purple-900/30",
      gradientTo: "to-purple-50 dark:to-purple-900/10",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    blue: {
      gradientFrom: "from-blue-100 dark:from-blue-900/30",
      gradientTo: "to-blue-50 dark:to-blue-900/10",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    green: {
      gradientFrom: "from-green-100 dark:from-green-900/30",
      gradientTo: "to-green-50 dark:to-green-900/10",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800"
    },
    amber: {
      gradientFrom: "from-amber-100 dark:from-amber-900/30",
      gradientTo: "to-amber-50 dark:to-amber-900/10",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800"
    },
    red: {
      gradientFrom: "from-red-100 dark:from-red-900/30",
      gradientTo: "to-red-50 dark:to-red-900/10",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800"
    }
  };

  const colorStyle = colorMap[color] || colorMap.purple;  // Default to purple if color not found
  
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "relative bg-gradient-to-r",
        colorStyle.gradientFrom, colorStyle.gradientTo,
        "border rounded-lg p-5 mb-4 shadow-sm",
        colorStyle.borderColor
      )}
    >
      <div className="flex items-start">
        <div className={cn(
          "flex-shrink-0 rounded-full h-10 w-10 flex items-center justify-center mr-3",
          colorStyle.iconBg
        )}>
          <Icon className={colorStyle.iconColor} size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button 
          onClick={onDismiss} 
          variant="ghost" 
          size="sm"
          className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss step"
        >
          <Check size={18} />
        </Button>
      </div>

      {/* Decorative accent elements */} 
      <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 rounded-full bg-white dark:bg-gray-800 opacity-70"></div>
      <div className="absolute bottom-0 left-0 -mb-1 -ml-1 w-2 h-2 rounded-full bg-white dark:bg-gray-800 opacity-50"></div>
    </MotionDiv>
  );
};

const NewUserGuidance = ({ onDismissAll }: { onDismissAll: () => void }) => {
  const [activeTips, setActiveTips] = useState({
    prompt: true,
    insights: true,
    quickLinks: true,
    entries: true
  });

  const handleDismiss = (tipName: TipId) => {
    setActiveTips(prev => {
      // Create the updated tips object
      const updatedTips = {
        ...prev,
        [tipName]: false
      };
      
      // Check if all tips are dismissed
      if (!Object.values(updatedTips).some(Boolean)) {
        onDismissAll();
      }
      
      return updatedTips;
    });
  };

  const steps = [
    {
      id: 'prompt' as TipId,
      title: "Begin Your Journey",
      description: "Start with the daily prompt for inspiration. Each day brings a new opportunity to reflect and grow through writing.",
      icon: Edit,
      color: "purple"
    },
    {
      id: 'insights' as TipId,
      title: "Discover AI-Powered Insights",
      description: "As you write more, receive personalized insights about your mood patterns, writing style, and journaling habits.",
      icon: Sparkles,
      color: "blue"
    },
    {
      id: 'quickLinks' as TipId,
      title: "Navigate with Ease",
      description: "Use Quick Links to access different journal features instantly. Create entries, view stats, and explore past writings.",
      icon: Compass,
      color: "green"
    },
    {
      id: 'entries' as TipId,
      title: "Build Your Streak",
      description: "Track your progress and watch your entry count grow. Consistency is the key to meaningful journaling practice.",
      icon: Medal,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-4 mb-6">
    <MotionDiv
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 p-5 rounded-lg border border-red-300/30 dark:border-red-700/30 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/30 p-2 rounded-full mr-3">
          <Lightbulb size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-bold text-xl">Getting Started Guide</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Follow these steps to make the most of your journaling experience
          </p>
        </div>
        </div>
        <Button onClick={onDismissAll} variant="outline" className="border-red-300/30 dark:border-red-700/30 hover:bg-red-500/10">
        Dismiss All
        </Button>
      </div>
    </MotionDiv>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <OnboardingStep 
            key={step.id}
            index={index + 1}
            title={step.title}
            description={step.description}
            icon={step.icon}
            color={step.color}
            active={activeTips[step.id]}
            onDismiss={() => handleDismiss(step.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced FirstEntryPrompt with better visual design
interface FirstEntryPromptProps {
    onClick: () => void;
}

const FirstEntryPrompt = ({ onClick }: FirstEntryPromptProps) => {
        return (
                <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={onClick}
                >
                        <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800/50 p-8">
                                <div className="flex flex-col items-center text-center space-y-5">
                                        <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-md opacity-60"></div>
                                                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white/50 flex items-center justify-center">
                                                        <Edit className="text-white" size={28} />
                                                </div>
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 inline-block text-transparent bg-clip-text">Write Your First Entry</h3>
                                        
                                        <p className="text-gray-700 dark:text-gray-200 max-w-md">
                                                Start your journaling journey by capturing your thoughts, feelings, or experiences.
                                                Your first entry marks the beginning of your personal growth story.
                                        </p>
                                        
                                        <Button 
                                                size="lg" 
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white group transition-all duration-300"
                                        >
                                                <span>Create First Entry</span>
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        
                                        {/* Colorful decorative elements */}
                                        <div className="absolute top-5 right-5 text-blue-500/40 dark:text-blue-400/40">
                                                <CalendarCheck size={40} />
                                        </div>
                                        <div className="absolute bottom-5 left-5 text-indigo-500/40 dark:text-indigo-400/40">
                                                <Sparkles size={32} />
                                        </div>
                                </div>
                        </div>
                </MotionDiv>
        );
};

export { NewUserGuidance, FirstEntryPrompt };