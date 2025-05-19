import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4285F4', '#34A853', '#FBBC05'];

const mockData = [
  { name: 'Present', value: 62 },
  { name: 'Past', value: 28 },
  { name: 'Future', value: 10 },
];

const TenseUsageChart = ({ data = mockData }) => {
  // Find dominant and next tense
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const dominant = sorted[0];
  const next = sorted[1];
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-2xl font-bold mb-2">Tense Usage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, value }) => `${name} (${value}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-4 text-gray-600 text-sm">
        Your journal predominantly uses {dominant.name.toLowerCase()} tense ({dominant.value}%), with {next.name.toLowerCase()} tense ({next.value}%) used primarily for reflection on other events.
      </p>
    </div>
  );
};

export default TenseUsageChart; 