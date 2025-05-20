import React from 'react';
import { Line } from 'react-chartjs-2';

interface HealthWellnessTrackerProps {
  healthMetrics: { sentiment: number; physicalWellness: number; mentalResilience: number }[];
  insight?: string;
}

const HealthWellnessTracker: React.FC<HealthWellnessTrackerProps> = ({ healthMetrics, insight }) => {
  const chartData = {
    labels: healthMetrics.map((_, i) => `Entry ${i + 1}`),
    datasets: [
      {
        label: 'Sentiment',
        data: healthMetrics.map(d => d.sentiment),
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Physical Wellness',
        data: healthMetrics.map(d => d.physicalWellness),
        borderColor: 'rgba(16, 185, 129, 0.8)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Mental Resilience',
        data: healthMetrics.map(d => d.mentalResilience),
        borderColor: 'rgba(251, 191, 36, 0.8)',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <Line data={chartData} options={{ plugins: { title: { display: true, text: 'Health & Wellness Tracker' } } }} />
      {insight && (
        <div className="mt-4 p-3 bg-blue-50 rounded text-blue-900 text-sm">
          <strong>Insight:</strong> {insight}
        </div>
      )}
    </div>
  );
};

export default HealthWellnessTracker; 