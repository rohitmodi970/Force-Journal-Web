import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';

// Hardcoded prompts for now - will be replaced with LLM-generated content later
const journalPrompts = [
  {
    text: "What's something you're looking forward to?",
    explanation: "Taking a moment to anticipate positive events can boost your mood and give you something to look forward to."
  },
  {
    text: "What made you smile today?",
    explanation: "Reflecting on positive moments, no matter how small, can help build gratitude and improve your mood."
  },
  {
    text: "Describe a challenge you're facing and three potential solutions.",
    explanation: "Breaking down problems into potential solutions helps reduce anxiety and builds problem-solving skills."
  },
  {
    text: "What's one thing you'd like to improve about yourself?",
    explanation: "Self-reflection helps identify growth opportunities and sets the foundation for positive change."
  },
  {
    text: "Who had the biggest influence on your life, and why?",
    explanation: "Understanding our influences helps us recognize the values and beliefs that shape our decisions."
  },
  {
    text: "What is something you're grateful for today?",
    explanation: "Practicing gratitude regularly has been shown to increase happiness and reduce stress."
  },
  {
    text: "If you could change one decision from your past, what would it be and why?",
    explanation: "Reflecting on past choices helps us learn and make better decisions in the future."
  },
  {
    text: "What boundaries do you need to set or maintain in your life right now?",
    explanation: "Healthy boundaries protect your wellbeing and help maintain balanced relationships."
  }
];

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database - even though we're using hardcoded data for now,
    // establishing the connection maintains consistent behavior with other routes
    await connectDB();

    // Select a random prompt from the array
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

    return NextResponse.json(randomPrompt, { status: 200 });
  } catch (error) {
    console.error("Error in random prompt API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
