import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Sparkles } from "lucide-react";

interface SuggestionData {
  moodTrends: {
    primaryMood: string;
    trend: string;
    intensity: number;
  };
  aiNudge: {
    theme: string;
    suggestion: string;
    action: string;
  };
  patternInsight: {
    pattern: string;
    exploration: string;
  };
}

interface AISuggestionsProps {
  suggestions: SuggestionData;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          AI Insights & Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Trends Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Mood Trends</h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your recent entries show a {suggestions.moodTrends.trend} trend of {suggestions.moodTrends.primaryMood.toLowerCase()}.
            {suggestions.moodTrends.intensity > 0.7 && " This emotion has been particularly strong in your writing."}
          </p>
        </div>

        {/* AI Nudge Section */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">Today's Suggestion</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              <span className="font-medium">Theme to explore:</span> {suggestions.aiNudge.theme}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              <span className="font-medium">Suggestion:</span> {suggestions.aiNudge.suggestion}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              <span className="font-medium">Try this:</span> {suggestions.aiNudge.action}
            </p>
          </div>
        </div>

        {/* Pattern Insight Section */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">Pattern Insight</h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            <span className="font-medium">Noticed pattern:</span> {suggestions.patternInsight.pattern}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            <span className="font-medium">Explore further:</span> {suggestions.patternInsight.exploration}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestions; 