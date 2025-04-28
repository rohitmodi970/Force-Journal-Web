// hooks/useMedia.ts
import { useState } from 'react';
import { useToast } from './use-toast';

interface UseMediaOptions {
  journalId: string;
}

export function useMedia({ journalId }: UseMediaOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const uploadMedia = async (
    file: File,
    mediaType: 'image' | 'audio' | 'video' | 'document'
  ) => {
    if (!journalId) {
      toast({
        title: 'Error',
        description: 'Journal ID is required',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('journalId', journalId);
    formData.append('mediaType', mediaType);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: 'Upload successful',
        description: `${mediaType} uploaded successfully`,
      });
      
      // Trigger refresh of media in components using this hook
      setRefreshTrigger(prev => prev + 1);
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred during upload',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!journalId || !mediaId) {
      toast({
        title: 'Error',
        description: 'Journal ID and Media ID are required',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaId,
          journalId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Deletion failed');
      }

      toast({
        title: 'Media deleted',
        description: 'Media file was successfully deleted',
      });
      
      // Trigger refresh of media in components using this hook
      setRefreshTrigger(prev => prev + 1);
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'An error occurred while deleting',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadMedia,
    deleteMedia,
    isLoading,
    refreshTrigger,
  };
}