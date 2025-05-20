import mongoose, { Schema } from 'mongoose';

interface IFeedback {
  userId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  userAgent?: string;
  ipAddress?: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'resolved'], 
      default: 'pending' 
    },
    userAgent: { type: String },
    ipAddress: { type: String }
  },
  { timestamps: true }
);
const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;