"use client"

import React from 'react';
import CollapsibleCard from '@/components/CollapsibleCard';
import { Separator } from '@/components/ui/quilted-gallery/ui/separator';

interface WeeklyStats {
  weeklyEntries?: number;
  averageMood?: string;
  mostProductiveDay?: string;
}

const WeeklySummary = ({ stats }: { stats?: WeeklyStats }) => {
  return (
    <CollapsibleCard title="Weekly Summary">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">
            Total Entries: {stats?.weeklyEntries || 0}
          </h3>
          <p className="text-xs text-muted-foreground">
            {stats?.weeklyEntries ? 
              'Keep up the good work!' : 
              'Write your first entry this week!'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">
            Average Mood: {stats?.averageMood || 'N/A'}
          </h3>
          <div className="w-full bg-muted h-2 rounded-full mt-1.5">
            <div 
              className={`h-2 rounded-full relative ${
                !stats?.averageMood ? 'bg-gray-300' : 
                stats.averageMood.toLowerCase().includes('positive') ? 'bg-journal-green' :
                stats.averageMood.toLowerCase().includes('negative') ? 'bg-journal-red' :
                'bg-journal-yellow'
              }`} 
              style={{ width: stats?.averageMood ? '75%' : '0%' }}
            >
              {stats?.averageMood && (
                <div className="absolute -right-1 -top-2 h-6 w-1 rounded-full" style={{
                  backgroundColor: 
                    stats.averageMood.toLowerCase().includes('positive') ? '#10B981' :
                    stats.averageMood.toLowerCase().includes('negative') ? '#EF4444' :
                    '#F59E0B'
                }} />
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Negative</span>
            <span>Positive</span>
          </div>
        </div>
        <Separator className="my-2" />
        <div>
          <h3 className="text-sm font-medium">Most Productive Day</h3>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {['M','T','W','T','F','S','S'].map((day, i) => (
              <div 
                key={day + i} 
                className={`h-8 rounded flex items-center justify-center text-xs
                  ${
                    stats?.mostProductiveDay && 
                    day === stats.mostProductiveDay.substring(0, 1) ? 
                    'bg-primary/20 text-primary font-medium' : 
                    'bg-muted/50 text-muted-foreground'
                  }
                `}
              >
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.mostProductiveDay ? 
              `${stats.mostProductiveDay} was most productive` : 
              'No entries this week'}
          </p>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default WeeklySummary;