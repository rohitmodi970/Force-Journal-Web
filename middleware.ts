// middleware.ts
import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  async function middleware(req) {
    console.log("Middleware called for path:", req.nextUrl.pathname);
    
    // Check if token exists and is valid
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("Token:", token);
    
    // Redirect authenticated users from homepage to dashboard
    if (token && req.nextUrl.pathname === '/') {
      console.log("✅ Authenticated user visiting homepage, redirecting to dashboard");
      return NextResponse.redirect(new URL('/user/dashboard', req.url));
    }
    
    // Check for expired access tokens and redirect to login if needed
    if (token?.error === "RefreshAccessTokenError") {
      console.log("❌ Token refresh error, redirecting to login");
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    // Remaining middleware logic stays the same...
    // Check Google token status for protected routes that require Google integration
    if (token && 
        token.onboardingComplete === true && 
        (req.nextUrl.pathname.startsWith('/user/google') || 
         req.nextUrl.pathname.startsWith('/user/drive'))) {
      
      try {
        // Check token status via our API
        const tokenCheckResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/refresh`, {
          headers: {
            'Cookie': req.headers.get('cookie') || '',
            'Content-Type': 'application/json',
          },
        });
        
        const tokenData = await tokenCheckResponse.json();
        
        // If token check fails or token is expired
        if (!tokenData.success || 
            (tokenData.tokenInfo.isExpired || tokenData.tokenInfo.expiresIn < 60)) {
          console.log("🔄 Google token expired or missing, redirecting to token refresh page");
          return NextResponse.redirect(new URL('/user/refresh-google-token', req.url));
        }
      } catch (error) {
        console.error("Error checking token status:", error);
        // On error, we'll just continue and let the specific API handle the error
      }
    }
    
    // For new users or users without completed onboarding, redirect to onboarding
    if (token && 
        (token.onboardingComplete === false) && 
        !req.nextUrl.pathname.startsWith('/auth/register') && 
        !req.nextUrl.pathname.startsWith('/user/onboarding')) {
      console.log("🆕 User needs onboarding, redirecting to onboarding flow");
      return NextResponse.redirect(new URL('/user/onboarding', req.url));
    }
    
    // For authenticated users with completed onboarding trying to visit onboarding page
    if (token && 
        token.onboardingComplete === true && 
        req.nextUrl.pathname.startsWith('/user/onboarding')) {
      console.log("✅ User already completed onboarding, redirecting to dashboard");
      return NextResponse.redirect(new URL('/user/dashboard', req.url));
    }
    
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
          '/user/refresh-google-token', // Add token refresh page to public paths
        ];
        
        // Handle '/' separately to avoid false matches
        const isPublicPath = 
          pathname === '/' || publicPaths.some(path => pathname.startsWith(path));
        
        if (isPublicPath) {
          console.log("✅ Public path allowed:", pathname);
          return true;
        }
        
        // Make onboarding accessible for new users and users who haven't completed onboarding
        if (pathname.startsWith('/user/onboarding') && 
            ( token?.onboardingComplete === false)) {
          console.log("✅ User accessing onboarding, allowed");
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

// Update matcher to exclude ALL API routes, not just api/auth
export const config = {
  matcher: [
    '/user/:path*',
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
};