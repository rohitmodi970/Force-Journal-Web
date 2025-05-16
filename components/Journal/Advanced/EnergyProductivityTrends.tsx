import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface EnergyProductivityTrendsProps {
  metrics: { energy: number; productivity: number }[];
}

const EnergyProductivityTrends: React.FC<EnergyProductivityTrendsProps> = ({ metrics }) => {
  const energyData = {
    labels: metrics.map((_, i) => `Entry ${i + 1}`),
    datasets: [
      {
        label: 'Energy',
        data: metrics.map(d => d.energy),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const productivityData = {
    labels: metrics.map((_, i) => `Entry ${i + 1}`),
    datasets: [
      {
        label: 'Productivity',
        data: metrics.map(d => d.productivity),
        borderColor: 'rgba(255, 99, 132, 0.8)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <div className="mb-4">
        <Bar data={energyData} options={{ plugins: { title: { display: true, text: 'Daily Energy Levels' } } }} />
      </div>
      <div>
        <Line data={productivityData} options={{ plugins: { title: { display: true, text: 'Daily Productivity Score' } } }} />
      </div>
    </div>
  );
};

export default EnergyProductivityTrends; 