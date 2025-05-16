import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface TopicHierarchyProps {
  topicHierarchy: string[];
}

const colors = [
  'rgba(99, 102, 241, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(251, 191, 36, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(59, 130, 246, 0.7)',
  'rgba(168, 85, 247, 0.7)',
  'rgba(34, 197, 94, 0.7)',
];

const TopicHierarchy: React.FC<TopicHierarchyProps> = ({ topicHierarchy }) => {
  // Count frequency of topics
  const topicCounts = topicHierarchy.reduce((freq: Record<string, number>, topic) => {
    freq[topic] = (freq[topic] || 0) + 1;
    return freq;
  }, {});

  const data = {
    labels: Object.keys(topicCounts),
    datasets: [
      {
        data: Object.values(topicCounts),
        backgroundColor: colors,
      },
    ],
  };

  return (
    <div>
      <Doughnut data={data} options={{ plugins: { title: { display: true, text: 'Topic Hierarchy' } } }} />
    </div>
  );
};

export default TopicHierarchy; 