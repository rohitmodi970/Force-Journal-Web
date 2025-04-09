"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useTheme } from "@/utilities/context/ThemeContext";

interface TimeSeriesPoint {
  time: number;
  [key: string]: number;
}

interface SpeechData {
  pitch: {
    average: number;
    data?: number[];
  };
  rate: {
    wordsPerMinute: number;
    data?: number[];
  };
  volume: {
    average: number;
    peak: number;
  };
  pauses: {
    count: number;
    averageDuration: number;
    locations?: number[];
  };
}

interface AnalysisResults {
  speech: SpeechData;
  metadata: {
    duration: number;
  };
}

interface SpeechTabProps {
  analysisResults: AnalysisResults;
}

const getTimeSeriesData = (data: { data?: number[] }, label: string): TimeSeriesPoint[] => {
  if (!data || !data.data) return [];

  return data.data.map((value, index) => ({
    time: index / 5, // Assuming 5 samples per second
    [label]: value,
  }));
};

const SpeechTab: React.FC<SpeechTabProps> = ({ analysisResults }) => {
  const { currentTheme, isDarkMode } = useTheme();

  const pitchData = getTimeSeriesData(analysisResults.speech.pitch, "pitch");
  const rateData = getTimeSeriesData(analysisResults.speech.rate, "rate");

  console.log("SpeechTab: ", analysisResults);
  console.log("SpeechTab rateData: ", rateData);

  // Theme-aware styling
  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const panelBgColor = isDarkMode ? "bg-gray-700" : "bg-gray-50";
  const gridColor = isDarkMode ? "#4B5563" : "#e2e8f0";
  const pauseBarColor = isDarkMode ? "bg-red-400" : "bg-red-500";
  const pauseTrackColor = isDarkMode ? "bg-gray-600" : "bg-gray-100";

  // Theme colors for charts
  const pitchLineColor = currentTheme.primary;
  const rateLineColor = currentTheme.hover;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className={`${bgColor} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Pitch Variation Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pitchData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="time" 
                label={{ value: "Time (seconds)", position: "insideBottom", offset: -5 }} 
                stroke={isDarkMode ? "#D1D5DB" : "#4B5563"}
              />
              <YAxis 
                label={{ value: "Pitch (Hz)", angle: -90, position: "insideLeft" }} 
                domain={["auto", "auto"]} 
                stroke={isDarkMode ? "#D1D5DB" : "#4B5563"}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} Hz`, "Pitch"]}
                contentStyle={{
                  backgroundColor: isDarkMode ? "#374151" : "#fff",
                  borderColor: isDarkMode ? "#4B5563" : "#e2e8f0",
                  color: isDarkMode ? "#F9FAFB" : "#111827"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pitch" 
                stroke={pitchLineColor} 
                activeDot={{ r: 8 }} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${bgColor} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Speech Rate Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rateData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="time" 
                label={{ value: "Time (seconds)", position: "insideBottom", offset: -5 }} 
                stroke={isDarkMode ? "#D1D5DB" : "#4B5563"}
              />
              <YAxis 
                label={{ value: "Syllables/sec", angle: -90, position: "insideLeft" }} 
                domain={["auto", "auto"]} 
                stroke={isDarkMode ? "#D1D5DB" : "#4B5563"}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} syllables/sec`, "Rate"]}
                contentStyle={{
                  backgroundColor: isDarkMode ? "#374151" : "#fff",
                  borderColor: isDarkMode ? "#4B5563" : "#e2e8f0",
                  color: isDarkMode ? "#F9FAFB" : "#111827"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke={rateLineColor} 
                activeDot={{ r: 8 }} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${bgColor} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Speech Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Average Pitch</h4>
            <p className={`text-lg ${textColor}`}>{analysisResults.speech.pitch.average} Hz</p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Speech Rate</h4>
            <p className={`text-lg ${textColor}`}>{analysisResults.speech.rate.wordsPerMinute} WPM</p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Volume</h4>
            <p className={textColor}>Avg: {analysisResults.speech.volume.average} dB</p>
            <p className={textColor}>Peak: {analysisResults.speech.volume.peak} dB</p>
          </div>
          <div className={`p-3 ${panelBgColor} rounded border ${borderColor}`}>
            <h4 className={`font-medium ${textColor}`}>Pauses</h4>
            <p className={textColor}>{analysisResults.speech.pauses.count} pauses</p>
            <p className={textColor}>Avg: {analysisResults.speech.pauses.averageDuration.toFixed(2)}s</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className={`font-medium mb-2 ${textColor}`}>Pause Distribution</h4>
          {analysisResults.speech.pauses.locations && (
            <div className={`relative h-8 w-full ${pauseTrackColor} rounded`}>
              {analysisResults.speech.pauses.locations.map((location, index) => {
                const duration = analysisResults.metadata.duration;
                const position = (location / duration) * 100;
                return (
                  <div
                    key={index}
                    className={`absolute h-8 w-1 ${pauseBarColor}`}
                    style={{ left: `${position}%` }}
                    title={`Pause at ${location.toFixed(1)}s`}
                  ></div>
                );
              })}
            </div>
          )}
          <div className={`flex justify-between text-xs mt-1 ${textColor}`}>
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechTab;