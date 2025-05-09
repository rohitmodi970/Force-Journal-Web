// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  username: string;
  new_user: boolean;
  ip_address: string[];  // Changed to array for storing IP history
  isActive?: boolean;
  // Auth provider fields
  provider?: string;
  providerId?: string;
  profileImage?: string;
  // Google Drive fields
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: Date;
  googleDriveFolderId?: string;
  // Profile information
  profile?: {
    bio?: string;
    personalityType?: string;
    dob?: Date;
    languages?: string[];
    socialMedia?: {
      [key: string]: string;  // For platforms like 'twitter', 'linkedin', etc.
    };
    sleepingHabits?: string;
    interests?: string[];
    photoUrl?: string;
  }
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    ip_address: [{ type: String }],  // Changed to array
    new_user: { type: Boolean, default: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false }, // Made optional for social login
    phone: { type: String, required: false }, // Made optional for social login
    username: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    // Auth provider fields
    provider: { type: String }, // e.g., 'google', 'github', etc.
    providerId: { type: String }, // ID from the provider
    profileImage: { type: String },
    // Google Drive fields
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Date },
    googleDriveFolderId: { type: String }, // Store the main folder ID for this user
    // Profile information
    profile: {
      bio: { type: String },
      personalityType: { type: String },
      dob: { type: Date },
      languages: [{ type: String }],
      socialMedia: {
        type: Map,
        of: String
      },
      sleepingHabits: { type: String },
      interests: [{ type: String }],
      photoUrl: { type: String }
    }
  },
  { timestamps: true }
);

// Create a compound index for provider and providerId to ensure uniqueness
userSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);