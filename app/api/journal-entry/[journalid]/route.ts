// app\api\journal-entry\[journalid]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import User from '@/models/User';
import Journal from '@/models/JournalModel';
import connectDB from '@/db/connectDB';
import { 
  uploadFileToDrive, 
  createUserFolder, 
  getMimeType,
  deleteFileFromDrive
} from '@/utilities/googleDrive';

// Encryption utilities
import {
  encryptJournalData,
  decryptJournalData,
  JOURNAL_ENCRYPTED_FIELDS
} from '@/utilities/encryption';

// Helper to get authenticated user from session
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  return { user };
}

// Validate that the journal belongs to the user
async function validateOwnership(journalId: string, userId: string): Promise<boolean> {
  const journal = await Journal.findOne({ journalId, userId });
  return !!journal;
}

// Create journal entry
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;
    const requestBody = await req.json();
    const journalId = await Journal.generateJournalId(user.userId);

    // Encrypt sensitive fields before saving
    const encryptedData = encryptJournalData({
      title: requestBody.title || '',
      content: requestBody.content || '',
      tags: requestBody.tags || [],
      mood: requestBody.mood || null,
      journalType: requestBody.journalType || 'general'
    });

    const newEntry = new Journal({
      ...encryptedData,
      date: requestBody.date || new Date().toISOString(),
      timestamp: requestBody.timestamp || new Date().toISOString(),
      media: { image: [], audio: [], video: [], document: [] },
      journalId,
      userId: user.userId
    });

    const savedEntry = await newEntry.save();
    // Decrypt before sending to client
    const decryptedEntry = decryptJournalData(savedEntry.toObject());
    return NextResponse.json(
      { message: 'Journal entry created', entry: decryptedEntry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating journal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create entry' },
      { status: 500 }
    );
  }
}

// Update journal entry
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;
    const { journalId, ...updateData } = await req.json();
    if (!journalId) {
      return NextResponse.json(
        { error: 'Journal ID required' },
        { status: 400 }
      );
    }
    if (!await validateOwnership(journalId, user.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized to update this entry' },
        { status: 403 }
      );
    }

    // Encrypt sensitive fields before updating
    const encryptedUpdate = encryptJournalData(updateData);

    const updatedEntry = await Journal.findOneAndUpdate(
      { journalId },
      {
        ...encryptedUpdate,
        timestamp: new Date().toISOString()
      },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    // Decrypt before sending to client
    const decryptedEntry = decryptJournalData(updatedEntry.toObject());
    return NextResponse.json({
      message: 'Journal updated',
      entry: decryptedEntry
    });
  } catch (error: any) {
    console.error('Error updating journal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update entry' },
      { status: 500 }
    );
  }
}

// Get journal entries
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;
    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get('journalId');
    const action = searchParams.get('action');

    if (action === 'get-media' && journalId) {
      const journal = await Journal.findOne({ journalId, userId: user.userId });
      if (!journal) {
        return NextResponse.json(
          { error: 'Journal not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        media: journal.media || { image: [], audio: [], video: [], document: [] }
      });
    }

    if (journalId) {
      const entry = await Journal.findOne({ journalId, userId: user.userId });
      if (!entry) {
        return NextResponse.json(
          { error: 'Journal not found' },
          { status: 404 }
        );
      }
      // Decrypt before sending to client
      const decryptedEntry = decryptJournalData(entry.toObject());
      return NextResponse.json(decryptedEntry);
    }

    const entries = await Journal.find({ userId: user.userId }).sort({ date: -1 });
    // Decrypt all entries before sending
    const decryptedEntries = entries.map(e => decryptJournalData(e.toObject()));
    return NextResponse.json(decryptedEntries);
  } catch (error: any) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// PATCH and DELETE remain unchanged unless you want to encrypt/decrypt media metadata.
// If you store sensitive info in media, apply encryptJournalData/decryptJournalData as needed.
