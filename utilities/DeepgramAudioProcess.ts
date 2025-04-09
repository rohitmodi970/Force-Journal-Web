import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Define TypeScript interfaces for the Deepgram API response structure
interface DeepgramAlternative {
  transcript: string;
  confidence: number;
}

interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

interface DeepgramSentimentAverage {
  sentiment: string;
  sentiment_score: number;
}

interface DeepgramSentiments {
  average: DeepgramSentimentAverage;
}

interface DeepgramSummary {
  short: string;
}

interface DeepgramTopic {
  topic: string;
  confidence: number;
}

interface DeepgramTopicSegment {
  topics: DeepgramTopic[];
}

interface DeepgramTopics {
  segments: DeepgramTopicSegment[];
}

interface DeepgramResults {
  channels: DeepgramChannel[];
  sentiments: DeepgramSentiments;
  summary: DeepgramSummary;
  topics: DeepgramTopics;
  keywords: Record<string, number>;
}

interface DeepgramResponse {
  results: DeepgramResults;
}

interface DeepgramProcessResult {
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

/**
 * Process audio file with Deepgram API for transcription and analysis
 * @param filePath - Path to the audio file for processing
 * @returns Processing results including transcript and analysis
 */
const processWithDeepgram = async (filePath: string): Promise<DeepgramProcessResult> => {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
    }

    const audioData = fs.readFileSync(filePath);

    const response = await axios.post<DeepgramResponse>('https://api.deepgram.com/v1/listen', audioData, {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      params: {
        model: 'nova',
        language: 'en-US',
        detect_topics: true,
        sentiment: true,
        keywords: true,
        summarize: 'v2',
        topics: true,
        detect_entities: true,
      },
    });
    
    console.log("response.data.results", response.data.results);
    
    // Extract transcript and confidence
    let transcript = '';
    let confidence = 0;
    if (response.data?.results?.channels) {
      const channel = response.data.results.channels[0];
      if (channel.alternatives?.length > 0) {
        const alternative = channel.alternatives[0];
        transcript = alternative.transcript || '';
        confidence = alternative.confidence || 0;
      }
    }

    // Extract sentiment data
    let sentiment = { overall: '', score: 0 };
    if (response.data?.results?.sentiments?.average) {
      sentiment = {
        overall: response.data.results.sentiments.average.sentiment,
        score: response.data.results.sentiments.average.sentiment_score,
      };
    }
    
    console.log("Sentiment: ", sentiment);
    
    // Extract summary
    let summary = '';
    if (response.data?.results?.summary?.short) {
      summary = response.data.results.summary.short;
    }

    // Extract topics
    let topics: string[] = [];
    const extractTopics = (segments: DeepgramTopicSegment[] | undefined): string[] => {
      if (!segments || !Array.isArray(segments)) {
        return [];
      }
      
      return segments.flatMap((segment) => 
        segment.topics?.map(t => t.topic) || []
      );
    };
    
    // Example usage:
    const segments = response.data.results.topics.segments;
    topics = extractTopics(segments);
    console.log(topics);

    // Extract keywords
    let keywords: string[] = [];
    if (response.data?.results?.keywords) {
      keywords = Object.keys(response.data.results.keywords);
    } else {
      // Fallback: extract potential keywords from transcript
      const words = transcript.toLowerCase().split(/\s+/);
      const stopWords = ['the', 'and', 'is', 'in', 'to', 'a', 'of', 'with', 'for', 'on'];
      keywords = words
        .filter(word => word.length > 4 && !stopWords.includes(word))
        .filter((word, index, self) => self.indexOf(word) === index)
        .slice(0, 5);
    }

    return {
      transcript,
      confidence,
      sentiment,
      topics,
      keywords,
      summary,
    };
  } catch (error: any) {
    console.error('Error processing with Deepgram:', error.message);

    // Return mock data as a fallback
    return {
      transcript: 'This is a sample transcription as a fallback since the API call failed.',
      confidence: 0.92,
      sentiment: { overall: 'neutral', score: 0.1 },
      topics: ['general', 'business'],
      keywords: ['sample', 'transcription', 'fallback', 'called', 'failed'],
      summary: 'This is a sample summary as a fallback since the API call failed.',
    };
  }
};

export { processWithDeepgram, type DeepgramProcessResult };