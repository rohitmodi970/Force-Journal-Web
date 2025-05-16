// app/api/user/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import connectDB from '@/db/connectDB';
import User from '@/models/User';
import Onboarding from '@/models/Onboarding';
import { uploadFileToStorage, generateFilePath } from '@/utilities/firebase/storage';

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
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse form data
    const formData = await req.formData();
    const goal = formData.get('goal') as string;
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
      userId: user.userId,
      userEmail: user.email,
      goal,
      completed: true,
      completedAt: new Date(),
    };
    
    // Handle audio file upload
    if (feelingAudio) {
      const userId = user.userId.toString();
      const audioPath = generateFilePath(userId, 'audio', feelingAudio.name);
      
      // Upload to Firebase Storage
      const audioUploadResult = await uploadFileToStorage(feelingAudio, audioPath);
      
      // Generate ASCII representation
      const audioArrayBuffer = await feelingAudio.arrayBuffer();
      const asciiData = await convertAudioToAscii(audioArrayBuffer);
      
      // Add to onboarding data
      onboardingData.feelingAudio = {
        ...audioUploadResult,
        asciiData,
      };
    }
    
    // Handle photo file upload
    if (prettyPhoto) {
      const userId = user.userId.toString();
      const photoPath = generateFilePath(userId, 'image', prettyPhoto.name);
      
      // Upload to Firebase Storage
      const photoUploadResult = await uploadFileToStorage(prettyPhoto, photoPath);
      
      // Add to onboarding data
      onboardingData.prettyPhoto = photoUploadResult;
    }
    
    // Create onboarding record
    const onboarding = await Onboarding.create(onboardingData);
    
    // Update user to mark onboarding as complete
    await User.findByIdAndUpdate(user.userId, { 
      onboardingComplete: true,
      new_user: false
    });
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { 
        onboardingId: onboarding.userId
      }
    });
    
  } catch (error) {
    console.error('Error in onboarding submission:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}