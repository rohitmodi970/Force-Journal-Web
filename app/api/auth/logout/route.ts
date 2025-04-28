// File: app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/db/connectDB';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Update user's new_user status to false
    await User.findByIdAndUpdate(userId, {
      new_user: false
    });

    return NextResponse.json(
      { success: true, message: 'User status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}