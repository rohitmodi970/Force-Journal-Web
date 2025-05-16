import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

interface ProgressRadarProps {
  progressMetrics: { health: number; resilience: number; academic: number; research: number };
}

const ProgressRadar: React.FC<ProgressRadarProps> = ({ progressMetrics }) => {
  const data = {
    labels: ['Health', 'Resilience', 'Academic', 'Research'],
    datasets: [
      {
        label: 'Progress',
        data: [progressMetrics.health, progressMetrics.resilience, progressMetrics.academic, progressMetrics.research],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  return (
    <div>
      <Radar data={data} options={{ plugins: { title: { display: true, text: 'Progress Radar' } } }} />
    </div>
  );
};

export default ProgressRadar; 