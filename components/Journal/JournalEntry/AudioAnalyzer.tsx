"use client";

import React, { useEffect, useState } from "react";
import TextTab from "@/components/voiceAnalysis/TextTab";
import { useTheme } from "@/utilities/context/ThemeContext";
import { Loader, AlertCircle, Mic, FileText } from "lucide-react";
import axios from "axios";
interface AudioAnalyzerProps {
  audioFile: File | Blob | null;
  onAnalysisComplete?: (results: AnalysisResults) => void;
}

interface AnalysisResults {
  linguistics: {
    transcript?: string;
    summary: string;
    sentiment: {
      overall: string;
      score: number;
    };
    confidence: number;
    topics: string[];
  };
}

type TabOption = "text";

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ audioFile, onAnalysisComplete }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>("text");

  const { currentTheme, isDarkMode } = useTheme();

  // Theme-aware styles
  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    const analyzeAudio = async () => {
      if (!audioFile) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create form data to send the audio file
        const formData = new FormData();
        formData.append("audioFile", audioFile);

        // Send the audio to the backend for analysis
        const response = await axios.post<AnalysisResults>(
          "/api/voice-analysis", 
          formData, 
          {
        headers: {
          "Content-Type": "multipart/form-data",
        },
          }
        );
        
        // Set the results from the API response
        const analysisData = response.data;
        setAnalysisResults(analysisData);
        
        // Call the callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisData);
        }

        setAnalysisResults(analysisData);
        
        // Call the callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisData);
        }
      } catch (err: any) {
        setError(`Failed to analyze audio: ${err.response?.data?.message || err.message}`);
        console.error("Analysis error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (audioFile) {
      analyzeAudio();
    }
  }, [audioFile, onAnalysisComplete]);

  if (!audioFile) {
    return (
      <div className={`${bgColor} border ${borderColor} rounded-lg p-6 text-center shadow-sm`}>
        <Mic size={32} className="mx-auto mb-3 text-gray-400" />
        <p className={`${textColor} text-sm`}>No audio file selected for analysis</p>
        <p className="text-gray-500 text-xs mt-2">Record or upload audio to see voice analysis</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${bgColor} border ${borderColor} rounded-lg p-8 text-center shadow-sm`}>
        <Loader 
          className="inline-block animate-spin h-8 w-8 mb-3" 
          style={{ color: currentTheme.primary }}
        />
        <p className={`${textColor} mt-2`}>Analyzing voice patterns...</p>
        <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bgColor} border border-red-300 rounded-lg p-6 shadow-sm`}>
        <div className="flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-red-600 font-medium mb-1">Analysis Error</h4>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResults) return null;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg shadow-md transition-all duration-300`}>
      <div className={`border-b ${borderColor}`}>
        <nav className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2
              ${activeTab === "text" 
                ? `border-b-2 text-${currentTheme.primary} border-${currentTheme.primary}` 
                : isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <FileText size={16} />
            Text Analysis
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "text" && <TextTab analysisResults={analysisResults} />}
      </div>
    </div>
  );
};

export default AudioAnalyzer;