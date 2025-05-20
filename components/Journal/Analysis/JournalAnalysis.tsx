import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SentimentAnalysisResults from './SentimentAnalysisResults';
import TextualAnalysisResults from './TextualAnalysisResults';
import { toast } from "sonner";
import { JournalEntry as GalleryJournalEntry } from "@/components/Journal/types";

// Use the same type as the gallery page
type JournalEntry = GalleryJournalEntry;

interface Props {
  entries: JournalEntry[];
}

type AnalysisType = 'sentiment' | 'textual';

// Define the analysis results type based on the analysis type
type AnalysisResults = {
  sentiment: {
    overallSentiment: {
      score: number;
      label: string;
      confidence: number;
    };
    emotionalPatterns: {
      primaryEmotions: Array<{
        emotion: string;
        frequency: number;
        intensity: number;
      }>;
      secondaryEmotions: Array<{
        emotion: string;
        frequency: number;
        intensity: number;
      }>;
    };
    sentimentTrends: Array<{
      date: string;
      sentiment: number;
      primaryEmotion: string;
      keyPhrases: string[];
    }>;
    insights: {
      emotionalTriggers: Array<{
        trigger: string;
        impact: number;
        frequency: number;
      }>;
      moodPatterns: Array<{
        pattern: string;
        significance: string;
        recommendation: string;
      }>;
    };
  };
  textual: {
    topics: Array<{
      topic: string;
      frequency: number;
      context: string[];
      sentiment: number;
    }>;
    writingPatterns: {
      vocabulary: {
        commonWords: string[];
        uniqueWords: string[];
        wordCategories: Array<{
          category: string;
          percentage: number;
        }>;
      };
      structure: {
        averageLength: number;
        paragraphPatterns: string[];
        temporalReferences: {
          present: number;
          past: number;
          future: number;
        };
      };
    };
    keyInsights: Array<{
      insight: string;
      evidence: string[];
      significance: string;
    }>;
    goalsAndProgress: Array<{
      goal: string;
      status: string;
      progress: number;
      milestones: string[];
    }>;
    recommendations: Array<{
      area: string;
      suggestion: string;
      rationale: string;
    }>;
  };
};

export default function JournalAnalysis({ entries }: Props) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [analysisType, setAnalysisType] = useState<AnalysisType>('sentiment');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults[keyof AnalysisResults] | null>(null);

  const handleAnalyze = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select a date range');
      return;
    }

    // Filter entries within date range
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= dateRange.from! && entryDate <= dateRange.to!;
    });

    if (filteredEntries.length === 0) {
      toast.error('No entries found in the selected date range');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: filteredEntries,
          analysisType,
          dateRange: {
            start: dateRange.from?.toISOString(),
            end: dateRange.to?.toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResults(data.data);
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze entries');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Journal Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Date Range Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          format(dateRange.from, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date: Date | undefined) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? (
                          format(dateRange.to, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date: Date | undefined) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Analysis Type Selection */}
              <div className="space-y-2">
                <Label>Analysis Type</Label>
                <RadioGroup
                  value={analysisType}
                  onValueChange={(value: string) => setAnalysisType(value as AnalysisType)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sentiment" id="sentiment" />
                    <Label htmlFor="sentiment">Sentiment Analysis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="textual" id="textual" />
                    <Label htmlFor="textual">Textual Analysis</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !dateRange.from || !dateRange.to}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Entries'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="mt-8">
          {analysisType === 'sentiment' ? (
            <SentimentAnalysisResults data={analysisResults as AnalysisResults['sentiment']} />
          ) : (
            <TextualAnalysisResults data={analysisResults as AnalysisResults['textual']} />
          )}
        </div>
      )}
    </div>
  );
} 