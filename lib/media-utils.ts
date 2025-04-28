// lib/media-utils.ts
import JournalMedia from '@/models/JournalMedia';
import Journal from '@/models/JournalModel';
/**
 * Generates a unique media ID based on journal ID with an incremented number
 * Format: journalId_1, journalId_2, etc.
 */
export const generateMediaId = async (journalId: string): Promise<string> => {
  // Find the highest mediaId for this journalId
  const highestMedia = await JournalMedia.findOne(
    { journalId, mediaId: { $regex: `^${journalId}_` } },
    { mediaId: 1 },
    { sort: { mediaId: -1 } }
  );

  let nextNumber = 1;
  
  if (highestMedia) {
    // Extract the number part after journalId + "_"
    const match = highestMedia.mediaId.match(new RegExp(`^${journalId}_(\\d+)$`));
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  // Format: journalId_1, journalId_2, etc.
  return `${journalId}_${nextNumber}`;
};

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
  
  // Count existing media of this type
  const existingMediaCount = await JournalMedia.countDocuments({
    journalId,
    mediaType: mediaType,
  });
  
  if (existingMediaCount >= MEDIA_LIMITS[typeSafe].count) {
    throw new Error(
      `You have reached the limit of ${MEDIA_LIMITS[typeSafe].count} ${mediaType} files for this journal`
    );
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
  
  