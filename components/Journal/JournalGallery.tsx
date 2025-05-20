import React, { useState, useRef, useEffect, useCallback } from "react";
import JournalEditor from "./GalleryComponent/JournalEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/quilted-gallery/ui/tabs";
import { useTheme } from "@/utilities/context/ThemeContext";
import { JournalEntry } from "./types";
import JournalCalendar from "./JournalCalendar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

interface JournalGalleryProps {
  entries: JournalEntry[];
}

interface Emotion {
  emotion: string;
  frequency: number;
  intensity: number;
}
interface MoodPattern {
  pattern: string;
  significance: string;
  recommendation: string;
}
interface Topic {
  topic: string;
  frequency?: number;
  context?: string[];
  sentiment?: number;
}
interface KeyInsight {
  insight: string;
  evidence?: string[];
  significance?: string;
}
interface SentimentAnalysisResults {
  overallSentiment?: { label: string; score: number; confidence: number };
  emotionalPatterns?: {
    primaryEmotions?: Emotion[];
    secondaryEmotions?: Emotion[];
  };
  insights?: {
    moodPatterns?: MoodPattern[];
  };
  sentimentTrends?: { date: string; sentiment: number }[];
}
interface TextualAnalysisResults {
  topics?: Topic[];
  keyInsights?: KeyInsight[];
}
interface AnalysisResults extends SentimentAnalysisResults, TextualAnalysisResults {
  error?: string;
}

// Add a type for history entries
interface AnalysisHistoryEntry {
  id: string;
  date: string;
  type: 'sentiment' | 'textual';
  range: string;
  results: AnalysisResults;
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

// Add a custom useLocalStorage hook:
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key]);

  return [storedValue, setValue];
}

