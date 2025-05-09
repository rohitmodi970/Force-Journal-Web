// app/api/updateProfile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/connectDB';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import bcrypt from 'bcrypt';

interface UpdateProfileBody {
  name?: string;
  phone?: string;
  password?: string;
  profile?: {
    bio?: string;
    personalityType?: string;
    dob?: string;
    languages?: string[];
    socialMedia?: { [key: string]: string };
    sleepingHabits?: string;
    interests?: string[];
    photoUrl?: string;
  };
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get user session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'You must be logged in to update your profile' }, { status: 401 });
    }
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Parse request body with validation
    let body: UpdateProfileBody;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
    
    // Check if any fields to update were provided
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No fields to update were provided' }, { status: 400 });
    }
    
    const { name, phone, password, profile } = body;
    
    // Update basic information with validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 });
      }
      user.name = name.trim();
    }
    
    if (phone !== undefined) {
      if (typeof phone !== 'string') {
        return NextResponse.json({ message: 'Phone must be a string' }, { status: 400 });
      }
      user.phone = phone.trim();
    }
    
    // Update password if provided with validation
    if (password !== undefined) {
      // If password is empty string, skip password update (allows other fields to be updated without changing password)
      if (password.trim() === '') {
        console.log('Password field empty, skipping password update');
      } else {
        // Validate password
        if (password.trim().length < 8) {
          return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
        }
        
        // Hash the password
        try {
          const hashedPassword = await bcrypt.hash(password.trim(), 10);
          user.password = hashedPassword;
          console.log('Password updated successfully');
        } catch (error) {
          console.error('Error hashing password:', error);
          return NextResponse.json({ message: 'Error updating password' }, { status: 500 });
        }
      }
    }
    
    // Update profile information with validation
    if (profile) {
      // Initialize profile if it doesn't exist
      if (!user.profile) {
        user.profile = {};
      }
      
      // Update specific profile fields
      if (profile.bio !== undefined) {
        user.profile.bio = profile.bio;
      }
      
      if (profile.personalityType !== undefined) {
        user.profile.personalityType = profile.personalityType;
      }
      
      if (profile.dob !== undefined) {
        try {
          // Validate date format
          if (profile.dob) {
            const date = new Date(profile.dob);
            if (isNaN(date.getTime())) {
              return NextResponse.json({ message: 'Invalid date format for date of birth' }, { status: 400 });
            }
            user.profile.dob = date;
          } else {
            // Allow removing the date by setting to null
            user.profile.dob = null;
          }
        } catch (error) {
          return NextResponse.json({ message: 'Invalid date format for date of birth' }, { status: 400 });
        }
      }
      
      if (profile.languages !== undefined) {
        if (!Array.isArray(profile.languages)) {
          return NextResponse.json({ message: 'Languages must be an array' }, { status: 400 });
        }
        user.profile.languages = profile.languages.filter(lang => typeof lang === 'string' && lang.trim() !== '');
      }
      
      if (profile.socialMedia !== undefined) {
        if (typeof profile.socialMedia !== 'object' || profile.socialMedia === null) {
          return NextResponse.json({ message: 'Social media must be an object' }, { status: 400 });
        }
        
        // Sanitize social media URLs
        const sanitizedSocialMedia: { [key: string]: string } = {};
        for (const [platform, url] of Object.entries(profile.socialMedia)) {
          if (typeof url === 'string' && url.trim() !== '') {
            sanitizedSocialMedia[platform.toLowerCase()] = url.trim();
          }
        }
        user.profile.socialMedia = sanitizedSocialMedia;
      }
      
      if (profile.sleepingHabits !== undefined) {
        user.profile.sleepingHabits = profile.sleepingHabits;
      }
      
      if (profile.interests !== undefined) {
        if (!Array.isArray(profile.interests)) {
          return NextResponse.json({ message: 'Interests must be an array' }, { status: 400 });
        }
        user.profile.interests = profile.interests.filter(interest => typeof interest === 'string' && interest.trim() !== '');
      }
      
      if (profile.photoUrl !== undefined) {
        user.profile.photoUrl = profile.photoUrl;
      }
    }
    
    // Get and add current IP address with error handling
    try {
      const ipAddress = await getIpAddress();
      if (ipAddress && !user.ip_address.includes(ipAddress)) {
        user.ip_address.push(ipAddress);
      }
    } catch (error) {
      console.error('Error tracking IP address:', error);
      // Continue with the update even if IP tracking fails
    }
    
    // Save the updated user
    try {
      await user.save();
    } catch (error) {
      console.error('Error saving user:', error);
      return NextResponse.json({ message: 'Error saving profile changes' }, { status: 500 });
    }
    
    // Return success response with sanitized user data
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: {
          bio: user.profile?.bio,
          personalityType: user.profile?.personalityType,
          dob: user.profile?.dob,
          languages: user.profile?.languages,
          socialMedia: user.profile?.socialMedia,
          sleepingHabits: user.profile?.sleepingHabits,
          interests: user.profile?.interests,
          photoUrl: user.profile?.photoUrl
        }
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred while updating your profile',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// Helper function to get IP address
const getIpAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error(`Failed to fetch IP: ${response.status}`);
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
};