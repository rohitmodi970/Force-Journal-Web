// utilities/cloudinaryUpload.ts
import { v2 as cloudinary } from 'cloudinary';
import { format } from 'date-fns';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  downloadUrl: string;
  viewUrl: string;
  path: string;
  publicId: string;
  format: string;
  resourceType: string;
  size: number;
}

/**
 * Generates a folder path for uploading files to Cloudinary
 * 
 * @param userId User ID for organizing files
 * @param mediaType Type of media being uploaded (e.g., 'image', 'audio')
 * @returns Path string for Cloudinary folder structure
 */
export const generateCloudinaryPath = (userId: string, mediaType: string): string => {
  const dateString = format(new Date(), 'yyyyMMdd');
  return `users/${userId}/${mediaType}/${dateString}`;
};

/**
 * Generate a unique filename for Cloudinary upload
 * 
 * @param userId User ID to prefix the filename
 * @param originalFilename Original filename
 * @returns Formatted filename with userId and date
 */
export const generateCloudinaryFilename = (userId: string, originalFilename: string): string => {
  const dateString = format(new Date(), 'yyyyMMdd_HHmmss');
  const fileExtension = originalFilename.split('.').pop() || '';
  const baseFilename = originalFilename.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${userId}_${baseFilename}_${dateString}.${fileExtension}`;
};

/**
 * Uploads a file to Cloudinary
 * 
 * @param file The file to upload (as Buffer or string)
 * @param path The Cloudinary folder path
 * @param filename Custom filename for the upload
 * @param resourceType Resource type ('image', 'video', 'raw', 'auto')
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  file: Buffer | string,
  path: string,
  filename: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<CloudinaryUploadResult> => {
  try {
    // For buffer uploads, we need to convert to base64
    const fileToUpload = Buffer.isBuffer(file)
      ? `data:application/octet-stream;base64,${file.toString('base64')}`
      : file;
    
    const uploadResult = await cloudinary.uploader.upload(fileToUpload, {
      folder: path,
      public_id: filename.split('.')[0], // Remove extension for public_id
      resource_type: resourceType,
      overwrite: true,
    });
    
    return {
      downloadUrl: uploadResult.secure_url,
      viewUrl: uploadResult.secure_url,
      path: `${path}/${filename}`,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      size: uploadResult.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${(error as Error).message}`);
  }
};

/**
 * Deletes a file from Cloudinary
 * 
 * @param publicId The Cloudinary public ID of the file
 * @param resourceType Resource type ('image', 'video', 'raw')
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (
  publicId: string, 
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return false;
  }
};