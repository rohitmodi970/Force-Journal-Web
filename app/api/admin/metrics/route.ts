import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import Metrics from '@/models/Metrics';
import User from '@/models/User';

// Helper to check if user is admin
async function isAdmin(userId: number): Promise<boolean> {
  const user = await User.findOne({ userId });
  return user?.isAdmin === true;
}

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

    // Check if user is admin
    if (!(await isAdmin(session.user.userId))) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    let data;
    if (userId) {
      // Get metrics for specific user
      const userMetrics = await Metrics.findOne({ userId: parseInt(userId, 10) });
      if (!userMetrics) {
        return NextResponse.json(
          { error: 'User metrics not found' },
          { status: 404 }
        );
      }
      data = { userMetrics };
    } else {
      // Get global metrics
      const [globalMetrics] = await Metrics.getGlobalMetrics();
      data = { globalMetrics };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// Endpoint to update waitlist status
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

    // Check if user is admin
    if (!(await isAdmin(session.user.userId))) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (action === 'grantAccess') {
      updates['waitlistStatus.grantedAccess'] = true;
      updates['waitlistStatus.grantedAccessAt'] = new Date();
    } else if (action === 'revokeAccess') {
      updates['waitlistStatus.grantedAccess'] = false;
      updates['waitlistStatus.grantedAccessAt'] = null;
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const updatedMetrics = await Metrics.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );

    if (!updatedMetrics) {
      return NextResponse.json(
        { error: 'User metrics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, metrics: updatedMetrics });
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist status' },
      { status: 500 }
    );
  }
} 