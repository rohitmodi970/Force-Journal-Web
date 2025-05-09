// app/api/media/list-folder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import Journal from '@/models/JournalModel';
import { listFilesInFolder } from '@/utilities/googleDrive';

export async function GET(req: NextRequest) {
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

    // 2. Parse URL params
    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get('journalId');
    const mediaType = searchParams.get('mediaType');
    
    // 3. Input validation
    if (!journalId) {
      return NextResponse.json(
        { error: 'Missing required journalId parameter' }, 
        { status: 400 }
      );
    }

    if (mediaType && !['image', 'audio', 'video', 'document'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'Invalid media type' }, 
        { status: 400 }
      );
    }

    // 4. Find the journal
    const journal = await Journal.findOne({ journalId });
    
    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' }, 
        { status: 404 }
      );
    }

    // 5. Verify user owns the journal
    if (journal.userId !== session.user.userId) {
      return NextResponse.json(
        { error: 'Access denied to this journal' }, 
        { status: 403 }
      );
    }

    // 6. Check if journal has Google Drive folder ID
    if (!journal.googleDriveFolderId) {
      return NextResponse.json(
        { error: 'Journal has no associated Google Drive folder' }, 
        { status: 404 }
      );
    }

    // 7. List files from Google Drive
    try {
      let files;
      
      if (mediaType) {
        // Find the media type folder ID
        const mediaFolderResult = await listFilesInFolder(session.accessToken, journal.googleDriveFolderId);
        const mediaTypeFolder = mediaFolderResult?.find(
          (file: any) => file.name === mediaType && file.mimeType === 'application/vnd.google-apps.folder'
        );
        
        if (!mediaTypeFolder) {
          return NextResponse.json({
            success: true,
            files: []
          });
        }
        
        // List files in the media type folder
        if (!mediaTypeFolder.id) {
          return NextResponse.json({
            success: true,
            files: []
          });
        }
        files = await listFilesInFolder(session.accessToken, mediaTypeFolder.id);
      } else {
        // List all files in journal folder (including subfolders)
        files = await listFilesInFolder(session.accessToken, journal.googleDriveFolderId);
      }
      
      return NextResponse.json({
        success: true,
        files
      });
      
    } catch (error: any) {
      console.error('Error listing files from Google Drive:', error);
      return NextResponse.json(
        { error: 'Failed to list files from Google Drive' }, 
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Media listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}