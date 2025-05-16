import React from 'react';
import { motion } from 'framer-motion';
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
  Cell
} from 'recharts';

interface SentimentAnalysisDashboardProps {
  analysisResult: {
    sentiment_score: number;
    emotion_scores: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
    };
    key_phrases: string[];
    sentiment_label: string;
  } | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SentimentAnalysisDashboard: React.FC<SentimentAnalysisDashboardProps> = ({ analysisResult }) => {
  if (!analysisResult) return null;

  // Prepare data for emotion pie chart
  const emotionData = Object.entries(analysisResult.emotion_scores).map(([name, value]) => ({
    name,
    value: value * 100 // Convert to percentage
  }));

  // Prepare data for sentiment trend line
  const sentimentData = [
    { name: 'Start', value: 0 },
    { name: 'Current', value: analysisResult.sentiment_score * 100 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Sentiment Analysis
      </h2>

      {/* Overall Sentiment */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Overall Sentiment
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-4xl font-bold" style={{
            color: analysisResult.sentiment_score > 0 ? '#10B981' : '#EF4444'
          }}>
            {analysisResult.sentiment_score > 0 ? '😊' : '😔'}
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300">
              {analysisResult.sentiment_label}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Score: {(analysisResult.sentiment_score * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Emotion Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {emotionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Phrases */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Key Phrases
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysisResult.key_phrases.map((phrase, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentAnalysisDashboard; 