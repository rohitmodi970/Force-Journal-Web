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
    mindMap: {
      nodes: { id: string; label: string; group: string }[];
      links: { source: string; target: string }[];
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
  sentimentPercentages?: {
    positive: number;
    neutral: number;
    negative: number;
  };
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
  "textAnalysis": {
    "coreValues": [
      {
        "name": "Value name (e.g. Balance & Flexibility)",
        "alignmentPercent": 0.0, // 0-1 scale, e.g. 0.85 for 85%
        "description": "Short description of the value and its role in the audio",
        "quotes": [
          "Direct quote from the transcript that exemplifies this value",
          "Another relevant quote"
        ],
        "insight": "A paragraph interpreting the value's role and importance in the audio context.",
        "actionGap": {
          "score": 0.0, // 0-1 scale, 0 = low gap, 1 = high gap
          "label": "Low/Medium/High"
        },
        "recommendations": [
          "Actionable recommendation to bridge the gap",
          "Another recommendation"
        ]
      }
    ]
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
    "mindMap": {
      "nodes": [
        {
          "id": "string",
          "label": "string",
          "group": "string",
          "value": 1,
          "details": {
            "description": "Detailed explanation of this topic/concept",
            "keyPoints": ["List of key points about this topic"],
            "relevance": 0.0, // 0-1 scale
            "sentiment": "positive/neutral/negative",
            "connections": ["List of related topics/concepts"],
            "color": "hex color code based on sentiment and relevance"
          }
        }
      ],
      "links": [
        {
          "source": "string",
          "target": "string",
          "strength": 0.0 // 0-1 scale indicating connection strength
        }
      ],
      "insights": "A short paragraph of mind map insights.",
      "actionSuggestion": "A short actionable suggestion."
    },
    "energyPatterns": {
      "segments": [
        {
          "time": "0:00",
          "energy": 0.0,
          "mood": 0.0,
          "focus": 0.0
        }
      ]
    },
    "growthInsights": {
      "categories": ["Cultural Awareness", "Personal Reflection", "Emotional Wellbeing", "Relationship Building", "Mindfulness"],
      "values": [0.0]
    }
  }
}

For the textAnalysis, identify the top 3-5 core values expressed in the audio. For each value, provide:
- Name, alignment percentage (0-1), and a short description
- 1-2 direct quotes from the transcript that exemplify the value
- An "Insight" paragraph interpreting the value's role in the audio
- An "Action Gap" score (0-1) and a label (Low/Medium/High)
- 2-3 actionable recommendations to bridge the gap

For the mindMap nodes:
1. Create meaningful nodes that represent key topics, concepts, or themes from the audio
2. Assign each node a color based on its sentiment (positive: green shades, neutral: blue shades, negative: red shades) and relevance (darker for more relevant)
3. Provide detailed information about each node including description, key points, and connections
4. Ensure nodes are logically connected based on their relationships in the content

For the energyPatterns, analyze the audio content in 5 equal time segments and provide:
1. Energy level (0-1): How energetic/enthusiastic the speaker is
2. Mood level (0-1): The emotional tone and positivity
3. Focus level (0-1): How focused and clear the message is

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
      let geminiAnalysis: GeminiAnalysis;
      let sentimentPercentages = { positive: 0, neutral: 0, negative: 0 };
      try {
        const text = geminiResponse.text || '';
        // Remove markdown code block formatting if present
        const jsonText = text
          .replace(/```json\n?|\n?```/g, '') // Remove markdown code block markers
          .replace(/json\n|\n/g, '') // Remove any remaining newlines and "json" prefix
          .trim();
        
        geminiAnalysis = JSON.parse(jsonText) as GeminiAnalysis;
        
        // Ensure visualizationData has all required fields with default values
        geminiAnalysis.visualizationData = {
          emotionDistribution: geminiAnalysis.visualizationData?.emotionDistribution || { labels: [], values: [] },
          topicRelevance: geminiAnalysis.visualizationData?.topicRelevance || { labels: [], values: [] },
          speechMetrics: geminiAnalysis.visualizationData?.speechMetrics || { labels: [], values: [] },
          mindMap: geminiAnalysis.visualizationData?.mindMap || {
            nodes: [],
            links: [],
            insights: "",
            actionSuggestion: ""
          },
          energyPatterns: geminiAnalysis.visualizationData?.energyPatterns || {
            segments: [
              { time: "0:00", energy: 0, mood: 0, focus: 0 },
              { time: "0:20", energy: 0, mood: 0, focus: 0 },
              { time: "0:40", energy: 0, mood: 0, focus: 0 },
              { time: "1:00", energy: 0, mood: 0, focus: 0 },
              { time: "1:20", energy: 0, mood: 0, focus: 0 }
            ]
          },
          growthInsights: geminiAnalysis.visualizationData?.growthInsights || {
            categories: ["Cultural Awareness", "Personal Reflection", "Emotional Wellbeing", "Relationship Building", "Mindfulness"],
            values: [0, 0, 0, 0, 0]
          }
        };

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
            mindMap: {
              nodes: [],
              links: [],
              insights: "",
              actionSuggestion: ""
            },
            energyPatterns: {
              segments: [
                { time: "0:00", energy: 0, mood: 0, focus: 0 },
                { time: "0:20", energy: 0, mood: 0, focus: 0 },
                { time: "0:40", energy: 0, mood: 0, focus: 0 },
                { time: "1:00", energy: 0, mood: 0, focus: 0 },
                { time: "1:20", energy: 0, mood: 0, focus: 0 }
              ]
            },
            growthInsights: {
              categories: ["Cultural Awareness", "Personal Reflection", "Emotional Wellbeing", "Relationship Building", "Mindfulness"],
              values: [0, 0, 0, 0, 0]
            }
          }
        } as GeminiAnalysis;
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