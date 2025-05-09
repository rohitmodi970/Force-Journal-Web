// app/api/journal-analysis/route.ts
// Complete implementation with all three providers: Gemini, OpenAI, and Claude

import { NextRequest, NextResponse } from 'next/server';
import { JournalEntry } from '@/components/Journal/types';

// Analysis types
export type AnalysisTimeframe = 'day' | 'week' | 'month' | 'custom';
export type AnalysisType = 
  | 'sentiment' 
  | 'topics' 
  | 'goals' 
  | 'mood' 
  | 'wordCloud' 
  | 'socialInteractions'
  | 'activities'
  | 'timeAllocation'
  | 'all';

interface AnalysisRequest {
  entries: JournalEntry[];
  timeframe: AnalysisTimeframe;
  analysisTypes: AnalysisType[];
  userName?: string;
  startDate?: string;
  endDate?: string;
  provider?: 'gemini' | 'openai' | 'claude';
}

// LLM provider types
type LLMProvider = 'gemini' | 'openai' | 'claude';

// Configuration for each LLM provider
const LLM_CONFIG = {
  gemini: {
    modelName: 'gemini-2.0-flash',
    maxTokens: 8192,
  },
  openai: {
    modelName: 'gpt-2.5-turbo',
    maxTokens: 8192,
  },
  claude: {
    modelName: 'claude-3-5-sonnet-20240620',
    maxTokens: 8192,
  }
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { 
      entries, 
      timeframe = 'day', 
      analysisTypes = ['all'],
      userName,
      startDate,
      endDate,
      provider = process.env.DEFAULT_LLM_PROVIDER as LLMProvider  
    }: AnalysisRequest = await request.json();
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'Journal entries are required' }, { status: 400 });
    }
    
    // Prepare entries for analysis
    const entriesData = prepareJournalDataForAnalysis(entries, timeframe, startDate, endDate);
    
    // Get analysis from selected provider
    const analysisResults = await getJournalAnalysis(
      entriesData, 
      analysisTypes, 
      provider as LLMProvider,
      userName
    );
    
    return NextResponse.json({ 
      success: true,
      timeframe,
      analysisTypes,
      provider,
      results: analysisResults,
      entriesCount: entries.length
    });
    
  } catch (error) {
    console.error('Journal analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze journal entries', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Prepare journal data for analysis based on timeframe
function prepareJournalDataForAnalysis(
  entries: JournalEntry[], 
  timeframe: AnalysisTimeframe,
  startDate?: string,
  endDate?: string
): any {
  // Filter entries by date range if specified
  let filteredEntries = entries;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }
  
  // Group entries by time period if needed
  if (timeframe === 'day') {
    // Group by individual days
    const entriesByDay = filteredEntries.reduce((acc, entry) => {
      const date = entry.date.split('T')[0]; // YYYY-MM-DD
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, JournalEntry[]>);
    
    return entriesByDay;
  } 
  else if (timeframe === 'week') {
    // Group by week
    const entriesByWeek = filteredEntries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) acc[weekKey] = [];
      acc[weekKey].push(entry);
      return acc;
    }, {} as Record<string, JournalEntry[]>);
    
    return entriesByWeek;
  }
  else if (timeframe === 'month') {
    // Group by month
    const entriesByMonth = filteredEntries.reduce((acc, entry) => {
      const yearMonth = entry.date.substring(0, 7); // YYYY-MM
      if (!acc[yearMonth]) acc[yearMonth] = [];
      acc[yearMonth].push(entry);
      return acc;
    }, {} as Record<string, JournalEntry[]>);
    
    return entriesByMonth;
  }
  
  // Default: return all entries without grouping
  return { all: filteredEntries };
}

