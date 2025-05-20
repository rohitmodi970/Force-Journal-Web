import React, { useState, useRef, useEffect } from "react";
import JournalEditor from "./GalleryComponent/JournalEditor";
import JournalAnalysis from "./GalleryComponent/JournalAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/utilities/context/ThemeContext";
import { JournalEntry } from "./types";

interface JournalGalleryProps {
  entries: JournalEntry[];
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFormattedDisplayDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

const JournalGallery: React.FC<JournalGalleryProps> = ({ entries }) => {
  const { currentTheme, isDarkMode, elementColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateScrollerRef = useRef<HTMLDivElement>(null);
  
  // Generate dates for the date scroller (past 30 days and future 7 days)
  const generateDateRange = () => {
    const today = new Date();
    const dates = [];
    
    // Past 30 days
    for (let i = 30; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    // Today
    dates.push(today);
    
    // Future 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dateRange = generateDateRange();
  
  // Group entries by date for easy lookup
  const entriesByDate: Record<string, JournalEntry[]> = {};
  
  entries.forEach(entry => {
    const { date } = entry;
    if (!entriesByDate[date]) {
      entriesByDate[date] = [];
    }
    entriesByDate[date].push(entry);
  });

  // Scroll to selected date when component mounts or selected date changes
  useEffect(() => {
    if (dateScrollerRef.current) {
      const selectedDateIndex = dateRange.findIndex(date => 
        formatDate(date) === formatDate(selectedDate)
      );
      
      if (selectedDateIndex !== -1) {
        const scrollElement = dateScrollerRef.current.children[selectedDateIndex] as HTMLElement;
        dateScrollerRef.current.scrollLeft = scrollElement.offsetLeft - 100; // Center it with some offset
      }
    }
  }, [selectedDate, dateRange]);
  
  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next'): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const hasEntries = (date: Date): boolean => {
    const formatted = formatDate(date);
    return entriesByDate[formatted] && entriesByDate[formatted].length > 0;
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Dynamic styles based on theme
  const containerStyle = {
    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
    borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
    color: elementColors.text
  };

  const secondaryContainerStyle = {
    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
    borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
  };

  const getDateButtonClass = (date: Date) => {
    const isSelected = formatDate(date) === formatDate(selectedDate);
    const hasJournalEntries = hasEntries(date);
    
    let className = "flex flex-col items-center p-2 rounded-lg min-w-16 mx-1 transition-colors ";
    
    if (isSelected) {
      className += "border-2 ";
    } else {
      className += "border ";
    }
    
    return className;
  };

  const getDateButtonStyle = (date: Date) => {
    const isSelected = formatDate(date) === formatDate(selectedDate);
    const hasJournalEntries = hasEntries(date);
    const _isToday = isToday(date);
    
    // Base style
    const style: React.CSSProperties = {
      borderColor: isSelected ? currentTheme.primary : (isDarkMode ? '#4A5568' : '#E2E8F0'),
      color: elementColors.text
    };
    
    // Background color
    if (isSelected) {
      style.backgroundColor = isDarkMode ? `${currentTheme.active}30` : `${currentTheme.light}`;
    } else if (hasJournalEntries) {
      style.backgroundColor = isDarkMode ? `${currentTheme.active}15` : `${currentTheme.light}40`;
    } else {
      style.backgroundColor = isDarkMode ? '#374151' : '#F8FAFC';
    }
    
    // Today indicator
    if (_isToday && !isSelected) {
      style.borderColor = currentTheme.primary;
    }
    
    return style;
  };

  // Handle refresh entries after saving
  const handleEntrySave = (newEntry: boolean): void => {
    // Here you would typically refresh the entries from the parent component
    console.log("Entry saved, refreshing entries...", newEntry ? "New entry created" : "Entry updated");
  };

  return (
    <div className="max-w-5xl mx-auto transition-colors" style={{ color: elementColors.text }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">My Journal</h1>
        <div className="flex gap-2">
          <span 
            className="text-sm px-3 py-1 rounded-full transition-colors"
            style={{ 
              backgroundColor: isDarkMode ? `${currentTheme.active}30` : `${currentTheme.light}`, 
              color: currentTheme.primary 
            }}
          >
            Personal
          </span>
        </div>
      </div>
      
      {/* Centralized Date Navigation */}
      <div 
        className="rounded-xl shadow-sm border p-4 mb-6 transition-colors"
        style={containerStyle}
      >
        {/* Date navigation controls */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateDay('prev')}
            className="p-2 rounded-full hover:opacity-80 flex items-center justify-center transition-colors"
            aria-label="Previous day"
            style={{ color: elementColors.text }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-medium" style={{ color: elementColors.text }}>
            {getFormattedDisplayDate(selectedDate)}
          </h2>
          
          <button 
            onClick={() => navigateDay('next')}
            className="p-2 rounded-full hover:opacity-80 flex items-center justify-center transition-colors"
            aria-label="Next day"
            style={{ color: elementColors.text }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Horizontal date scroller */}
        <div className="relative">
          <div 
            ref={dateScrollerRef}
            className="flex overflow-x-auto py-2 scrollbar-thin"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarColor: `${currentTheme.medium} ${isDarkMode ? '#4A5568' : '#F1F5F9'}`
            }}
          >
            {dateRange.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(new Date(date))}
                className={getDateButtonClass(date)}
                style={getDateButtonStyle(date)}
              >
                <span 
                  className="text-xs opacity-75"
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-semibold">
                  {date.getDate()}
                </span>
                {hasEntries(date) && (
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: currentTheme.primary }}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="write" className="w-full">
          <TabsList 
            className="mb-4 w-full max-w-md"
            //@ts-ignore
            style={{ 
              backgroundColor: isDarkMode ? '#374151' : '#F1F5F9',
            }}
          >
            <TabsTrigger 
              value="write" 
              className="flex-1 data-[state=active]:text-white"
              //@ts-ignore
              style={{ 
                color: elementColors.text,
                backgroundColor: 'transparent',
                ['--tab-accent' as any]: currentTheme.primary 
              }}
            >
              Write Journal
            </TabsTrigger>
            <TabsTrigger 
              value="analyze" 
              className="flex-1 data-[state=active]:text-white"
              //@ts-ignore
              style={{ 
                color: elementColors.text,
                backgroundColor: 'transparent', 
                ['--tab-accent' as any]: currentTheme.primary 
              }}
            >
              Analyze
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <JournalEditor 
                selectedDate={selectedDate}
                entries={entries}
                onSave={handleEntrySave}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div 
                  className="rounded-xl shadow-sm border p-6 transition-colors"
                  style={containerStyle}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ color: elementColors.text }}>Recent Insights</h3>
                  
                  <div className="space-y-4">
                    <div 
                      className="p-4 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#F8FAFC',
                        color: elementColors.text
                      }}
                    >
                      <p>
                        {entries.length > 0 ? 
                          "Your journals this week show a pattern of increased anxiety around work-related topics. Try incorporating some mindfulness practices into your daily routine." :
                          "Start journaling to see insights about your writing patterns and mood trends."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className="rounded-lg p-4 transition-colors"
                        style={{ 
                          backgroundColor: isDarkMode ? `${currentTheme.active}30` : `${currentTheme.light}`,
                          color: currentTheme.primary
                        }}
                      >
                        <div className="text-3xl font-bold">25%</div>
                        <div className="text-sm">anxiety</div>
                      </div>
                      <div 
                        className="rounded-lg p-4 transition-colors"
                        style={{ 
                          backgroundColor: isDarkMode ? 'rgba(217, 119, 6, 0.2)' : 'rgba(251, 191, 36, 0.1)',
                          color: isDarkMode ? 'rgb(245, 158, 11)' : 'rgb(180, 83, 9)'
                        }}
                      >
                        <div className="text-3xl font-bold">18%</div>
                        <div className="text-sm">excitement</div>
                      </div>
                      <div 
                        className="rounded-lg p-4 transition-colors"
                        style={{ 
                          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: isDarkMode ? 'rgb(5, 150, 105)' : 'rgb(4, 120, 87)'
                        }}
                      >
                        <div className="text-3xl font-bold">12%</div>
                        <div className="text-sm">gratitude</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div 
                  className="rounded-xl shadow-sm border p-6 h-full transition-colors"
                  style={containerStyle}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ color: elementColors.text }}>Journal Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total entries</span>
                      <span className="font-medium">{entries.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Streak</span>
                      <span className="font-medium">3 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average length</span>
                      <span className="font-medium">250 words</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm opacity-75">
                        Keep writing consistently to see more detailed analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JournalGallery;