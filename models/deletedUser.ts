// models/DeletedUser.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDeletedUser extends Document {
  userId: number;
  name: string;
  email: string;
  ip_address: string[];
  deletedAt: Date;
  reason?: string;
}

const deletedUserSchema = new Schema<IDeletedUser>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    ip_address: [{ type: String }],
    deletedAt: { 
      type: Date, 
      default: Date.now 
    },
    reason: { 
      type: String 
    }
  },
  { timestamps: false }
);

export default mongoose.models.DeletedUser || mongoose.model<IDeletedUser>("DeletedUser", deletedUserSchema);