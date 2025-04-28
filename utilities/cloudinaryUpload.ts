// utilities/cloudinaryUpload.ts
import axios from 'axios';

interface UploadProgressCallback {
  (progress: number): void;
}

interface CloudinaryResponse {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  size: number;
}

interface MediaFileData {
  url: string;
  cloudinaryPublicId: string;
  cloudinaryResourceType: string;
  fileName: string;
  fileSize: number;
  uploadedAt?: Date;
}

/**
 * Uploads a file to Cloudinary via the backend API
 * 
 * @param file The file to upload
 * @param journalId The journal ID to associate with the upload
 * @param mediaType The type of media ('image', 'audio', 'video', 'document')
 * @param onProgress Optional callback for upload progress
 * @returns Promise with the Cloudinary response data
 */
export async function uploadToCloudinary(
  file: File,
  journalId: string,
  mediaType: 'image' | 'audio' | 'video' | 'document',
  onProgress?: UploadProgressCallback
): Promise<CloudinaryResponse> {
  // Create form data for the upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('journalId', journalId);
  formData.append('mediaType', mediaType);
  formData.append('fileName', file.name);
  formData.append('fileSize', file.size.toString());

  try {
    // Upload the file to the API endpoint
    const response = await axios.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // @ts-ignore
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
// @ts-ignore
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Adds a media file reference to a journal entry
 * 
 * @param journalId The journal ID to add media to
 * @param mediaType The type of media being added
 * @param mediaData The media file data
 * @returns Promise with the API response
 */
export async function addMediaToJournal(
  journalId: string, 
  mediaType: 'image' | 'audio' | 'video' | 'document', 
  mediaData: MediaFileData
): Promise<any> {
  try {
    const response = await axios.post('/api/journal-entry', {
      action: 'add-media',
      journalId,
      mediaType,
      mediaFile: mediaData
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding media to journal:', error);
    throw error;
  }
}