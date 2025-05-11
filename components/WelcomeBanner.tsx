
import React from 'react';
import { Card, CardContent } from './ui/quilted-gallery/ui/card';
import { Button } from './ui/button2';
import { ArrowRight, Lightbulb, CalendarDays, TrendingUp } from "lucide-react";
import AnimatedSVG from './AnimatedSVG';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/quilted-gallery/ui/tooltip';

interface WelcomeBannerProps {
  userName: string;
  onNewEntry: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ userName, onNewEntry }) => {
  // Get current time to personalize greeting
  const currentHour = new Date().getHours();
  let greeting = "Good day";
  let timeIcon;
  
  if (currentHour < 12) {
    greeting = "Good morning";
    timeIcon = "morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
    timeIcon = "afternoon";
  } else {
    greeting = "Good evening";
    timeIcon = "evening";
  }
  
  // Generate a random prompt
  const prompts = [
    "How are you feeling today?",
    "What made you smile today?",
    "What's something you're looking forward to?",
    "Any small wins to celebrate?",
    "What's on your mind right now?",
    "What made today unique?",
    "What are you grateful for today?",
  ];
  
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return (
    <Card className="border-0 shadow-none bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 animate-pulse-gentle" style={{animationDuration: "15s"}}></div>
        <div className="absolute right-20 bottom-10 w-32 h-32 rounded-full bg-primary/10 animate-float" style={{animationDelay: "2s", animationDuration: "10s"}}></div>
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 relative">
            <div className="absolute -top-1 -left-3 opacity-30">
              {timeIcon === "morning" && (
                <AnimatedSVG type="morning" className="w-10 h-10" />
              )}
              {timeIcon === "afternoon" && (
                <AnimatedSVG type="afternoon" className="w-10 h-10" />
              )}
              {timeIcon === "evening" && (
                <AnimatedSVG type="evening" className="w-10 h-10" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium text-muted-foreground animate-fade-in">
                {greeting},
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 bg-journal-green/10 px-2 py-0.5 rounded-full text-xs text-journal-green">
                      <TrendingUp className="h-3 w-3" />
                      <span>5 day streak</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You've written in your journal for 5 days in a row!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <h1 className="text-3xl font-bold text-foreground animate-fade-in" style={{animationDelay: "0.1s"}}>
              {userName} <span className="inline-block animate-pulse-gentle">👋</span>
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 animate-fade-in" style={{animationDelay: "0.2s"}}>
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border flex-grow">
                <Lightbulb className="h-5 w-5 text-primary animate-pulse-gentle" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Today's prompt:</span> {randomPrompt}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex items-center gap-4">
            <AnimatedSVG type="journal" className="hidden md:block" />
            <Button 
              onClick={onNewEntry} 
              className="group animate-fade-in hover:shadow-md transition-all duration-300 relative overflow-hidden"
              style={{animationDelay: "0.3s"}}
            >
              <span className="relative z-10">Start Writing</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300 z-0"></div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
