"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarIcon, ArrowRightIcon as ArrowsMaximize, ArrowLeftIcon as ArrowsMinimize } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

import { Badge } from "./ui/quilted-gallery/ui/badge"
import { Button } from "./ui/button2"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ui/quilted-gallery/ui/tooltip"

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

// Enhanced utility function for Google Drive images
const getGoogleDriveImageUrl = (url?: string, fileId?: string): string => {
  if (!url && !fileId) return '/placeholder.svg'
  
  try {
    // Direct Google Drive approach - requires specific access settings
    // but works more reliably than other methods when properly configured
    if (fileId) {
      // Try one of these formats for Google Drive images
      // Format 1: Direct thumbnail with no size limit
      return `https://drive.google.com/thumbnail?authuser=0&sz=w2000&id=${fileId}`
      
      // Alternative formats if the above doesn't work:
      // return `https://lh3.googleusercontent.com/d/${fileId}`
      // return `https://drive.google.com/uc?id=${fileId}`
    }
    
    // Extract file ID from URL if provided
    if (url) {
      const match = url.match(/(?:\/file\/d\/|id=)([a-zA-Z0-9_-]+)/)
      
      if (match && match[1]) {
        const extractedId = match[1]
        return `https://drive.google.com/thumbnail?authuser=0&sz=w2000&id=${extractedId}`
      }
    }
    
    return url || '/placeholder.svg'
  } catch (error) {
    console.error('Error converting Google Drive URL:', error)
    return '/placeholder.svg'
  }
}

// Sortable Image Component with Enhanced Debugging
const SortableImage = ({ image, onSizeChange }: { 
    image: ImageItem, 
    onSizeChange: (id: string, size: "small" | "medium" | "large") => void 
}) => {
    const [imageLoadError, setImageLoadError] = useState(false)
    const [imageSrc, setImageSrc] = useState<string>('/placeholder.svg') // Default value
    
    useEffect(() => {
        // Log the image details for debugging
        console.log('Processing image:', {
            id: image.id,
            src: image.src,
            driveFileId: image.driveFileId,
            thumbnailLink: image.thumbnailLink
        })
        
        // Get the direct link prioritizing driveFileId if available
        const directLink = getGoogleDriveImageUrl(image.src, image.driveFileId)
        console.log('Generated image source URL:', directLink)
        
        // Set the image source
        setImageSrc(directLink)
    }, [image])

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: `span ${image.cols}`,
        gridRow: `span ${image.rows}`,
        zIndex: isDragging ? 10 : 0,
        position: "relative" as const,
    }

    const currentSize: "small" | "medium" | "large" =
        image.cols === 1 && image.rows === 1 ? "small" : 
        image.cols === 2 && image.rows === 1 ? "medium" : "large"

    const canEnlarge = currentSize === "small" || currentSize === "medium"
    const canShrink = currentSize === "medium" || currentSize === "large"

    // Render placeholder if there's no valid source
    if (!imageSrc) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "relative overflow-hidden rounded-lg border border-border bg-gray-100",
                    isDragging ? "opacity-70 shadow-xl ring-2 ring-primary" : "",
                    "group cursor-grab",
                )}
                {...attributes}
                {...listeners}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="font-medium text-base">{image.title}</div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative overflow-hidden rounded-lg border border-border",
                isDragging ? "opacity-70 shadow-xl ring-2 ring-primary" : "",
                "group cursor-grab",
            )}
            {...attributes}
            {...listeners}
        >
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                {imageLoadError ? (
                    <div className="text-red-500 text-center p-4">
                        <p>Failed to load image</p>
                        <p className="text-xs break-all max-w-full overflow-hidden">Source: {imageSrc}</p>
                    </div>
                ) : (
                    <Image
                        src={imageSrc}
                        alt={image.title || "Gallery image"}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${image.cols * 25}vw`}
                        unoptimized={imageSrc.includes('drive.google.com')} // Skip Next.js image optimization for Google Drive images
                        onError={(e) => {
                            console.error('Image load error:', {
                                src: imageSrc,
                                imageId: image.id,
                                driveFileId: image.driveFileId
                            });
                            setImageLoadError(true)
                        }}
                    />
                )}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <div className="font-medium text-base">{image.title}</div>
                <div className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                    <CalendarIcon className="h-3 w-3" />
                    {format(image.uploadDate, "MMMM d, yyyy")}
                </div>
            </div>

            {/* Size controls */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEnlarge && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white border-none"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSizeChange(image.id, currentSize === "small" ? "medium" : "large")
                                    }}
                                >
                                    <ArrowsMaximize className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Enlarge image</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {canShrink && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white border-none"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSizeChange(image.id, currentSize === "large" ? "medium" : "small")
                                    }}
                                >
                                    <ArrowsMinimize className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Shrink image</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* Importance indicator */}
            {image.importance > 1 && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="secondary" className="bg-black/50 text-white border-none">
                                    {image.importance === 3 ? "High" : "Medium"} Priority
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This image has {image.importance === 3 ? "high" : "medium"} importance</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    )
}

export default SortableImage