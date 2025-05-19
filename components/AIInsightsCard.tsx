"use client"

import React from 'react';
import { Sparkle, CalendarDays, ArrowRight } from "lucide-react";
import { Card } from '@/components/ui/quilted-gallery/ui/card';
import { Separator } from '@/components/ui/quilted-gallery/ui/separator';

interface Topic {
  name: string;
  count: number;
}

interface InsightStats {
  totalEntries?: number;
  weeklyEntries?: number;
  lastEntryDate?: string;
  topTopics?: Topic[];
}

interface AIInsightsCardProps {
  stats?: InsightStats;
  showAIInsight: () => void;
}

const AIInsightsCard = ({ stats, showAIInsight }: AIInsightsCardProps) => {
  return (
    <Card className="border p-4 rounded-lg bg-gradient-to-br from-journal-purple/5 to-background">
      <div className="flex items-start space-x-3">
        <div className="h-8 w-8 rounded-full bg-journal-purple/20 flex items-center justify-center flex-shrink-0">
          <Sparkle className="h-4 w-4 text-journal-purple" />
        </div>
        <div>
          <h3 className="font-medium">AI Insights</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {stats?.totalEntries ? (
              `You've written ${stats.totalEntries} entries total. ` + 
              (stats.weeklyEntries && stats.weeklyEntries > 0 ? 
                `That's ${stats.weeklyEntries} this week!` : 
                'Start writing to see insights.')
            ) : 'Start writing to see insights.'}
          </p>
          <div className="mt-3 flex items-center">
            <CalendarDays className="h-4 w-4 text-muted-foreground mr-1.5" />
            <span className="text-xs text-muted-foreground">
              {stats?.lastEntryDate ? 
                `Last entry: ${new Date(stats.lastEntryDate).toLocaleDateString()}` : 
                'No entries yet'}
            </span>
          </div>
          <button 
            className="mt-3 text-xs text-primary flex items-center hover:underline"
            onClick={showAIInsight}
          >
            Get insights
            <ArrowRight className="ml-1 h-3 w-3" />
          </button>
        </div>
      </div>
      {stats?.topTopics && stats.topTopics.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mt-2">
            <h4 className="text-sm font-medium">Top Mentioned Topics</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {stats.topTopics.slice(0, 4).map((topic, index) => (
                <div 
                  key={index}
                  className="text-xs bg-journal-blue/10 text-journal-blue px-2 py-1 rounded-full"
                >
                  {topic.name} ({topic.count})
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default AIInsightsCard;