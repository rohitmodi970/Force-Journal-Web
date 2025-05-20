import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

// Define analysis types for each analysis type
interface AdvancedAnalysis {
  keywords: string[];
  metrics: { energy: number; productivity: number }[];
  moodInfluencers: { influencer: string; impact: number }[];
  emotionDistribution: Record<string, number>[];
  topicHierarchy: string[];
  flowData: {
    nodes: Array<{
      id: string;
      label: string;
      type: 'emotion' | 'factor';
      data: { category: 'positive' | 'negative' | 'external' | 'internal' };
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label: string;
    }>;
  };
  healthMetrics: { sentiment: number; physicalWellness: number; mentalResilience: number }[];
  progressMetrics: { health: number; resilience: number; academic: number; research: number };
  happinessSources: Array<{ source: string; strength: number; moments: string[]; quote: string; color: string }>;
  tenseUsage: { present: number; past: number; future: number };
  wordChoiceCategories: Array<{ category: string; percentage: number }>;
  healthWellnessInsight: string;
}

interface SentimentAnalysis {
  sentiment_score: number;
  sentiment_label: string;
  primary_emotion?: string;
  secondary_emotions?: string[];
  topics?: string[];
  summary?: string;
}

interface EntriesAnalysis {
  entryId: string;
  sentiment_score: number;
  sentiment_label: string;
  primary_emotion: string | null;
  secondary_emotions: string[];
  key_phrases: string[];
}

type AnalysisType = {
  advanced: AdvancedAnalysis;
  sentiment: SentimentAnalysis;
  entries: EntriesAnalysis;
};

interface AnalysisHistoryEntry<T extends keyof AnalysisType = keyof AnalysisType> {
  id: string;
  date: string;
  title: string;
  summary: string;
  analysis: AnalysisType[T];
}

interface AnalysisHistoryProps {
  history: AnalysisHistoryEntry[];
  onLoadHistory: (entry: AnalysisHistoryEntry) => void;
  type: keyof AnalysisType;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, onLoadHistory, type }) => {
  const getHistoryTitle = () => {
    switch (type) {
      case 'advanced':
        return 'Advanced Analysis History';
      case 'sentiment':
        return 'Sentiment Analysis History';
      case 'entries':
        return 'Entries Analysis History';
      default:
        return 'Analysis History';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5" />
          {getHistoryTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-gray-500">No previous analyses found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.map((entry) => (
              <li key={entry.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <div className="font-semibold text-blue-700">{entry.title}</div>
                  <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</div>
                  <div className="text-sm text-gray-700 mt-1 line-clamp-2">{entry.summary}</div>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-blue-700 transition w-32 flex-shrink-0"
                  onClick={() => onLoadHistory(entry)}
                >
                  Load Analysis
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory; 