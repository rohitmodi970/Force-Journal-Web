// app/api/journal-entry/route.ts
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
import { 
  encryptJournalData, 
  decryptJournalData,
  JOURNAL_ENCRYPTED_FIELDS 
} from '@/utilities/encryption';
// Add debugging for authentication issues
const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  console.log('Session data:', JSON.stringify({
    exists: !!session,
    hasUser: !!session?.user,
    email: session?.user?.email || 'missing',
    hasAccessToken: !!session?.accessToken
  }));
  
  if (!session?.user?.email) {
    return { error: 'Authentication required', status: 401 };
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return { error: 'User account not found', status: 404 };
  }

  return { user, session };
};

// Media type configuration
const MEDIA_LIMITS = {
  image: { count: 6, size: 25 * 1024 * 1024 }, // 25MB
  audio: { count: 11, size: 5 * 1024 * 1024 }, // 5MB
  video: { count: 2, size: 200 * 1024 * 1024 }, // 200MB
  document: { count: 5, size: 5 * 1024 * 1024 }, // 5MB
};

// Helper function to validate user ownership
async function validateOwnership(journalId: string, userId: number) {
  const journal = await Journal.findOne({ journalId });
  return journal?.userId === userId;
}

// Helper to ensure user has a Drive folder
async function ensureUserDriveFolder(user: InstanceType<typeof User>) {
  if (!user.googleDriveFolderId && user.googleAccessToken) {
    user.googleDriveFolderId = await createUserFolder(
      user.googleAccessToken,
      `JournalApp_${user.userId}`
    );
    await user.save();
  }
  return user.googleDriveFolderId;
}

// Helper to ensure journal has a Drive folder
async function ensureJournalFolder(
  accessToken: string,
  userFolderId: string,
  journalId: string
) {
  const journal = await Journal.findOne({ journalId });
  if (!journal?.googleDriveFolderId) {
    const folderId = await createUserFolder(
      accessToken,
      `Journal_${journalId}`,
      userFolderId
    );
    if (journal && folderId) {
      journal.googleDriveFolderId = folderId;
      await journal.save();
    }
    return folderId;
  }
  return journal.googleDriveFolderId;
}

