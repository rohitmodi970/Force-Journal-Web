import mongoose, { Schema, Document } from "mongoose";

export interface IMetrics extends Document {
  userId: number;
  totalCharactersWritten: number;
  totalTimeSpent: number; // in seconds
  lastActive: Date;
  journalCount: number;
  averageEntryLength: number;
  waitlistStatus: {
    signedUp: boolean;
    signedUpAt?: Date;
    grantedAccess: boolean;
    grantedAccessAt?: Date;
  };
  sessionHistory: {
    startTime: Date;
    endTime?: Date;
    duration?: number; // in seconds
    pageViews: string[]; // URLs visited
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const metricsSchema = new Schema<IMetrics>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
      ref: 'User'
    },
    totalCharactersWritten: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    journalCount: {
      type: Number,
      default: 0
    },
    averageEntryLength: {
      type: Number,
      default: 0
    },
    waitlistStatus: {
      signedUp: {
        type: Boolean,
        default: false
      },
      signedUpAt: Date,
      grantedAccess: {
        type: Boolean,
        default: false
      },
      grantedAccessAt: Date
    },
    sessionHistory: [{
      startTime: {
        type: Date,
        required: true
      },
      endTime: Date,
      duration: Number,
      pageViews: [String]
    }]
  },
  { timestamps: true }
);

// Index for faster queries
metricsSchema.index({ userId: 1 });
metricsSchema.index({ 'waitlistStatus.signedUp': 1 });
metricsSchema.index({ 'waitlistStatus.grantedAccess': 1 });

// Static method to get global metrics
metricsSchema.statics.getGlobalMetrics = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalCharacters: { $sum: '$totalCharactersWritten' },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        totalJournals: { $sum: '$journalCount' },
        waitlistSignups: {
          $sum: { $cond: [{ $eq: ['$waitlistStatus.signedUp', true] }, 1, 0] }
        },
        accessGrants: {
          $sum: { $cond: [{ $eq: ['$waitlistStatus.grantedAccess', true] }, 1, 0] }
        }
      }
    }
  ]);
};

const Metrics = mongoose.models.Metrics || mongoose.model<IMetrics>("Metrics", metricsSchema);

export default Metrics; 