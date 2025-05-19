"use client"

import React from 'react';
import { LogOut, CalendarDays, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from '@/components/ui/button2';
import { useRouter } from 'next/navigation';

interface Stats {
  streakCount?: number;
  totalEntries?: number;
  lastEntryDate?: string;
  weeklyEntries?: number;
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

  const handleNewEntry = () => {
    router.push('/user/journal-entry');
  };

  return (
    <div 
      className="relative overflow-hidden rounded-xl shadow-md border border-primary/10"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.light} 0%, rgba(255,255,255,0) 70%)`,
        borderImage: `linear-gradient(to right, ${currentTheme.primary}40, transparent) 1`
      }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 -mt-12 -mr-12 opacity-10">
        <div className="w-full h-full rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
      </div>
      
      <div className="relative px-6 py-8 sm:px-8 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, <span style={{ color: currentTheme.primary }}>{userName}</span>!
            </h1>
            <p className="mt-2 text-muted-foreground">
              {stats?.streakCount ? (
                <>
                  You've maintained a <span className="font-semibold" style={{ color: currentTheme.primary }}>
                    {stats.streakCount}-day
                  </span> writing streak! {stats?.totalEntries ? `(${stats.totalEntries} total entries)` : ''}
                </>
              ) : (
                "Ready to start your journal journey today?"
              )}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="text-xs text-muted-foreground flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                {stats?.lastEntryDate ? (
                  <>Last entry: {new Date(stats.lastEntryDate).toLocaleDateString()}</>
                ) : (
                  "No entries yet"
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:items-end gap-3">
            <Button 
              onClick={handleNewEntry}
              className="flex items-center justify-center gap-2 px-5 py-2.5"
              style={{
                backgroundColor: elementColors.button,
                color: isDarkMode ? '#fff' : '#fff',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Write New Entry</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign out
            </button>
          </div>
        </div>
        
        {/* Streak indicator */}
        {stats?.streakCount !== undefined && stats.streakCount > 0 && (
          <div className="mt-4 sm:mt-6 bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-primary/10 max-w-md">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-journal-yellow/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-3 w-3 text-journal-yellow" />
              </div>
              <p className="text-xs font-medium">Your writing streak</p>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between mb-1 text-xs">
                <span>{stats.streakCount >= 7 ? `${stats.streakCount} days` : `${stats.streakCount}/7 days`}</span>
                {stats.streakCount >= 7 && <span>Streak badge earned!</span>}
              </div>
              <div className="w-full bg-background/50 h-1.5 rounded-full">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ 
                    width: stats.streakCount >= 7 ? '100%' : `${(stats.streakCount / 7) * 100}%`,
                    backgroundColor: currentTheme.primary
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;