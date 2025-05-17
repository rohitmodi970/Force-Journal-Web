// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import User from '@/models/User';

/**
 * GET endpoint to check the status of the user's tokens
 */
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
    const isTokenExpired = user.googleTokenExpiry && user.googleTokenExpiry < new Date();
    
    // Return token information
    return NextResponse.json({
      success: true,
      tokenInfo: {
        hasGoogleToken: !!user.googleAccessToken,
        tokenExpiry: user.googleTokenExpiry,
        expiresIn: user.googleTokenExpiry ?
          Math.floor((user.googleTokenExpiry.getTime() - Date.now()) / 1000) : null,
        isExpired: isTokenExpired
      }
    });
  } catch (error: any) {
    console.error('Token status check error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to check token status'
    }, { status: 500 });
  }
}

/**
 * POST endpoint to manually trigger token refresh
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validate session and refresh token
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'No active session'
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Get the latest user data to ensure we have the most recent refresh token
    const user = await User.findById(session.user.id);
    
    if (!user?.googleRefreshToken) {
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
        refresh_token: user.googleRefreshToken,
      }),
    });
    
    const tokens = await response.json();
    
    if (!response.ok) {
      console.error('Google token refresh failed:', tokens);
      
      // Handle specific error cases
      if (tokens.error === 'invalid_grant') {
        // Mark the refresh token as invalid in the database
        await User.findByIdAndUpdate(session.user.id, {
          googleRefreshTokenInvalid: true
        });
        
        return NextResponse.json({
          success: false,
          message: 'Refresh token is invalid or has been revoked',
          error: 'invalid_grant',
          requiresReauth: true
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        message: 'Failed to refresh token',
        error: tokens.error || 'unknown_error'
      }, { status: response.status });
    }
    
    // Calculate new expiry time
    const expiryTime = new Date(Date.now() + (tokens.expires_in * 1000));
    
    // Update user in database with new token information
    await User.findByIdAndUpdate(session.user.id, {
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: expiryTime,
      googleRefreshTokenInvalid: false,
      // Only update refresh token if a new one was provided
      ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {})
    });
    
    // Return success with token information
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      tokenInfo: {
        expiresIn: tokens.expires_in,
        expiryTime: expiryTime,
        // Only send part of the access token for logging/debugging
        tokenPreview: tokens.access_token ? 
          `${tokens.access_token.substring(0, 5)}...${tokens.access_token.substring(tokens.access_token.length - 5)}` : 
          null,
        receivedNewRefreshToken: !!tokens.refresh_token
      }
    });
  } catch (error: any) {
    console.error('Manual token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to refresh token'
    }, { status: 500 });
  }
}