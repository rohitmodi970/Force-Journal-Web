"use client"

import React, { useState, useEffect } from 'react';
import { LogOut, CalendarDays, Lightbulb, ArrowRight, TrendingUp, BookOpen, MessageSquare, Award, ChevronRight } from "lucide-react";
import { Button } from '@/components/ui/button2';
import { useRouter } from 'next/navigation';

interface Stats {
  streakCount?: number;
  totalEntries?: number;
  lastEntryDate?: string;
  weeklyEntries?: number;
  averageMood?: string;
  mostProductiveDay?: string;
  topTopics?: Array<{name: string, count: number}>;
}

interface Theme {
  primary: string;
  light: string;
}

interface ElementColors {
  button: string;
}

interface WelcomeBannerProps {
  userName: string;
  stats?: Stats;
  currentTheme: Theme;
  isDarkMode: boolean;
  elementColors: ElementColors;
  handleLogout: () => void;
}

const WelcomeBanner = ({ 
  userName, 
  stats, 
  currentTheme, 
  isDarkMode, 
  elementColors,
  handleLogout
}: WelcomeBannerProps) => {
  const router = useRouter();
  const [timeGreeting, setTimeGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(false);
console.log(stats)
  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting("Good morning");
    } else if (hour >= 12 && hour < 18) {
      setTimeGreeting("Good afternoon");
    } else {
      setTimeGreeting("Good evening");
    }
  }, []);

  const handleNewEntry = () => {
    router.push('/user/journal-entry');
  };

  // Check if user last wrote today
  const getWritingStatus = () => {
    if (!stats?.lastEntryDate) {
      return {
        status: "never",
        message: "Start your journal journey today!"
      };
    }
    
    const now = new Date();
    const lastEntry = new Date(stats.lastEntryDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastEntryDate = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
    
    // Check if last entry was today
    if (lastEntryDate.getTime() === today.getTime()) {
      return {
        status: "today",
        message: `You've written today! ${stats.weeklyEntries} entries this week.`
      };
    }
    
    // Check if last entry was yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastEntryDate.getTime() === yesterday.getTime()) {
      return {
        status: "yesterday",
        message: "You wrote yesterday! Don't break your momentum."
      };
    }
    
    // Calculate days since last entry
    const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      status: "gap",
      message: `It's been ${diffDays} days since your last entry. Let's get back to writing!`,
      days: diffDays
    };
  };

  const writingStatus = getWritingStatus();

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-lg border"
      style={{
        background: isDarkMode 
          ? `linear-gradient(145deg, ${currentTheme.primary}15 0%, rgba(0,0,0,0.2) 100%)`
          : `linear-gradient(145deg, ${currentTheme.light} 0%, rgba(255,255,255,0.7) 100%)`,
        borderColor: `${currentTheme.primary}30`
      }}
    >
      {/* Abstract shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 -mt-24 -mr-24 opacity-5">
        <div className="w-full h-full rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 -mb-32 -ml-32 opacity-5">
        <div className="w-full h-full rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
      </div>
      
      <div className="relative px-6 py-8 sm:px-8 z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
              {timeGreeting}, <span className="ml-2 tracking-tight" style={{ color: currentTheme.primary }}>{userName} </span>
              <span>!</span>
              
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {stats?.totalEntries ? (
                <>You've written <span className="font-bold" style={{ color: currentTheme.primary }}>
                  {stats.totalEntries}
                </span> journal entries so far.</>
              ) : (
                "Ready to start your journal journey today?"
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:items-end gap-4">
            <Button 
              onClick={handleNewEntry}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium shadow-md hover:translate-y-0.5 transition-all"
              style={{
                backgroundColor: elementColors.button,
                boxShadow: `0 4px 12px ${elementColors.button}40`
              }}
            >
              <span>Write New Entry</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign out
            </button>
          </div>
        </div>
        
        {/* Stats Cards Section */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Latest Entry Card */}
          <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-medium">Latest Entry</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats?.lastEntryDate ? (
                new Date(stats.lastEntryDate).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })
              ) : (
                "No entries yet"
              )}
            </p>
            <p className="text-xs mt-1" style={{ color: currentTheme.primary }}>
              {writingStatus.message}
            </p>
          </div>
          
          {/* Mood Card */}
          <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <h3 className="font-medium">Mood Trends</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats?.averageMood ? (
                `Average mood: ${stats.averageMood}`
              ) : (
                "Track your mood in entries"
              )}
            </p>
            <div className="mt-2 flex gap-1">
              {["😔", "😐", "🙂", "😊"].map((emoji, index) => (
                <span 
                  key={index} 
                  className={`text-sm px-1.5 rounded ${index === 3 ? 'bg-green-500/10' : 'bg-background/50'}`}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
          
          {/* Activity Card */}
          <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="font-medium">Activity</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats?.mostProductiveDay ? (
                `Most active: ${stats.mostProductiveDay}`
              ) : (
                "Start writing to see patterns"
              )}
            </p>
            <p className="text-xs mt-1">
              {stats?.weeklyEntries ? (
                `${stats.weeklyEntries} entries this week`
              ) : (
                "No entries this week"
              )}
            </p>
          </div>
          
          {/* Topics Card */}
          <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-amber-500" />
              </div>
              <h3 className="font-medium">Top Topics</h3>
            </div>
            {stats?.topTopics && stats.topTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.topTopics.slice(0, 3).map((topic, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10"
                    style={{ color: currentTheme.primary }}
                  >
                    #{topic.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add topics to your entries
              </p>
            )}
          </div>
        </div>
        
        {/* Progress Section */}
        {stats?.totalEntries !== undefined && stats.totalEntries > 0 && (
          <div className="mt-6 bg-background/30 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-journal-yellow/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-journal-yellow" />
                </div>
                <h3 className="font-medium">Writing Progress</h3>
              </div>
              
              <button className="text-xs text-primary flex items-center hover:underline">
                View insights
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              {/* Weekly Progress */}
              <div>
                <div className="flex justify-between mb-2 text-xs">
                  <span className="font-medium">Weekly goal</span>
                  <span className="font-bold">{stats.weeklyEntries ?? 0}/7 entries</span>
                </div>
                <div className="w-full bg-background/50 h-2 rounded-full">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: (stats.weeklyEntries ?? 0) >= 7 ? '100%' : `${((stats.weeklyEntries ?? 0) / 7) * 100}%`,
                      backgroundColor: currentTheme.primary
                    }}
                  ></div>
                </div>
                {(stats.weeklyEntries ?? 0) >= 7 && (
                  <p className="text-xs mt-1 text-green-500">Weekly goal achieved!</p>
                )}
              </div>
              
              {/* Monthly Progress */}
              <div>
                <div className="flex justify-between mb-2 text-xs">
                  <span className="font-medium">Monthly progress</span>
                  <span className="font-bold">{stats.totalEntries % 30}/30 entries</span>
                </div>
                <div className="w-full bg-background/50 h-2 rounded-full">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${((stats.totalEntries % 30) / 30) * 100}%`,
                      backgroundColor: currentTheme.primary
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Mood Distribution */}
              <div>
                <div className="flex justify-between mb-2 text-xs">
                  <span className="font-medium">Mood distribution</span>
                </div>
                <div className="flex h-2 w-full rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '40%' }}></div>
                  <div className="h-full bg-blue-400" style={{ width: '30%' }}></div>
                  <div className="h-full bg-amber-400" style={{ width: '20%' }}></div>
                  <div className="h-full bg-red-400" style={{ width: '10%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>😊 40%</span>
                  <span>😐 30%</span>
                  <span>🙂 20%</span>
                  <span>😔 10%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;