// utilities/firebase/storage.ts
import { initializeApp } from 'firebase/app';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  UploadResult 
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

interface UploadFileResponse {
  downloadUrl: string;
  viewUrl: string;
  path: string;
}

/**
 * Uploads a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The path to upload the file to (including filename)
 * @returns Promise with download and view URLs
 */
export const uploadFileToStorage = async (
  file: File,
  path: string
): Promise<UploadFileResponse> => {
  try {
    // Create a reference to the file location
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot: UploadResult = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return {
      downloadUrl,
      viewUrl: downloadUrl,
      path: path
    };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Generate a unique file path for Firebase Storage
 * @param userId - User ID to include in the path
 * @param fileType - Type of file (e.g., 'audio', 'image')
 * @param fileName - Original file name
 * @returns A unique file path
 */
export const generateFilePath = (
  userId: string,
  fileType: 'audio' | 'image',
  fileName: string
): string => {
  // Create a timestamp-based unique identifier
  const timestamp = Date.now();
  const extension = fileName.split('.').pop() || '';
  
  // Format: users/{userId}/{fileType}/{timestamp}-{fileName}
  return `users/${userId}/${fileType}/${timestamp}-${fileName}`;
};