"use client";

import React, { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout";
import { getAllJournalEntries } from "@/utilities/journal-data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/quilted-gallery/ui/card';
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Loader2, BarChart2, Book, ArrowRight } from "lucide-react";
import AnalysisCharts from "@/components/Journal/AnalysisCharts";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from '@/components/ui/button2';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/quilted-gallery/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/quilted-gallery/ui/tooltip';
import ThemeSidebar from '@/components/Navbar/ThemeSidebar';

// Define the JournalEntry type
export interface JournalEntry {
  journalId: string;
  title: string;
  content: string;
  date: string;
  userId?: string | number; // Allow both string and number types
  mediaUrl?: {
    image?: string[];
    audio?: string[];
  };
  tags?: string[];
  mood?: string | null;
  location?: string;
  weather?: string;
  isPrivate?: boolean;
}

// Define the AnalysisResult type
interface AnalysisResult {
  sentiment_score: number;
  sentiment_label: string;
  magnitude: number;
  confidence: number;
  probabilities: {
    positive: number;
    neutral: number;
    negative: number;
  };
  primary_emotion: string | null;
  secondary_emotions: string[];
  emotion_scores: Record<string, number>;
  key_phrases: string[];
}

// Define type for analyzed entries
interface AnalyzedEntry {
  title: string;
  date: string;
  analysis: AnalysisResult;
}

// Define theme context types
interface ThemeContextType {
  currentTheme: {
    primary: string;
    secondary?: string;
  } | {
    primary: string;
  };
  isDarkMode: boolean;
  elementColors: {
    accent: string;
    [key: string]: string;
  };
}

const AnalysisPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEntries, setProcessingEntries] = useState<Record<string, boolean>>({});

  // Theme context
  const { currentTheme, isDarkMode, elementColors } = useTheme() ;
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    async function loadJournalEntries() {
      try {
        setIsLoading(true);
        const fetchedEntries = await getAllJournalEntries();
        setEntries(fetchedEntries);
      } catch (err) {
        console.error('Failed to load journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadJournalEntries();
  }, []);

  const analyzeEntry = async (entry: JournalEntry): Promise<AnalysisResult | undefined> => {
    try {
      setProcessingEntries(prev => ({ ...prev, [entry.journalId]: true }));
      
      const formData = new FormData();
      formData.append("text", entry.content || "");
      
      // Add image if available
      if (entry.mediaUrl?.image?.[0]) {
        const imageResponse = await fetch(entry.mediaUrl.image[0]);
        const imageBlob = await imageResponse.blob();
        formData.append("image", imageBlob);
      }

      const response = await fetch("/api/sentiment/analyze-entry", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze sentiment");
      }

      const result = await response.json() as AnalysisResult;
      setAnalysisResults(prev => ({
        ...prev,
        [entry.journalId]: result
      }));

      return result;
    } catch (error) {
      console.error("Error analyzing entry:", error);
      throw error;
    } finally {
      setProcessingEntries(prev => ({ ...prev, [entry.journalId]: false }));
    }
  };

  const analyzeAllEntries = async (): Promise<void> => {
    try {
      const unanalyzedEntries = entries.filter(entry => !analysisResults[entry.journalId]);
      
      // Set all entries as processing
      const processing = unanalyzedEntries.reduce<Record<string, boolean>>((acc, entry) => {
        acc[entry.journalId] = true;
        return acc;
      }, {});
      
      setProcessingEntries(prev => ({ ...prev, ...processing }));
      
      // Analyze entries in batches of 3 to avoid overwhelming the API
      const batchSize = 3;
      for (let i = 0; i < unanalyzedEntries.length; i += batchSize) {
        const batch = unanalyzedEntries.slice(i, i + batchSize);
        await Promise.all(batch.map(entry => analyzeEntry(entry)));
      }
    } catch (error) {
      console.error("Error analyzing all entries:", error);
    }
  };

  const getSentimentColor = (sentiment: string | undefined): string => {
    if (!sentiment) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  const getEmotionCategory = (emotion: string): string => {
    const joyEmotions = ['joy', 'happiness', 'excitement', 'gratitude', 'love', 'contentment'];
    const angerEmotions = ['anger', 'frustration', 'irritation', 'rage', 'annoyance'];
    const sadnessEmotions = ['sadness', 'grief', 'disappointment', 'melancholy', 'despair'];
    const fearEmotions = ['fear', 'anxiety', 'worry', 'nervousness', 'dread'];
    const surpriseEmotions = ['surprise', 'astonishment', 'amazement', 'shock'];
    
    const lowerEmotion = emotion.toLowerCase();
    
    if (joyEmotions.includes(lowerEmotion)) return 'joy';
    if (angerEmotions.includes(lowerEmotion)) return 'anger';
    if (sadnessEmotions.includes(lowerEmotion)) return 'sadness';
    if (fearEmotions.includes(lowerEmotion)) return 'fear';
    if (surpriseEmotions.includes(lowerEmotion)) return 'surprise';
    
    return 'other';
  };
  
  const getEmotionColor = (emotion: string): string => {
    const category = getEmotionCategory(emotion);
    
    switch (category) {
      case 'joy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'anger':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'sadness':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'fear':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'surprise':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Calculate sentiment statistics
  const sentimentCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    const result = analysisResults[entry.journalId];
    if (!result?.sentiment_label) return acc;
    
    acc[result.sentiment_label] = (acc[result.sentiment_label] || 0) + 1;
    return acc;
  }, {});

  // Calculate emotion statistics
  const emotionCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    const result = analysisResults[entry.journalId];
    if (!result?.primary_emotion) return acc;
    
    acc[result.primary_emotion] = (acc[result.primary_emotion] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for charts
  const analyzedEntries: AnalyzedEntry[] = entries
    .filter(entry => analysisResults[entry.journalId] && analysisResults[entry.journalId].sentiment_score !== undefined)
    .map(entry => ({
      title: entry.title,
      date: entry.date,
      analysis: analysisResults[entry.journalId],
    }));

  const analysisCount = Object.keys(analysisResults).length;
  const totalEntries = entries.length;
  const completionPercentage = totalEntries > 0 ? Math.round((analysisCount / totalEntries) * 100) : 0;

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1F2937' : '#F7F9FC',
    color: isDarkMode ? '#F9FAFB' : '#111827',
  };

  const accentStyle: React.CSSProperties = {
    backgroundColor: elementColors.accent,
  };

  const primaryStyle: React.CSSProperties = {
    backgroundColor: currentTheme.primary,
    color: '#FFFFFF',
  };

  return (
    <div className="flex" style={backgroundStyle}>
      <ThemeSidebar />
      <div className="flex-1">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold font-journal mb-2" style={{ color: currentTheme.primary }}>
                  Journal Analysis
                </h1>
                <p className="text-muted-foreground font-handwriting text-xl">
                  Insights and sentiment analysis of your journal entries
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <Button
                  onClick={analyzeAllEntries}
                  disabled={entries.length === Object.keys(analysisResults).length}
                  className="flex items-center gap-2"
                  style={primaryStyle}
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze All Entries
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/user/journal/analysis/advanced">
                    Advanced Analysis
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="shadow-md">
                      <CardHeader>
                        <Skeleton className="h-6 w-36 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card className="shadow-md">
                  <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <p className="text-red-500">{error}</p>
                    <Button 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                      style={primaryStyle}
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        Journal Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{totalEntries}</p>
                          <p className="text-sm text-muted-foreground">Total Entries</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analysisCount}</p>
                          <p className="text-sm text-muted-foreground">Analyzed</p>
                        </div>
                        <div>
                          <div className="relative w-16 h-16">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-lg font-bold">{completionPercentage}%</p>
                            </div>
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                className="text-gray-200 dark:text-gray-700"
                                cx="50"
                                cy="50"
                                r="40"
                                strokeWidth="10"
                                fill="transparent"
                                stroke="currentColor"
                              />
                              <circle
                                style={{ stroke: currentTheme.primary }}
                                cx="50"
                                cy="50"
                                r="40"
                                strokeWidth="10"
                                fill="transparent"
                                stroke="currentColor"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Sentiment Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                          <Badge key={sentiment} className={getSentimentColor(sentiment)}>
                            {sentiment}: {count}
                          </Badge>
                        ))}
                        {Object.keys(sentimentCounts).length === 0 && (
                          <p className="text-sm text-muted-foreground">No sentiment data available yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Emotion Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(emotionCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([emotion, count]) => (
                            <Badge key={emotion} className={getEmotionColor(emotion)}>
                              {emotion}: {count}
                            </Badge>
                          ))}
                        {Object.keys(emotionCounts).length === 0 && (
                          <p className="text-sm text-muted-foreground">No emotion data available yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                {analyzedEntries.length > 0 && (
                  <Card className="shadow-md mb-8">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Sentiment & Emotion Analysis Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnalysisCharts entries={analyzedEntries} />
                    </CardContent>
                  </Card>
                )}

                {/* Tabs for different views */}
                <Tabs defaultValue="grid" className="mt-8">
                  <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>

                  {/* Grid View */}
                  <TabsContent value="grid">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedEntries.map((entry) => (
                        <Card key={entry.journalId} className="shadow-md overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-journal">
                              {entry.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {analysisResults[entry.journalId] ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Badge className={getSentimentColor(analysisResults[entry.journalId].sentiment_label)}>
                                    {analysisResults[entry.journalId].sentiment_label}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Score: {analysisResults[entry.journalId].sentiment_score?.toFixed(2) ?? 'N/A'}
                                  </span>
                                </div>
                                {analysisResults[entry.journalId].primary_emotion && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Primary Emotion</h4>
                                    <Badge className={getEmotionColor(analysisResults[entry.journalId].primary_emotion || '')}>
                                      {analysisResults[entry.journalId].primary_emotion}
                                    </Badge>
                                  </div>
                                )}
                                {analysisResults[entry.journalId].secondary_emotions && analysisResults[entry.journalId].secondary_emotions.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Secondary Emotions</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {analysisResults[entry.journalId].secondary_emotions.slice(0, 3).map((emotion: string, index: number) => (
                                        <Badge key={index} className={getEmotionColor(emotion)}>
                                          {emotion}
                                        </Badge>
                                      ))}
                                      {analysisResults[entry.journalId].secondary_emotions.length > 3 && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Badge variant="outline">
                                                +{analysisResults[entry.journalId].secondary_emotions.length - 3} more
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="p-2">
                                                {analysisResults[entry.journalId].secondary_emotions.slice(3).join(', ')}
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {analysisResults[entry.journalId].key_phrases && analysisResults[entry.journalId].key_phrases.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Key Phrases</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {analysisResults[entry.journalId].key_phrases.slice(0, 3).map((phrase: string, index: number) => (
                                        <Badge key={index} variant="outline">
                                          {phrase}
                                        </Badge>
                                      ))}
                                      {analysisResults[entry.journalId].key_phrases.length > 3 && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Badge variant="outline">
                                                +{analysisResults[entry.journalId].key_phrases.length - 3} more
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="p-2">
                                                {analysisResults[entry.journalId].key_phrases.slice(3).join(', ')}
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Button
                                onClick={() => analyzeEntry(entry)}
                                disabled={!!processingEntries[entry.journalId]}
                                className="w-full py-2 px-4 rounded-md flex items-center justify-center gap-2"
                                style={primaryStyle}
                              >
                                {processingEntries[entry.journalId] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4" />
                                    Analyze Entry
                                  </>
                                )}
                              </Button>
                            )}
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs" 
                              asChild
                            >
                              <a href={`/user/journal/${entry.journalId}`}>
                                View Entry
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* List View */}
                  <TabsContent value="list">
                    <div className="space-y-4">
                      {sortedEntries.map((entry) => (
                        <Card key={entry.journalId} className="shadow-md">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-4 md:w-2/3">
                              <h3 className="text-xl font-journal font-bold">
                                {entry.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-2 text-sm line-clamp-2">
                                {entry.content}
                              </p>
                              <div className="mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs" 
                                  asChild
                                >
                                  <a href={`/user/journal/entry/${entry.journalId}`}>
                                    View Entry
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <div className="p-4 md:w-1/3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
                              {analysisResults[entry.journalId] ? (
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={getSentimentColor(analysisResults[entry.journalId].sentiment_label)}>
                                        {analysisResults[entry.journalId].sentiment_label}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        Score: {analysisResults[entry.journalId].sentiment_score?.toFixed(2) ?? 'N/A'}
                                      </span>
                                    </div>
                                    {analysisResults[entry.journalId].primary_emotion && (
                                      <Badge className={getEmotionColor(analysisResults[entry.journalId].primary_emotion || '')}>
                                        {analysisResults[entry.journalId].primary_emotion}
                                      </Badge>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-medium mb-1">Key Phrases</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {analysisResults[entry.journalId].key_phrases?.slice(0, 2).map((phrase: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {phrase}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => analyzeEntry(entry)}
                                  disabled={!!processingEntries[entry.journalId]}
                                  className="w-full py-2 px-4 rounded-md flex items-center justify-center gap-2"
                                  style={primaryStyle}
                                >
                                  {processingEntries[entry.journalId] ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Analyzing...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-4 w-4" />
                                      Analyze Entry
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Empty state */}
                {entries.length === 0 && (
                  <Card className="shadow-md">
                    <CardContent className="p-6 text-center">
                      <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-bold mb-2">No Journal Entries Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start writing in your journal to see analysis and insights.
                      </p>
                      <Button asChild style={primaryStyle}>
                        <a href="/user/journal-entry">
                          Create Your First Entry
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
};

export default AnalysisPage;