// Get journal analysis from selected provider
async function getJournalAnalysis(
  entriesData: any, 
  analysisTypes: AnalysisType[],
  provider: LLMProvider = (process.env.DEFAULT_LLM_PROVIDER as LLMProvider) || 'gemini', 
  userName?: string
): Promise<any> {
  try {
    if (provider === 'gemini') {
      return await getGeminiAnalysis(entriesData, analysisTypes, userName);
    } 
    else if (provider === 'openai') {
      return await getOpenAIAnalysis(entriesData, analysisTypes, userName);
    }
    else if (provider === 'claude') {
      return await getClaudeAnalysis(entriesData, analysisTypes, userName);
    }
    else {
      throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  } catch (error) {
    console.error('Journal analysis error:', error);
    throw error;
  }
}

// Gemini analysis implementation
async function getGeminiAnalysis(
  entriesData: any, 
  analysisTypes: AnalysisType[],
  userName?: string
): Promise<any> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const modelName = LLM_CONFIG.gemini.modelName;
    
    // Create the analysis prompt
    const prompt = createAnalysisPrompt(entriesData, analysisTypes, userName);
    
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      //@ts-ignore
      generationConfig: {
        maxOutputTokens: LLM_CONFIG.gemini.maxTokens,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });
    
    const text = response.text || '';
    
    // Try to parse the response as JSON
    try {
      // Gemini sometimes wraps its JSON in markdown code blocks
      const jsonText = text.replace(/```json\n|\n```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', e);
      // Return the raw text if JSON parsing fails
      return { rawAnalysis: text };
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
}

// OpenAI analysis implementation
async function getOpenAIAnalysis(
  entriesData: any, 
  analysisTypes: AnalysisType[],
  userName?: string
): Promise<any> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    // Create the analysis prompt for OpenAI
    const prompt = createAnalysisPrompt(entriesData, analysisTypes, userName);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: LLM_CONFIG.openai.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a professional journal analyzer providing detailed insights and analysis. Return your analysis in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: LLM_CONFIG.openai.maxTokens,
        temperature: 0.7,
        top_p: 0.95,
        response_format: { type: "json_object" }  // Request JSON response format
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API error');
    }
    
    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Try to parse the response as JSON
    try {
      // OpenAI might wrap response in code blocks despite the response_format setting
      const jsonText = text.replace(/```json\n|\n```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', e);
      // Return the raw text if JSON parsing fails
      return { rawAnalysis: text };
    }
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
}

// Claude analysis implementation
async function getClaudeAnalysis(
  entriesData: any, 
  analysisTypes: AnalysisType[],
  userName?: string
): Promise<any> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not defined in environment variables');
    }
    
    // Create the analysis prompt for Claude
    const prompt = createAnalysisPrompt(entriesData, analysisTypes, userName);
    // Enhance the prompt with Claude-specific formatting
    const enhancedPrompt = enhanceClaudePrompt(prompt);
    
    // Make API request to Anthropic's Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: LLM_CONFIG.claude.modelName,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: LLM_CONFIG.claude.maxTokens,
        temperature: 0.7,
        system: 'You are a professional journal analyzer providing detailed insights and analysis. Return your analysis in valid JSON format only without any additional text.'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Claude API error');
    }
    
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    
    // Try to parse the response as JSON
    try {
      // Claude might wrap its JSON in markdown code blocks
      const jsonText = text.replace(/```json\n|\n```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse Claude response as JSON:', e);
      // Return the raw text if JSON parsing fails
      return { rawAnalysis: text };
    }
  } catch (error) {
    console.error('Claude analysis error:', error);
    throw error;
  }
}

// Additional helper function to enhance Claude-specific prompt if needed
function enhanceClaudePrompt(basePrompt: string): string {
  // Claude performs well with XML-structured instructions
  return `${basePrompt}

<instructions>
Please analyze the journal entries carefully and provide insights that are:
1. Empathetic and psychologically informed
2. Based strictly on the content provided
3. Structured exactly according to the requested JSON format
4. Free from any explanatory text outside the JSON structure

Your response should begin with the opening brace '{' and end with the closing brace '}' with no additional text.
</instructions>`;
}

