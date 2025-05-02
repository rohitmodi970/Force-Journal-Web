import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  new_user: boolean;
  ip_address: string;
  isActive?: boolean;
  // Auth provider fields
  provider?: string;
  providerId?: string;
  profileImage?: string;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    ip_address: { type: String, required: true },
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
  },
  { timestamps: true }
);

// Create a compound index for provider and providerId to ensure uniqueness
userSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);