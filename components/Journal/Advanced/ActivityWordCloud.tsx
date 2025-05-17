'use client';
import React, { useMemo } from 'react';
import WordCloud from 'react-wordcloud';

interface ActivityWordCloudProps {
  words: string[]; // Array of words from Gemini API response, most important first
}

const colorPalette = [
  '#6baed6', '#74c476', '#fd8d3c', '#9e9ac8', '#e377c2', '#fdd0a2', '#bcbddc', '#c7e9c0', '#fdae6b', '#c6dbef',
  '#ff9896', '#c49c94', '#f7b6d2', '#dbdb8d', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff7f0e', '#2ca02c'
];

const options = {
  rotations: 2,
  rotationAngles: [-90, 0, 90], // Allows for horizontal and vertical words
  fontSizes: [20, 60], // Min and max font sizes
  fontFamily: 'sans-serif',
  padding: 2,
  deterministic: false, // For random placement
  transitionDuration: 1000,
};

const ActivityWordCloud: React.FC<ActivityWordCloudProps> = ({ words }) => {
  const wordCloudData = useMemo(
    () =>
      Array.isArray(words) && words.length > 0
        ? words
            .filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
            .map((word) => ({
              text: word,
              value: Math.floor(Math.random() * 100) + 1, // Random value between 1 and 100
            }))
        : [],
    [words]
  );

  if (!wordCloudData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No words available
      </div>
    );
  }

  return (
    <div
      style={{
        height: 400,
        width: 600,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 24,
        margin: "0 auto"
      }}
    >
      <WordCloud
        words={wordCloudData}
        options={{
          ...options,
          colors: colorPalette,
        }}
        size={[550, 350]}
      />
    </div>
  );
};

export default ActivityWordCloud;