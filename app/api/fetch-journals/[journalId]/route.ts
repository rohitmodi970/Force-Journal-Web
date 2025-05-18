
// app\api\fetch-journals\[journalId]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import Journal from '@/models/JournalModel';
import User from '@/models/User';
import connectDB from '@/db/connectDB';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { journalId: string } }
) {
  try {
    // Connect to the database
    await connectDB();

    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user from the database
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { journalId } = params;

    // Check if journal entry exists and belongs to the authenticated user
    const journal = await Journal.findOne({
      journalId,
      userId: user.userId
    }).lean();

    if (!journal) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Format the journal data for the frontend
    const formattedJournal = {
      id: journal.journalId,
      title: journal.title || 'Untitled Entry',
      content: journal.content || '',
      date: journal.date || new Date(journal.timestamp).toLocaleString(),
      mood: journal.mood || 'Neutral',
      moodColor: getMoodColor(journal.mood),
      tags: journal.tags || [],
      media: journal.media || {
        image: [],
        audio: [],
        video: [],
        document: []
      },
      timestamp: journal.timestamp
    };

    return NextResponse.json(formattedJournal);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 });
  }
}

// Helper function to map mood to color
function getMoodColor(mood: string | null): string {
  if (!mood) return 'gray';
  
  const moodMap: {[key: string]: string} = {
    'Happy': 'yellow',
    'Sad': 'blue',
    'Angry': 'red',
    'Excited': 'orange',
    'Peaceful': 'blue',
    'Anxious': 'purple',
    'Optimistic': 'green',
    'Frustrated': 'red',
    'Grateful': 'green',
    'Stressed': 'purple',
    'Thoughtful': 'purple',
    'Neutral': 'gray'
  };
  
  return moodMap[mood] || 'gray';
}