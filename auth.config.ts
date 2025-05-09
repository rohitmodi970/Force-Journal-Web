// auth.config.ts
import type { NextAuthOptions } from 'next-auth';
import { authOptions } from './utilities/auth';

// Re-export your existing authOptions
export { authOptions };

// Define protected routes configuration
export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request }: { auth: { user?: unknown } | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      
      // Define public paths that don't require authentication
      const isPublicPath = [
        '/auth/login',
        '/auth/register',
        '/auth/error',
        // '/',
        // Add other public paths here
      ].some(path => pathname.startsWith(path));

      // If it's a public path, allow access
      if (isPublicPath) return true;
      
      // Otherwise, require authentication
      return isLoggedIn;
    },
  },
};