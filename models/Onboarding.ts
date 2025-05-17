// models/Onboarding.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOnboarding extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  goal: string;
  feelingAudio: {
    downloadUrl: string;
    viewUrl: string;
    path: string;
  };
  prettyPhoto: {
    downloadUrl: string;
    viewUrl: string;
    path: string;
  };
  completed: boolean;
  completedAt: Date;
}

const onboardingSchema = new Schema<IOnboarding>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    feelingAudio: {
      downloadUrl: String,
      viewUrl: String,
      path: String
    },
    prettyPhoto: {
      downloadUrl: String,
      viewUrl: String,
      path: String,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Onboarding || mongoose.model<IOnboarding>("Onboarding", onboardingSchema);