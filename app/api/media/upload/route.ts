// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import User from '@/models/User';
import Journal from '@/models/JournalModel';
import connectDB from '@/db/connectDB';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to validate user ownership of a journal entry
async function validateOwnership(journalId: string, userId: number) {
  const journal = await Journal.findOne({ journalId });
  if (!journal) return false;
  return journal.userId === userId;
}

// Media limits
const MEDIA_LIMITS = {
  image: { count: 6, size: 25 * 1024 * 1024 }, // 25MB
  audio: { count: 11, size: 5 * 1024 * 1024 }, // 5MB
  video: { count: 2, size: 200 * 1024 * 1024 }, // 200MB
  document: { count: 5, size: 5 * 1024 * 1024 }, // 5MB
};

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
    
    // Process the FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const journalId = formData.get('journalId') as string;
    const mediaType = formData.get('mediaType') as 'image' | 'audio' | 'video' | 'document';
    const fileName = formData.get('fileName') as string || file.name;
    const fileSize = parseInt(formData.get('fileSize') as string) || file.size;
    
    if (!file || !journalId || !mediaType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify ownership - user can only upload to their own entries
    const isOwner = await validateOwnership(journalId, user.userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'You do not have permission to update this entry' }, { status: 403 });
    }
    
    // Check media limits
    const journal = await Journal.findOne({ journalId });
    if (!journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }
    
    // Count existing media of this type using the new schema structure
    const existingMediaCount = journal.media && journal.media[mediaType] ? journal.media[mediaType].length : 0;
    
    // Check if adding this file would exceed the limit
    if (existingMediaCount >= MEDIA_LIMITS[mediaType].count) {
      return NextResponse.json({ 
        error: `You can only upload up to ${MEDIA_LIMITS[mediaType].count} ${mediaType} files` 
      }, { status: 400 });
    }
    
    // Check file size
    if (fileSize > MEDIA_LIMITS[mediaType].size) {
      return NextResponse.json({ 
        error: `File exceeds the maximum size for ${mediaType} uploads (${MEDIA_LIMITS[mediaType].size / (1024 * 1024)}MB)` 
      }, { status: 400 });
    }
    
    // Convert file to buffer for cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Cloudinary
    const base64Data = buffer.toString('base64');
    const base64File = `data:${file.type};base64,${base64Data}`;
    
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: `journal/${journalId}`,
        resource_type: 'auto' as 'auto'  // Type assertion to match UploadApiOptions
      };
      
      cloudinary.uploader.upload(base64File, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    }) as any;
    
    // Create new media file object
    const newMediaFile = {
      url: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      cloudinaryResourceType: cloudinaryResult.resource_type,
      fileName: fileName,
      fileSize: fileSize,
      uploadedAt: new Date()
    };
    
    // SOLUTION: Use a single atomic operation to ensure the media object exists and update it
    // This avoids the race condition during first-time uploads
    const mediaUpdateQuery: { $set?: any; $push?: any } = {};
    
    // Create default media structure if needed
    if (!journal.media) {
      mediaUpdateQuery['$set'] = {
        media: { image: [], audio: [], video: [], document: [] }
      };
    }
    
    // Add the new media file
    mediaUpdateQuery['$push'] = {
      [`media.${mediaType}`]: newMediaFile
    };
    
    // Perform a single atomic update without storing the result
    await Journal.findOneAndUpdate(
      { journalId },
      mediaUpdateQuery,
      { new: true }
    );
    // Return response structure matched with CloudinaryResponse interface
    return NextResponse.json({
      message: 'Media uploaded successfully',
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      resourceType: cloudinaryResult.resource_type,
      format: cloudinaryResult.format || '',
      size: fileSize
    });
    
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}