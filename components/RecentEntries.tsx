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
  const { currentTheme, isDarkMode, elementColors } = useTheme();
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
    router.push('/user/journal');
  };

  // Define button styles based on theme
  const buttonStyle = {
    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.7)',
    color: elementColors.text,
    borderRadius: '0.375rem', // rounded-md equivalent
    display: 'flex',
    alignItems: 'center',
    padding: '0.375rem 0.75rem', // px-3 py-1.5 equivalent
    fontWeight: 500, // font-medium equivalent
    transition: 'background-color 0.2s',
    border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.6)' : '1px solid rgba(229, 231, 235, 0.9)',
  };

  const hoverStyle = {
    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(229, 231, 235, 0.9)',
  };

  const activeStyle = {
    backgroundColor: currentTheme.primary,
    color: 'white',
  };

  // Function to determine if a filter or sort option is active
  const isActive = (option: string, type: 'filter' | 'sort') => {
    return (type === 'filter' && filterOption === option) || 
           (type === 'sort' && sortOption === option);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                style={{
                  ...buttonStyle,
                  background: currentTheme.light,
                  border: `1px solid ${currentTheme.medium}`,
                  color: isDarkMode ? 'white' : 'black',
                }}
                className="h-8 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48"
              style={{
                backgroundColor: isDarkMode ? '#374151' : 'white',
                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <DropdownMenuLabel 
                style={{ color: elementColors.text }}
              >
                Filter by
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setFilterOption('all')}
                  style={isActive('all', 'filter') ? 
                    { backgroundColor: currentTheme.primary, color: 'white' } : 
                    { color: elementColors.text }}
                >
                  All entries
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterOption('week')}
                  style={isActive('week', 'filter') ? 
                    { backgroundColor: currentTheme.primary, color: 'white' } : 
                    { color: elementColors.text }}
                >
                  This week
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterOption('month')}
                  style={isActive('month', 'filter') ? 
                    { backgroundColor: currentTheme.primary, color: 'white' } : 
                    { color: elementColors.text }}
                >
                  This month
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel 
                style={{ color: elementColors.text }}
              >
                Sort by
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setSortOption('newest')}
                  style={isActive('newest', 'sort') ? 
                    { backgroundColor: currentTheme.primary, color: 'white' } : 
                    { color: elementColors.text }}
                >
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption('oldest')}
                  style={isActive('oldest', 'sort') ? 
                    { backgroundColor: currentTheme.primary, color: 'white' } : 
                    { color: elementColors.text }}
                >
                  Oldest first
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button 
            style={{
              ...buttonStyle,
              background: currentTheme.light,
              border: `1px solid ${currentTheme.medium}`,
              color: isDarkMode ? 'white' : 'black',
              width: '2rem',
              height: '2rem',
              padding: '0',
              display: 'flex',
              justifyContent: 'center',
            }}
            className="shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={() => setEntriesView(entriesView === 'grid' ? 'compact' : 'grid')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
          
          <button 
            style={{
              ...buttonStyle,
              background: currentTheme.light,
              border: `1px solid ${currentTheme.medium}`,
              color: isDarkMode ? 'white' : 'black',
            }}
            className="gap-1 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={handleViewAll}
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 
            className="h-8 w-8 animate-spin" 
            style={{ color: currentTheme.primary }}
          />
        </div>
      ) : error ? (
        <div 
          className="p-4 rounded-lg text-center"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(254, 226, 226, 1)',
            color: isDarkMode ? 'rgba(248, 113, 113, 1)' : 'rgba(185, 28, 28, 1)'
          }}
        >
          {error}
        </div>
      ) : journalEntries.length === 0 ? (
        <div 
          className="p-8 rounded-lg text-center"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.7)',
          }}
        >
          <p style={{ color: isDarkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)' }}>
            No journal entries yet. Start writing your first entry!
          </p>
          <button 
            onClick={() => router.push('/user/journal-entry')}
            className="mt-4 px-4 py-2 rounded-md font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: currentTheme.primary,
              color: 'white',
            }}
          >
            Create Entry
          </button>
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