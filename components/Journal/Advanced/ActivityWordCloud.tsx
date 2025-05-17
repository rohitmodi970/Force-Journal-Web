'use client';
import React, { useMemo } from 'react';
import ReactWordcloud from 'react-wordcloud';

interface ActivityWordCloudProps {
  words: string[]; // Array of words from Gemini API response, most important first
}

const colorPalette = [
  '#6baed6', '#74c476', '#fd8d3c', '#9e9ac8', '#e377c2', '#fdd0a2', '#bcbddc', '#c7e9c0', '#fdae6b', '#c6dbef',
  '#ff9896', '#c49c94', '#f7b6d2', '#dbdb8d', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff7f0e', '#2ca02c'
];

interface WordCloudWord {
  text: string;
  value: number;
}

const ActivityWordCloud: React.FC<ActivityWordCloudProps> = ({ words }) => {
  const wordCloudData = useMemo(
    () =>
      Array.isArray(words) && words.length > 0
        ? words
            .filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
            .map((word, index) => ({
              text: word,
              value: 100 - index, // More important words come first, so higher value
            }))
        : [],
    [words]
  );

  const options = {
    rotations: 2,
    rotationAngles: [0, 90], // Alternating between 0 and 90 degrees
    fontFamily: 'sans-serif',
    fontSizes: [20, 60], // Min and max font sizes
    padding: 2,
    spiral: 'rectangular', // Same as your original
    deterministic: false, // For random placement
    transitionDuration: 1000,
  };

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
      <ReactWordcloud
        words={wordCloudData}
        options={options}
        callbacks={{
          getWordColor: (word: WordCloudWord, index: number) => colorPalette[index % colorPalette.length],
          getWordTooltip: (word: WordCloudWord) => `${word.text} (importance: ${word.value})`,
        }}
      />
    </div>
  );
};

export default ActivityWordCloud;