const JournalGallery: React.FC<JournalGalleryProps> = ({ entries }) => {
  const { currentTheme, isDarkMode, elementColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateScrollerRef = useRef<HTMLDivElement>(null);
  const [analysisDateRange, setAnalysisDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    selectedDates: Date[];
  }>({
    startDate: null,
    endDate: null,
    selectedDates: []
  });
  const [analysisType, setAnalysisType] = useState<'sentiment' | 'textual'>('sentiment');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tab, setTab] = useState<'analyze' | 'history'>('analyze');
  const [history, setHistory] = useLocalStorage<AnalysisHistoryEntry[]>(
    'journal-analysis-history',
    []
  );
  
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

  // Handle calendar analysis date selection
  const handleAnalyzeDates = async (
    startDate: Date,
    endDate: Date | null,
    selectedDates: Date[],
    type: 'sentiment' | 'textual'
  ) => {
    setAnalysisType(type);
    setAnalysisDateRange({ startDate, endDate, selectedDates });
    setIsAnalyzing(true);
    setAnalysisResults(null);
    // Filter entries by selected dates
    let filteredEntries: JournalEntry[] = [];
    if (selectedDates.length > 0) {
      const selectedStrs = selectedDates.map(d => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      });
      filteredEntries = entries.filter(e => selectedStrs.includes(e.date));
    } else if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;
      filteredEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }
    if (filteredEntries.length === 0) {
      setAnalysisResults({ error: 'No entries found in the selected date(s).' });
      setIsAnalyzing(false);
      return;
    }
    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: filteredEntries,
          analysisType: type,
          dateRange: {
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
          },
        }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAnalysisResults(data.data);
    } catch {
      setAnalysisResults({ error: 'Failed to analyze entries.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to save current analysis to history
  const saveAnalysisToHistory = () => {
    if (!analysisResults || isAnalyzing) return;
    const range = (() => {
      if (analysisDateRange.selectedDates && analysisDateRange.selectedDates.length > 0) {
        return analysisDateRange.selectedDates.map(d => d.toLocaleDateString()).join(' - ');
      }
      if (analysisDateRange.startDate && analysisDateRange.startDate.getTime() !== 0) {
        return `${analysisDateRange.startDate.toLocaleDateString()}${analysisDateRange.endDate ? ` to ${analysisDateRange.endDate.toLocaleDateString()}` : ''}`;
      }
      return 'Recent';
    })();
    setHistory([
      {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        type: analysisType,
        range,
        results: analysisResults,
      },
      ...history,
    ]);
  };

  // Function to load a history entry
  const loadHistoryEntry = (entry: AnalysisHistoryEntry) => {
    setAnalysisType(entry.type);
    setAnalysisResults(entry.results);
    // Optionally set the date range UI
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
            //@ts-expect-error shadcn TabsTrigger style prop: style is not in shadcn TabsTrigger types
            style={{ 
              backgroundColor: isDarkMode ? '#374151' : '#F1F5F9',
            }}
          >
            <TabsTrigger 
              value="write" 
              className="flex-1 data-[state=active]:text-white"
              //@ts-expect-error shadcn TabsTrigger style prop: style is not in shadcn TabsTrigger types
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
              //@ts-expect-error shadcn TabsTrigger style prop: style is not in shadcn TabsTrigger types
              style={{ 
                color: elementColors.text,
                backgroundColor: 'transparent', 
                ['--tab-accent' as any]: currentTheme.primary 
              }}
            >
              Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 data-[state=active]:text-white" onClick={() => setTab('history')}>History</TabsTrigger>
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
                  <h3 className="text-lg font-medium mb-4" style={{ color: elementColors.text }}>
                    {(() => {
                      // If selectedDates are used (multiple mode)
                      if (analysisDateRange.selectedDates && analysisDateRange.selectedDates.length > 0) {
                        return `Analysis for ${analysisDateRange.selectedDates.map(d => d.toLocaleDateString()).join(' - ')}`;
                      }
                      // If a valid range is used (range mode)
                      if (
                        analysisDateRange.startDate &&
                        analysisDateRange.startDate.getTime() !== 0 // not epoch
                      ) {
                        return `Analysis for ${analysisDateRange.startDate.toLocaleDateString()}${analysisDateRange.endDate ? ` to ${analysisDateRange.endDate.toLocaleDateString()}` : ''}`;
                      }
                      // Fallback
                      return "Recent Insights";
                    })()}
                  </h3>
                  <div className="space-y-4">
                    {isAnalyzing ? (
                      <div className="p-4 rounded-lg text-center" style={{ backgroundColor: isDarkMode ? '#374151' : '#F8FAFC', color: elementColors.text }}>
                        <p>Analyzing your journal entries...</p>
                      </div>
                    ) : analysisResults && !analysisResults.error ? (
                      <div className="p-4 rounded-lg transition-colors" style={{ backgroundColor: isDarkMode ? '#374151' : '#F8FAFC', color: elementColors.text }}>
                        {analysisType === 'sentiment' ? (
                          <>
                            <h4 className="font-semibold mb-2">Sentiment Analysis</h4>
                            {/* Sentiment Trend Chart */}
                            {analysisResults.sentimentTrends && Array.isArray(analysisResults.sentimentTrends) && analysisResults.sentimentTrends.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium mb-1">Sentiment Trend</h5>
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={analysisResults.sentimentTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[-1, 1]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="sentiment" stroke="#8884d8" name="Sentiment" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            {/* Emotions Bar Chart */}
                            {analysisResults.emotionalPatterns && analysisResults.emotionalPatterns.primaryEmotions && analysisResults.emotionalPatterns.primaryEmotions.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium mb-1">Primary Emotions</h5>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={analysisResults.emotionalPatterns.primaryEmotions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="emotion" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="frequency" fill="#82ca9d" name="Frequency" />
                                    <Bar dataKey="intensity" fill="#8884d8" name="Intensity" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            {analysisResults.overallSentiment && (
                              <div className="mb-2">
                                <div><strong>Overall Sentiment:</strong> {analysisResults.overallSentiment.label} ({analysisResults.overallSentiment.score})</div>
                                <div><strong>Confidence:</strong> {Math.round(analysisResults.overallSentiment.confidence * 100)}%</div>
                              </div>
                            )}
                            {analysisResults.emotionalPatterns && analysisResults.emotionalPatterns.secondaryEmotions && (
                              <div className="mb-2">
                                <div className="font-medium">Secondary Emotions:</div>
                                <ul className="list-disc pl-5">
                                  {analysisResults.emotionalPatterns.secondaryEmotions.map((em: Emotion, idx: number) => (
                                    <li key={idx}>{em.emotion} (Frequency: {em.frequency}, Intensity: {em.intensity})</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {analysisResults.insights && analysisResults.insights.moodPatterns && (
                              <div className="mb-2">
                                <div className="font-medium">Mood Patterns:</div>
                                <ul className="list-disc pl-5">
                                  {analysisResults.insights.moodPatterns.map((mp: MoodPattern, idx: number) => (
                                    <li key={idx}>{mp.pattern} - {mp.significance} <br/> <span className="text-xs">{mp.recommendation}</span></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold mb-2">Textual Analysis</h4>
                            {/* Topic Frequency Bar Chart */}
                            {analysisResults.topics && Array.isArray(analysisResults.topics) && analysisResults.topics.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium mb-1">Topic Frequencies</h5>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={analysisResults.topics}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="topic" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            {analysisResults.topics && Array.isArray(analysisResults.topics) && (
                              <div className="mt-2">
                                <h5 className="font-medium mb-1">Topics:</h5>
                                <ul className="list-disc pl-5">
                                  {analysisResults.topics.map((topic: Topic, idx: number) => (
                                    <li key={idx}>
                                      <strong>{topic.topic}</strong>
                                      {typeof topic.frequency !== 'undefined' && <> (Frequency: {topic.frequency})</>}
                                      {topic.context && Array.isArray(topic.context) && topic.context.length > 0 && (
                                        <div className="text-xs opacity-70">Context: {topic.context.join(', ')}</div>
                                      )}
                                      {typeof topic.sentiment !== 'undefined' && (
                                        <div className="text-xs opacity-70">Sentiment: {topic.sentiment}</div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {analysisResults.keyInsights && Array.isArray(analysisResults.keyInsights) && analysisResults.keyInsights.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium mb-1">Key Insights:</h5>
                                <ul className="list-disc pl-5">
                                  {analysisResults.keyInsights.map((insight: KeyInsight, idx: number) => (
                                    <li key={idx}>{insight.insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : analysisResults && analysisResults.error ? (
                      <div className="p-4 rounded-lg text-center text-red-500" style={{ backgroundColor: isDarkMode ? '#374151' : '#F8FAFC' }}>
                        <p>{analysisResults.error}</p>
                      </div>
                    ) : (
                      // Catchy CTA instead of hardcoded fallback
                      <div className="p-6 rounded-lg text-center bg-gradient-to-r from-blue-50 to-amber-50 border border-dashed border-blue-300 shadow-sm">
                        <h3 className="text-xl font-bold mb-2 text-blue-800">Discover Insights from Your Journals!</h3>
                        <p className="text-md text-blue-700 mb-2">Select a date range or specific dates and click <span className="font-semibold text-amber-700">Analyze Journal Entries</span> to unlock trends, emotions, and patterns in your writing. Visualize your growth and get personalized insights instantly!</p>
                        <p className="text-sm text-gray-500">Try it now and see your story in a whole new light.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                {/* Calendar Component Integration */}
                <JournalCalendar 
                  entries={entries}
                  onAnalyze={handleAnalyzeDates}
                />
                
                <div 
                  className="rounded-xl shadow-sm border p-6 mt-6 transition-colors"
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
            {analysisResults && !analysisResults.error && !isAnalyzing && (
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={saveAnalysisToHistory}
              >
                Save Analysis to History
              </button>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4">Analysis History</h3>
              {history.length === 0 ? (
                <div className="text-gray-500">No past analyses saved yet.</div>
              ) : (
                <ul className="space-y-4">
                  {history.map(entry => (
                    <li key={entry.id} className="border rounded p-3 hover:bg-blue-50 cursor-pointer" onClick={() => loadHistoryEntry(entry)}>
                      <div className="font-semibold">{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Analysis</div>
                      <div className="text-xs text-gray-500">{entry.range} • {entry.date}</div>
                      <div className="text-sm mt-1 truncate">
                        {entry.type === 'sentiment' && entry.results.overallSentiment ? (
                          <>Sentiment: <b>{entry.results.overallSentiment.label}</b> ({entry.results.overallSentiment.score})</>
                        ) : entry.type === 'textual' && entry.results.keyInsights && entry.results.keyInsights.length > 0 ? (
                          <>Insight: <b>{entry.results.keyInsights[0].insight}</b></>
                        ) : (
                          <>No summary available.</>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JournalGallery;