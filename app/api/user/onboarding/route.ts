// app/api/user/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import User from '@/models/User';
import Onboarding from '@/models/Onboarding';
import { 
  uploadToCloudinary, 
  generateCloudinaryPath, 
  generateCloudinaryFilename 
} from '@/utilities/cloudinaryUpload';

// Helper function to convert audio to ASCII representation
const convertAudioToAscii = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // This is a simple implementation - for a real app, you'd want a more sophisticated
    // audio processing solution that creates a meaningful ASCII representation
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Sample the audio data to create a simplified waveform
    const samplingRate = Math.ceil(uint8Array.length / 100); // Sample to get ~100 data points
    let asciiWaveform = '';
    
    const chars = ' ▁▂▃▄▅▆▇█'; // ASCII characters to represent waveform amplitude
    
    for (let i = 0; i < uint8Array.length; i += samplingRate) {
      // Calculate average value for this sample
      let sum = 0;
      let count = 0;
      
      for (let j = 0; j < samplingRate && i + j < uint8Array.length; j++) {
        sum += uint8Array[i + j];
        count++;
      }
      
      const avgValue = sum / count;
      // Map to an ASCII character (0-255 range mapped to our characters array)
      const charIndex = Math.floor((avgValue / 255) * (chars.length - 1));
      asciiWaveform += chars[charIndex];
      
      // Add line breaks to keep it readable
      if ((i / samplingRate) % 50 === 49) {
        asciiWaveform += '\n';
      }
    }
    
    return asciiWaveform;
  } catch (error) {
    console.error('Error converting audio to ASCII:', error);
    return ''; // Return empty string on error
  }
};

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user from session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse form data
    const formData = await req.formData();
    const goal = formData.get('') as string;
    const feelingAudio = formData.get('feelingAudio') as File | null;
    const prettyPhoto = formData.get('prettyPhoto') as File | null;
    
    // Validate required fields
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      );
    }
    
    // Prepare onboarding data
    const onboardingData: any = {
      userId: user._id,
      userEmail: user.email,
      goal,
      completed: true,
      completedAt: new Date(),
    };
    
    // Handle audio file upload
    if (feelingAudio) {
      try {
        const userId = user._id.toString();
        const audioPath = generateCloudinaryPath(userId, 'audio');
        const audioFilename = generateCloudinaryFilename(userId, feelingAudio.name);
        
        // Convert File to Buffer for Cloudinary upload
        const audioArrayBuffer = await feelingAudio.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);
        
        // Upload to Cloudinary
        const audioUploadResult = await uploadToCloudinary(
          audioBuffer,
          audioPath,
          audioFilename,
          'video' // Cloudinary uses 'video' type for audio files
        );
        
        // Generate ASCII representation
        const asciiData = await convertAudioToAscii(audioArrayBuffer);
        
        // Add to onboarding data
        onboardingData.feelingAudio = {
          downloadUrl: audioUploadResult.downloadUrl,
          viewUrl: audioUploadResult.viewUrl,
          path: audioUploadResult.path,
          asciiData,
        };
      } catch (audioError) {
        console.error('Error processing audio:', audioError);
        return NextResponse.json(
          { error: 'Failed to process audio file', details: (audioError as Error).message },
          { status: 500 }
        );
      }
    }
    
    // Handle photo file upload
    if (prettyPhoto) {
      try {
        const userId = user._id.toString();
        const photoPath = generateCloudinaryPath(userId, 'image');
        const photoFilename = generateCloudinaryFilename(userId, prettyPhoto.name);
        
        // Convert File to Buffer for Cloudinary upload
        const photoArrayBuffer = await prettyPhoto.arrayBuffer();
        const photoBuffer = Buffer.from(photoArrayBuffer);
        
        // Upload to Cloudinary
        const photoUploadResult = await uploadToCloudinary(
          photoBuffer,
          photoPath,
          photoFilename,
          'image'
        );
        
        // Add to onboarding data
        onboardingData.prettyPhoto = {
          downloadUrl: photoUploadResult.downloadUrl,
          viewUrl: photoUploadResult.viewUrl,
          path: photoUploadResult.path,
        };
      } catch (photoError) {
        console.error('Error processing photo:', photoError);
        return NextResponse.json(
          { error: 'Failed to process photo file', details: (photoError as Error).message },
          { status: 500 }
        );
      }
    }
    
    // Create onboarding record
    let onboarding;
    try {
      onboarding = await Onboarding.create(onboardingData);
    } catch (dbError) {
      console.error('Error creating onboarding record:', dbError);
      return NextResponse.json(
        { error: 'Failed to create onboarding record', details: (dbError as Error).message },
        { status: 500 }
      );
    }
    
    // Update user to mark onboarding as complete
    try {
      await User.findByIdAndUpdate(user._id, { 
        onboardingComplete: true,
        new_user: false
      });
    } catch (updateError) {
      console.error('Error updating user:', updateError);
      // Don't return error here, as the onboarding record was created
    }
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { 
        onboardingId: onboarding._id.toString()
      }
    });
    
  } catch (error) {
    console.error('Error in onboarding submission:', error);
    // Always return a properly formatted JSON response
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}