"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from"../ui/quilted-gallery/ui/alert"
import GridImage from "@/components/GridImage"
import { useTheme } from "@/utilities/context/ThemeContext"

// Define types for image and journal data
interface ImageItem {
  id: string
  src: string
  title: string
  cols: number
  rows: number
  uploadDate: Date
  importance: number // 1-3, with 3 being most important
  driveFileId: string
  mimeType?: string
  thumbnailLink?: string
  thumbnailUrl?: string
  journalId: string
}

// Type for API response when getting media files
interface MediaApiResponse {
  success: boolean
  media?: Array<{
    url?: string
    driveFileId: string
    driveMimeType: string
    uploadedAt: string
    thumbnailLink?: string
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

// Type for journal IDs API response
interface JournalIdsResponse {
  journalIds: string[]
  error?: string
}

// Type for loading progress state
interface LoadingProgress {
  loaded: number
  total: number
}

// Props for CombinedGallery component
interface CombinedGalleryProps {
  journalIds: string[]
}


function CombinedGallery({ journalIds }: CombinedGalleryProps) {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ 
    loaded: 0, 
    total: journalIds.length 
  })
  const { currentTheme, isDarkMode } = useTheme()

  useEffect(() => {
    let isMounted = true
    const fetchAllImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const imagesArray: ImageItem[] = []
        let loadedCount = 0
        
        // Fetch images from each journal
        for (const journalId of journalIds) {
          try {
            // Use the /api/media/get API route
            const response = await fetch(`/api/media/get?journalId=${journalId}&mediaType=image`)
            
            if (!response.ok) {
              console.warn(`Failed to fetch images for journal ${journalId}: ${response.status}`)
              continue
            }
            
            const data: MediaApiResponse = await response.json()
            
            if (data.success && data.media && data.media.length > 0) {
              // Process media items for this journal
              const journalImages = data.media.map((item, index) => {
                if (!item.driveFileId) return null
                
                const uploadDate = new Date(item.uploadedAt)
                
                // Determine importance and size
                const importance = index < 2 ? 3 : index < 5 ? 2 : 1
                const cols = importance === 3 ? 2 : importance === 2 ? 2 : 1
                const rows = importance === 3 ? 2 : importance === 2 ? 1 : 1
                
                return {
                  id: `${journalId}-${item.driveFileId}`,
                  src: item.url || '',
                  title: `Journal ${journalId} - Image ${index + 1}`,
                  cols,
                  rows,
                  uploadDate,
                  importance,
                  driveFileId: item.driveFileId,
                  mimeType: item.driveMimeType,
                  thumbnailUrl: item.thumbnailLink,
                  thumbnailLink: item.thumbnailLink,
                  journalId
                } as ImageItem
              }).filter((item): item is ImageItem => item !== null)
              
              imagesArray.push(...journalImages)
            }
          } catch (err) {
            console.error(`Error fetching images for journal ${journalId}:`, err)
          }
          
          loadedCount++
          if (isMounted) {
            setLoadingProgress({ loaded: loadedCount, total: journalIds.length })
          }
        }
        
        // Sort all images by date (newest first)
        imagesArray.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
        
        if (isMounted) {
          setAllImages(imagesArray)
        }
      } catch (err) {
        console.error('Error fetching all images:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load images')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    if (journalIds.length > 0) {
      fetchAllImages()
    } else {
      setLoading(false)
    }
    
    return () => { isMounted = false }
  }, [journalIds])

  if (loading) {
    return (
      <div className="container px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-2" style={{ color: currentTheme.primary }} />
        <p className="text-muted-foreground">
          Loading images from all journals ({loadingProgress.loaded} of {loadingProgress.total})...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load images: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      {allImages.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-md">
          <p className="text-muted-foreground">No photos found in any journal.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 auto-rows-[150px]">
            {allImages.map((image) => (
              <GridImage key={image.id} image={image} />
            ))}
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            <p>Total Photos: {allImages.length} from {journalIds.length} journals</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function AllJournalsGallery() {
  const [journalIds, setJournalIds] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { currentTheme } = useTheme()

  useEffect(() => {
    const fetchJournalIds = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/journal-entry/fetch-data')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch journal IDs: ${response.status}`)
        }
        
        const data: JournalIdsResponse = await response.json()
        
        if (!data.journalIds) {
          throw new Error('No journal IDs returned from API')
        }
        
        console.log('Fetched journal IDs:', data.journalIds)
        setJournalIds(data.journalIds)
      } catch (err) {
        console.error('Error fetching journal IDs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load journal IDs')
      } finally {
        setLoading(false)
      }
    }
    
    fetchJournalIds()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-2" style={{ color: currentTheme.primary }} />
        <p className="text-muted-foreground">Loading journals...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load journals: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (journalIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 text-center border border-dashed rounded-md">
          <p className="text-muted-foreground">No journals found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: currentTheme.primary }}>All Journals Gallery</h1>
      <CombinedGallery journalIds={journalIds} />
    </div>
  )
}