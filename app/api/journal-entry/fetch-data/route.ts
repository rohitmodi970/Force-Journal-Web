// app\api\journal-entry\fetch-data\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth';
import User from '@/models/User';
import Journal from '@/models/JournalModel';
import connectDB from '@/db/connectDB';

// Get all journal IDs for the authenticated user
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        
        // Get the user session
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Authentication required' }, 
                { status: 401 }
            );
        }

        // Find the user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: 'User account not found' }, 
                { status: 404 }
            );
        }

        // Fetch all journal IDs for the user
        const journals = await Journal.find(
            { userId: user.userId }, 
            { journalId: 1, _id: 0 }
        );
        
        // Extract just the journalId values
        const journalIds = journals.map(journal => journal.journalId);

        return NextResponse.json({ journalIds }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching journal IDs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch journal IDs' },
            { status: 500 }
        );
    }
}