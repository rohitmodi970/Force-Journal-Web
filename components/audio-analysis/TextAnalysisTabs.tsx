import React, { useState } from 'react';

interface CoreValue {
  name: string;
  alignmentPercent: number;
  description: string;
  quotes: string[];
  insight: string;
  actionGap: {
    score: number;
    label: string;
  };
  recommendations: string[];
}

interface TextAnalysisTabsProps {
  coreValues: CoreValue[];
}

const getActionGapColor = (label: string) => {
  if (label.toLowerCase() === 'low') return '#22c55e';
  if (label.toLowerCase() === 'medium') return '#eab308';
  return '#ef4444';
};

export default function TextAnalysisTabs({ coreValues }: TextAnalysisTabsProps) {
  const [selected, setSelected] = useState(0);
  const selectedValue = coreValues[selected];

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex gap-2 mb-4">
        {coreValues.map((v, i) => (
          <button
            key={v.name}
            className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors duration-200 ${selected === i ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
            onClick={() => setSelected(i)}
          >
            {v.name} <span className="ml-2 text-xs font-normal">{Math.round(v.alignmentPercent * 100)}%</span>
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b-lg shadow p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-blue-700">{selectedValue.name}</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{Math.round(selectedValue.alignmentPercent * 100)}% Aligned</span>
        </div>
        <div className="text-gray-600 mb-4">{selectedValue.description}</div>
        <div className="bg-blue-50 rounded p-3 mb-4">
          <div className="text-xs text-blue-700 font-semibold mb-1">From your journal:</div>
          {selectedValue.quotes.map((q, idx) => (
            <div key={idx} className="italic text-gray-800 text-sm mb-1">"{q}"</div>
          ))}
        </div>
        <div className="mb-4">
          <span className="block font-bold text-blue-700 mb-1">Force Insight:</span>
          <span className="text-gray-700">{selectedValue.insight}</span>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-700">Action Gap:</span>
            <span className="text-xs font-semibold" style={{ color: getActionGapColor(selectedValue.actionGap.label) }}>{selectedValue.actionGap.label}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 rounded"
              style={{
                width: `${Math.round(selectedValue.actionGap.score * 100)}%`,
                background: getActionGapColor(selectedValue.actionGap.label),
                transition: 'width 0.3s'
              }}
            />
          </div>
        </div>
        <div className="mb-2">
          <span className="block font-bold text-blue-700 mb-1">Bridging the Action Gap:</span>
          <ol className="list-decimal list-inside text-gray-700">
            {selectedValue.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ol>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <b>Force App Notes:</b> The Values Alignment tool helps identify the core values expressed in journal entries and measures how well current behaviors align with these values. The Action Gap represents the distance between what users say they value and what they actually do, with specific recommendations to close that gap.
      </div>
    </div>
  );
} 