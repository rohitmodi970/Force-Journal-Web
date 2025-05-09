// utilities/googleDrive.ts
import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize the Google Drive API client
export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

// Create a folder in Google Drive for a specific user
export async function createUserFolder(
    accessToken: string, 
    folderName: string,
    parentFolderId?: string
  ) {
    const drive = getDriveClient(accessToken);
  
    try {
      const requestBody: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
  
      if (parentFolderId) {
        requestBody.parents = [parentFolderId];
      }
  
      const response = await drive.files.create({
        requestBody,
        fields: 'id',
      });
  
      return response.data.id;
    } catch (error) {
      console.error('Error creating folder in Google Drive:', error);
      throw error;
    }
  }
  

// Upload a file to a specific folder in Google Drive
export async function uploadFileToDrive(
  accessToken: string, 
  file: Buffer, 
  fileName: string, 
  mimeType: string, 
  folderId: string
) {
  const drive = getDriveClient(accessToken);
  
  try {
    const requestBody = {
      name: fileName,
      parents: [folderId],
    };
    
    const media = {
      mimeType,
      body: Readable.from(file),
    };
    
    const response = await drive.files.create({
      requestBody,
      media,
      fields: 'id,name,mimeType,webViewLink,webContentLink,size',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

// Delete a file from Google Drive
export async function deleteFileFromDrive(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    await drive.files.delete({
      fileId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
}

// Get file metadata from Google Drive
export async function getFileMetadata(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,webViewLink,webContentLink,size',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting file metadata from Google Drive:', error);
    throw error;
  }
}

// Get a list of files in a folder
export async function listFilesInFolder(accessToken: string, folderId: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,size)',
    });
    
    return response.data.files;
  } catch (error) {
    console.error('Error listing files in Google Drive folder:', error);
    throw error;
  }
}

// Update file in Google Drive (replace with new content)
export async function updateFileInDrive(
  accessToken: string,
  fileId: string,
  file: Buffer,
  mimeType: string
) {
  const drive = getDriveClient(accessToken);
  
  try {
    const media = {
      mimeType,
      body: Readable.from(file),
    };
    
    const response = await drive.files.update({
      fileId,
      media,
      fields: 'id,name,mimeType,webViewLink,webContentLink,size',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating file in Google Drive:', error);
    throw error;
  }
}

// Helper to determine MIME type based on file extension
export function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
  };
  
  return extension && mimeTypes[extension] ? mimeTypes[extension] : 'application/octet-stream';
}


export async function getOrCreateMediaTypeFolder(
  accessToken: string,
  mediaType: string,
  journalFolderId: string
) {
  const drive = getDriveClient(accessToken);
  
  try {
    // First check if folder already exists
    const response = await drive.files.list({
      q: `'${journalFolderId}' in parents and name='${mediaType}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name)',
    });
    
    // If folder exists, return its ID
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }
    
    // If folder doesn't exist, create it
    const requestBody = {
      name: mediaType,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [journalFolderId],
    };
    
    const createResponse = await drive.files.create({
      requestBody,
      fields: 'id',
    });
    
    return createResponse.data.id;
  } catch (error) {
    console.error(`Error creating or getting ${mediaType} folder:`, error);
    throw error;
  }
}