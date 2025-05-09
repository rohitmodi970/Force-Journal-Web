import mongoose, { Schema, Document, Model } from "mongoose";

// Journal schema interface
export interface IJournal extends Document {
  journalId: string;
  title?: string;
  content?: string;
  date?: string;
  tags: string[];
  mood: string | null;
  journalType?: string;
  timestamp: string;
  userId: number;
  googleDriveFolderId?: string; 
  media: {
    image: MediaFile[];
    audio: MediaFile[];
    video: MediaFile[];
    document: MediaFile[];
  }; 
}

export interface MediaFile {
  url: string;
  driveFileId: string; 
  driveMimeType: string; 
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

const mediaItemSchema = new Schema({
  url: { type: String, required: true },
  driveFileId: { type: String, required: true }, 
  driveMimeType: { type: String, required: true }, 
  fileName: { type: String },
  fileSize: { type: Number },
  uploadedAt: { type: Date, default: Date.now }
});

interface JournalModel extends Model<IJournal> {
  generateJournalId(userId: number): Promise<string>;
}

// Journal schema
const journalSchema = new Schema<IJournal>(
  {
    journalId: {
      type: String,
      required: true,
      unique: true,
    },
    title: { type: String, required: false },  // Not required
    content: { type: String, required: false },  // Not required
    date: { type: String, required: false },  // Not required
    tags: [{ type: String }],
    mood: { type: String, default: null },
    journalType: { type: String, required: false },  // Not required
    timestamp: { type: String, required: true },
    userId: { 
      type: Number, 
      required: true,
      ref: 'User'
    },

    // Media fields 
    media: {
      image: {
        type: [mediaItemSchema],
        default: []
      },
      audio: {
        type: [mediaItemSchema],
        default: []
      },
      video: {
        type: [mediaItemSchema],
        default: []
      },
      document: {
        type: [mediaItemSchema],
        default: []
      }
    }
  },
  { timestamps: true }
);

// Define the static method
journalSchema.statics.generateJournalId = async function(userId: number): Promise<string> {
  const highestJournal = await this.findOne(
    { userId, journalId: { $regex: `^${userId}J` } },
    { journalId: 1 },
    { sort: { journalId: -1 } }
  );

  let nextNumber = 1;
  
  if (highestJournal) {
    const match = highestJournal.journalId.match(new RegExp(`^${userId}J(\\d+)$`));
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  return `${userId}J${nextNumber}`;
};

// Use the model with the correct interface
const Journal = (mongoose.models.Journal as JournalModel) || 
  mongoose.model<IJournal, JournalModel>("Journal", journalSchema);

export default Journal;