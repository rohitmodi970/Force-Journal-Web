"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTheme } from "@/utilities/context/ThemeContext";
import { AnalysisResults, EmotionData } from "./types/voiceAnalysis";

interface OverviewTabProps {
  analysisResults: AnalysisResults;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ analysisResults }) => {
  console.log("Analysis Results OverView:", analysisResults);
  
  // Use theme context
  const { currentTheme, isDarkMode } = useTheme();

  if (!analysisResults) return null;

  // Extract top emotions
  const topEmotions: EmotionData[] = Object.entries(analysisResults.emotions || {})
    .map(([emotion, value]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: parseFloat((value * 100).toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  // Speech metrics
  const avgPitch = analysisResults.speech?.pitch?.average || 0;
  const wpm = analysisResults.speech?.rate?.wordsPerMinute || 0;
  const pauseCount = analysisResults.speech?.pauses?.count || 0;

  // Sentiment
  const sentimentText =
    analysisResults.sentiment?.overall || "No sentiment data available";

  // Define emotion colors with fallback to theme colors
  const COLORS: Record<string, string> = {
    joy: "#4CAF50",
    sadness: "#2196F3",
    anger: "#F44336",
    fear: "#9C27B0",
    surprise: "#FF9800",
    disgust: "#795548",
    contempt: "#607D8B",
    neutral: "#9E9E9E",
  };

  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const panelBgColor = isDarkMode ? "bg-gray-700" : "bg-gray-50";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={`${bgColor} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Transcript</h3>
        <div className={`p-3 ${panelBgColor} rounded border ${borderColor} max-h-60 overflow-y-auto`}>
          <p className={textColor}>{analysisResults.linguistics?.transcript || "No transcript available"}</p>
          <p className="text-sm text-gray-500 mt-2">
            Confidence:{" "}
            {analysisResults.linguistics?.confidence
              ? (analysisResults.linguistics.confidence * 100).toFixed(1) + "%"
              : "N/A"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Sentiment</h4>
            <p className={textColor}>{sentimentText}</p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Topics</h4>
            <p className={textColor}>
              {(analysisResults.topics ?? []).length > 0
                ? (analysisResults.topics ?? []).join(", ")
                : "No topics detected"}
            </p>
          </div>
        </div>
      </div>

      <div className={`${bgColor} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Top Emotion</h4>
            <p className={`capitalize text-lg ${textColor}`}>
              {topEmotions[0]?.name || "N/A"}
            </p>
            <p className={textColor}>
              {topEmotions[0]?.value
                ? topEmotions[0].value.toFixed(1) + "%"
                : "N/A"}
            </p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Speaking Rate</h4>
            <p className={`text-lg ${textColor}`}>{wpm || "N/A"} WPM</p>
            <p className="text-sm text-gray-500">Words per minute</p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Average Pitch</h4>
            <p className={`text-lg ${textColor}`}>{avgPitch || "N/A"} Hz</p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Pauses</h4>
            <p className={`text-lg ${textColor}`}>{pauseCount || "N/A"}</p>
            <p className="text-sm text-gray-500">Total pauses detected</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className={`font-medium mb-2 ${textColor}`}>Dominant Emotions</h4>
          <div className="h-64">
            {topEmotions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topEmotions}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={currentTheme.primary}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {topEmotions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[entry.name.toLowerCase()] || 
                          currentTheme.primary ||
                          `hsl(${index * 45}, 70%, 50%)`
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? "#374151" : "#fff",
                      borderColor: isDarkMode ? "#4B5563" : "#e2e8f0",
                      color: isDarkMode ? "#F9FAFB" : "#111827"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className={`text-center mt-8 ${textColor}`}>No emotion data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;