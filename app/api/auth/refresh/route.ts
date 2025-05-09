// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active session' 
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Find user and check token status
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // Check Google token expiry
    if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
      // Token is expired - client should force sign out and sign in again
      return NextResponse.json({ 
        success: false, 
        message: 'Google token expired, please sign in again',
        expired: true
      }, { status: 401 });
    }
    
    // Return fresh token information
    return NextResponse.json({
      success: true,
      tokenInfo: {
        hasGoogleToken: !!user.googleAccessToken,
        tokenExpiry: user.googleTokenExpiry,
        expiresIn: user.googleTokenExpiry ? 
          Math.floor((user.googleTokenExpiry.getTime() - Date.now()) / 1000) : null
      }
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to check token status'
    }, { status: 500 });
  }
}

// POST endpoint to manually trigger token refresh
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.googleRefreshToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'No refresh token available' 
      }, { status: 400 });
    }
    
    // Call the Google OAuth token endpoint
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: session.user.googleRefreshToken,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to refresh token',
        error: tokens
      }, { status: response.status });
    }
    
    // Update user in database with new token
    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {})
    });
    
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresIn: tokens.expires_in
    });
  } catch (error: any) {
    console.error('Manual token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to refresh token'
    }, { status: 500 });
  }
}