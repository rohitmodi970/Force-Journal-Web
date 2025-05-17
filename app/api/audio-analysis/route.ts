import { NextResponse } from 'next/server';
import { processWithDeepgram } from '@/utilities/DeepgramAudioProcess';
import { GoogleGenAI } from '@google/genai';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

interface DeepgramData {
  transcript: string;
  confidence: number;
  sentiment: {
    overall: string;
    score: number;
  };
  topics: string[];
  keywords: string[];
  summary: string;
}

interface GeminiAnalysis {
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
}

// Save uploaded file to disk
async function saveFileToDisk(file: File): Promise<{ filepath: string; filename: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const filename = `${uuidv4()}-${file.name}`;
  const filepath = join(tmpdir(), filename);
  
  await writeFile(filepath, buffer);
  return { filepath, filename };
}

// Create analysis prompt for Gemini
function createAudioAnalysisPrompt(deepgramData: DeepgramData) {
  return `You are a professional audio analyzer. Analyze the following audio transcription and provide detailed insights:

Transcription: ${deepgramData.transcript}

Topics: ${deepgramData.topics.join(', ')}

Sentiment: ${deepgramData.sentiment.overall} (score: ${deepgramData.sentiment.score})

First, analyze the transcript and estimate the percentage of positive, neutral, and negative sentiment expressed. Return these as values between 0 and 1 that sum to 1, in a JSON object with keys: positive, neutral, negative. Then, provide a comprehensive analysis in the following JSON format (add a 'sentimentPercentages' field at the root, with the sentiment percentages you calculated):

{
  "sentimentPercentages": { "positive": 0.0, "neutral": 0.0, "negative": 0.0 },
  "summary": "A concise summary of the audio content",
  "keyPoints": ["List of main points discussed"],
  "insights": ["Key insights and observations"],
  "emotions": {
    "primary": "main emotion detected",
    "secondary": ["other emotions detected"],
    "intensity": 0.0 // 0-1 scale
  },
  "speechPatterns": {
    "pace": "slow/medium/fast",
    "clarity": 0.0, // 0-1 scale
    "confidence": 0.0 // 0-1 scale
  },
  "recommendations": ["Actionable recommendations based on the content"],
  "lifeInsights": {
    "shortTerm": ["Immediate actionable insights"],
    "longTerm": ["Long-term life improvement suggestions"],
    "actionableSteps": ["Specific steps to implement insights"],
    "mindsetShifts": ["Recommended changes in perspective"]
  },
  "visualizationData": {
    "emotionDistribution": {
      "labels": ["Emotion names"],
      "values": [0.0] // 0-1 scale for each emotion
    },
    "topicRelevance": {
      "labels": ["Topic names"],
      "values": [0.0] // 0-1 scale for each topic
    },
    "speechMetrics": {
      "labels": ["Metric names"],
      "values": [0.0] // 0-1 scale for each metric
    },
    "insightCategories": {
      "labels": ["Category names"],
      "values": [0.0] // 0-1 scale for each category
    },
    "recommendationPriority": {
      "labels": ["Recommendation names"],
      "values": [0.0] // 0-1 scale for each recommendation
    }
  }
}

Return ONLY valid JSON.`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse the FormData
    const formData = await request.formData();
    const file = formData.get('audioFile') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Save the file to a temporary location
    const { filepath, filename } = await saveFileToDisk(file);
    
    try {
      // Process with Deepgram
      const deepgramData = await processWithDeepgram(filepath);
      
      // Process with Gemini
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
      }
      
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = createAudioAnalysisPrompt(deepgramData);
      
      const geminiResponse = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        // @ts-expect-error - GoogleGenAI types are not fully up to date
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        }
      });
      
      // Parse Gemini response
      let geminiAnalysis: any;
      let sentimentPercentages = { positive: 0, neutral: 0, negative: 0 };
      try {
        const text = geminiResponse.text || '';
        const jsonText = text.replace(/```json\n|\n```/g, '').trim();
        geminiAnalysis = JSON.parse(jsonText);
        if (geminiAnalysis.sentimentPercentages) {
          sentimentPercentages = geminiAnalysis.sentimentPercentages;
          delete geminiAnalysis.sentimentPercentages;
        }
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        geminiAnalysis = {
          summary: "Failed to analyze audio content",
          keyPoints: [],
          insights: [],
          emotions: {
            primary: "unknown",
            secondary: [],
            intensity: 0
          },
          speechPatterns: {
            pace: "unknown",
            clarity: 0,
            confidence: 0
          },
          recommendations: [],
          lifeInsights: {
            shortTerm: [],
            longTerm: [],
            actionableSteps: [],
            mindsetShifts: []
          },
          visualizationData: {
            emotionDistribution: { labels: [], values: [] },
            topicRelevance: { labels: [], values: [] },
            speechMetrics: { labels: [], values: [] },
            insightCategories: { labels: [], values: [] },
            recommendationPriority: { labels: [], values: [] }
          }
        };
      }
      
      // Combine results
      const analysisResults = {
        metadata: {
          filename: filename,
          filesize: file.size,
          timestamp: new Date().toISOString()
        },
        deepgram: {
          ...deepgramData,
          sentiment: {
            ...deepgramData.sentiment,
            positive: sentimentPercentages.positive,
            neutral: sentimentPercentages.neutral,
            negative: sentimentPercentages.negative
          }
        },
        gemini: geminiAnalysis
      };
      
      // Clean up temporary file
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
      
      return NextResponse.json(analysisResults);
    } catch (error) {
      // Clean up temporary file in case of error
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
      throw error;
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json(
      { message: 'Error processing audio file', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 