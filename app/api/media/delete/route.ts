// app/api/media/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import Journal from '@/models/JournalModel';
import { deleteFileFromDrive } from '@/utilities/googleDrive';

export async function DELETE(req: NextRequest) {
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

    // 2. Parse request body
    const { driveFileId, journalId, mediaType } = await req.json();
    
    // 3. Input validation
    if (!driveFileId || !journalId || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields (driveFileId, journalId, or mediaType)' }, 
        { status: 400 }
      );
    }

    // Validate mediaType is one of the allowed types
    if (!['image', 'audio', 'video', 'document'].includes(mediaType)) {
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

    // 6. Find the media item in the appropriate array
    const mediaArray = journal.media?.[mediaType as 'image' | 'audio' | 'video' | 'document'];
    
    if (!mediaArray) {
      return NextResponse.json(
        { error: `No ${mediaType} media found in journal` }, 
        { status: 404 }
      );
    }

    const mediaIndex = mediaArray.findIndex(item => item.driveFileId === driveFileId);
    
    if (mediaIndex === -1) {
      return NextResponse.json(
        { error: 'Media not found in journal' }, 
        { status: 404 }
      );
    }

    // 7. Get the media item
    const mediaItem = mediaArray[mediaIndex];

    // 8. Delete from Google Drive
    try {
      await deleteFileFromDrive(session.accessToken, mediaItem.driveFileId);
    } catch (deleteError: any) {
      console.error('Google Drive deletion error:', deleteError);
      return NextResponse.json(
        { 
          error: 'Failed to delete media from Google Drive',
          details: deleteError.message
        }, 
        { status: 500 }
      );
    }

    // 9. Remove from journal's media array
    mediaArray.splice(mediaIndex, 1);
    await journal.save();

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Media deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}