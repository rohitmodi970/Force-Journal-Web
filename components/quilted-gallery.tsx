"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/quilted-gallery/ui/alert"
import GridImage from "./GridImage"

// Define the image item type with date and size
interface ImageItem {
  id: string
  src: string
  title: string
  cols: number
  rows: number
  uploadDate: Date
  importance: number // 1-3, with 3 being most important
  driveFileId?: string
  mimeType?: string
  thumbnailLink?: string
}

// Type for API response when getting media files
interface MediaApiResponse {
  success: boolean
  media?: Array<{
    url?: string
    driveFileId: string
    driveMimeType: string
    uploadedAt: string
    _id?: string
  }>
  error?: string
  files?: Array<{
    id: string
    name: string
    mimeType: string
    thumbnailLink?: string
    webViewLink?: string
    createdTime: string
  }>
}

// Simple QuiltedGallery component focused on rendering
export default function QuiltedGallery({ journalId }: { journalId: string }) {
  // For loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Images state with empty initial value
  const [images, setImages] = useState<ImageItem[]>([])

  // Function to handle image size changes
  const handleSizeChange = (id: string, size: "small" | "medium" | "large") => {
    setImages(prevImages => 
      prevImages.map(img => {
        if (img.id !== id) return img;
        
        // Update cols and rows based on the requested size
        const newCols = size === "small" ? 1 : size === "medium" ? 2 : 2;
        const newRows = size === "small" ? 1 : size === "medium" ? 1 : 2;
        
        return { ...img, cols: newCols, rows: newRows };
      })
    );
  };

  // Fetch images when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching images for journalId:', journalId)
        
        // Use the /api/media/get API route
        const response = await fetch(`/api/media/get?journalId=${journalId}&mediaType=image`)
        console.log('Response status:', response.status)
        
        const data: MediaApiResponse = await response.json()
        console.log('Full API Response:', data)
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch images')
        }
        
        // Transform API data to our ImageItem format
        const imageItems: ImageItem[] = []
        
        // Handle images from media array
        if (data.media && data.media.length > 0) {
          data.media.forEach((item, index) => {
            console.log(`Processing image ${index + 1}:`, item)
            
            if (!item.driveFileId) {
              console.warn(`Skipping item ${index} due to missing driveFileId:`, item)
              return;
            }
            
            const uploadDate = new Date(item.uploadedAt)
            
            // Determine importance and size
            const importance = index < 2 ? 3 : index < 5 ? 2 : 1
            const cols = importance === 3 ? 2 : importance === 2 ? 2 : 1
            const rows = importance === 3 ? 2 : importance === 2 ? 1 : 1
            
            imageItems.push({
              id: item.driveFileId,
              src: item.url || '',
              title: `Image ${index + 1}`,
              cols,
              rows,
              uploadDate,
              importance,
              driveFileId: item.driveFileId,
              mimeType: item.driveMimeType,
            })
          })
        }
        
        console.log('Transformed Image Items:', imageItems)
        setImages(imageItems)
      } catch (err) {
        console.error('Error fetching images:', err)
        setError(err instanceof Error ? err.message : 'Failed to load images')
        setImages([])
      } finally {
        setLoading(false)
      }
    }
    
    if (journalId) {
      fetchImages()
    }
  }, [journalId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-muted-foreground">Loading images...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load images: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>

      {images.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-md">
          <p className="text-muted-foreground">No photos found in this journal.</p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 auto-rows-[150px]"
        >
          {images.map((image) => (
            <GridImage 
              key={image.id} 
              image={image} 
            />
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        <p>Total Photos: {images.length}</p>
      </div>
    </div>
  )
}