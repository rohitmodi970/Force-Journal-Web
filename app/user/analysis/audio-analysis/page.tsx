"use client";

import React, { useState } from 'react';
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
// import SideNavbar from "@/components/Navbar/SideNavbar";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, Music, FileText, BarChart2 } from "lucide-react";
import axios from 'axios';
import { AudioVisualizations } from "@/components/audio-analysis/AudioVisualizations";
import { AudioRecorder } from "@/components/audio-analysis/AudioRecorder";

interface AnalysisResults {
  metadata: {
    filename: string;
    filesize: number;
    timestamp: string;
  };
  deepgram: {
    transcript: string;
    confidence: number;
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
      overall: string;
      score: number;
    };
    topics: string[];
    keywords: string[];
    summary: string;
  };
  gemini: {
    summary: string;
    keyPoints: string[];
    insights: string[];
    emotions: {
      primary: string;
      secondary: string[];
      intensity: number;
    };
    speechPatterns: {
      pace: string;
      clarity: number;
      confidence: number;
    };
    recommendations: string[];
    lifeInsights: {
      shortTerm: string[];
      longTerm: string[];
      actionableSteps: string[];
      mindsetShifts: string[];
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
}

const AudioAnalysisPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Theme and session context
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select an audio file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audioFile', file);

      const response = await axios.post<AnalysisResults>('/api/audio-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResults(response.data);
    } catch (err) {
      setError('Failed to analyze audio file. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'recording.wav');

      const response = await axios.post<AnalysisResults>('/api/audio-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResults(response.data);
    } catch (err) {
      setError('Failed to analyze audio recording. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* <SideNavbar
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
        pathname={pathname}
        menuItems={[]}
      /> */}
      <div className="flex-1">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold font-journal mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Audio Analysis
              </h1>
              <p className="text-muted-foreground font-handwriting text-xl">
                Upload an audio file or record directly to analyze its content, features, and patterns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Upload Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-md">
                      <label
                        htmlFor="audio-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-blue-600 dark:text-blue-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">MP3, WAV, or M4A (MAX. 25MB)</p>
                        </div>
                        <input
                          id="audio-upload"
                          type="file"
                          className="hidden"
                          accept="audio/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {file && (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        Selected file: {file.name}
                      </div>
                    )}
                    <Button
                      onClick={handleAnalyze}
                      disabled={!file || isLoading}
                      className="w-full max-w-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </div>
                      ) : (
                        'Analyze Audio'
                      )}
                    </Button>
                    {error && (
                      <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                        {error}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                isAnalyzing={isLoading}
              />
            </div>

            {analysisResults && (
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="text" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Text Analysis
                  </TabsTrigger>
                  <TabsTrigger value="features" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <Music className="w-4 h-4 mr-2" />
                    Audio Features
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Visualization
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold">Text Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-2 text-lg">Transcript</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {analysisResults.deepgram.transcript}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-2 text-lg">Summary</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {analysisResults.gemini.summary}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-2 text-lg">Key Points</h3>
                          <ul className="list-disc list-inside space-y-2">
                            {analysisResults.gemini.keyPoints.map((point, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-2 text-lg">Topics</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.deepgram.topics.map((topic, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                            <h3 className="font-semibold mb-2 text-lg">Sentiment Analysis</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Positive</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div 
                                      className="h-full bg-green-500 rounded-full" 
                                      style={{ width: `${analysisResults.deepgram.sentiment.positive * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {(analysisResults.deepgram.sentiment.positive * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Neutral</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full" 
                                      style={{ width: `${analysisResults.deepgram.sentiment.neutral * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {(analysisResults.deepgram.sentiment.neutral * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Negative</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div 
                                      className="h-full bg-red-500 rounded-full" 
                                      style={{ width: `${analysisResults.deepgram.sentiment.negative * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {(analysisResults.deepgram.sentiment.negative * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Speech Patterns</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Confidence</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full" 
                                      style={{ width: `${analysisResults.deepgram.confidence * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {(analysisResults.deepgram.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Clarity</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div 
                                      className="h-full bg-green-500 rounded-full" 
                                      style={{ width: `${analysisResults.gemini.speechPatterns.clarity * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {(analysisResults.gemini.speechPatterns.clarity * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Emotional Analysis</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Emotional Intensity</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div 
                                      className="h-full bg-purple-500 rounded-full" 
                                      style={{ width: `${analysisResults.gemini.emotions.intensity * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {(analysisResults.gemini.emotions.intensity * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold">Audio Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-4 text-lg">Audio Metadata</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">File Name</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{analysisResults.metadata.filename}</p>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {(analysisResults.metadata.filesize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Analysis Time</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {new Date(analysisResults.metadata.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {Math.round(analysisResults.deepgram.confidence * 100)}%
                                </p>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${analysisResults.deepgram.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-4 text-lg">Speech Analysis</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Pace</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {analysisResults.gemini.speechPatterns.pace}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Clarity</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {Math.round(analysisResults.gemini.speechPatterns.clarity * 100)}%
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${analysisResults.gemini.speechPatterns.clarity * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Confidence</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {Math.round(analysisResults.gemini.speechPatterns.confidence * 100)}%
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                                <div
                                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${analysisResults.gemini.speechPatterns.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-4 text-lg">Emotions</h3>
                          <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Primary Emotion</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize mb-2">
                                {analysisResults.gemini.emotions.primary}
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${analysisResults.gemini.emotions.intensity * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Secondary Emotions</p>
                              <div className="flex flex-wrap gap-2">
                                {analysisResults.gemini.emotions.secondary.map((emotion, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium capitalize"
                                  >
                                    {emotion}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-4 text-lg">Insights</h3>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <ul className="list-disc list-inside space-y-2">
                              {analysisResults.gemini.insights.map((insight, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                          <h3 className="font-semibold mb-4 text-lg">Recommendations</h3>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <ul className="list-disc list-inside space-y-2">
                              {analysisResults.gemini.recommendations.map((recommendation, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="visual">
                  <AudioVisualizations analysisResults={analysisResults} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
};

export default AudioAnalysisPage; 