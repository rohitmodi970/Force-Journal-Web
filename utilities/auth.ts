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
      username?: string;
      userId?: number;
    }
  }

  interface JWT {
    id?: string;
    new_user?: boolean;
    username?: string;
    userId?: number;
  }

  interface User {
    id?: string;
    new_user?: boolean;
    username?: string;
    userId?: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Existing Credentials Provider
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

        // Update IP address and check if new_user
        const isNewUser = user.new_user;

        // Update IP address and set new_user to false
        await User.findByIdAndUpdate(user._id, {
          ip_address: credentials.ipAddress || user.ip_address || '0.0.0.0',
          new_user: false
        });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          new_user: isNewUser,
          username: user.username,
          userId: user.userId
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      if (account?.provider === "google") {
        // For social sign-in
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

          // User exists with this provider, update IP address
          await User.findByIdAndUpdate(existingUser._id, {
            ip_address: getIpAddress(),
            new_user: false
          });

          // Update the user object to include additional info
          user.id = existingUser._id.toString();
          user.new_user = existingUser.new_user;
          user.username = existingUser.username;
          user.userId = existingUser.userId;

          return true;
        }

        // Check if user exists with the same email
        existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Link this provider to the existing account
          await User.findByIdAndUpdate(existingUser._id, {
            provider: providerName,
            providerId: providerId,
            profileImage: user.image,
            ip_address: getIpAddress(),
            new_user: false
          });

          // Update the user object
          user.id = existingUser._id.toString();
          user.new_user = existingUser.new_user;
          user.username = existingUser.username;
          user.userId = existingUser.userId;

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
          ip_address: '0.0.0.0', // You may want to get the actual IP
          new_user: true
        });

        // Update user object
        user.id = newUser._id.toString();
        user.new_user = true;
        user.username = username;
        user.userId = userId;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.new_user = user.new_user;
        token.username = user.username;
        token.userId = user.userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.new_user = token.new_user as boolean | undefined;
        session.user.username = token.username as string;
        session.user.userId = token.userId as number;
      }

      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login'
  }
};