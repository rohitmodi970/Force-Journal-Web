import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SentimentAnalysisData {
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
}

interface Props {
  data: SentimentAnalysisData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SentimentAnalysisResults({ data }: Props) {
  // Transform data for charts
  const sentimentTrendData = data.sentimentTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    sentiment: trend.sentiment,
    emotion: trend.primaryEmotion,
  }));

  const emotionData = [
    ...data.emotionalPatterns.primaryEmotions.map(emotion => ({
      name: emotion.emotion,
      value: emotion.frequency * emotion.intensity,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Overall Sentiment Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-2xl font-bold">{data.overallSentiment.score.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Label</p>
              <p className="text-2xl font-bold capitalize">{data.overallSentiment.label}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Confidence</p>
              <p className="text-2xl font-bold">{(data.overallSentiment.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Emotion Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Emotional Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Emotional Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.insights.emotionalTriggers.map((trigger, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{trigger.trigger}</p>
                  <p className="text-sm text-gray-500">Frequency: {trigger.frequency}</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  trigger.impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  Impact: {trigger.impact.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Patterns & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.insights.moodPatterns.map((pattern, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">{pattern.pattern}</p>
                <p className="text-sm text-gray-600 mt-1">{pattern.significance}</p>
                <p className="text-sm text-blue-600 mt-2">{pattern.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 