// app/api/fetchUserData/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/connectDB';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user session using Next.js App Router method
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email })
      .select('-password -googleAccessToken -googleRefreshToken'); // Exclude sensitive fields
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}