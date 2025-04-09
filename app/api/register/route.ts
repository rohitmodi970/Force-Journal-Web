import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import connectDB from '@/db/connectDB';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password,name,phone } = body;

    if (!email || !password  || !name || !phone) {
      return NextResponse.json(
        { error: 'Required details are missing' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUserEmail = await User.findOne({ email });
    const existingUserPhone = await User.findOne({ phone });
    
    if (existingUserEmail || existingUserPhone) {
      return NextResponse.json(
        { error: `User with this ${email} or ${phone} already exists` },
        { status: 409 }
      );
    }
   
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name, 
      phone,
      email,
      username:  email.split('@')[0],
      password: hashedPassword,
    });

    // Return success without exposing password
    return NextResponse.json(
      { 
        success: true,
        user: {
          id: newUser._id.toString(),
          email: newUser.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}