import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

interface JournalEntry {
  date: string;
  content: string;
  title: string;
}

interface AnalysisRequest {
  entries: JournalEntry[];
  analysisType: 'sentiment' | 'textual';
  dateRange: {
    start: string;
    end: string;
  };
}

// Define specific response types for each analysis type
interface SentimentAnalysisResult {
  overallSentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  emotionalPatterns: {
    primaryEmotions: Array<{
      emotion: string;
      frequency: number;
      intensity: number;
    }>;
    secondaryEmotions: Array<{
      emotion: string;
      frequency: number;
      intensity: number;
    }>;
  };
  sentimentTrends: Array<{
    date: string;
    sentiment: number;
    primaryEmotion: string;
    keyPhrases: string[];
  }>;
  insights: {
    emotionalTriggers: Array<{
      trigger: string;
      impact: number;
      frequency: number;
    }>;
    moodPatterns: Array<{
      pattern: string;
      significance: string;
      recommendation: string;
    }>;
  };
}

interface TextualAnalysisResult {
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

type AnalysisResult = SentimentAnalysisResult | TextualAnalysisResult;

const LLM_CONFIG = {
  modelName: 'gemini-2.0-flash',
  maxTokens: 8192,
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { entries, analysisType, dateRange }: AnalysisRequest = await request.json();
    
    if (!entries || !analysisType || !dateRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const genAI = new GoogleGenAI({ apiKey });
    
    // Format entries into a prompt
    const entriesText = entries.map(entry => 
      `Date: ${entry.date}\nTitle: ${entry.title}\nContent: ${entry.content}\n---`
    ).join('\n\n');

    // Create appropriate prompt based on analysis type
    const prompt = analysisType === 'sentiment' 
      ? formatSentimentAnalysisPrompt(entriesText, dateRange)
      : formatTextualAnalysisPrompt(entriesText, dateRange);

    const response = await genAI.models.generateContent({
      model: LLM_CONFIG.modelName,
      contents: prompt,
      // @ts-expect-error - GoogleGenAI types are not fully up to date
      generationConfig: {
        maxOutputTokens: LLM_CONFIG.maxTokens,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    
    const text = response.text;
    
    if (!text) {
      throw new Error('No response text received from Gemini API');
    }

    let parsedData: AnalysisResult;
    const jsonString = extractFirstJson(text);
    if (!jsonString) {
      console.error('No JSON found in Gemini response:', text);
      throw new Error('Invalid JSON response from Gemini API');
    }
    try {
      parsedData = JSON.parse(jsonString) as AnalysisResult;
    } catch {
      console.error('Failed to parse Gemini response:', jsonString);
      throw new Error('Invalid JSON response from Gemini API');
    }

    return NextResponse.json({
      data: parsedData,
      analysisType
    });

  } catch (error) {
    console.error('Journal Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analysis request', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function formatSentimentAnalysisPrompt(entriesText: string, dateRange: { start: string; end: string }): string {
  return `
Analyze the following journal entries for sentiment and emotional patterns between ${dateRange.start} and ${dateRange.end}:

${entriesText}

Please provide a comprehensive sentiment analysis in JSON format with the following structure:
{
  "overallSentiment": {
    "score": number, // -1 to 1
    "label": string, // "positive", "negative", "neutral"
    "confidence": number // 0 to 1
  },
  "emotionalPatterns": {
    "primaryEmotions": [
      {
        "emotion": string,
        "frequency": number,
        "intensity": number // 0 to 1
      }
    ],
    "secondaryEmotions": [
      {
        "emotion": string,
        "frequency": number,
        "intensity": number
      }
    ]
  },
  "sentimentTrends": [
    {
      "date": string,
      "sentiment": number, // -1 to 1
      "primaryEmotion": string,
      "keyPhrases": string[]
    }
  ],
  "insights": {
    "emotionalTriggers": [
      {
        "trigger": string,
        "impact": number, // -1 to 1
        "frequency": number
      }
    ],
    "moodPatterns": [
      {
        "pattern": string,
        "significance": string,
        "recommendation": string
      }
    ]
  }
}

Return ONLY valid JSON.
`;
}

function formatTextualAnalysisPrompt(entriesText: string, dateRange: { start: string; end: string }): string {
  return `
Analyze the following journal entries for textual patterns and insights between ${dateRange.start} and ${dateRange.end}:

${entriesText}

Please provide a comprehensive textual analysis in JSON format with the following structure:
{
  "topics": [
    {
      "topic": string,
      "frequency": number,
      "context": string[],
      "sentiment": number // -1 to 1
    }
  ],
  "writingPatterns": {
    "vocabulary": {
      "commonWords": string[],
      "uniqueWords": string[],
      "wordCategories": [
        {
          "category": string,
          "percentage": number
        }
      ]
    },
    "structure": {
      "averageLength": number,
      "paragraphPatterns": string[],
      "temporalReferences": {
        "present": number,
        "past": number,
        "future": number
      }
    }
  },
  "keyInsights": [
    {
      "insight": string,
      "evidence": string[],
      "significance": string
    }
  ],
  "goalsAndProgress": [
    {
      "goal": string,
      "status": string,
      "progress": number, // 0 to 1
      "milestones": string[]
    }
  ],
  "recommendations": [
    {
      "area": string,
      "suggestion": string,
      "rationale": string
    }
  ]
}

Return ONLY valid JSON.
`;
}

function extractFirstJson(text: string): string | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return null;
} 