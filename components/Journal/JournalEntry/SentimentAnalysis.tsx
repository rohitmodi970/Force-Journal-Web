"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Smile, 
  Frown, 
  Meh,
  Heart, 
  Star, 
  TrendingUp, 
  Filter
} from 'lucide-react';

// Sample data structure from your schema
interface EmotionEntry {
  sentiment: string;
  roberta_sentiment: string;
  primary_emotion: string;
  secondary_emotions: string[];
  emotion_scores: Record<string, number>;
  timestamp: string;
  image_path?: string;
}

// Simplified dummy data based on your examples
const dummyData: EmotionEntry[] = [
  {
    sentiment: "positive",
    roberta_sentiment: "neutral",
    primary_emotion: "neutral",
    secondary_emotions: ["neutral"],
    emotion_scores: {"neutral": 1},
    timestamp: "2025-05-06 21:46:06.422624",
    image_path: "/api/placeholder/300/200"
  },
  {
    sentiment: "positive",
    roberta_sentiment: "positive",
    primary_emotion: "positive",
    secondary_emotions: ["joy", "pride", "gratitude"],
    emotion_scores: {"joy": 0.4, "pride": 0.3, "gratitude": 0.8},
    timestamp: "2025-05-06 21:47:16.456216",
    image_path: "/api/placeholder/300/200"
  },
  {
    sentiment: "positive",
    roberta_sentiment: "negative",
    primary_emotion: "negative",
    secondary_emotions: ["fear"],
    emotion_scores: {"fear": 1},
    timestamp: "2025-05-09 15:04:01.370179"
  },
  {
    sentiment: "positive",
    roberta_sentiment: "positive",
    primary_emotion: "positive",
    secondary_emotions: ["joy", "pride", "gratitude"],
    emotion_scores: {"joy": 0.8, "pride": 0.6, "gratitude": 0.5},
    timestamp: "2025-05-09 23:39:15.112531",
    image_path: "/api/placeholder/300/200"
  },
  {
    sentiment: "neutral",
    roberta_sentiment: "neutral",
    primary_emotion: "neutral",
    secondary_emotions: ["neutral"],
    emotion_scores: {"neutral": 1},
    timestamp: "2025-05-09 23:39:45.805056",
    image_path: "/api/placeholder/300/200"
  }
];

// Prepare data for trend chart
const prepareChartData = (data: EmotionEntry[]) => {
  return data.map(entry => {
    const date = new Date(entry.timestamp);
    return {
      name: `${date.getMonth() + 1}/${date.getDate()}`,
      sentiment: entry.roberta_sentiment === "positive" ? 1 : 
                entry.roberta_sentiment === "negative" ? -1 : 0,
      primaryEmotion: entry.primary_emotion
    };
  });
};

// Prepare data for emotion distribution
const prepareEmotionData = (data: EmotionEntry[]) => {
  const emotions: Record<string, number> = {};
  
  data.forEach(entry => {
    entry.secondary_emotions.forEach(emotion => {
      if (emotions[emotion]) {
        emotions[emotion] += 1;
      } else {
        emotions[emotion] = 1;
      }
    });
  });
  
  return Object.keys(emotions).map(key => ({
    name: key,
    value: emotions[key]
  }));
};

// Color mapping for different sentiment types
const COLORS = {
  positive: '#10B981', // green
  negative: '#EF4444', // red
  neutral: '#6B7280',  // gray
  joy: '#F59E0B',      // amber
  pride: '#8B5CF6',    // purple
  gratitude: '#3B82F6', // blue
  fear: '#EC4899',     // pink
  default: '#CBD5E1'   // slate
};

