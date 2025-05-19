"use client";

import React, { useRef, useEffect } from 'react';
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
import { ForceGraphMethods } from 'react-force-graph-2d';
import D3MindMap from './D3MindMap';

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
        mindMap: {
          nodes: {
            id: string;
            label: string;
            group: string;
            value: number;
            details: {
              description: string;
              keyPoints: string[];
              relevance: number;
              sentiment: string;
              connections: string[];
              color: string;
            };
          }[];
          links: {
            source: string;
            target: string;
            strength: number;
          }[];
          insights: string;
          actionSuggestion: string;
        };
        energyPatterns: {
          segments: {
            time: string;
            energy: number;
            mood: number;
            focus: number;
          }[];
        };
        growthInsights: {
          categories: string[];
          values: number[];
        };
      };
    };
  };
}

// Mind Map (Force Graph) types must be defined before use
type MindMapNode = {
  id: string;
  label: string;
  group: string;
  value: number;
  val: number;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  details: {
    description: string;
    keyPoints: string[];
    relevance: number;
    sentiment: string;
    connections: string[];
    color: string;
  };
  x?: number;
  y?: number;
};
type MindMapLink = {
  source: string;
  target: string;
  strength: number;
  width: number;
  color: string;
};

// Color palette for mind map nodes
const mindMapPalette = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#F43F5E', '#A21CAF', '#F472B6', '#FBBF24', '#22D3EE', '#84CC16', '#E11D48'
];

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

  // Emotion Distribution (multi-color)
  const emotionColors = [
    '#4BC0C0', '#FF6384', '#FFCE56', '#36A2EB', '#9966FF', '#FF9F40', '#B2FF66', '#FF66B2', '#66B2FF', '#B266FF'
  ];
  const emotionData = {
    labels: analysisResults.gemini.visualizationData.emotionDistribution.labels,
    datasets: [{
      label: 'Emotion Intensity',
      data: analysisResults.gemini.visualizationData.emotionDistribution.values,
      backgroundColor: emotionColors.slice(0, analysisResults.gemini.visualizationData.emotionDistribution.labels.length),
      borderColor: emotionColors.slice(0, analysisResults.gemini.visualizationData.emotionDistribution.labels.length),
      hoverBackgroundColor: emotionColors.slice(0, analysisResults.gemini.visualizationData.emotionDistribution.labels.length)
    }]
  };

  // Topic Relevance
  const topicData = {
    labels: analysisResults.gemini.visualizationData.topicRelevance.labels,
    datasets: [{
      label: 'Topic Relevance',
      data: analysisResults.gemini.visualizationData.topicRelevance.values,
      backgroundColor: colorSchemes.secondary.backgroundColor,
      borderColor: colorSchemes.secondary.borderColor,
      hoverBackgroundColor: colorSchemes.secondary.hoverBackgroundColor
    }]
  };

  // Confidence Metrics
  const confidenceData = {
    labels: ['Speech Confidence', 'Clarity', 'Emotional Intensity'],
    datasets: [{
      label: 'Confidence Metrics',
      data: [
        analysisResults.deepgram.confidence,
        analysisResults.gemini.speechPatterns.clarity,
        analysisResults.gemini.emotions.intensity
      ],
      backgroundColor: colorSchemes.success.backgroundColor,
      borderColor: colorSchemes.success.borderColor
    }]
  };

  // Growth Insights (Radar Chart) - Modified for larger size
  const growthInsights = analysisResults.gemini.visualizationData.growthInsights;
  const growthInsightsData = {
    labels: growthInsights.categories,
    datasets: [
      {
        label: 'Growth Insights',
        data: growthInsights.values,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75,192,192,1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Custom options for radar chart
  const radarOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          display: false,
          backdropColor: 'transparent'
        },
        pointLabels: {
          font: {
            size: 12
          }
        },
        grid: {
          circular: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    maintainAspectRatio: false
  };

  const fgRef = useRef<ForceGraphMethods<MindMapNode, MindMapLink> | undefined>(undefined);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${e.clientX + 20}px`;
        tooltipRef.current.style.top = `${e.clientY - 20}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-180);
      fgRef.current.d3Force('link')?.distance(180);
    }
  }, []);

  // Energy Patterns (Line Chart) - Modified for audio duration
  const energyPatterns = analysisResults.gemini.visualizationData.energyPatterns;
  const energyPatternData = {
    labels: energyPatterns.segments.map(segment => segment.time),
    datasets: [
      {
        label: 'Energy',
        data: energyPatterns.segments.map(segment => segment.energy),
        borderColor: '#FFCE56',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Mood',
        data: energyPatterns.segments.map(segment => segment.mood),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Focus',
        data: energyPatterns.segments.map(segment => segment.focus),
        borderColor: '#9966FF',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Emotion Distribution */}
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

      {/* Topic Relevance */}
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

      {/* Confidence Metrics */}
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

      {/* Mind Map (D3) */}
      {analysisResults.gemini.visualizationData.mindMap && (
        <D3MindMap
          nodes={analysisResults.gemini.visualizationData.mindMap.nodes.map((node, i) => ({
            ...node,
            color: node.color || mindMapPalette[i % mindMapPalette.length],
          }))}
          links={analysisResults.gemini.visualizationData.mindMap.links}
          insights={analysisResults.gemini.visualizationData.mindMap.insights}
          actionSuggestion={analysisResults.gemini.visualizationData.mindMap.actionSuggestion}
        />
      )}

      {/* Energy Patterns */}
      <Card className="md:col-span-2 hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Energy Patterns Over Audio Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <Line data={energyPatternData} options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                x: {
                  ...commonOptions.scales.x,
                  title: {
                    display: true,
                    text: 'Time (minutes:seconds)',
                    font: {
                      family: "'Poppins', sans-serif",
                      size: 12
                    }
                  }
                }
              }
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Growth Insights Radar Chart */}
      <Card className="md:col-span-2 hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Growth Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <Radar data={growthInsightsData} options={radarOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 