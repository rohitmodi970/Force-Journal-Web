"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Maximize2, Eye, Loader2 } from "lucide-react"
import { Badge } from "./ui/quilted-gallery/ui/badge"
import { useTheme } from "@/utilities/context/ThemeContext"

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
  thumbnailUrl?: string // Optional thumbnail URL for faster initial loading
}

// Google Drive component with thumbnail fallback
const GoogleDriveEmbed = ({ 
  id, 
  src, 
  driveFileId,
  title,
  thumbnailUrl,
}: { 
  id: string
  src: string
  driveFileId?: string
  title: string
  thumbnailUrl?: string
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasThumbnail, setHasThumbnail] = useState(!!thumbnailUrl)
  const [showIframe, setShowIframe] = useState(false)
  const { currentTheme, isDarkMode } = useTheme()
  
  // Extract file ID from either the driveFileId prop or the src URL
  const getFileId = () => {
    // If driveFileId is provided, use it directly
    if (driveFileId) return driveFileId
    
    // Otherwise try to extract from the src URL
    try {
      // Format: /file/d/FILE_ID/view
      const match = src.match(/\/file\/d\/([^/]+)/)
      if (match && match[1]) return match[1]
      
      // Format: ?id=FILE_ID
      const idMatch = src.match(/[?&]id=([^&]+)/)
      if (idMatch && idMatch[1]) return idMatch[1]
      
      // If the src itself looks like a file ID (alphanumeric with dashes/underscores)
      if (/^[a-zA-Z0-9_-]{25,40}$/.test(src)) return src
      
      return null
    } catch (e) {
      console.error("Error extracting file ID:", e)
      return null
    }
  }
  
  const fileId = getFileId()

  // Load iframe only when needed
  useEffect(() => {
    // If no thumbnail, load iframe immediately
    if (!thumbnailUrl) {
      setShowIframe(true)
    }
  }, [thumbnailUrl])

  // Handle expand/collapse
  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
    setShowIframe(true) // Always load iframe when expanding
  }

  // Handle thumbnail click
  const handleThumbnailClick = () => {
    if (!showIframe) {
      setShowIframe(true)
    }
  }
  
  // If no file ID could be found, show an error
  if (!fileId) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-sm p-2 text-center">
          <p>No file ID found</p>
          <p className="text-xs mt-1">Check the URL format</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "w-full h-full relative transition-all duration-300 cursor-pointer",
        isExpanded ? "fixed inset-0 z-50 p-4 bg-black/80" : ""
      )}
    >
      {/* Thumbnail (if available) */}
      {thumbnailUrl && !isExpanded && !isLoading && (
        <img
          src={thumbnailUrl}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            showIframe ? "opacity-0 absolute" : "opacity-100"
          )}
          onClick={handleThumbnailClick}
        />
      )}
      
      {/* Placeholder while loading */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10" 
             style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}>
          <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: currentTheme.primary }} />
          <span className="text-sm" style={{ color: isDarkMode ? '#D1D5DB' : '#4B5563' }}>Loading preview...</span>
        </div>
      )}
      
      {/* Google Drive iframe (only rendered when needed) */}
      {showIframe && (
        <iframe 
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          className={cn(
            "border-0 transition-opacity duration-300",
            isExpanded ? "w-full h-full max-w-4xl max-h-4xl mx-auto" : "absolute inset-0 w-full h-full",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          allow="autoplay"
          onLoad={() => setIsLoading(false)}
          title={title || "Google Drive embed"}
        />
      )}

      {/* Expanded mode controls */}
      {isExpanded && (
        <button 
          onClick={toggleExpanded}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)' }}
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}

      {/* View indicator - only shown if using thumbnail */}
      {thumbnailUrl && !showIframe && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="rounded-full p-3" style={{ backgroundColor: `${currentTheme.primary}99` }}>
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Grid Image component
export default function GridImage({ image }: { image: ImageItem }) {
  const style = {
    gridColumn: `span ${image.cols}`,
    gridRow: `span ${image.rows}`,
    position: "relative" as const,
  }

  const [isHovered, setIsHovered] = useState(false)
  const { currentTheme, isDarkMode } = useTheme()

  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-lg border",
        isHovered ? "shadow-lg" : "shadow-sm",
        "transition-all duration-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Google Drive embed with thumbnail support */}
      <GoogleDriveEmbed
        id={image.id}
        src={image.src}
        driveFileId={image.driveFileId}
        title={image.title}
        thumbnailUrl={image.thumbnailUrl}
      />

      {/* Gradient overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity pointer-events-none",
          isHovered ? "opacity-100" : "opacity-0"
        )} 
      />

      {/* Expand button */}
      <button
        className={cn(
          "absolute top-2 right-2 p-2 text-white rounded-full transition-all",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}
        style={{ 
          backgroundColor: isHovered ? currentTheme.hover : currentTheme.primary,
        }}
        onClick={(e) => {
          e.stopPropagation()
          // Find the GoogleDriveEmbed inside this component and trigger its expand function
          const embed = e.currentTarget.closest('.relative')?.querySelector('iframe')
          if (embed) {
            embed.click()
          }
        }}
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Image info */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 p-3 text-white transition-all pointer-events-none",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <div className="font-medium text-base">{image.title}</div>
        <div className="text-xs text-gray-300 flex items-center gap-1 mt-1">
          <CalendarIcon className="h-3 w-3" />
          {format(image.uploadDate, "MMMM d, yyyy")}
        </div>
      </div>

      {/* Importance indicator */}
      {image.importance > 1 && (
        <div 
          className={cn(
            "absolute top-2 left-2 transition-opacity pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Badge 
            variant="secondary" 
            className="border-none" 
            style={{ 
              backgroundColor: image.importance === 3 ? currentTheme.primary : currentTheme.light,
              color: image.importance === 3 ? 'white' : isDarkMode ? '#F9FAFB' : '#111827'
            }}
          >
            {image.importance === 3 ? "High" : "Medium"} Priority
          </Badge>
        </div>
      )}
    </div>
  )
}