const SentimentAnalysisDashboard = ({ data = dummyData }) => {
  const { theme } = useTheme();
  const [selectedEntry, setSelectedEntry] = useState<EmotionEntry | null>(data[data.length - 1]);
  const [chartData, setChartData] = useState(prepareChartData(data));
  const [emotionData, setEmotionData] = useState(prepareEmotionData(data));
  
  const isDarkTheme = theme === 'dark';
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-800';
  const bgColor = isDarkTheme ? 'bg-gray-800' : 'bg-white';
  const cardBgColor = isDarkTheme ? 'bg-gray-700' : 'bg-gray-50';
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-200';
  
  useEffect(() => {
    setChartData(prepareChartData(data));
    setEmotionData(prepareEmotionData(data));
  }, [data]);

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <Smile className="w-6 h-6 text-green-500" />;
    if (sentiment === 'negative') return <Frown className="w-6 h-6 text-red-500" />;
    return <Meh className="w-6 h-6 text-gray-500" />;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full rounded-lg shadow-lg ${bgColor} ${textColor} overflow-hidden mt-28`}
    >
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-2">Emotion Analysis Dashboard</h2>
        <p className="text-sm opacity-70">Tracking your emotional journey and sentiment patterns over time</p>
      </div>
      
      {/* Main Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Left Column: Current Entry Analysis */}
        <div className="md:col-span-1">
          {selectedEntry && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-lg ${cardBgColor} h-full`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Latest Entry Analysis</h3>
                <Clock className="w-4 h-4 opacity-50" />
              </div>
              
              <div className="mb-6">
                <div className="text-xs opacity-60 mb-1">TIMESTAMP</div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 opacity-70" />
                  {formatDate(selectedEntry.timestamp)}
                </div>
              </div>

              {selectedEntry.image_path && (
                <div className="mb-6">
                  <div className="text-xs opacity-60 mb-1">ATTACHED IMAGE</div>
                  <img 
                    src={selectedEntry.image_path} 
                    alt="Entry attachment" 
                    className="w-full h-32 object-cover rounded-md mb-2" 
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="text-xs opacity-60 mb-1">MODEL SENTIMENT</div>
                  <div className="flex items-center">
                    {getSentimentIcon(selectedEntry.roberta_sentiment)}
                    <span className="ml-2 capitalize font-medium">{selectedEntry.roberta_sentiment}</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="text-xs opacity-60 mb-1">PRIMARY EMOTION</div>
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="ml-2 capitalize font-medium">{selectedEntry.primary_emotion}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-xs opacity-60 mb-2">SECONDARY EMOTIONS</div>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.secondary_emotions.map((emotion, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs opacity-60 mb-2">EMOTION SCORES</div>
                <div className="space-y-2">
                  {Object.entries(selectedEntry.emotion_scores).map(([emotion, score], index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-24 capitalize text-sm">{emotion}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 ml-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${score * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                          className={`h-full rounded-full`}
                          style={{ backgroundColor: COLORS[emotion as keyof typeof COLORS] || COLORS.default }}
                        />
                      </div>
                      <div className="ml-2 text-xs w-10 text-right">{Math.round(score * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Middle: Charts */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            {/* Sentiment Trend Chart */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-lg ${cardBgColor} h-64`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Sentiment Over Time</h3>
                <TrendingUp className="w-4 h-4 opacity-50" />
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#2563EB", strokeWidth: 0 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkTheme ? '#1F2937' : '#FFFFFF',
                      borderColor: isDarkTheme ? '#374151' : '#E5E7EB',
                      borderRadius: '0.375rem' 
                    }}
                    formatter={(value: number) => {
                      if (value === 1) return ["Positive"];
                      if (value === -1) return ["Negative"];
                      return ["Neutral"];
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            
            {/* Emotion Distribution */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`p-4 rounded-lg ${cardBgColor} h-[40vh] overflow-auto`}
            >
              <div className="flex items-center justify-between mb-4 ">
                <h3 className="font-semibold">Emotion Distribution</h3>
                <Star className="w-4 h-4 opacity-50" />
              </div>
              
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {emotionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.default} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${name}: ${value} entries`, '']}
                    contentStyle={{ 
                      backgroundColor: isDarkTheme ? '#1F2937' : '#FFFFFF',
                      borderColor: isDarkTheme ? '#374151' : '#E5E7EB',
                      borderRadius: '0.375rem' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Entry timeline section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6 border-t border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Entries</h3>
          <Filter className="w-4 h-4 opacity-50" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {data.map((entry, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedEntry(entry)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                entry === selectedEntry
                  ? 'ring-2 ring-blue-500 ' + cardBgColor
                  : `${cardBgColor} hover:bg-opacity-80`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {getSentimentIcon(entry.roberta_sentiment)}
                <div className={`text-xs px-2 py-1 rounded-full ${
                  entry.primary_emotion === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  entry.primary_emotion === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {entry.primary_emotion.slice(0, 3)}
                </div>
              </div>
              
              <div className="text-xs opacity-60 truncate">
                {new Date(entry.timestamp).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SentimentAnalysisDashboard;