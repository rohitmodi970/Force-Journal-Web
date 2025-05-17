// utilities/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcrypt';
import connectDB from '@/db/connectDB';
import User from '@/models/User';

// Extend the next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      new_user?: boolean;
      onboardingComplete?: boolean;
      username?: string;
      userId?: number;
      googleAccessToken?: string;
      googleRefreshToken?: string;
    }
    accessToken?: string;
    error?: string;
    expires: string;
  }

  interface JWT {
    id?: string;
    new_user?: boolean;
    onboardingComplete?: boolean;
    username?: string;
    userId?: number;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    name?: string | null;
    email?: string | null;
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }

  interface User {
    id?: string;
    new_user?: boolean;
    onboardingComplete?: boolean;
    username?: string;
    userId?: number;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleTokenExpiry?: Date;
  }
}

// Check for required environment variables
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Warning: ${key} is not set in environment variables`);
  }
});

export const authOptions: NextAuthOptions = {
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              scope: "openid email profile https://www.googleapis.com/auth/drive.file",
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            },
          },
        })
      ]
      : []),
    // Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        ipAddress: { label: "IP Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();
          console.log("Connecting to DB...");

          // Find user by email
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("User not found");
          }

          // Check if password is correct
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
          }

          // Check if onboarding is complete
          const onboardingComplete = user.onboardingComplete || false;
          const isNewUser = user.new_user;

          // Update IP address
          await User.findByIdAndUpdate(user._id, {
            ip_address: credentials.ipAddress || user.ip_address || '0.0.0.0'
            // Don't update new_user status here - we'll only do this after onboarding
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            new_user: isNewUser,
            onboardingComplete: onboardingComplete,
            username: user.username,
            userId: user.userId
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      if (account?.provider === "google") {
        // For Google sign-in
        const providerId = account.providerAccountId;
        const providerName = account.provider;

        if (!providerId || !user.email) return false;

        // Check if user exists with this provider
        let existingUser = await User.findOne({
          provider: providerName,
          providerId: providerId
        });

        const getIpAddress = async () => {
          try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
          } catch (error) {
            console.error('Error fetching IP address:', error);
            return '0.0.0.0';
          }
        };

        if (existingUser) {
          // User exists with this provider, update tokens and IP address
          existingUser.googleAccessToken = account.access_token;
          existingUser.googleRefreshToken = account.refresh_token;
          existingUser.googleTokenExpiry = new Date(Date.now() + (account.expires_at || 3600 * 24 * 7) * 1000); // 7 days
          existingUser.ip_address = await getIpAddress();
          // Don't update new_user status here - we'll keep the onboarding flag
          await existingUser.save();

          // Update the user object to include additional info
          user.id = existingUser._id.toString();
          user.new_user = existingUser.new_user;
          user.onboardingComplete = existingUser.onboardingComplete;
          user.username = existingUser.username;
          user.userId = existingUser.userId;
          user.googleAccessToken = account.access_token;
          user.googleRefreshToken = account.refresh_token;

          return true;
        }

        // Check if user exists with the same email
        existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Link this provider to the existing account
          existingUser.provider = providerName;
          existingUser.providerId = providerId;
          existingUser.profileImage = user.image;
          existingUser.ip_address = await getIpAddress();
          existingUser.googleAccessToken = account.access_token;
          existingUser.googleRefreshToken = account.refresh_token;
          existingUser.googleTokenExpiry = new Date(Date.now() + (account.expires_at || 3600 * 24 * 7) * 1000); // 7 days
          await existingUser.save();

          // Update the user object with existing user's status
          user.id = existingUser._id.toString();
          user.new_user = existingUser.new_user;
          user.onboardingComplete = existingUser.onboardingComplete;
          user.username = existingUser.username;
          user.userId = existingUser.userId;
          user.googleAccessToken = account.access_token;
          user.googleRefreshToken = account.refresh_token;

          return true;
        }

        // Create a new user
        const userCount = await User.countDocuments();
        const username = `${user.email?.split('@')[0]}_${Math.floor(Math.random() * 1000)}`;
        const userId = userCount + 1;

        const newUser = await User.create({
          userId: userId,
          name: user.name,
          email: user.email,
          username: username,
          provider: providerName,
          providerId: providerId,
          profileImage: user.image,
          ip_address: await getIpAddress(),
          new_user: true,
          onboardingComplete: false,
          googleAccessToken: account.access_token,
          googleRefreshToken: account.refresh_token,
          googleTokenExpiry: new Date(Date.now() + (account.expires_at || 3600 * 24 * 7) * 1000) // 7 days
        });

        // Update user object
        user.id = newUser._id.toString();
        user.new_user = true;
        user.onboardingComplete = false;
        user.username = username;
        user.userId = userId;
        user.googleAccessToken = account.access_token;
        user.googleRefreshToken = account.refresh_token;
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      // Handle session updates
  if (trigger === "update" && session?.onboardingComplete !== undefined) {
    return { 
      ...token,
      onboardingComplete: session.onboardingComplete,
      new_user: session.new_user ?? token.new_user
    };
  }
      if (account && user) {
        return {
          ...token,
          id: user.id,
          new_user: user.new_user,
          onboardingComplete: user.onboardingComplete,
          username: user.username,
          userId: user.userId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at,
          googleAccessToken: user.googleAccessToken,
          googleRefreshToken: user.googleRefreshToken
        };
      }

      // Reissue token with updated user info on session update
      if (trigger === "update" && user) {
        return {
          ...token,
          ...user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires &&
        typeof token.accessTokenExpires === 'number' &&
        Date.now() < token.accessTokenExpires * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      if (token.refreshToken) {
        try {
          // Attempt to refresh Google token
          if (token.googleRefreshToken && typeof token.googleRefreshToken === 'string') {
            const refreshedTokens = await refreshGoogleAccessToken(token.googleRefreshToken);

            if (refreshedTokens) {
              // Update the User in the database with new tokens
              await connectDB();
              if (token.id) {
                await User.findByIdAndUpdate(token.id, {
                  googleAccessToken: refreshedTokens.access_token,
                  googleTokenExpiry: new Date(Date.now() + refreshedTokens.expires_in * 1000)
                });
              }

              return {
                ...token,
                accessToken: refreshedTokens.access_token,
                accessTokenExpires: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
                googleAccessToken: refreshedTokens.access_token,
                // Don't update refresh token if we didn't get a new one
                ...(refreshedTokens.refresh_token ? {
                  refreshToken: refreshedTokens.refresh_token,
                  googleRefreshToken: refreshedTokens.refresh_token
                } : {})
              };
            }
          }
        } catch (error) {
          console.error("Error refreshing access token", error);

          // If refresh failed but token info exists, keep the session active
          // but mark that there was an error refreshing
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string | undefined,
          name: token.name,
          email: token.email,
          new_user: token.new_user as boolean | undefined,
          onboardingComplete: token.onboardingComplete as boolean | undefined,
          username: token.username as string | undefined,
          userId: token.userId as number | undefined,
          googleAccessToken: token.googleAccessToken as string | undefined,
          googleRefreshToken: token.googleRefreshToken as string | undefined
        };
        session.accessToken = token.accessToken as string | undefined;
        session.error = token.error as string | undefined;

        // Additional debugging to check what's being included in the session
        console.log("Session being constructed with token data:", {
          new_user: token.new_user,
          onboardingComplete: token.onboardingComplete
        });
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If the URL starts with the base URL, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Handle special redirects for OAuth callbacks
      if (url.includes('/api/auth/callback')) {
        // We'll check onboarding status in middleware
        return `${baseUrl}/user/onboarding`;
      }

      // Default fallback
      return baseUrl;
    }
  },
  events: {
    async signIn(message) {
      // Additional logging for debugging
      console.log("Sign-in event:", {
        user: message.user.email,
        isNewUser: message.user.new_user,
        onboardingComplete: message.user.onboardingComplete,
        account: message.account?.provider
      });
    },
    async signOut(message) {
      console.log("Sign-out event:", { user: message.token?.email });
    },
    //@ts-ignore
    async error(message) {
      console.error("Auth error:", message);
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    newUser: '/auth/register',
  }
};

// Helper function to refresh Google tokens
async function refreshGoogleAccessToken(refreshToken: string) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      throw tokens;
    }

    return tokens;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}