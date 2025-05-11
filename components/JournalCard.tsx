import React from 'react';
import { CardFooter } from './ui/quilted-gallery/ui/card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/quilted-gallery/ui/card';
import { Badge } from "@/components/ui/badge";
import { Smile, Calendar, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '../utilities/context/ThemeContext';

interface JournalCardProps {
  id: string;
  date: string;
  title: string;
  preview: string;
  mood: string;
  moodColor: string;
  className?: string;
}

const JournalCard: React.FC<JournalCardProps> = ({
  date,
  title,
  preview,
  mood,
  moodColor,
  className,
}) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  // Map mood colors to theme properties
  const getMoodColorStyles = (color: string) => {
    // Use theme colors for mood indicators instead of hardcoded journal-color classes
    switch(color) {
      case "green":
        return {
          bg: `bg-opacity-10 bg-[#48BB78]`,
          text: `text-[#48BB78]`,
          border: `border-[#48BB78] border-opacity-20`,
          hover: `hover:bg-[#48BB78] hover:bg-opacity-20`
        };
      case "blue":
        return {
          bg: `bg-opacity-10 bg-[${currentTheme.primary}]`,
          text: `text-[${currentTheme.primary}]`,
          border: `border-[${currentTheme.primary}] border-opacity-20`,
          hover: `hover:bg-[${currentTheme.primary}] hover:bg-opacity-20`
        };
      case "yellow":
        return {
          bg: `bg-opacity-10 bg-[#ECC94B]`,
          text: `text-[#ECC94B]`,
          border: `border-[#ECC94B] border-opacity-30`,
          hover: `hover:bg-[#ECC94B] hover:bg-opacity-20`
        };
      case "red":
        return {
          bg: `bg-opacity-10 bg-[#E53E3E]`,
          text: `text-[#E53E3E]`,
          border: `border-[#E53E3E] border-opacity-20`,
          hover: `hover:bg-[#E53E3E] hover:bg-opacity-20`
        };
      case "purple":
        return {
          bg: `bg-opacity-10 bg-[#9F7AEA]`,
          text: `text-[#9F7AEA]`,
          border: `border-[#9F7AEA] border-opacity-20`,
          hover: `hover:bg-[#9F7AEA] hover:bg-opacity-20`
        };
      default:
        return {
          bg: `bg-opacity-10 bg-[${currentTheme.primary}]`,
          text: `text-[${currentTheme.primary}]`,
          border: `border-[${currentTheme.primary}] border-opacity-20`,
          hover: `hover:bg-[${currentTheme.primary}] hover:bg-opacity-20`
        };
    }
  };

  const moodStyles = getMoodColorStyles(moodColor);

  return (
    <Card className={cn(
      "journal-entry-card cursor-pointer group transition-all duration-300 hover:shadow-lg relative overflow-hidden", 
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 -rotate-45 transform translate-x-10 -translate-y-10 bg-gradient-to-br from-transparent to-primary/5 rounded-full"></div>
      
      {/* Paper texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{date}</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "px-2 py-0 h-6 font-normal transition-all duration-300", 
              moodStyles.bg,
              moodStyles.text,
              moodStyles.border,
              moodStyles.hover
            )}
          >
            <Smile className="h-3.5 w-3.5 mr-1 animate-pulse-gentle" />
            {mood}
          </Badge>
        </div>
        <CardTitle className="text-lg font-medium mt-2 transition-colors group-hover:text-primary relative">
          {title}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500"></span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 text-sm text-muted-foreground group-hover:text-foreground/90 transition-all duration-300">
          {preview}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <span className="flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          Read more
          <svg className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h13" />
          </svg>
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary/80 hover:text-primary">
          <Bookmark className="h-4 w-4" />
        </button>
      </CardFooter>
      
      {/* Corner fold effect with enhanced animation */}
      <div className="absolute bottom-0 right-0 w-8 h-8 transition-all duration-300 group-hover:w-10 group-hover:h-10 origin-bottom-right">
        <div className="absolute top-0 left-0 w-0 h-0 border-b-8 border-r-8 border-b-primary/20 border-r-transparent group-hover:border-b-12 group-hover:border-r-12 transition-all duration-300"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-card rounded-tl-lg transform rotate-180"></div>
      </div>
    </Card>
  );
};

export default JournalCard;