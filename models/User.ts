import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: number; 
  name: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  isActive?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    userId: {  
      type: Number,
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);