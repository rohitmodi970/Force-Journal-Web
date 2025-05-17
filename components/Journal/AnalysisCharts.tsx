import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

export interface AnalysisResult {
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

interface AnalysisChartsProps {
  entries: Array<{
    title: string;
    date: string;
    analysis: AnalysisResult;
  }>;
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ entries }) => {
  // Sentiment trend
  const sentimentTrendData = {
    labels: entries.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sentiment Score',
        data: entries.map(entry => entry.analysis.sentiment_score),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // Sentiment label distribution
  const sentimentCounts = entries.reduce((acc, entry) => {
    const label = entry.analysis.sentiment_label;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sentimentDistributionData = {
    labels: Object.keys(sentimentCounts),
    datasets: [
      {
        data: Object.values(sentimentCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Average sentiment by day of week
  const dayOfWeekData = entries.reduce((acc, entry) => {
    const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[day]) acc[day] = { sum: 0, count: 0 };
    acc[day].sum += entry.analysis.sentiment_score;
    acc[day].count += 1;
    return acc;
  }, {} as Record<string, { sum: number; count: number }>);
  const averageByDayData = {
    labels: Object.keys(dayOfWeekData),
    datasets: [
      {
        label: 'Average Sentiment',
        data: Object.values(dayOfWeekData).map(({ sum, count }) => sum / count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      },
    ],
  };

  // Aggregate emotion scores
  const allEmotions = Object.keys(entries[0]?.analysis.emotion_scores || {});
  const avgEmotionScores = allEmotions.map(emotion => {
    const total = entries.reduce((sum, entry) => sum + (entry.analysis.emotion_scores[emotion] || 0), 0);
    return total / entries.length;
  });
  const emotionData = {
    labels: allEmotions,
    datasets: [
      {
        label: 'Avg Emotion Score',
        data: avgEmotionScores,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1,
      },
    ],
  };

  // Aggregate probabilities
  const avgProbabilities = ['positive', 'neutral', 'negative'].map(type => {
    //@ts-ignore
    const total = entries.reduce((sum, entry) => sum + (entry.analysis.probabilities[type] || 0), 0);
    return total / entries.length;
  });
  const probData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: avgProbabilities,
        backgroundColor: ['#4ade80', '#fbbf24', '#f87171'],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Sentiment Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={sentimentTrendData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Sentiment Score Over Time' } }, scales: { y: { min: -1, max: 1 } } }} />
        </CardContent>
      </Card>

      {/* Sentiment Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Doughnut data={sentimentDistributionData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Distribution of Sentiments' } } }} />
        </CardContent>
      </Card>

      {/* Average Sentiment by Day of Week */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Average Sentiment by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={averageByDayData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Average Sentiment Score by Day of Week' } }, scales: { y: { min: -1, max: 1 } } }} />
        </CardContent>
      </Card>

      {/* Emotion Scores */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Average Emotion Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={emotionData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Average Emotion Scores' } }, scales: { y: { min: 0, max: 1 } } }} />
        </CardContent>
      </Card>

      {/* Sentiment Probabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Average Sentiment Probabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <Doughnut data={probData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Average Sentiment Probabilities' } } }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisCharts; 