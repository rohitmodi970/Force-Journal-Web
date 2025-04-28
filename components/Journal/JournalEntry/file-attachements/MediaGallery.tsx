// components/MediaGallery.tsx
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/journal/ui/tabs';
import { Camera, Mic, Video, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button2';
import { useToast } from '@/hooks/use-toast';
// import { useToast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/about/ui/alert-dialog';

interface MediaItem {
  mediaId: string;
  journalId: string;
  mediaType: string[];
  mediaUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface MediaGalleryProps {
  journalId: string;
  refreshTrigger?: number;
}

export default function MediaGallery({ journalId, refreshTrigger = 0 }: MediaGalleryProps) {
  const [mediaByType, setMediaByType] = useState<Record<string, MediaItem[]>>({
    image: [],
    audio: [],
    video: [],
    document: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!journalId) return;
    
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/media/${journalId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }
        
        const data = await response.json();
        setMediaByType(data);
      } catch (error) {
        console.error('Error fetching media:', error);
        toast({
          title: 'Error',
          description: 'Failed to load media files',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedia();
  }, [journalId, refreshTrigger, toast]);

  const handleDeleteClick = (media: MediaItem) => {
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    
    try {
      const response = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaId: mediaToDelete.mediaId,
          journalId: mediaToDelete.journalId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete media');
      }
      
      // Update local state to remove the deleted item
      setMediaByType(prev => {
        const newState = { ...prev };
        for (const type in newState) {
          newState[type] = newState[type].filter(
            item => item.mediaId !== mediaToDelete.mediaId
          );
        }
        return newState;
      });
      
      toast({
        title: 'Media deleted',
        description: 'Media file was successfully deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'An error occurred while deleting',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    }
  };

  const renderMediaItem = (media: MediaItem) => {
    // Determine primary media type (use first one in the array)
    const primaryType = media.mediaType[0];
    
    switch (primaryType) {
      case 'image':
        return (
          <div key={media.mediaId} className="relative group">
            <div className="aspect-square overflow-hidden rounded-md">
              <img 
                src={media.mediaUrl} 
                alt={media.fileName}
                className="object-cover w-full h-full"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteClick(media)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
        
      case 'audio':
        return (
          <div key={media.mediaId} className="relative group p-4 border rounded-md">
            <p className="text-sm truncate mb-2">{media.fileName}</p>
            <audio 
              controls 
              className="w-full h-10"
              src={media.mediaUrl}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteClick(media)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
        
      case 'video':
        return (
          <div key={media.mediaId} className="relative group">
            <div className="aspect-video overflow-hidden rounded-md">
              <video
                controls
                className="w-full h-full object-contain bg-black"
                src={media.mediaUrl}
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteClick(media)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
        
      case 'document':
        return (
          <div key={media.mediaId} className="relative group p-4 border rounded-md flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-500" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm truncate">{media.fileName}</p>
              <p className="text-xs text-gray-500">
                {(media.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => window.open(media.mediaUrl, '_blank')}
            >
              View
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteClick(media)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'image': return <Camera className="w-4 h-4 mr-2" />;
      case 'audio': return <Mic className="w-4 h-4 mr-2" />;
      case 'video': return <Video className="w-4 h-4 mr-2" />;
      case 'document': return <FileText className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading media...</div>;
  }

  const hasAnyMedia = Object.values(mediaByType).some(items => items.length > 0);
  
  if (!hasAnyMedia) {
    return (
      <div className="text-center py-8 text-gray-500">
        No media files uploaded yet
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="image">
        <TabsList className="grid grid-cols-4 mb-4">
          {Object.keys(mediaByType).map(type => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="flex items-center"
              disabled={mediaByType[type].length === 0}
            >
              {getTabIcon(type)}
              <span className="capitalize">{type}</span>
              <span className="ml-1 text-xs">({mediaByType[type].length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.keys(mediaByType).map(type => (
          <TabsContent key={type} value={type}>
            <div className={`grid gap-4 ${type === 'image' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {mediaByType[type].map(media => renderMediaItem(media))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media file?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}