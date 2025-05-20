// File: app/api/fetch-journals/journal-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import Journal from '@/models/JournalModel';
import User from '@/models/User';
import { decryptJournalData } from '@/utilities/encryption';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get user from session
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Query all journals for this user
    const journals = await Journal.find({ userId: user.userId }).sort({ timestamp: -1 }).lean();

    // Decrypt sensitive fields
    const decryptedJournals = journals.map(journal => decryptJournalData(journal));

    // Calculate statistics
    const stats = calculateJournalStats(decryptedJournals);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error in journal stats API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function calculateJournalStats(journals: any[]) {
  if (!journals || journals.length === 0) {
    return {
      totalEntries: 0,
      streakCount: 0,
      lastEntryDate: null,
      weeklyEntries: 0,
      averageMood: "Neutral",
      mostProductiveDay: "Monday",
      topTopics: []
    };
  }

  const totalEntries = journals.length;
  const lastEntryDate = journals[0].timestamp;

  const streakCount = calculateStreak(journals);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyEntries = journals.filter(journal =>
    new Date(journal.timestamp) >= oneWeekAgo
  ).length;

  const moodCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  journals.forEach(journal => {
    if (!journal.mood) return;
    const lowerMood = String(journal.mood).toLowerCase();
    if (lowerMood.includes('happy') || lowerMood.includes('good') || lowerMood.includes('great')) {
      moodCounts.positive++;
    } else if (lowerMood.includes('sad') || lowerMood.includes('bad') || lowerMood.includes('angry')) {
      moodCounts.negative++;
    } else {
      moodCounts.neutral++;
    }
  });

  let averageMood = "Neutral";
  if (moodCounts.positive > moodCounts.neutral && moodCounts.positive > moodCounts.negative) {
    averageMood = "Positive";
  } else if (moodCounts.negative > moodCounts.neutral && moodCounts.negative > moodCounts.positive) {
    averageMood = "Negative";
  }

  const dayEntries: Record<string, number> = {
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0,
    'Sunday': 0
  };

  journals.forEach(journal => {
    const day = new Date(journal.timestamp).toLocaleString('en-US', { weekday: 'long' }) as keyof typeof dayEntries;
    dayEntries[day]++;
  });

  let mostProductiveDay = 'Monday';
  let maxEntries = 0;
  for (const [day, count] of Object.entries(dayEntries)) {
    if (count > maxEntries) {
      mostProductiveDay = day;
      maxEntries = count;
    }
  }

  const topicCounts: Record<string, number> = {};
  journals.forEach(journal => {
    if (Array.isArray(journal.tags) && journal.tags.length) {
      journal.tags.forEach((tag: string) => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      });
    }
  });

  const topTopics = Object.entries(topicCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5);

  return {
    totalEntries,
    streakCount,
    lastEntryDate,
    weeklyEntries,
    averageMood,
    mostProductiveDay,
    topTopics
  };
}

function calculateStreak(journals: any[]): number {
  if (!journals.length) return 0;

  const sortedJournals = [...journals].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEntryDate = new Date(sortedJournals[0].timestamp);
  lastEntryDate.setHours(0, 0, 0, 0);

  if (today.getTime() - lastEntryDate.getTime() > 86400000 * 2) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return lastEntryDate.getTime() === yesterday.getTime() ? 1 : 0;
  }

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const journalDates = new Map();
  sortedJournals.forEach(journal => {
    const journalDate = new Date(journal.timestamp);
    journalDate.setHours(0, 0, 0, 0);
    journalDates.set(journalDate.getTime(), true);
  });

  while (journalDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}
