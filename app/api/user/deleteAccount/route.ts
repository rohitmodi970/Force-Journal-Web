import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import Journal from '@/models/JournalModel'
import Onboarding from '@/models/Onboarding'
import deletedUser from '@/models/deletedUser'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utilities/auth'
import connectDB from '@/db/connectDB'

export async function POST(req: NextRequest) {
  try {
    // Get user session to ensure the request is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse the request body
    const { reason } = await req.json()
    const userEmail = session.user?.email
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'User email not found in session' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()
    
    try {
      // Find the user to be deleted
      const user = await User.findOne({ email: userEmail })
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        )
      }
      
      // Create a record in DeletedUser collection
      const deletedUserRecord = new deletedUser({
        userId: user.userId,
        name: user.name,
        email: user.email,
        ip_address: user.ip_address,
        reason: reason || 'Not provided',
        deletedAt: new Date()
      })
      
      await deletedUserRecord.save()
      
      // Delete user's journals
      await Journal.deleteMany({ userId: user.userId })
      
      // Delete user's onboarding data
      await Onboarding.deleteMany({ userEmail })
      
      // Delete the user
      await User.findByIdAndDelete(user._id)
      
      return NextResponse.json(
        { success: true, message: 'Account deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete account', 
        error: (error as Error).message 
      },
      { status: 500 }
    )
  }
}