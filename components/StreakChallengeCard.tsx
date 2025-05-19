"use client"

import React from 'react';
import { Lightbulb } from "lucide-react";
import { useRouter } from 'next/navigation';

interface StreakStats {
  streakCount?: number;
  lastEntryDate?: string;
}

const StreakChallengeCard = ({ stats }: { stats?: StreakStats }) => {
  const router = useRouter();

  const handleNewEntry = () => {
    router.push('/user/journal-entry');
  };

  // If no streak or streak is 0, don't render
  if (!stats?.streakCount) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-journal-yellow/10 to-journal-orange/5 p-4 rounded-lg border border-journal-yellow/20 shadow-sm" style={{animation: "pulse 10s infinite ease-in-out"}}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-journal-yellow/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-4 w-4 text-journal-yellow" />
        </div>
        <h3 className="font-medium">Journal streak challenge</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {stats.streakCount >= 7 ? 
          `Amazing! You've maintained a ${stats.streakCount}-day streak!` :
          `Write an entry for 7 consecutive days to earn your first streak badge!`
        }
      </p>
      <div className="flex justify-between mt-3 items-center">
        <div className="text-xs">
          {stats.streakCount >= 7 ? 
            `${stats.streakCount} days` : 
            `${stats.streakCount}/7 days`
          }
        </div>
        <button 
          onClick={handleNewEntry}
          className="text-xs bg-journal-yellow/20 hover:bg-journal-yellow/30 text-journal-yellow px-3 py-1 rounded-full transition-colors"
        >
          {stats.lastEntryDate && new Date(stats.lastEntryDate).toDateString() === new Date().toDateString() ?
            'Add another' : 'Write today'
          }
        </button>
      </div>
      <div className="w-full bg-white/30 h-2 rounded-full mt-2">
        <div 
          className="bg-journal-yellow h-2 rounded-full" 
          style={{ 
            width: stats.streakCount >= 7 ? '100%' : `${(stats.streakCount / 7) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default StreakChallengeCard;