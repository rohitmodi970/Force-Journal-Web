import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/db/connectDB';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import Journal from '@/models/JournalModel';
import { validateJournalAccess } from '@/lib/media-utils';

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = token.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID not found in token' },
        { status: 401 }
      );
    }

    // Parse request body
    const { cloudinaryPublicId, journalId, mediaType } = await req.json();
    
    if (!cloudinaryPublicId || !journalId || !mediaType) {
      return NextResponse.json(
        { message: 'Missing required fields (cloudinaryPublicId, journalId, or mediaType)' },
        { status: 400 }
      );
    }

    // Validate mediaType is one of the allowed types
    if (!['image', 'audio', 'video', 'document'].includes(mediaType)) {
      return NextResponse.json(
        { message: 'Invalid media type' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    
    // Validate journal access
    try {
      await validateJournalAccess(journalId, Number(userId));
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      );
    }

    // Find the journal
    const journal = await Journal.findOne({ journalId });
    
    if (!journal) {
      return NextResponse.json(
        { message: 'Journal not found' },
        { status: 404 }
      );
    }

    // Find the media item in the appropriate array
    const mediaArray = journal.media[mediaType as 'image' | 'audio' | 'video' | 'document'];
    const mediaIndex = mediaArray.findIndex(item => item.cloudinaryPublicId === cloudinaryPublicId);
    
    if (mediaIndex === -1) {
      return NextResponse.json(
        { message: 'Media not found in journal' },
        { status: 404 }
      );
    }

    // Get the media item
    const mediaItem = mediaArray[mediaIndex];

    // Delete from Cloudinary
    const deletionResult = await deleteFromCloudinary(
      mediaItem.cloudinaryPublicId,
      mediaItem.cloudinaryResourceType
    );

    if (!deletionResult) {
      return NextResponse.json(
        { message: 'Failed to delete media from storage' },
        { status: 500 }
      );
    }

    // Remove from journal's media array
    mediaArray.splice(mediaIndex, 1);
    await journal.save();

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error: any) {
    console.error('Media deletion error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}