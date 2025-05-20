import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Journal from '@/models/JournalModel';
import User from '@/models/User';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
  try {
    console.log('Personalized prompt endpoint called');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    console.log('User authenticated with email:', userEmail);

    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Get user's userId from their email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('Found user with userId:', user.userId);

    // Define interface for journal entries with createdAt
    interface JournalWithCreatedAt {
      content: string;
      createdAt: Date;
      [key: string]: any;
    }

    // Get the most recent journal entries for better context
    const recentEntries = await Journal
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('content createdAt')
      .lean()
      .then(entries => entries as unknown as JournalWithCreatedAt[]);

    if (!recentEntries || recentEntries.length === 0) {
      console.log('No journal entries found for userId:', user.userId);
      return NextResponse.json({
        prompt: {
          text: "What's on your mind today?",
          explanation: "Start your journaling journey by sharing your thoughts and feelings."
        },
        suggestions: {
          moodTrends: {
            primaryMood: "neutral",
            trend: "starting",
            intensity: 0.5
          },
          aiNudge: {
            theme: "Getting Started",
            suggestion: "Begin your journaling journey by writing about your day",
            action: "Try writing for 5 minutes about what made you smile today"
          },
          patternInsight: {
            pattern: "New to journaling",
            exploration: "Explore different writing styles and find what works best for you"
          }
        }
      });
    }

    // Create prompt for Gemini
    const prompt = `Based on the following recent journal entries, generate both a personalized writing prompt and AI suggestions. Analyze the entries for mood trends, patterns, and potential areas for growth.

Recent Journal Entries:

${recentEntries.map((entry, index) => `Entry ${index + 1} (${new Date(entry.createdAt).toLocaleDateString()}):
${entry.content}
---`).join('\n\n')}

Generate a response in the following JSON format:
{
  "prompt": {
    "text": "The writing prompt question",
    "explanation": "A brief explanation of why this prompt might be helpful"
  },
  "suggestions": {
    "moodTrends": {
      "primaryMood": "The dominant emotion in recent entries",
      "trend": "How the mood has been changing (increasing, decreasing, fluctuating)",
      "intensity": "A number between 0 and 1 indicating the strength of the emotion"
    },
    "aiNudge": {
      "theme": "A specific theme or topic to explore",
      "suggestion": "A personalized suggestion based on their writing",
      "action": "A specific, actionable step they can take"
    },
    "patternInsight": {
      "pattern": "An observed pattern in their writing",
      "exploration": "A suggestion for exploring this pattern further"
    }
  }
}

The response should:
1. Be personalized to their current situation and writing patterns
2. Identify emotional trends and patterns
3. Provide actionable suggestions
4. Encourage deeper reflection
5. Be supportive and constructive

Return ONLY the JSON object, no additional text.`;

    // Generate response using Gemini
    console.log('Calling Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Raw Gemini response:', text);
    
    // Clean the response by removing markdown code blocks and any extra whitespace
    const cleanedText = text
      .replace(/```json\n?|\n?```/g, '') // Remove markdown code block markers
      .replace(/^json\n?/g, '') // Remove any "json" prefix
      .trim();
    
    console.log('Cleaned response:', cleanedText);
    
    // Parse the JSON response
    let responseData;
    try {
      responseData = JSON.parse(cleanedText);
      console.log('Successfully parsed response data:', responseData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Cleaned text that failed to parse:', cleanedText);
      // Return default data if parsing fails
      return NextResponse.json({
        prompt: {
          text: "What's on your mind today?",
          explanation: "Start your journaling journey by sharing your thoughts and feelings."
        },
        suggestions: {
          moodTrends: {
            primaryMood: "neutral",
            trend: "starting",
            intensity: 0.5
          },
          aiNudge: {
            theme: "Getting Started",
            suggestion: "Begin your journaling journey by writing about your day",
            action: "Try writing for 5 minutes about what made you smile today"
          },
          patternInsight: {
            pattern: "New to journaling",
            exploration: "Explore different writing styles and find what works best for you"
          }
        }
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in personalized prompt generation:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
} 