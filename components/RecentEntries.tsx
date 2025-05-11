import React, { useState } from 'react';
import JournalCard from './JournalCard';
import { Button } from './ui/button2';
import { ArrowRight, Filter, ArrowUpDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/quilted-gallery/ui/dropdown-menu';
import { useTheme } from '../utilities/context/ThemeContext';

const recentJournalEntries = [
  {
    id: "1",
    date: "Today, 2:30 PM",
    title: "Meeting with the team",
    preview: "Today's meeting went really well. We discussed the upcoming project deadlines and assigned tasks to everyone. I'm feeling confident about our progress.",
    mood: "Optimistic",
    moodColor: "green"
  },
  {
    id: "2",
    date: "Yesterday",
    title: "A walk in the park",
    preview: "Took some time for myself today and went for a long walk in the park. The fresh air really helped clear my mind and I came back feeling refreshed.",
    mood: "Peaceful",
    moodColor: "blue"  // This will now use the current theme's primary color
  },
  {
    id: "3",
    date: "May 5, 2025",
    title: "Reflecting on goals",
    preview: "Spent some time thinking about my yearly goals today. I'm a bit behind on some, but I've made good progress overall. Need to refocus on the health ones.",
    mood: "Thoughtful",
    moodColor: "purple"
  }
];

const RecentEntries: React.FC = () => {
  const { currentTheme } = useTheme();
  const [entriesView, setEntriesView] = useState<'grid' | 'compact'>('grid');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  All entries
                </DropdownMenuItem>
                <DropdownMenuItem>
                  This week
                </DropdownMenuItem>
                <DropdownMenuItem>
                  This month
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Oldest first
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setEntriesView(entriesView === 'grid' ? 'compact' : 'grid')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={`grid ${entriesView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid-cols-1 gap-2'}`}>
        {recentJournalEntries.map(entry => (
          <JournalCard
            key={entry.id}
            id={entry.id}
            date={entry.date}
            title={entry.title}
            preview={entry.preview}
            mood={entry.mood}
            moodColor={entry.moodColor}
            className={entriesView === 'compact' ? 'p-2' : ''}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentEntries;