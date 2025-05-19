import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Starting sentiment analysis request...');
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const image = formData.get('image') as File | null;

    console.log('Received text length:', text?.length || 0);
    console.log('Received image:', image ? 'Yes' : 'No');

    if (!text) {
      console.log('Error: No text provided');
      return NextResponse.json(
        { error: 'Text is required for sentiment analysis' },
        { status: 400 }
      );
    }

    // Get the model URL from environment variable
    const MODEL_URL = process.env.SENTIMENT_MODEL_URL;
    console.log('Model URL configured:', MODEL_URL ? 'Yes' : 'No');
    
    if (!MODEL_URL) {
      console.error('Error: SENTIMENT_MODEL_URL is not defined');
      throw new Error('SENTIMENT_MODEL_URL is not defined in environment variables');
    }

    // Forward the FormData as multipart/form-data to the model
    const forwardForm = new FormData();
    forwardForm.append('text', text);
    if (image) {
      forwardForm.append('image', image, (image as File).name);
    }

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

    console.log('Forwarding request to model at:', MODEL_URL);
    let response;
    try {
      response = await fetch(MODEL_URL, {
        method: 'POST',
        body: forwardForm,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
      } catch {
        errorData = 'Unable to parse error response';
      }
      console.error('Model returned error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze sentiment', details: errorData, status: response.status, url: MODEL_URL },
        { status: response.status }
      );
    }

    let result;
    try {
      result = await response.json();
    } catch {
      const textResult = await response.text();
      console.error('Model returned non-JSON response:', textResult);
      return NextResponse.json(
        { error: 'Model returned non-JSON response', details: textResult },
        { status: 500 }
      );
    }
    console.log('Received response from model:', result);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request to model timed out');
      return NextResponse.json(
        { error: 'Request to model timed out' },
        { status: 504 }
      );
    }
    console.error('Detailed sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 