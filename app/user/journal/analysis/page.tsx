// app/journal/analysis/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Layout from "@/components/layout/Layout";
import { getAllJournalEntries } from "@/utilities/journal-data";
import { JournalEntry } from "@/components/Journal/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar } from "lucide-react";
import AnalysisCharts from "@/components/Journal/AnalysisCharts";
// import SideNavbar from "@/components/Navbar/SideNavbar";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

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

const AnalysisPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SideNavbar context
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  // // SideNavbar menu items (copied from main UI)
  // const sideNavMenuItems = useMemo(() => [
  //   {
  //     name: 'Home',
  //     href: session ? '/user/dashboard' : '/',
  //     icon: 'HiHome',
  //   },
  //   {
  //     name: 'Journals',
  //     href: '/user/journal',
  //     icon: 'GiNotebook',
  //     subItems: [
  //       {
  //         name: 'New Entry',
  //         href: '/user/journal-entry/',
  //         icon: 'HiPencilAlt',
  //       },
  //       {
  //         name: 'Analysis',
  //         href: '/user/journal/analysis',
  //         icon: 'HiChartBar',
  //       },
  //       {
  //         name: 'Journal Gallery',
  //         href: '/user/journal/journal-gallery',
  //         icon: 'HiPhotograph',
  //       },
  //       {
  //         name: 'Quilted Gallery',
  //         href: '/user/journal/quilted-gallery',
  //         icon: 'HiViewGrid',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Profile',
  //     href: '/user/profile',
  //     icon: 'HiUser',
  //     subItems: [
  //       {
  //         name: 'Profile Settings',
  //         href: '/user/profile',
  //         icon: 'HiUser',
  //       },
  //       {
  //         name: 'Preferences',
  //         href: '/user/settings',
  //         icon: 'HiCog',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'AI Tools',
  //     href: '/user/ai-tools',
  //     icon: 'HiOutlineChip',
  //   },
  // ], [session]);

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

  const analyzeEntry = async (entry: JournalEntry) => {
    try {
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

      const result = await response.json();
      setAnalysisResults(prev => ({
        ...prev,
        [entry.journalId]: result
      }));

      return result;
    } catch (error) {
      console.error("Error analyzing entry:", error);
      throw error;
    }
  };

  const getSentimentColor = (sentiment: string | undefined) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Prepare data for charts
  const analyzedEntries = entries
    .filter(entry => analysisResults[entry.journalId] && analysisResults[entry.journalId].sentiment_score !== undefined)
    .map(entry => ({
      title: entry.title,
      date: entry.date,
      analysis: analysisResults[entry.journalId],
    }));

  return (
    <div className="flex">
      {/* <SideNavbar
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
        pathname={pathname}
        menuItems={sideNavMenuItems}
      /> */}
      <div className="flex-1">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-journal mb-2">Journal Analysis</h1>
              <p className="text-muted-foreground font-handwriting text-xl">
                Insights and sentiment analysis of your journal entries
              </p>
              <div className="mt-4">
                <a
                  href="/user/journal/analysis/advanced"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold shadow"
                >
                  Go to Advanced Analysis
                </a>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading your journal entries...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <>
                {/* Charts Section */}
                {analyzedEntries.length > 0 && (
                  <AnalysisCharts entries={analyzedEntries} />
                )}

                {/* Individual Entries Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {entries.map((entry) => (
                    <Card key={entry.journalId} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-journal">{entry.title}</CardTitle>
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
                                <Badge variant="secondary" className="text-xs">
                                  {analysisResults[entry.journalId].primary_emotion}
                                </Badge>
                              </div>
                            )}
                            {analysisResults[entry.journalId].secondary_emotions && analysisResults[entry.journalId].secondary_emotions.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Secondary Emotions</h4>
                                <div className="flex flex-wrap gap-2">
                                  {analysisResults[entry.journalId].secondary_emotions.map((emotion: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {emotion}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {analysisResults[entry.journalId].key_phrases && analysisResults[entry.journalId].key_phrases.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Key Phrases</h4>
                                <div className="flex flex-wrap gap-2">
                                  {analysisResults[entry.journalId].key_phrases.map((phrase: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {phrase}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => analyzeEntry(entry)}
                            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                          >
                            <Sparkles className="h-4 w-4" />
                            Analyze Entry
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
};

export default AnalysisPage;