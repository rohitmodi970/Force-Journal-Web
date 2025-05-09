// components/Journal/JournalAnalysis.tsx
import React, { useState } from 'react';
import { JournalEntry } from './types';

interface JournalAnalysisProps {
  entries: JournalEntry[];
  userName?: string;
}

type AnalysisTimeframe = 'day' | 'week' | 'month' | 'custom';
type AnalysisType = 
  | 'sentiment' 
  | 'topics' 
  | 'goals' 
  | 'mood' 
  | 'wordCloud' 
  | 'socialInteractions'
  | 'activities'
  | 'timeAllocation'
  | 'all';

const JournalAnalysis: React.FC<JournalAnalysisProps> = ({ entries, userName }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<AnalysisTimeframe>('day');
  const [selectedTypes, setSelectedTypes] = useState<AnalysisType[]>(['all']);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle analysis type selection
  const handleTypeSelection = (type: AnalysisType) => {
    if (type === 'all') {
      setSelectedTypes(['all']);
      return;
    }

    // Remove 'all' if it's selected and add the specific type
    let newTypes = selectedTypes.filter(t => t !== 'all');
    
    // Toggle the selected type
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }

    // If nothing is selected, default to 'all'
    setSelectedTypes(newTypes.length > 0 ? newTypes : ['all']);
  };

  // Fetch analysis from the API
  const fetchAnalysis = async () => {
    if (!entries || entries.length === 0) {
      setError('No journal entries available for analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/journal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries,
          timeframe,
          analysisTypes: selectedTypes,
          userName,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze journal entries');
      }

      const data = await response.json();
      setAnalysisResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Format the analysis results for basic display
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Analysis Results:</h3>
        
        {/* Sentiment Analysis */}
        {analysisResults.sentiment && (
          <div className="mb-4">
            <h4 className="font-medium">Sentiment Analysis:</h4>
            <p>Overall: {analysisResults.sentiment.overall}</p>
            <p>Score: {analysisResults.sentiment.score}</p>
          </div>
        )}

        {/* Topics */}
        {analysisResults.topics && analysisResults.topics.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Key Topics:</h4>
            <ul>
              {analysisResults.topics.map((topic: any, index: number) => (
                <li key={index}>
                  <strong>{topic.name}</strong> (Frequency: {topic.frequency})
                  <p className="text-sm">{topic.context}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Word Cloud Data */}
        {analysisResults.wordCloud && analysisResults.wordCloud.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Word Frequency:</h4>
            <div className="flex flex-wrap gap-2">
              {analysisResults.wordCloud.slice(0, 15).map((word: any, index: number) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-blue-100 rounded"
                  style={{ fontSize: `${Math.max(0.8, Math.min(2, 0.8 + word.count / 5))}rem` }}
                >
                  {word.word} ({word.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mood Distribution */}
        {analysisResults.moodDistribution && (
          <div className="mb-4">
            <h4 className="font-medium">Mood Distribution:</h4>
            <div className="flex items-center gap-1">
              {analysisResults.moodDistribution.categories.map((category: string, index: number) => {
                const value = analysisResults.moodDistribution.values[index];
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500" 
                      style={{ 
                        height: `${value}px`, 
                        width: '20px',
                        maxHeight: '100px'
                      }}
                    ></div>
                    <span className="text-xs mt-1">{category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Goals */}
        {analysisResults.goals && analysisResults.goals.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Goals:</h4>
            <ul>
              {analysisResults.goals.map((goal: any, index: number) => (
                <li key={index}>
                  <strong>{goal.goal}</strong> (Mentions: {goal.mentions})
                  <p className="text-sm">Progress: {goal.progress}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social Interactions */}
        {analysisResults.socialInteractions && (
          <div className="mb-4">
            <h4 className="font-medium">Social Interactions:</h4>
            <p>Total People Mentioned: {analysisResults.socialInteractions.totalPeopleMentioned}</p>
            {analysisResults.socialInteractions.people && (
              <ul>
                {analysisResults.socialInteractions.people.map((person: any, index: number) => (
                  <li key={index}>
                    <strong>{person.name}</strong> (Mentions: {person.mentions})
                    <p className="text-sm">Relationship: {person.relationship}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Activities */}
        {analysisResults.activities && analysisResults.activities.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Activities:</h4>
            <ul>
              {analysisResults.activities.map((activity: any, index: number) => (
                <li key={index}>
                  <strong>{activity.name}</strong> (Frequency: {activity.frequency})
                  <p className="text-sm">Category: {activity.category}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insights */}
        {analysisResults.insights && analysisResults.insights.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Insights:</h4>
            <ul>
              {analysisResults.insights.map((insight: string, index: number) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Recommendations:</h4>
            <ul>
              {analysisResults.recommendations.map((recommendation: string, index: number) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw Analysis (fallback) */}
        {analysisResults.rawAnalysis && (
          <div>
            <h4 className="font-medium">Analysis:</h4>
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm">
              {analysisResults.rawAnalysis}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Journal Analysis</h2>
      
      {/* Analysis Controls */}
      <div className="mb-6 space-y-4">
        {/* Timeframe Selection */}
        <div>
          <label className="block mb-2 font-medium">Select Timeframe:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('day')}
              className={`px-3 py-1 border rounded ${timeframe === 'day' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 border rounded ${timeframe === 'week' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 border rounded ${timeframe === 'month' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('custom')}
              className={`px-3 py-1 border rounded ${timeframe === 'custom' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Date Range (for custom timeframe) */}
        {timeframe === 'custom' && (
          <div className="flex gap-4">
            <div>
              <label className="block mb-1 text-sm">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 border rounded"
              />
            </div>
          </div>
        )}

        {/* Analysis Type Selection */}
        <div>
          <label className="block mb-2 font-medium">Analysis Types:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTypeSelection('all')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('all') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeSelection('sentiment')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('sentiment') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Sentiment
            </button>
            <button
              onClick={() => handleTypeSelection('topics')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('topics') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Topics
            </button>
            <button
              onClick={() => handleTypeSelection('mood')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('mood') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Mood
            </button>
            <button
              onClick={() => handleTypeSelection('wordCloud')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('wordCloud') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Word Cloud
            </button>
            <button
              onClick={() => handleTypeSelection('goals')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('goals') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Goals
            </button>
            <button
              onClick={() => handleTypeSelection('socialInteractions')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('socialInteractions') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Social
            </button>
            <button
              onClick={() => handleTypeSelection('activities')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('activities') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Activities
            </button>
            <button
              onClick={() => handleTypeSelection('timeAllocation')}
              className={`px-3 py-1 border rounded ${selectedTypes.includes('timeAllocation') ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Time Allocation
            </button>
          </div>
        </div>

        {/* Analysis Button */}
        <div>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {loading ? 'Analyzing...' : 'Analyze Journals'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-500 mt-2">
            Error: {error}
          </div>
        )}

        {/* Entry Count Display */}
        <div className="text-sm text-gray-600">
          {entries.length} journal entries available for analysis
        </div>
      </div>

      {/* Analysis Results */}
      {renderAnalysisResults()}
    </div>
  );
};

export default JournalAnalysis;