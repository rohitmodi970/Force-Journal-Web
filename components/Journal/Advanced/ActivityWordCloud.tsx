'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface ActivityWordCloudProps {
  words: string[]; // Array of words from API response, most important first
}

interface WordData {
  text: string;
  size: number;
  color: string;
  x?: number;
  y?: number;
  rotate?: number;
}

const colorPalette = [
  '#6baed6', '#74c476', '#fd8d3c', '#9e9ac8', '#e377c2', '#fdd0a2', '#bcbddc', 
  '#c7e9c0', '#fdae6b', '#c6dbef', '#ff9896', '#c49c94', '#f7b6d2', '#dbdb8d', 
  '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff7f0e', '#2ca02c'
];

const ActivityWordCloud: React.FC<ActivityWordCloudProps> = ({ words }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !words || !words.length) return;
    
    // Clear any existing SVG
    d3.select(containerRef.current).select('svg').remove();
    
    const width = 600;
    const height = 400;
    
    // Prepare data
    const wordData: WordData[] = words
      .filter(word => typeof word === 'string' && word.trim().length > 0)
      .map((word, index) => ({
        text: word,
        size: 50 - Math.min(index * 1.5, 40), // Decrease size gradually
        color: colorPalette[index % colorPalette.length]
      }));
    
    // Create layout
    const layout = cloud()
      .size([width, height])
      //@ts-ignore
      .words(wordData)
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      //@ts-ignore
      .fontSize(d => d.size)
      .on('end', draw as any);
    
    layout.start();
    
    // Draw function
    function draw(words: WordData[]) {
      const svg = d3.select(containerRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
        
      svg.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'sans-serif')
        .style('fill', d => d.color)
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x || 0},${d.y || 0}) rotate(${d.rotate || 0})`)
        .text(d => d.text)
        .style('cursor', 'pointer')
        .append('title')
        .text(d => `${d.text} (importance: ${d.size})`);
    }
  }, [words]);
  
  if (!words || !words.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No words available
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mx-auto"
      style={{ height: 400, width: 600 }}
    />
  );
};

export default ActivityWordCloud;