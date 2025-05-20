import { NextRequest, NextResponse } from 'next/server';
import Journal from '@/models/JournalModel';
import User from '@/models/User';
import connectDB from '@/db/connectDB';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import { decryptJournalData } from '@/utilities/encryption';

export async function GET(
  request: NextRequest
) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const journalId = pathParts[pathParts.length - 1];
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const journal = await Journal.findOne({
      journalId,
      userId: user.userId
    }).lean();

    if (!journal) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Decrypt sensitive fields
    const decryptedJournal = decryptJournalData(journal);

    const formattedJournal = {
      id: decryptedJournal.journalId,
      title: decryptedJournal.title || 'Untitled Entry',
      content: decryptedJournal.content || '',
      date: decryptedJournal.date || new Date(decryptedJournal.timestamp).toLocaleString(),
      mood: decryptedJournal.mood || 'Neutral',
      moodColor: getMoodColor(decryptedJournal.mood),
      tags: Array.isArray(decryptedJournal.tags) ? decryptedJournal.tags : [],
      media: decryptedJournal.media || {
        image: [],
        audio: [],
        video: [],
        document: []
      },
      timestamp: decryptedJournal.timestamp
    };

    return NextResponse.json(formattedJournal);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 });
  }
}

function getMoodColor(mood: string | null): string {
  if (!mood) return 'gray';

  const moodMap: { [key: string]: string } = {
    Happy: 'yellow',
    Sad: 'blue',
    Angry: 'red',
    Excited: 'orange',
    Peaceful: 'blue',
    Anxious: 'purple',
    Optimistic: 'green',
    Frustrated: 'red',
    Grateful: 'green',
    Stressed: 'purple',
    Thoughtful: 'purple',
    Neutral: 'gray'
  };

  return moodMap[mood] || 'gray';
}