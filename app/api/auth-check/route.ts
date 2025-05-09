// app/api/auth-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Return detailed session info for debugging
    return NextResponse.json({
      authenticated: !!session?.user,
      session: {
        exists: !!session,
        user: session?.user ? {
          name: session.user.name,
          email: session.user.email,
        //   image: session.user.image,
        } : null,
        expires: session?.expires,
        hasAccessToken: !!session?.accessToken,
      },
      headers: {
        cookie: req.headers.get('cookie') ? 'Present' : 'Missing',
        authorization: req.headers.get('authorization') ? 'Present' : 'Missing',
      }
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to check authentication',
      authenticated: false
    }, { status: 500 });
  }
}