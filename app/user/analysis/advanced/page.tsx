// app\user\journal\analysis\advanced\page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout";
import { getAllJournalEntries } from "@/utilities/journal-data";
import { JournalEntry } from "@/components/Journal/types";
import AdvancedAnalysisDashboard from "@/components/Journal/Advanced/AdvancedAnalysisDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, BarChart2 } from "lucide-react";
import AnalysisHistory from "@/components/Journal/AnalysisHistory";

interface AnalysisHistoryEntry {
  id: string;
  date: string;
  title: string;
  summary: string;
  analysis: any; // Will be typed based on advanced analysis results
}

const AdvancedAnalysisPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('advancedAnalysisHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save analysis to history
  const saveToHistory = (analysis: any, title: string, summary: string) => {
    const entry: AnalysisHistoryEntry = {
      id: `${title}-${Date.now()}`,
      date: new Date().toISOString(),
      title,
      summary,
      analysis
    };
    const updated = [entry, ...history].slice(0, 20); // keep last 20
    setHistory(updated);
    localStorage.setItem('advancedAnalysisHistory', JSON.stringify(updated));
  };

  // Load a history entry as the current analysis
  const handleLoadHistory = (entry: AnalysisHistoryEntry) => {
    setCurrentAnalysis(entry.analysis);
  };

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

  return (
    <div className="flex">
      <div className="flex-1">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-journal mb-2">Advanced Journal Analysis</h1>
              <p className="text-muted-foreground font-handwriting text-xl">
                Deep insights and advanced analytics of your journal entries
              </p>
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
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analysis">
                  <AdvancedAnalysisDashboard 
                    entries={entries} 
                    onAnalysisComplete={(analysis, title, summary) => {
                      saveToHistory(analysis, title, summary);
                      setCurrentAnalysis(analysis);
                    }}
                    currentAnalysis={currentAnalysis}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <AnalysisHistory
                    history={history}
                    onLoadHistory={handleLoadHistory}
                    type="advanced"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
};

export default AdvancedAnalysisPage; 