import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJournal extends Document {
  journalId: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  mood: string | null;
  journalType: string;
  timestamp: string;
  userId: number;
}

// Define the static methods interface
interface JournalModel extends Model<IJournal> {
  generateJournalId(userId: number): Promise<string>;
}

const journalSchema = new Schema<IJournal>(
  {
    journalId: {
      type: String,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    tags: [{ type: String }],
    mood: { type: String, default: null },
    journalType: { type: String, required: true },
    timestamp: { type: String, required: true },
    userId: { 
      type: Number, 
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Define the static method
journalSchema.statics.generateJournalId = async function(userId: number): Promise<string> {
  // Find the highest journalId for this user
  const highestJournal = await this.findOne(
    { userId, journalId: { $regex: `^${userId}J` } },
    { journalId: 1 },
    { sort: { journalId: -1 } }
  );

  let nextNumber = 1;
  
  if (highestJournal) {
    // Extract the number part after userId + "J"
    const match = highestJournal.journalId.match(new RegExp(`^${userId}J(\\d+)$`));
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  // Format: userIdJ1, userIdJ2, etc.
  return `${userId}J${nextNumber}`;
};

// Use the model with the correct interface
const Journal = (mongoose.models.Journal as JournalModel) || 
  mongoose.model<IJournal, JournalModel>("Journal", journalSchema);

export default Journal;