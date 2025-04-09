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
      image?: string | null;
    }
  }
  
  interface JWT {
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
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
  
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name, 
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
        }
        return token;
      },
      async session({ session, token }) {
        await connectDB();
  
        if (session.user && token.id) {
          session.user.id = token.id as string;
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