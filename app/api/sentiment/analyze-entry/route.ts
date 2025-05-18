import { NextResponse } from 'next/server';
import axios from 'axios';

// Define the response type from your model
interface ModelResponse {
  sentiment_score: number;
  sentiment_label: string;
  emotion_scores: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  key_phrases: string[];
  roberta_sentiment?: string;
  primary_emotion?: string;
  secondary_emotions?: string[];
}

// Define the request payload type
interface ModelRequestPayload {
  text: string;
  image?: string; // base64 encoded image
}

// Define the error type
interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
  message: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const image = formData.get('image') as File | null;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for sentiment analysis' },
        { status: 400 }
      );
    }

    // Get the model URL from environment variable
    const MODEL_URL = process.env.SENTIMENT_MODEL_URL;
    if (!MODEL_URL) {
      throw new Error('SENTIMENT_MODEL_URL is not defined in environment variables');
    }

    // Prepare the request payload
    const payload: ModelRequestPayload = {
      text: text
    };

    // If there's an image, convert it to base64 and add to payload
    if (image) {
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
      payload.image = base64Image;
    }

    // Make request to your deployed model
    const response = await axios.post<ModelResponse>(MODEL_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Return the model's response
    return NextResponse.json(response.data);

  } catch (error: unknown) {
    console.error('Sentiment analysis error:', error);
    
    const apiError = error as ApiError;
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to analyze sentiment',
        details: apiError.response?.data?.error || apiError.message
      },
      { status: apiError.response?.status || 500 }
    );
  }
} 