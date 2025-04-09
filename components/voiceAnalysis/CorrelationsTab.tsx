import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTheme } from "@/utilities/context/ThemeContext";

interface CorrelationPoint {
  pitch: number;
  rate: number;
}

interface Metadata {
  duration: number;
  sampleRate: number;
  bitrate: number;
  filesize: number;
}

interface SpeechData {
  pitch: {
    data: number[];
  };
  rate: {
    data: number[];
  };
}

interface AnalysisResults {
  speech: SpeechData;
  metadata: Metadata;
}

interface CorrelationsTabProps {
  analysisResults: AnalysisResults;
}

const getCorrelationData = (analysisResults: AnalysisResults): CorrelationPoint[] => {
  if (!analysisResults?.speech?.pitch?.data || !analysisResults?.speech?.rate?.data) return [];

  const pitchData = analysisResults.speech.pitch.data;
  const rateData = analysisResults.speech.rate.data;
  const minLength = Math.min(pitchData.length, rateData.length);

  return Array.from({ length: minLength }, (_, i) => ({
    pitch: pitchData[i],
    rate: rateData[i],
  }));
};

const CorrelationsTab: React.FC<CorrelationsTabProps> = ({ analysisResults }) => {
  const correlationData = getCorrelationData(analysisResults);
  const { currentTheme, isDarkMode } = useTheme();
  
  const themeStyles = {
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    textColor: isDarkMode ? "text-gray-200" : "text-gray-800",
    secondaryTextColor: isDarkMode ? "text-gray-400" : "text-gray-500",
    borderColor: isDarkMode ? "border-gray-700" : "border-gray-200",
    gridBg: isDarkMode ? "bg-gray-700" : "bg-gray-50",
    scatterColor: currentTheme.primary,
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className={`${themeStyles.cardBg} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${themeStyles.textColor}`}>Correlations</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis 
                type="number" 
                dataKey="pitch" 
                name="Pitch" 
                label={{ value: "Pitch (Hz)", position: "insideBottom", offset: -5, fill: themeStyles.textColor }} 
                tick={{ fill: themeStyles.textColor }}
              />
              <YAxis 
                type="number" 
                dataKey="rate" 
                name="Rate" 
                label={{ value: "Speech Rate (syl/sec)", angle: -90, position: "insideLeft", fill: themeStyles.textColor }} 
                tick={{ fill: themeStyles.textColor }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: "3 3" }} 
                formatter={(value: number) => value.toFixed(2)} 
                contentStyle={{ backgroundColor: isDarkMode ? "#1F2937" : "#fff", borderColor: isDarkMode ? "#374151" : "#e5e7eb" }}
                labelStyle={{ color: themeStyles.textColor }}
              />
              <Scatter name="Pitch vs Rate" data={correlationData} fill={themeStyles.scatterColor} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className={`text-sm ${themeStyles.secondaryTextColor} mt-2`}>
          This chart shows the relationship between pitch and speaking rate throughout the recording.
        </p>
      </div>

      <div className={`${themeStyles.cardBg} p-4 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-medium mb-4 ${themeStyles.textColor}`}>Metadata Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 ${themeStyles.gridBg} rounded border ${themeStyles.borderColor}`}>
            <h4 className={`font-medium ${themeStyles.textColor}`}>Recording Duration</h4>
            <p className={themeStyles.textColor}>{analysisResults.metadata.duration.toFixed(1)} seconds</p>
          </div>
          <div className={`p-3 ${themeStyles.gridBg} rounded border ${themeStyles.borderColor}`}>
            <h4 className={`font-medium ${themeStyles.textColor}`}>Sample Rate</h4>
            <p className={themeStyles.textColor}>{(analysisResults.metadata.sampleRate / 1000).toFixed(1)} kHz</p>
          </div>
          <div className={`p-3 ${themeStyles.gridBg} rounded border ${themeStyles.borderColor}`}>
            <h4 className={`font-medium ${themeStyles.textColor}`}>Bitrate</h4>
            <p className={themeStyles.textColor}>{(analysisResults.metadata.bitrate / 1000).toFixed(0)} kbps</p>
          </div>
          <div className={`p-3 ${themeStyles.gridBg} rounded border ${themeStyles.borderColor}`}>
            <h4 className={`font-medium ${themeStyles.textColor}`}>File Size</h4>
            <p className={themeStyles.textColor}>{(analysisResults.metadata.filesize / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className={`font-medium mb-2 ${themeStyles.textColor}`}>Speaker Analysis</h4>
          <p className={themeStyles.textColor}>Currently analyzing a single speaker's voice. Multi-speaker detection can be enabled for group conversations.</p>
        </div>
      </div>
    </div>
  );
};

export default CorrelationsTab;