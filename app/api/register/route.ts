import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import connectDB from '@/db/connectDB';
import mongoose from 'mongoose';

// Counter model
const Counter = mongoose.models.Counter || mongoose.model(
  'Counter',
  new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
  })
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Required details are missing' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUserEmail = await User.findOne({ email });
    const existingUserPhone = await User.findOne({ phone });

    if (existingUserEmail || existingUserPhone) {
      return NextResponse.json(
        { error: `User with this ${email} or ${phone} already exists` },
        { status: 409 }
      );
    }

    // Get next custom ID
    const counter = await Counter.findOneAndUpdate(
      { name: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userId: counter.seq, 
      name,
      phone,
      email,
      username: email.split('@')[0],
      password: hashedPassword
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: newUser.userId, 
          _id: newUser._id.toString(),
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