// Create a detailed prompt for journal analysis
function createAnalysisPrompt(
  entriesData: any, 
  analysisTypes: AnalysisType[],
  userName?: string
): string {
  const includeAll = analysisTypes.includes('all');
  const timeframes = Object.keys(entriesData);
  
  // Build the analysis instructions
  let prompt = `
You are a professional journal analyzer. I'll provide you with journal entries for ${userName || 'a user'}.
Please analyze these entries and provide meaningful insights. 

JOURNAL ENTRIES:
`;

  // Add the journal entries organized by timeframe
  timeframes.forEach(timeframe => {
    const entries = entriesData[timeframe];
    prompt += `\n--- ${timeframe} ---\n`;
    
    entries.forEach((entry: JournalEntry, index: number) => {
      prompt += `\nEntry ${index + 1}:
Title: ${entry.title}
Date: ${entry.date}
Content: ${entry.content}
Mood: ${entry.mood || 'Not specified'}
Tags: ${entry.tags.join(', ') || 'None'}
${entry.mediaType.length > 0 ? `Media: ${entry.mediaType.join(', ')}` : ''}
`;
    });
  });

  // Add specific analysis requests
  prompt += `\nANALYSIS REQUESTED:
Please provide the following analysis in JSON format:
`;

  if (includeAll || analysisTypes.includes('sentiment')) {
    prompt += `
- Overall sentiment analysis: Determine the general emotional tone of the journal entries. 
  Score the sentiment on a scale from -10 (extremely negative) to +10 (extremely positive).
`;
  }

  if (includeAll || analysisTypes.includes('topics')) {
    prompt += `
- Key topics: Identify the main topics, themes, and recurring subjects in the entries.
  For each topic, provide the frequency and context.
`;
  }

  if (includeAll || analysisTypes.includes('mood')) {
    prompt += `
- Mood distribution: Analyze the emotional patterns and variations in mood.
  Calculate percentages of different mood states and notice any patterns.
`;
  }

  if (includeAll || analysisTypes.includes('wordCloud')) {
    prompt += `
- Word frequency: List the most frequently used meaningful words and their counts.
  Exclude common words like "the", "and", "I", etc.
`;
  }

  if (includeAll || analysisTypes.includes('goals')) {
    prompt += `
- Goals and aspirations: Identify any mentioned goals, aspirations, or intentions.
  Track any progress mentioned toward these goals across entries.
`;
  }

  if (includeAll || analysisTypes.includes('socialInteractions')) {
    prompt += `
- Social interactions: Identify people mentioned and the nature of relationships.
  Count how many unique individuals are mentioned and categorize relationships.
`;
  }

  if (includeAll || analysisTypes.includes('activities')) {
    prompt += `
- Activities and skills: Identify activities, hobbies, and skills mentioned.
  Categorize by frequency and importance to the user.
`;
  }

  if (includeAll || analysisTypes.includes('timeAllocation')) {
    prompt += `
- Time allocation: Analyze how the user spends their time based on the entries.
  Categorize time spent in different areas of life.
`;
  }

  // Request for insights and recommendations
  prompt += `
- Insights: Provide 3-5 deep, personalized insights about patterns, behaviors, or opportunities for growth.
- Recommendations: Suggest 3-5 actionable recommendations based on the journal content.

FORMAT YOUR RESPONSE AS VALID JSON with the following structure:
{
  "sentiment": {
    "overall": "string description",
    "score": number
  },
  "topics": [
    { "name": "string", "frequency": number, "context": "string" }
  ],
  "moodDistribution": {
    "categories": ["happy", "sad", "anxious", etc.],
    "values": [percentage1, percentage2, etc.]
  },
  "wordCloud": [
    { "word": "string", "count": number }
  ],
  "goals": [
    { "goal": "string", "mentions": number, "progress": "string" }
  ],
  "socialInteractions": {
    "totalPeopleMentioned": number,
    "people": [
      { "name": "string", "mentions": number, "relationship": "string" }
    ]
  },
  "activities": [
    { "name": "string", "frequency": number, "category": "string" }
  ],
  "timeAllocation": [
    { "category": "string", "percentage": number }
  ],
  "insights": ["string", "string", ...],
  "recommendations": ["string", "string", ...]
}

ONLY include the sections I specifically requested above. Return ONLY valid JSON without any additional text, comments, or explanations.
`;

  return prompt;
}