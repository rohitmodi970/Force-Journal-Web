
// app/api/journal-entry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import User from '@/models/User';
import Journal from '@/models/JournalModel';
import connectDB from '@/db/connectDB';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// Helper function to validate user ownership of a journal entry
async function validateOwnership(journalId: string, userId: number) {
  const journal = await Journal.findOne({ journalId });
  if (!journal) return false;
  return journal.userId === userId;
}

// Helper function to check media limits
async function checkMediaLimits(
  journalId: string, 
  mediaType: 'image' | 'audio' | 'video' | 'document', 
  fileSize: number
) {
  // Define limits for each media type
  const MEDIA_LIMITS = {
    image: { count: 6, size: 25 * 1024 * 1024 }, // 25MB
    audio: { count: 11, size: 5 * 1024 * 1024 }, // 5MB
    video: { count: 2, size: 200 * 1024 * 1024 }, // 200MB
    document: { count: 5, size: 5 * 1024 * 1024 }, // 5MB
  };
  
  // Check file size
  if (fileSize > MEDIA_LIMITS[mediaType].size) {
    throw new Error(`File exceeds the maximum size for ${mediaType} uploads (${MEDIA_LIMITS[mediaType].size / (1024 * 1024)}MB)`);
  }
  
  // Get existing media count
  const journal = await Journal.findOne({ journalId });
  if (!journal) throw new Error('Journal entry not found');
  
  // Count media of this type using the new schema structure
  const existingCount = journal.media[mediaType]?.length || 0;
  
  // Check if adding one more would exceed the limit
  if (existingCount >= MEDIA_LIMITS[mediaType].count) {
    throw new Error(`You can only upload up to ${MEDIA_LIMITS[mediaType].count} ${mediaType} files`);
  }
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
    
    // Parse request body with defaults for required fields
    const requestBody = await req.json();
    
    const entryData = {
      title: requestBody.title || '',
      content: requestBody.content || '',
      // Ensure date is always provided as a string (since your schema expects a string)
      date: requestBody.date || new Date().toISOString(),
      tags: requestBody.tags || [],
      mood: requestBody.mood || null,
      journalType: requestBody.journalType || 'general',
      // Ensure timestamp is always provided
      timestamp: requestBody.timestamp || new Date().toISOString(),
      media: requestBody.media || { image: [], audio: [], video: [], document: [] }
    };
    
    // Generate the unique journalId using the static method
    const journalId = await Journal.generateJournalId(user.userId);
    
    // Create new journal entry
    const newEntry = new Journal({
      ...entryData,
      journalId,
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
    const { journalId, title, content, date, tags, mood, journalType, media } = await req.json();
    
    if (!journalId) {
      return NextResponse.json({ error: 'Journal ID is required' }, { status: 400 });
    }
    
    // Verify ownership - user can only update their own entries
    const isOwner = await validateOwnership(journalId, user.userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'You do not have permission to update this entry' }, { status: 403 });
    }
    
    // Find and update the journal entry including the media fields with the new structure
    const updatedEntry = await Journal.findOneAndUpdate(
      { journalId },
      {
        title,
        content,
        date,
        tags: tags || [],
        mood: mood || null,
        journalType,
        // Update timestamp for edit
        timestamp: new Date().toISOString(),
        // Update media fields with the new structure if provided
        ...(media && {
          media: {
            image: media.image || [],
            audio: media.audio || [],
            video: media.video || [],
            document: media.document || []
          }
        })
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
    
    // Get URL parameters - safely handle URL parsing
    let journalId = null;
    let action = null;

    try {
      // Make sure the URL is properly formatted with origin
      const url = new URL(req.url);
      journalId = url.searchParams.get('journalId');
      action = url.searchParams.get('action');
    } catch (error) {
      console.error('Error parsing URL:', error);
      // Try an alternative approach if URL parsing fails
      const rawUrl = req.url || '';
      const queryString = rawUrl.split('?')[1] || '';
      const params = new URLSearchParams(queryString);
      journalId = params.get('journalId');
      action = params.get('action');
    }
    
    // Get media for a specific journal entry
    if (action === 'get-media' && journalId) {
      try {
        const journal = await Journal.findOne({ journalId });
        
        if (!journal) {
          return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
        }
        
        // Check if user owns this journal entry
        if (journal.userId !== user.userId) {
          return NextResponse.json({ error: 'Unauthorized to access this entry' }, { status: 403 });
        }
        
        // Return the media structure
        return NextResponse.json({ 
          success: true, 
          media: journal.media || { image: [], audio: [], video: [], document: [] }
        });
      } catch (error: any) {
        console.error('Error fetching journal media:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 });
      }
    }
    
    // If journalId is provided, return only that specific entry
    if (journalId) {
      const entry = await Journal.findOne({ journalId, userId: user.userId });
      if (!entry) {
        return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
      }
      return NextResponse.json(entry);
    }
    
    // Return all entries for the user
    const entries = await Journal.find({ userId: user.userId }).sort({ date: -1 });
    
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Add a new route for media operations
export async function PATCH(req: NextRequest) {
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
    const { journalId, operation, mediaType, mediaData } = await req.json();
    
    if (!journalId || !operation || !mediaType) {
      return NextResponse.json({ 
        error: 'Missing required fields: journalId, operation, and mediaType are required' 
      }, { status: 400 });
    }
    
    // Verify ownership
    const isOwner = await validateOwnership(journalId, user.userId);
    if (!isOwner) {
      return NextResponse.json({ 
        error: 'You do not have permission to modify this entry' 
      }, { status: 403 });
    }
    
    const journal = await Journal.findOne({ journalId });
    if (!journal) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }
    
    // Type assertion for mediaType to ensure it's a valid key
    const validMediaType = mediaType as 'image' | 'audio' | 'video' | 'document';
    
    // Handle different operations
    if (operation === 'add') {
      // Check if media data is provided
      if (!mediaData) {
        return NextResponse.json({ error: 'Media data is required for add operation' }, { status: 400 });
      }
      
      // Check media limits before adding
      await checkMediaLimits(journalId, validMediaType, mediaData.fileSize);
      
      // Add media to the appropriate array in the journal's media object
      journal.media[validMediaType].push(mediaData);
      
      await journal.save();
      
      return NextResponse.json({
        message: `${validMediaType} added successfully to journal entry`,
        entry: journal
      });
    } 
    else if (operation === 'remove') {
      // Check if mediaData.cloudinaryPublicId is provided for removal
      if (!mediaData || !mediaData.cloudinaryPublicId) {
        return NextResponse.json({ 
          error: 'cloudinaryPublicId is required for remove operation' 
        }, { status: 400 });
      }
      
      // Remove media from the appropriate array in the journal's media object
      journal.media[validMediaType] = journal.media[validMediaType].filter(
        (item: { cloudinaryPublicId: string }) => item.cloudinaryPublicId !== mediaData.cloudinaryPublicId
      );
      
      await journal.save();
      
      return NextResponse.json({
        message: `${mediaType} removed successfully from journal entry`,
        entry: journal
      });
    }
    else {
      return NextResponse.json({ error: 'Invalid operation. Use "add" or "remove"' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating journal media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
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
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    // Handle media removal
    if (action === 'remove-media') {
      const data = await req.json();
      const { journalId, mediaType, cloudinaryPublicId } = data;
      
      if (!journalId || !mediaType || !cloudinaryPublicId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
      // Type assertion for mediaType
      const validMediaType = mediaType as 'image' | 'audio' | 'video' | 'document';
      
      // Verify ownership
      const journal = await Journal.findOne({ journalId });
      if (!journal) {
        return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
      }
      
      if (journal.userId !== user.userId) {
        return NextResponse.json({ error: 'Unauthorized to modify this entry' }, { status: 403 });
      }
      
      // Find the media file to determine resource type
      const mediaFile = journal.media[validMediaType]?.find(
        (file: any) => file.cloudinaryPublicId === cloudinaryPublicId
      );
      
      if (!mediaFile) {
        return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
      }
      
      // Delete from Cloudinary
      const deleted = await deleteFromCloudinary(
        cloudinaryPublicId, 
        mediaFile.cloudinaryResourceType
      );
      
      if (!deleted) {
        // Continue with deletion from database even if Cloudinary delete failed
      }
      
      // Remove from database
      await Journal.updateOne(
        { journalId },
        { $pull: { [`media.${validMediaType}`]: { cloudinaryPublicId } } }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Media file removed successfully' 
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Error handling media removal:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}