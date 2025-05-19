import React, { useEffect, useState } from 'react';
import { JournalEntry } from '../types';
import ActivityWordCloud from './ActivityWordCloud';
import EnergyProductivityTrends from './EnergyProductivityTrends';
import MoodPatterns from './MoodPatterns';
import TopicHierarchy from './TopicHierarchy';
import FlowDiagram from './FlowDiagram';
import HealthWellnessTracker from './HealthWellnessTracker';
import HappinessTree from '@/components/HappinessTree';
import { fetchGeminiAnalytics, GeminiAnalytics } from '../../../utilities/geminiAnalysis';
import TenseUsageChart from '@/components/TenseUsageChart';
import WordChoiceChart from '@/components/WordChoiceChart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TextualAnalysisTab from './TextualAnalysisTab';

interface AdvancedAnalysisDashboardProps {
  entries: JournalEntry[];
}

const AdvancedAnalysisDashboard: React.FC<AdvancedAnalysisDashboardProps> = ({ entries }) => {
  const [analytics, setAnalytics] = useState<GeminiAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entries || entries.length === 0) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGeminiAnalytics(entries);
        if (data) {
          setAnalytics(data);
        } else {
          setError('Failed to fetch analytics data');
        }
      } catch (err) {
        setError('Error fetching analytics');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading advanced analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No analytics data available.</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="visual" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
        <TabsTrigger value="textual">Textual Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="visual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Activity/Topic Word Cloud */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-2xl font-bold mb-2">Activity & Topic Word Cloud</h2>
              <ActivityWordCloud words={analytics.keywords.map(k => k.text)} />
            </div>
          </div>
          {/* Energy & Productivity Trends */}
          <div>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-2xl font-bold mb-2">Energy & Productivity Trends</h2>
              <EnergyProductivityTrends metrics={analytics.metrics} />
            </div>
          </div>
          {/* Mood Patterns & Influencers */}
          <div>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-2xl font-bold mb-2">Mood Patterns & Influencers</h2>
              <MoodPatterns moodInfluencers={analytics.moodInfluencers} />
            </div>
          </div>
          {/* Happiness Tree Visualization */}
          <div className="col-span-1 md:col-span-2">
            <HappinessTree sources={analytics.happinessSources} />
          </div>
          {/* Tense Usage Chart */}
          <div>
            <TenseUsageChart data={analytics.tenseUsage ? [
              { name: 'Present', value: analytics.tenseUsage.present },
              { name: 'Past', value: analytics.tenseUsage.past },
              { name: 'Future', value: analytics.tenseUsage.future },
            ] : undefined} />
          </div>
          {/* Word Choice Categories Chart */}
          <div>
            <WordChoiceChart data={analytics.wordChoiceCategories ? analytics.wordChoiceCategories.map(c => ({ name: c.category, value: c.percentage })) : undefined} />
          </div>
          {/* Topic Hierarchy */}
          <div>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-2xl font-bold mb-2">Topic Hierarchy</h2>
              <TopicHierarchy topicHierarchy={analytics.topicHierarchy} />
            </div>
          </div>
          {/* Flow Diagram (now full width, larger) */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4" style={{ minHeight: 600 }}>
              <h2 className="text-2xl font-bold mb-2">Flow Diagram</h2>
              <FlowDiagram flowData={analytics.flowData} />
            </div>
          </div>
          {/* Health & Wellness Tracker */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-2xl font-bold mb-2">Health & Wellness Tracker</h2>
              <HealthWellnessTracker healthMetrics={analytics.healthMetrics} insight={analytics.healthWellnessInsight} />
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="textual">
        <TextualAnalysisTab analytics={analytics} />
      </TabsContent>
    </Tabs>
  );
};

export default AdvancedAnalysisDashboard; 