// auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
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
    }
  }
  
  interface JWT {
    id?: string;
    new_user?: boolean;
  }

  interface User {
    id?: string;
    new_user?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
    providers: [
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
          });
  
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            new_user: isNewUser
          };
        }
      })
    ],
    session: {
      strategy: "jwt"
    },
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider === "github" || account?.provider === "google") {
          await connectDB();
  
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            // If implementing social login, you would handle new users here
          }
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.new_user = user.new_user;
        }
        return token;
      },
      async session({ session, token }) {
        await connectDB();
  
        if (session.user && token.id) {
          session.user.id = token.id as string;
          session.user.new_user = token.new_user as boolean | undefined;
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