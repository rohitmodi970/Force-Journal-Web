// app/api/media/upload/route.ts
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
  getOrCreateMediaTypeFolder 
} from '@/utilities/googleDrive';

// Media type configuration
const MEDIA_LIMITS = {
  image: { count: 6, size: 25 * 1024 * 1024 }, // 25MB
  audio: { count: 11, size: 5 * 1024 * 1024 }, // 5MB
  video: { count: 2, size: 200 * 1024 * 1024 }, // 200MB
  document: { count: 5, size: 5 * 1024 * 1024 }, // 5MB
};

export async function POST(req: NextRequest) {
  try {
    // 1. Database and authentication setup
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check for access token
    if (!session.accessToken) {
      return NextResponse.json(
        { error: 'Google Drive access token not available. Please reconnect your Google account.' }, 
        { status: 401 }
      );
    }

    // 2. User verification
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User account not found' }, 
        { status: 404 }
      );
    }

    // 3. Form data processing
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const journalId = formData.get('journalId') as string;
    const mediaType = formData.get('mediaType') as keyof typeof MEDIA_LIMITS;
    const fileName = formData.get('fileName') as string || file.name;
    const fileSize = file.size;

    // 4. Input validation
    if (!file || !journalId || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    if (!Object.keys(MEDIA_LIMITS).includes(mediaType)) {
      return NextResponse.json(
        { error: 'Invalid media type' }, 
        { status: 400 }
      );
    }

    // 5. Journal verification
    const journal = await Journal.findOne({ journalId });
    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' }, 
        { status: 404 }
      );
    }
    
    // Check if user owns the journal
    if (journal.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied to this journal' }, 
        { status: 403 }
      );
    }

    // 6. Media limits validation
    const mediaCount = journal.media?.[mediaType]?.length || 0;
    if (mediaCount >= MEDIA_LIMITS[mediaType].count) {
      return NextResponse.json(
        { error: `Maximum ${mediaType} limit reached (${MEDIA_LIMITS[mediaType].count} files)` }, 
        { status: 400 }
      );
    }

    if (fileSize > MEDIA_LIMITS[mediaType].size) {
      return NextResponse.json(
        { error: `File exceeds ${MEDIA_LIMITS[mediaType].size / (1024 * 1024)}MB size limit` }, 
        { status: 400 }
      );
    }
    
    // 7. Prepare file for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = getMimeType(fileName);
    
    // 8. Drive folder management - FIXED VERSION
    try {
      // Create user folder if it doesn't exist
      if (!user.googleDriveFolderId) {
        const userFolderId = await createUserFolder(
          session.accessToken,
          `JournalApp_${user.userId}`
        );
        
        if (!userFolderId) {
          throw new Error('Failed to create user folder in Google Drive');
        }
        
        // Save the folder ID to user document
        user.googleDriveFolderId = userFolderId;
        await user.save();
      }

      // Create or get journal folder - KEY FIX: We'll now properly check and reuse existing journal folders
      if (!journal.googleDriveFolderId) {
        // Get the drive client and check if a folder with this name already exists
        const drive = getDriveClient(session.accessToken);
        const searchResponse = await drive.files.list({
          q: `'${user.googleDriveFolderId}' in parents and name='Journal_${journalId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id)'
        });
        
        let journalFolderId;
        
        // If folder already exists, use it
        if (searchResponse.data.files && searchResponse.data.files.length > 0) {
          journalFolderId = searchResponse.data.files[0].id;
        } else {
          // If folder doesn't exist, create it
          journalFolderId = await createUserFolder(
            session.accessToken,
            `Journal_${journalId}`,
            user.googleDriveFolderId
          );
        }
        
        if (!journalFolderId) {
          throw new Error('Failed to create or retrieve journal folder in Google Drive');
        }
        
        // Save the folder ID to journal document
        journal.googleDriveFolderId = journalFolderId;
        await journal.save();
      }

      // Get or create media type subfolder (image, video, audio, document)
      if (!journal.googleDriveFolderId) {
        throw new Error('Journal Google Drive folder ID is missing');
      }
      
      const mediaTypeFolder = await getOrCreateMediaTypeFolder(
        session.accessToken,
        mediaType,
        journal.googleDriveFolderId
      );

      // Ensure media type folder ID exists
      if (!mediaTypeFolder) {
        throw new Error(`Failed to create or retrieve ${mediaType} folder`);
      }

      // 9. Upload to Google Drive
      const uploadResult = await uploadFileToDrive(
        session.accessToken,
        buffer,
        fileName,
        mimeType,
        mediaTypeFolder
      );

      // 10. Update journal entry
      const newMedia = {
        url: uploadResult.webViewLink || uploadResult.webContentLink,
        driveFileId: uploadResult.id as string,
        driveMimeType: uploadResult.mimeType as string,
        fileName,
        fileSize,
        uploadedAt: new Date()
      };

      // Initialize media object if it doesn't exist
      if (!journal.media) {
        journal.media = { image: [], audio: [], video: [], document: [] };
      }

      // Update the journal with new media
      await Journal.findOneAndUpdate(
        { journalId },
        { $push: { [`media.${mediaType}`]: newMedia } },
        { new: true }
      );

      // 11. Return success response
      return NextResponse.json({
        success: true,
        fileId: uploadResult.id,
        url: uploadResult.webViewLink,
        mimeType: uploadResult.mimeType,
        fileName: uploadResult.name,
        size: uploadResult.size
      });

    } catch (uploadError: any) {
      console.error('Google Drive upload error:', uploadError);
      return NextResponse.json(
        { 
          error: 'Google Drive upload failed', 
          details: uploadError.message 
        }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process media upload' }, 
      { status: 500 }
    );
  }
}

// Helper function to get Drive client (imported from googleDrive.ts but added here to make the code work)
function getDriveClient(accessToken: string) {
  const { google } = require('googleapis');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}