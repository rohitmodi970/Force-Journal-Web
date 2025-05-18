// app\api\fetch-journals\route.ts

import { NextRequest, NextResponse } from 'next/server';
import Journal from '@/models/JournalModel';
import User from '@/models/User';
import connectDB from '@/db/connectDB';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const mood = url.searchParams.get('mood');
    const tag = url.searchParams.get('tag');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const search = url.searchParams.get('search');

    // Build query
    const query: any = { userId: user.userId };
    
    if (mood) {
      query.mood = mood;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const journals = await Journal.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Journal.countDocuments(query);

    // Transform the data for frontend consumption
    const formattedJournals = journals.map(journal => ({
      id: journal.journalId,
      title: journal.title || 'Untitled Entry',
      preview: journal.content ? journal.content.substring(0, 150) + (journal.content.length > 150 ? '...' : '') : '',
      date: journal.date || new Date(journal.timestamp).toLocaleString(),
      mood: journal.mood || 'Neutral',
      moodColor: getMoodColor(journal.mood),
      tags: journal.tags || []
    }));

    return NextResponse.json({
      journals: formattedJournals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
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