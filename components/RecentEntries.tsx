'use client';

import React, { useState, useEffect } from 'react';
import JournalCard from './JournalCard';
import { Button } from './ui/button2';
import { ArrowRight, Filter, ArrowUpDown, Loader2 } from "lucide-react";
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
import { useRouter } from 'next/navigation';

interface JournalEntry {
  id: string;
  title: string;
  preview: string;
  date: string;
  mood: string;
  moodColor: string;
  tags?: string[];
}

const RecentEntries: React.FC = () => {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const [entriesView, setEntriesView] = useState<'grid' | 'compact'>('grid');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetchJournalEntries();
  }, [filterOption, sortOption]);

  const fetchJournalEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters based on filter and sort options
      let queryParams = new URLSearchParams();
      queryParams.append('limit', '6');  // Limit to 6 entries for recent view
      
      if (filterOption === 'week') {
        queryParams.append('since', getDateNDaysAgo(7));
      } else if (filterOption === 'month') {
        queryParams.append('since', getDateNDaysAgo(30));
      }
      
      if (sortOption === 'oldest') {
        queryParams.append('sortBy', 'createdAt');
        queryParams.append('sortOrder', 'asc');
      } else {
        queryParams.append('sortBy', 'createdAt');
        queryParams.append('sortOrder', 'desc');
      }
      
      const response = await fetch(`/api/fetch-journals?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      
      const data = await response.json();
      setJournalEntries(data.journals);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateNDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const handleViewEntry = (journalId: string) => {
    router.push(`/user/journal/${journalId}`);
  };

  const handleViewAll = () => {
    router.push('/user/journals');
  };

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
                <DropdownMenuItem onClick={() => setFilterOption('all')}>
                  All entries
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterOption('week')}>
                  This week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterOption('month')}>
                  This month
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSortOption('newest')}>
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('oldest')}>
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
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={handleViewAll}
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : journalEntries.length === 0 ? (
        <div className="bg-muted/30 p-8 rounded-lg text-center">
          <p className="text-muted-foreground">No journal entries yet. Start writing your first entry!</p>
          <Button 
            onClick={() => router.push('/user/journal-entry')}
            className="mt-4"
          >
            Create Entry
          </Button>
        </div>
      ) : (
        <div className={`grid ${entriesView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid-cols-1 gap-2'}`}>
          {journalEntries.map(entry => (
            <JournalCard
              key={entry.id}
              id={entry.id}
              date={entry.date}
              title={entry.title}
              preview={entry.preview}
              mood={entry.mood}
              moodColor={entry.moodColor}
              className={entriesView === 'compact' ? 'p-2' : ''}
              onClick={() => handleViewEntry(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentEntries;