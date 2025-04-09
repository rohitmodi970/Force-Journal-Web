import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from "recharts";
import { useTheme } from "@/utilities/context/ThemeContext";

interface EnergyPoint {
  time: number;
  energy: number;
  intensity?: number;
}

interface EnergyData {
  totalEnergy: number;
  averageEnergy: number;
  energyDistribution: EnergyPoint[];
}

interface AnalysisResults {
  energyData: EnergyData;
}

interface EnergyTabProps {
  analysisResults: AnalysisResults;
}

interface EnergyInsights {
  energyVariance: number;
  peakEnergy: number;
  lowEnergy: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { isDarkMode } = useTheme();
  
  if (active && payload && payload.length) {
    const tooltipStyle = isDarkMode 
      ? "bg-gray-800 border border-gray-700 p-4 rounded shadow-lg text-gray-200" 
      : "bg-white border border-gray-300 p-4 rounded shadow-lg text-gray-700";
    
    return (
      <div className={tooltipStyle}>
        <p className="font-bold">Time: {label} seconds</p>
        <p className="text-blue-600">Energy: {payload[0].value.toFixed(3)}</p>
        {payload[1] && (
          <p className="text-green-600">Intensity: {payload[1].value.toFixed(3)}</p>
        )}
      </div>
    );
  }
  return null;
};

// Utility function to compute variance
function computeVariance(data: EnergyPoint[], key: keyof EnergyPoint): number {
  const mean = data.reduce((sum, item) => sum + Number(item[key]), 0) / data.length;
  const squaredDiffs = data.map(item => Math.pow(Number(item[key]) - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / data.length;
}

// Function to interpret energy data
function interpretEnergyData(energyData: EnergyData, insights: EnergyInsights): string {
  const { totalEnergy, averageEnergy } = energyData;
  const { energyVariance, peakEnergy, lowEnergy } = insights;

  if (totalEnergy < 0.5) return "Low overall energy detected. The audio might be very quiet or subdued.";
  if (energyVariance > 0.5) return "High energy variability suggests dynamic audio content with significant intensity changes.";
  if (peakEnergy > averageEnergy * 2) return "Sharp energy peaks indicate momentary intense sounds or sudden audio events.";
  
  return "Relatively consistent energy levels with moderate variations in audio intensity.";
}

const EnergyTab: React.FC<EnergyTabProps> = ({ analysisResults }) => {
  const { energyData } = analysisResults;
  const { currentTheme, isDarkMode } = useTheme();
  
  // Compute additional insights
  const energyInsights: EnergyInsights = {
    energyVariance: computeVariance(energyData.energyDistribution, 'energy'),
    peakEnergy: Math.max(...energyData.energyDistribution.map(d => d.energy)),
    lowEnergy: Math.min(...energyData.energyDistribution.map(d => d.energy))
  };
  
  const themeStyles = {
    pageBg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    textPrimary: isDarkMode ? "text-gray-200" : "text-gray-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-gray-600",
    border: isDarkMode ? "border-gray-700" : "border-gray-300",
    gridBg: isDarkMode ? "bg-gray-700" : "bg-gray-50",
    lineColor: currentTheme.primary,
    areaColor: currentTheme.light,
    grid: isDarkMode ? "#374151" : "#f3f3f3",
  };

  return (
    <div className={`p-4 ${themeStyles.pageBg} rounded-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${themeStyles.textPrimary}`}>Energy Level Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`${themeStyles.cardBg} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textPrimary}`}>Energy Statistics</h3>
          <div className="space-y-2">
            <p className={themeStyles.textPrimary}>
              <strong className="text-blue-600">Total Energy:</strong> 
              {" "}{energyData.totalEnergy.toFixed(2)}
            </p>
            <p className={themeStyles.textPrimary}>
              <strong className="text-green-600">Average Energy:</strong> 
              {" "}{energyData.averageEnergy.toFixed(2)}
            </p>
            <p className={themeStyles.textPrimary}>
              <strong className="text-purple-600">Energy Variance:</strong> 
              {" "}{energyInsights.energyVariance.toFixed(3)}
            </p>
            <p className={themeStyles.textPrimary}>
              <strong className="text-red-600">Peak Energy:</strong> 
              {" "}{energyInsights.peakEnergy.toFixed(3)}
            </p>
            <p className={themeStyles.textPrimary}>
              <strong className="text-yellow-600">Lowest Energy:</strong> 
              {" "}{energyInsights.lowEnergy.toFixed(3)}
            </p>
          </div>
        </div>
        
        <div className={`${themeStyles.cardBg} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textPrimary}`}>Energy Interpretation</h3>
          <p className={themeStyles.textSecondary}>
            {interpretEnergyData(energyData, energyInsights)}
          </p>
        </div>
      </div>

      <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textPrimary}`}>Energy Distribution Over Time</h3>
      
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={energyData.energyDistribution}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              stroke={themeStyles.grid} 
              strokeDasharray="5 5" 
            />
            <XAxis 
              dataKey="time" 
              label={{ 
                value: "Time (seconds)", 
                position: "insideBottom", 
                offset: -10,
                fill: themeStyles.textPrimary
              }}
              tick={{ fill: themeStyles.textPrimary }}
            />
            <YAxis 
              label={{ 
                value: "Energy Intensity", 
                angle: -90, 
                position: "insideLeft",
                fill: themeStyles.textPrimary
              }}
              tick={{ fill: themeStyles.textPrimary }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="energy" 
              stroke={themeStyles.lineColor} 
              strokeWidth={3}
              dot={{ stroke: themeStyles.lineColor, strokeWidth: 2 }}
              activeDot={{ r: 8, stroke: themeStyles.lineColor, strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="energy" 
              fill={themeStyles.lineColor} 
              fillOpacity={0.3} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyTab;