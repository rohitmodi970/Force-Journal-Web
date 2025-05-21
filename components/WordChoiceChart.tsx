import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#FF6F61', // Emotional
  '#4DD0E1', // Descriptive
  '#FFD54F', // Action-oriented
  '#9575CD', // Reflective
  '#81C784', // Spiritual
  '#455A64', // Future-focused
];

const mockData = [
  { name: 'Emotional', value: 26 },
  { name: 'Descriptive', value: 19 },
  { name: 'Action-oriented', value: 17 },
  { name: 'Reflective', value: 15 },
  { name: 'Spiritual', value: 14 },
  { name: 'Future-focused', value: 9 },
];

const WordChoiceChart = ({ data = mockData }) => {
  // Find top two categories
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const second = sorted[1];
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-2xl font-bold mb-2">Word Choice Categories</h2>
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
        {top?.name} vocabulary dominates your journal ({top?.value}%), with {second?.name?.toLowerCase()} language close behind ({second?.value}%), reflecting an expressive writing style.
      </p>
    </div>
  );
};

export default WordChoiceChart; 