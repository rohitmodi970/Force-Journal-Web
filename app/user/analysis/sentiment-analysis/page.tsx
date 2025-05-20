"use client";

import React, { useState, useEffect } from 'react';
import SentimentAnalysisDashboard from '@/components/Journal/JournalEntry/SentimentAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, BarChart2 } from "lucide-react";
import AnalysisHistory from "@/components/Journal/AnalysisHistory";

interface AnalysisHistoryEntry {
  id: string;
  date: string;
  title: string;
  summary: string;
  analysis: {
    sentiment_score: number;
    sentiment_label: string;
    primary_emotion?: string;
    secondary_emotions?: string[];
    topics?: string[];
    summary?: string;
  };
}

const SentimentAnalysis = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistoryEntry['analysis'] | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sentimentAnalysisHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save analysis to history
  const saveToHistory = (analysis: AnalysisHistoryEntry['analysis'], title: string, summary: string) => {
    const entry: AnalysisHistoryEntry = {
      id: `${title}-${Date.now()}`,
      date: new Date().toISOString(),
      title,
      summary,
      analysis
    };
    const updated = [entry, ...history].slice(0, 20); // keep last 20
    setHistory(updated);
    localStorage.setItem('sentimentAnalysisHistory', JSON.stringify(updated));
  };

  // Load a history entry as the current analysis
  const handleLoadHistory = (entry: AnalysisHistoryEntry) => {
    setCurrentAnalysis(entry.analysis);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          <SentimentAnalysisDashboard 
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
            type="sentiment"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SentimentAnalysis;
