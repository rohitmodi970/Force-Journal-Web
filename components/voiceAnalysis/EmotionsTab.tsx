import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from "recharts";
import { useTheme } from "@/utilities/context/ThemeContext";

interface EmotionData {
  name: string;
  value: number;
}

interface Emotions {
  [key: string]: number;
}

interface AnalysisResults {
  emotions: Emotions;
}

interface EmotionsTabProps {
  analysisResults: AnalysisResults;
}

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

const getEmotionChartData = (analysisResults: AnalysisResults): EmotionData[] => {
  if (!analysisResults?.emotions) return [];

  return Object.entries(analysisResults.emotions)
    .map(([emotion, value]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: parseFloat((value * 100).toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value);
};

const EmotionsTab: React.FC<EmotionsTabProps> = ({ analysisResults }) => {
  const emotionData = getEmotionChartData(analysisResults);
  const { currentTheme, isDarkMode } = useTheme();
  
  const themeStyles = {
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    textColor: isDarkMode ? "text-gray-200" : "text-gray-800",
    secondaryTextColor: isDarkMode ? "text-gray-400" : "text-gray-500",
    bgColor: isDarkMode ? "bg-gray-700" : "bg-gray-200",
    progressBarColor: currentTheme.primary,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={`${themeStyles.cardBg} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${themeStyles.textColor}`}>Emotion Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="name" tick={{ fill: themeStyles.textColor }} />
              <YAxis 
                label={{ 
                  value: "Percentage (%)", 
                  angle: -90, 
                  position: "insideLeft",
                  fill: themeStyles.textColor 
                }} 
                tick={{ fill: themeStyles.textColor }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, "Intensity"]} 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                  color: themeStyles.textColor
                }}
              />
              <Bar dataKey="value" name="Intensity">
                {emotionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase()] || `hsl(${index * 45}, 70%, 50%)`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${themeStyles.cardBg} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${themeStyles.textColor}`}>Emotion Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {emotionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase()] || `hsl(${index * 45}, 70%, 50%)`} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, "Intensity"]}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                  color: themeStyles.textColor
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4">
          <h4 className={`font-medium ${themeStyles.textColor}`}>Emotional Energy</h4>
          <p className={themeStyles.textColor}>Based on voice analysis, the speaker's emotional energy is:</p>

          <div className={`mt-2 ${themeStyles.bgColor} rounded-full h-4 w-full`}>
            {emotionData.some((item) => item.name.toLowerCase() === "neutral") ? (
              <div
                className="h-4 rounded-full"
                style={{
                  width: `${100 - (emotionData.find((item) => item.name.toLowerCase() === "neutral")?.value || 0)}%`,
                  backgroundColor: themeStyles.progressBarColor
                }}
              ></div>
            ) : (
              <div className="h-4 rounded-full w-3/4" style={{ backgroundColor: themeStyles.progressBarColor }}></div>
            )}
          </div>
          <div className={`flex justify-between text-xs mt-1 ${themeStyles.textColor}`}>
            <span>Low Energy</span>
            <span>High Energy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionsTab;