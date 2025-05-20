import React, { useState, useRef, useEffect } from "react";
import JournalEditor from "./GalleryComponent/JournalEditor";
import JournalAnalysis from "./GalleryComponent/JournalAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Image } from "lucide-react";
import { JournalEntry } from "./types";

interface JournalGalleryProps {
  entries: JournalEntry[];
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFormattedDisplayDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

const JournalGallery: React.FC<JournalGalleryProps> = ({ entries }) => {
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

  // Get media entries (entries with media attached)
  const mediaEntries = entries.filter(entry => 
    entry.mediaType && entry.mediaType.length > 0 && 
    (entry.mediaUrl.image.length > 0 || 
     entry.mediaUrl.audio.length > 0 || 
     entry.mediaUrl.video.length > 0)
  );

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
  }, [selectedDate]);
  
  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const hasEntries = (date: Date) => {
    const formatted = formatDate(date);
    return entriesByDate[formatted] && entriesByDate[formatted].length > 0;
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  const getDateButtonClass = (date: Date) => {
    const isSelected = formatDate(date) === formatDate(selectedDate);
    const hasJournalEntries = hasEntries(date);
    
    let className = "flex flex-col items-center p-2 rounded-lg min-w-16 mx-1 transition-colors ";
    
    if (isSelected) {
      className += "border-2 border-blue-600 bg-blue-100 ";
    } else {
      className += "border border-gray-200 ";
    }
    
    if (hasJournalEntries) {
      className += isSelected ? "" : "bg-blue-50 ";
    } else {
      className += isSelected ? "" : "bg-gray-50 ";
    }
    
    if (isToday(date)) {
      className += isSelected ? "" : "border-blue-300 font-medium ";
    }
    
    return className;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Journal</h1>
        <div className="flex gap-2">
          <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            Personal
          </span>
        </div>
      </div>
      
      {/* Centralized Date Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        {/* Date navigation controls */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateDay('prev')}
            className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-medium text-gray-800">
            {getFormattedDisplayDate(selectedDate)}
          </h2>
          
          <button 
            onClick={() => navigateDay('next')}
            className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Next day"
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
            className="flex overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ scrollBehavior: 'smooth' }}
          >
            {dateRange.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(new Date(date))}
                className={getDateButtonClass(date)}
              >
                <span className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-semibold">
                  {date.getDate()}
                </span>
                {hasEntries(date) && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="mb-4 w-full max-w-md">
            <TabsTrigger value="write" className="flex-1">Write Journal</TabsTrigger>
            <TabsTrigger value="analyze" className="flex-1">Analyze</TabsTrigger>
            <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <JournalEditor 
                selectedDate={selectedDate}
                entries={entries}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Insights</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        {entries.length > 0 ? 
                          "Your journals this week show a pattern of increased anxiety around work-related topics. Try incorporating some mindfulness practices into your daily routine." :
                          "Start journaling to see insights about your writing patterns and mood trends."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 text-blue-700 rounded-lg p-4">
                        <div className="text-3xl font-bold">25%</div>
                        <div className="text-sm">anxiety</div>
                      </div>
                      <div className="bg-amber-50 text-amber-700 rounded-lg p-4">
                        <div className="text-3xl font-bold">18%</div>
                        <div className="text-sm">excitement</div>
                      </div>
                      <div className="bg-green-50 text-green-700 rounded-lg p-4">
                        <div className="text-3xl font-bold">12%</div>
                        <div className="text-sm">gratitude</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                {/* <JournalAnalysis entries={entries} /> */}
                <JournalAnalysis  />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Media Library</h3>
              
              {mediaEntries.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      {mediaEntries.length} media items found across your journal entries
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaEntries.map((entry, index) => {
                      // Determine if it's an audio entry
                      const isAudio = entry.mediaType.includes('audio');
                      
                      return (
                        <div key={entry.journalId + index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {isAudio ? (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="text-white">♪</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600">Audio Recording</div>
                              </div>
                            ) : (
                              <Image className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm">
                                View
                              </button>
                            </div>
                          </div>
                          <div className="mt-1">
                            <p className="text-xs text-gray-500 truncate">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Media</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4">
                    <Camera className="h-16 w-16 text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-2">No media found in your journal entries</p>
                  <p className="text-gray-400 text-sm max-w-md text-center">
                    Add photos, audio recordings, or other media to your journal entries to see them here
                  </p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Your First Media
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JournalGallery;