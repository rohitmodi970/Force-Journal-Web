// Function to fetch all journal entries from the API
import { JournalEntry } from "@/components/Journal/types";
export const getAllJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    console.log(baseUrl)
    const response = await fetch(`${baseUrl}/api/journal-entry`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch journal entries');
    }

    const entries = await response.json();
    
    // Transform the data to match JournalEntry type
    return entries.map((entry: any) => ({
      journalId: entry.journalId,
      title: entry.title || '',
      content: entry.content || '',
      date: entry.date || '',
      tags: entry.tags || [],
      mood: entry.mood || null,
      journalType: entry.journalType || '',
      timestamp: entry.timestamp,
      userId: entry.userId,
      mediaType: Object.keys(entry.media || {}).filter(key => 
        Array.isArray(entry.media[key]) && entry.media[key].length > 0
      ),
      mediaUrl: {
        image: (entry.media?.image || []).map((img: any) => img.url || ''),
        audio: (entry.media?.audio || []).map((audio: any) => audio.url || ''),
        video: (entry.media?.video || []).map((video: any) => video.url || ''),
        document: (entry.media?.document || []).map((doc: any) => doc.url || ''),
      },
      fileName: entry.fileName || '',
      fileSize: entry.fileSize || 0,
      createdAt: entry.createdAt || '',
      updatedAt: entry.updatedAt || '',
    }));
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
};

// Function to fetch a specific journal entry by ID
export const getJournalEntryById = async (id: string): Promise<JournalEntry | undefined> => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/journal-entry?journalId=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch journal entry');
    }

    const entry = await response.json();
    
    return {
      journalId: entry.journalId,
      title: entry.title || '',
      content: entry.content || '',
      date: entry.date || '',
      tags: entry.tags || [],
      mood: entry.mood || null,
      journalType: entry.journalType || '',
      timestamp: entry.timestamp,
      userId: entry.userId,
      mediaType: Object.keys(entry.media || {}).filter(key => 
        Array.isArray(entry.media[key]) && entry.media[key].length > 0
      ),
      mediaUrl: {
        image: (entry.media?.image || []).map((img: any) => img.url || ''),
        audio: (entry.media?.audio || []).map((audio: any) => audio.url || ''),
        video: (entry.media?.video || []).map((video: any) => video.url || ''),
        document: (entry.media?.document || []).map((doc: any) => doc.url || ''),
      },
      fileName: entry.fileName || '',
      fileSize: entry.fileSize || 0,
      createdAt: entry.createdAt || '',
      updatedAt: entry.updatedAt || '',
    };
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return undefined;
  }
};
