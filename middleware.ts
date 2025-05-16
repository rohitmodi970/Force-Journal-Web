// middleware.ts 
import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  async function middleware(req) {
    console.log("Middleware called for path:", req.nextUrl.pathname);
    
    // Check if token exists and is valid
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // Check for expired access tokens and redirect to login if needed
    if (token?.error === "RefreshAccessTokenError") {
      console.log("❌ Token refresh error, redirecting to login");
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    // For new users, redirect to registration/onboarding
    // IMPORTANT FIX: Only redirect if we're not already on the onboarding page
    // if (token?.new_user === true && 
    //     !req.nextUrl.pathname.startsWith('/auth/register') && 
    //     !req.nextUrl.pathname.startsWith('/user/onboarding')) {
    //   console.log("🆕 New user detected, redirecting to registration");
    //   return NextResponse.redirect(new URL('/user/onboarding', req.url));
    // }
    
    return NextResponse.next();
  },
  
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        const publicPaths = [
          '/auth',
          '/about',
          '/contact',
          '/api/public',
          '/api/auth',
        ];
        
        // Fix: Handle '/' separately to avoid false matches
        const isPublicPath = 
          pathname === '/' || publicPaths.some(path => pathname.startsWith(path));
        
        if (isPublicPath) {
          console.log("✅ Public path allowed:", pathname);
          return true;
        }
        
        // IMPORTANT FIX: Make onboarding accessible for new users
        if (pathname.startsWith('/user/onboarding') && token?.new_user === true) {
          console.log("✅ New user accessing onboarding, allowed");
          return true;
        }
        
        // Protect other /user/* routes
        const isProtected = pathname.startsWith('/user');
        const isAuthorized = !!token;
        
        if (isProtected) {
          console.log(`🔒 Protected path: ${pathname}, Authenticated: ${isAuthorized}`);
          return isAuthorized;
        }
        
        return true;
      },
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
  }
);

// ✅ Match both `/user/**` routes and any path for checking token validity
export const config = {
  matcher: [
    '/user/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};