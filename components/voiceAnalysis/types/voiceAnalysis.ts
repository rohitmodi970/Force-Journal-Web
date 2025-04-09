// types.ts - Place this in a shared directory, such as @/types/

export interface EmotionData {
    name: string;
    value: number;
  }
  
  export interface SpeechData {
    pitch?: {
      average?: number;
    };
    rate?: {
      wordsPerMinute?: number;
    };
    pauses?: {
      count?: number;
    };
  }
  
  export interface LinguisticsData {
    transcript?: string;
    confidence?: number;
  }
  
  export interface SentimentData {
    overall?: string;
  }
  
  export interface AnalysisResults {
    // Combine both interface definitions
    emotions?: Record<string, number>;
    speech?: SpeechData;
    linguistics?: LinguisticsData; // Making this optional to match the page's interface
    sentiment?: SentimentData;
    topics?: string[];
    
    // Properties from the page's interface
    speechPatterns?: any;
    textAnalysis?: any;
    energyLevels?: any;
    overviewData?: any;
    correlations?: any;
  }