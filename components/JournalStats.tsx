import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/quilted-gallery/ui/card';
import { CalendarDays, BookOpen, Heart, Activity, Edit, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '@/utilities/context/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  trendValue,
  color = "primary"
}) => {
  const { currentTheme } = useTheme();
  
  // Map color names to theme values
  const colorMap: Record<string, string> = {
    'primary': currentTheme.primary,
    'journal-green': '#48BB78',
    'journal-blue': '#4299E1',
    'journal-purple': '#9F7AEA',
    'journal-yellow': '#ECC94B',
    'journal-red': '#F56565'
  };
  
  // Get the actual color value
  const colorValue = colorMap[color] || currentTheme.primary;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div 
        className="h-1 w-full" 
        style={{ backgroundColor: `${colorValue}` }}
      ></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div 
          className="h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300"
          style={{ 
            backgroundColor: `${colorValue}20`,  // 20 is hex for 12% opacity
            color: colorValue
          }}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={cn(
              "flex items-center text-xs px-1.5 py-0.5 rounded-full",
              trend === 'up' && "bg-journal-green/10 text-journal-green",
              trend === 'down' && "bg-journal-red/10 text-journal-red",
              trend === 'neutral' && "bg-journal-blue/10 text-journal-blue"
            )}>
              {trend === 'up' && <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>}
              {trend === 'down' && <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
              {trend === 'neutral' && <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const JournalStats: React.FC = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatsCard
        title="Entries"
        value={27}
        description="Total journal entries"
        icon={<BookOpen className="h-4 w-4" />}
        trend="up"
        trendValue="12%"
        color="journal-blue"
      />
      <StatsCard
        title="Streak"
        value="5 days"
        description="Current writing streak"
        icon={<CalendarDays className="h-4 w-4" />}
        trend="up"
        trendValue="3 days"
        color="primary"
      />
      <StatsCard
        title="Mood"
        value="Positive"
        description="Your overall mood trend"
        icon={<Heart className="h-4 w-4" />}
        trend="up"
        trendValue="5%"
        color="journal-green"
      />
      <StatsCard
        title="Activity"
        value="High"
        description="Writing activity this week"
        icon={<Activity className="h-4 w-4" />}
        trend="neutral"
        trendValue="same"
        color="journal-purple"
      />
      <StatsCard
        title="Avg. Length"
        value="326"
        description="Words per entry"
        icon={<Edit className="h-4 w-4" />}
        trend="down"
        trendValue="8%"
        color="journal-yellow"
      />
      <StatsCard
        title="Writing Time"
        value="Evening"
        description="Your most productive time"
        icon={<Clock className="h-4 w-4" />}
        color="journal-purple"
      />
    </div>
  );
};

export default JournalStats;