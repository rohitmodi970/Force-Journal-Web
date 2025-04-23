import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import User from '@/models/User';
import JournalModel from '@/models/JournalModel';
import connectDB from '@/db/connectDB';

// Helper function to validate user ownership of a journal entry
async function validateOwnership(journalId: string, userId: number) {
  const journal = await JournalModel.findOne({ journalId });
  if (!journal) return false;
  return journal.userId === userId;
}

// Create a new journal entry
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get the authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const { title, content, date, tags, mood, journalType } = await req.json();
    
    // Generate the unique journalId using the static method
    const journalId = await JournalModel.generateJournalId(user.userId);
    
    // Create new journal entry
    const newEntry = new JournalModel({
      title,
      content,
      date,
      tags: tags || [],
      mood: mood || null,
      journalType,
      journalId, // Using the generated ID format
      timestamp: new Date().toISOString(),
      userId: user.userId
    });
    
    // Save the journal entry
    const savedEntry = await newEntry.save();
    
    return NextResponse.json({
      message: 'Journal entry created successfully',
      entry: savedEntry
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Update an existing journal entry
export async function PUT(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get the authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const { journalId, title, content, date, tags, mood, journalType } = await req.json();
    
    if (!journalId) {
      return NextResponse.json({ error: 'Journal ID is required' }, { status: 400 });
    }
    
    // Verify ownership - user can only update their own entries
    const isOwner = await validateOwnership(journalId, user.userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'You do not have permission to update this entry' }, { status: 403 });
    }
    
    // Find and update the journal entry
    const updatedEntry = await JournalModel.findOneAndUpdate(
      { journalId },
      {
        title,
        content,
        date,
        tags: tags || [],
        mood: mood || null,
        journalType,
        timestamp: new Date().toISOString() // Update timestamp for edit
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Journal entry updated successfully',
      entry: updatedEntry
    });
  } catch (error: any) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get all journal entries for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get the authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get('journalId');
    
    // If journalId is provided, return only that specific entry
    if (journalId) {
      const entry = await JournalModel.findOne({ journalId, userId: user.userId });
      if (!entry) {
        return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
      }
      return NextResponse.json(entry);
    }
    
    // Return all entries for the user
    const entries = await JournalModel.find({ userId: user.userId }).sort({ date: -1 });
    
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a journal entry
export async function DELETE(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get the authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get('journalId');
    
    if (!journalId) {
      return NextResponse.json({ error: 'Journal ID is required' }, { status: 400 });
    }
    
    // Verify ownership - user can only delete their own entries
    const isOwner = await validateOwnership(journalId, user.userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'You do not have permission to delete this entry' }, { status: 403 });
    }
    
    // Delete the journal entry
    const result = await JournalModel.findOneAndDelete({ journalId });
    
    if (!result) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}