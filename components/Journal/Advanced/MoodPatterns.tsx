import React from 'react';
import { Bar } from 'react-chartjs-2';

interface MoodPatternsProps {
  moodInfluencers: { influencer: string; impact: number }[];
}

const MoodPatterns: React.FC<MoodPatternsProps> = ({ moodInfluencers }) => {
  const data = {
    labels: moodInfluencers.map(d => d.influencer),
    datasets: [
      {
        label: 'Impact Strength',
        data: moodInfluencers.map(d => d.impact),
        backgroundColor: moodInfluencers.map(d => d.impact >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
      },
    ],
  };

  return (
    <div>
      <Bar data={data} options={{ plugins: { title: { display: true, text: 'Mood Influencers' } } }} />
    </div>
  );
};

export default MoodPatterns; 