import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import Metrics from '@/models/Metrics';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      charactersWritten,
      sessionDuration,
      pageView,
      isNewSession = false
    } = body;

    // Find or create metrics document for user
    let metrics = await Metrics.findOne({ userId: session.user.userId });
    
    if (!metrics) {
      metrics = await Metrics.create({
        userId: session.user.userId,
        totalCharactersWritten: 0,
        totalTimeSpent: 0,
        journalCount: 0,
        averageEntryLength: 0,
        waitlistStatus: {
          signedUp: false,
          grantedAccess: false
        },
        sessionHistory: []
      });
    }

    // Update metrics based on the request
    const updates: any = {
      lastActive: new Date()
    };

    if (charactersWritten) {
      updates.totalCharactersWritten = metrics.totalCharactersWritten + charactersWritten;
      // Recalculate average entry length
      const user = await User.findOne({ userId: session.user.userId });
      if (user) {
        const journalCount = await user.journalCount;
        updates.journalCount = journalCount;
        updates.averageEntryLength = updates.totalCharactersWritten / (journalCount || 1);
      }
    }

    if (sessionDuration) {
      updates.totalTimeSpent = metrics.totalTimeSpent + sessionDuration;
    }

    if (isNewSession) {
      // Start a new session
      metrics.sessionHistory.push({
        startTime: new Date(),
        pageViews: pageView ? [pageView] : []
      });
    } else if (pageView && metrics.sessionHistory.length > 0) {
      // Add page view to current session
      const currentSession = metrics.sessionHistory[metrics.sessionHistory.length - 1];
      if (!currentSession.endTime) {
        currentSession.pageViews.push(pageView);
      }
    }

    // Update the metrics document
    await Metrics.findOneAndUpdate(
      { userId: session.user.userId },
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update metrics' },
      { status: 500 }
    );
  }
}

// Endpoint to get metrics for a user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const metrics = await Metrics.findOne({ userId: session.user.userId });
    
    if (!metrics) {
      return NextResponse.json(
        { error: 'Metrics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 