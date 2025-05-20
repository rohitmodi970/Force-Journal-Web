import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TextualAnalysisData {
  topics: Array<{
    topic: string;
    frequency: number;
    context: string[];
    sentiment: number;
  }>;
  writingPatterns: {
    vocabulary: {
      commonWords: string[];
      uniqueWords: string[];
      wordCategories: Array<{
        category: string;
        percentage: number;
      }>;
    };
    structure: {
      averageLength: number;
      paragraphPatterns: string[];
      temporalReferences: {
        present: number;
        past: number;
        future: number;
      };
    };
  };
  keyInsights: Array<{
    insight: string;
    evidence: string[];
    significance: string;
  }>;
  goalsAndProgress: Array<{
    goal: string;
    status: string;
    progress: number;
    milestones: string[];
  }>;
  recommendations: Array<{
    area: string;
    suggestion: string;
    rationale: string;
  }>;
}

interface Props {
  data: TextualAnalysisData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function TextualAnalysisResults({ data }: Props) {
  // Transform data for charts
  const topicData = data.topics.map(topic => ({
    name: topic.topic,
    frequency: topic.frequency,
    sentiment: topic.sentiment,
  }));

  const temporalData = [
    { name: 'Present', value: data.writingPatterns.structure.temporalReferences.present },
    { name: 'Past', value: data.writingPatterns.structure.temporalReferences.past },
    { name: 'Future', value: data.writingPatterns.structure.temporalReferences.future },
  ];

  const wordCategoryData = data.writingPatterns.vocabulary.wordCategories.map(category => ({
    subject: category.category,
    A: category.percentage,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Topics Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.topics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{topic.topic}</p>
                  <p className="text-sm text-gray-500">
                    Context: {topic.context.slice(0, 2).join(', ')}...
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  topic.sentiment > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  Sentiment: {topic.sentiment.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Writing Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Temporal References */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Temporal References</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={temporalData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Temporal Distribution"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Word Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Word Categories</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={wordCategoryData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Word Categories"
                      dataKey="A"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Common Words */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Common Words</h3>
            <div className="flex flex-wrap gap-2">
              {data.writingPatterns.vocabulary.commonWords.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals and Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Goals and Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.goalsAndProgress.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{goal.goal}</h3>
                  <span className="text-sm text-gray-500">{goal.status}</span>
                </div>
                <Progress value={goal.progress * 100} className="h-2" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Milestones:</p>
                  <ul className="list-disc list-inside">
                    {goal.milestones.map((milestone, mIndex) => (
                      <li key={mIndex}>{milestone}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.keyInsights.map((insight, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <p className="font-medium">{insight.insight}</p>
                <p className="text-sm text-gray-600 mt-1">{insight.significance}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-purple-600">Evidence:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {insight.evidence.map((item, eIndex) => (
                      <li key={eIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-600">{rec.area}</h3>
                <p className="mt-1">{rec.suggestion}</p>
                <p className="text-sm text-gray-600 mt-2">{rec.rationale}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 