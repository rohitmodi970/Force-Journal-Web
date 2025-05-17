"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface AudioVisualizationsProps {
  analysisResults: {
    deepgram: {
      confidence: number;
      sentiment: {
        overall: string;
        score: number;
      };
    };
    gemini: {
      emotions: {
        intensity: number;
      };
      speechPatterns: {
        clarity: number;
        confidence: number;
      };
      visualizationData: {
        emotionDistribution: {
          labels: string[];
          values: number[];
        };
        topicRelevance: {
          labels: string[];
          values: number[];
        };
        speechMetrics: {
          labels: string[];
          values: number[];
        };
        insightCategories: {
          labels: string[];
          values: number[];
        };
        recommendationPriority: {
          labels: string[];
          values: number[];
        };
      };
    };
  };
}

export function AudioVisualizations({ analysisResults }: AudioVisualizationsProps) {
  // Common chart options with enhanced styling
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          },
          padding: 20
        }
      },
      title: {
        display: true,
        font: {
          family: "'Poppins', sans-serif",
          size: 16,
          weight: 'bold' as const
        },
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Score',
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuad' as const
    }
  };

  // Enhanced color schemes
  const colorSchemes = {
    primary: {
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      hoverBackgroundColor: 'rgba(75, 192, 192, 0.7)'
    },
    secondary: {
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgb(153, 102, 255)',
      hoverBackgroundColor: 'rgba(153, 102, 255, 0.7)'
    },
    accent: {
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
      hoverBackgroundColor: 'rgba(255, 99, 132, 0.7)'
    },
    success: {
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      hoverBackgroundColor: 'rgba(54, 162, 235, 0.7)'
    },
    warning: {
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgb(255, 159, 64)',
      hoverBackgroundColor: 'rgba(255, 159, 64, 0.7)'
    }
  };

  // Existing chart data with enhanced styling
  const emotionData = {
    labels: analysisResults.gemini.visualizationData.emotionDistribution.labels,
    datasets: [{
      label: 'Emotion Intensity',
      data: analysisResults.gemini.visualizationData.emotionDistribution.values,
      ...colorSchemes.primary
    }]
  };

  const topicData = {
    labels: analysisResults.gemini.visualizationData.topicRelevance.labels,
    datasets: [{
      label: 'Topic Relevance',
      data: analysisResults.gemini.visualizationData.topicRelevance.values,
      ...colorSchemes.secondary
    }]
  };

  const speechData = {
    labels: analysisResults.gemini.visualizationData.speechMetrics.labels,
    datasets: [{
      label: 'Speech Metrics',
      data: analysisResults.gemini.visualizationData.speechMetrics.values,
      ...colorSchemes.accent
    }]
  };

  const insightData = {
    labels: analysisResults.gemini.visualizationData.insightCategories.labels,
    datasets: [{
      label: 'Insight Categories',
      data: analysisResults.gemini.visualizationData.insightCategories.values,
      ...colorSchemes.success
    }]
  };

  const recommendationData = {
    labels: analysisResults.gemini.visualizationData.recommendationPriority.labels,
    datasets: [{
      label: 'Recommendation Priority',
      data: analysisResults.gemini.visualizationData.recommendationPriority.values,
      ...colorSchemes.warning
    }]
  };

  // New charts
  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          analysisResults.deepgram.sentiment.positive * 100,
          analysisResults.deepgram.sentiment.neutral * 100,
          analysisResults.deepgram.sentiment.negative * 100
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(239, 68, 68, 0.8)',  // red
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const sentimentOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        ...commonOptions.plugins.title,
        text: 'Sentiment Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `${context.label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  const confidenceData = {
    labels: ['Speech Confidence', 'Clarity', 'Emotional Intensity'],
    datasets: [{
      label: 'Confidence Metrics',
      data: [
        analysisResults.deepgram.confidence,
        analysisResults.gemini.speechPatterns.clarity,
        analysisResults.gemini.emotions.intensity
      ],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)'
    }]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Doughnut data={emotionData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Topic Relevance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={topicData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Speech Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Radar data={speechData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Insight Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={insightData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Doughnut data={sentimentData} options={sentimentOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Confidence Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={confidenceData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recommendation Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={recommendationData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 