// Create journal entry
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    console.log('POST request received, checking authentication...');
    
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { user } = authResult;
    console.log('User authenticated successfully, processing journal creation');

    const requestBody = await req.json();
    const journalId = await Journal.generateJournalId(user.userId);
    
    // Create journal entry with plain data
    const journalData = {
      title: requestBody.title || '',
      content: requestBody.content || '',
      date: requestBody.date || new Date().toISOString(),
      tags: requestBody.tags || [],
      mood: requestBody.mood || null,
      journalType: requestBody.journalType || 'general',
      timestamp: requestBody.timestamp || new Date().toISOString(),
      media: { image: [], audio: [], video: [], document: [] },
      journalId,
      userId: user.userId
    };

    // Encrypt sensitive fields before saving
    const encryptedData = encryptJournalData(journalData);
    
    const newEntry = new Journal(encryptedData);
    const savedEntry = await newEntry.save();
    
    // Decrypt for response to client
    const decryptedEntry = decryptJournalData(savedEntry.toObject());
    
    console.log('Journal entry created successfully');
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

    // Encrypt sensitive fields before update
    const encryptedData = encryptJournalData({
      ...updateData,
      timestamp: new Date().toISOString()
    });

    const updatedEntry = await Journal.findOneAndUpdate(
      { journalId },
      encryptedData,
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    // Decrypt for response to client
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
      
      // Decrypt single entry
      const decryptedEntry = decryptJournalData(entry.toObject());
      return NextResponse.json(decryptedEntry);
    }

    // Get all entries
    const entries = await Journal.find({ userId: user.userId }).sort({ date: -1 });
    
    // Decrypt all entries
    const decryptedEntries = entries.map(entry => decryptJournalData(entry.toObject()));
    
    return NextResponse.json(decryptedEntries);
  } catch (error: any) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// Media operations
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { user, session } = authResult;
    
    if (!session.accessToken) {
      return NextResponse.json(
        { error: 'Google Drive access token required' },
        { status: 401 }
      );
    }

    const { journalId, operation, mediaType, mediaData } = await req.json();
    if (!journalId || !operation || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const journal = await Journal.findOne({ journalId, userId: user.userId });
    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found or unauthorized' },
        { status: 404 }
      );
    }

    const validMediaType = mediaType as keyof typeof MEDIA_LIMITS;

    if (operation === 'add') {
      if (!mediaData?.file?.size) {
        return NextResponse.json(
          { error: 'Media file data required' },
          { status: 400 }
        );
      }

      if (mediaData.file.size > MEDIA_LIMITS[validMediaType].size) {
        return NextResponse.json(
          { error: `File exceeds ${MEDIA_LIMITS[validMediaType].size / (1024 * 1024)}MB limit` },
          { status: 400 }
        );
      }

      const mediaCount = journal.media[validMediaType]?.length || 0;
      if (mediaCount >= MEDIA_LIMITS[validMediaType].count) {
        return NextResponse.json(
          { error: `Maximum ${validMediaType} limit reached` },
          { status: 400 }
        );
      }

      const userFolderId = await ensureUserDriveFolder(user);
      if (!userFolderId) {
        return NextResponse.json(
          { error: 'Failed to create or find user folder' },
          { status: 500 }
        );
      }
      
      const journalFolderId = await ensureJournalFolder(
        session.accessToken,
        userFolderId,
        journalId
      );
      
      if (!journalFolderId) {
        return NextResponse.json(
          { error: 'Failed to create or find journal folder' },
          { status: 500 }
        );
      }

      const buffer = Buffer.from(await mediaData.file.arrayBuffer());
      const mimeType = getMimeType(mediaData.file.name);

      const uploadResult = await uploadFileToDrive(
        session.accessToken,
        buffer,
        mediaData.file.name,
        mimeType,
        journalFolderId
      );

      const newMedia = {
        url: uploadResult.webViewLink || uploadResult.webContentLink || '',
        driveFileId: uploadResult.id as string,
        driveMimeType: uploadResult.mimeType as string,
        fileName: mediaData.file.name,
        fileSize: mediaData.file.size,
        uploadedAt: new Date()
      };

      journal.media[validMediaType].push(newMedia);
      await journal.save();

      return NextResponse.json({
        message: 'Media added successfully',
        media: newMedia
      });
    } 
    else if (operation === 'remove') {
      if (!mediaData?.driveFileId) {
        return NextResponse.json(
          { error: 'Drive file ID required' },
          { status: 400 }
        );
      }

      await deleteFileFromDrive(session.accessToken, mediaData.driveFileId);

      journal.media[validMediaType] = journal.media[validMediaType].filter(
        (item: any) => item.driveFileId !== mediaData.driveFileId
      );
      await journal.save();

      return NextResponse.json({
        message: 'Media removed successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in media operation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process media' },
      { status: 500 }
    );
  }
}

// Delete operations
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { user, session } = authResult;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'remove-media') {
      const { journalId, mediaType, driveFileId } = await req.json();
      
      if (!journalId || !mediaType || !driveFileId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const journal = await Journal.findOne({ journalId, userId: user.userId });
      if (!journal) {
        return NextResponse.json(
          { error: 'Journal not found or unauthorized' },
          { status: 404 }
        );
      }

      if (session.accessToken) {
        try {
          await deleteFileFromDrive(session.accessToken, driveFileId);
        } catch (driveError) {
          console.error('Drive deletion error:', driveError);
        }
      }

      const validMediaType = mediaType as keyof typeof MEDIA_LIMITS;
      journal.media[validMediaType] = journal.media[validMediaType].filter(
        (item: any) => item.driveFileId !== driveFileId
      );
      await journal.save();

      return NextResponse.json({ 
        success: true,
        message: 'Media removed successfully' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in delete operation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process deletion' },
      { status: 500 }
    );
  }
}