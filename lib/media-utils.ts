// lib/media-utils.ts

import Journal from '@/models/JournalModel';


/**
 * Check if the media upload is within limits
 */
export const checkMediaLimits = async (
  journalId: string,
  mediaType: string,
  fileSize: number
): Promise<boolean> => {
  // Define limits
  const MEDIA_LIMITS = {
    image: { count: 6, size: 25 * 1024 * 1024 }, // 25MB
    audio: { count: 11, size: 5 * 1024 * 1024 }, // 5MB
    video: { count: 2, size: 200 * 1024 * 1024 }, // 200MB
    document: { count: 5, size: 5 * 1024 * 1024 }, // 5MB
  };
  
  // Check file size
  const typeSafe = mediaType as keyof typeof MEDIA_LIMITS;
  if (!MEDIA_LIMITS[typeSafe]) {
    throw new Error('Invalid media type');
  }
  
  if (fileSize > MEDIA_LIMITS[typeSafe].size) {
    throw new Error(`File size exceeds the limit for ${mediaType}`);
  }
  
  return true;
};

// Check if the journal exists and belongs to the current user
export const validateJournalAccess = async (journalId: string, userId: number): Promise<boolean> => {
    const journal = await Journal.findOne({ journalId });
    
    if (!journal) {
      throw new Error('Journal not found');
    }
    
    if (journal.userId !== userId) {
      throw new Error('You do not have permission to upload media to this journal');
    }
    
    return true;
  };
  
  