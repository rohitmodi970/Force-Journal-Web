import React from 'react';
import { Line } from 'react-chartjs-2';

interface EmotionDistributionProps {
  emotionDistribution: Record<string, number>[];
}

const emotionColors: Record<string, string> = {
  joy: 'rgba(16, 185, 129, 0.5)',
  sadness: 'rgba(59, 130, 246, 0.5)',
  anger: 'rgba(239, 68, 68, 0.5)',
  fear: 'rgba(245, 158, 11, 0.5)',
  surprise: 'rgba(168, 85, 247, 0.5)',
  disgust: 'rgba(34, 197, 94, 0.5)',
};

const EmotionDistribution: React.FC<EmotionDistributionProps> = ({ emotionDistribution }) => {
  // Get all unique emotion keys
  const emotionKeys = Array.from(new Set(emotionDistribution.flatMap(d => Object.keys(d))));

  const data = {
    labels: emotionDistribution.map((_, i) => `Entry ${i + 1}`),
    datasets: emotionKeys.map(emotion => ({
      label: emotion,
      data: emotionDistribution.map(d => d[emotion] || 0),
      fill: true,
      backgroundColor: emotionColors[emotion] || 'rgba(107, 114, 128, 0.3)',
      borderColor: emotionColors[emotion]?.replace('0.5', '1') || 'rgba(107, 114, 128, 1)',
      tension: 0.4,
    })),
  };

  return (
    <div>
      <Line data={data} options={{ plugins: { title: { display: true, text: 'Emotion Distribution Over Time' } }, scales: { y: { min: 0, max: 1 } } }} />
    </div>
  );
};

export default EmotionDistribution; 