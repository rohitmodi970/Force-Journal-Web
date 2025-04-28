"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarIcon, ArrowRightIcon as ArrowsMaximize, ArrowLeftIcon as ArrowsMinimize, Info } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy,} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@/lib/utils"
import { Button } from "./ui/quilted-gallery/ui/button"
import { Calendar } from "./ui/quilted-gallery/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/quilted-gallery/ui/popover"
import { Label } from "./ui/quilted-gallery/ui/label"
import { Badge } from "./ui/quilted-gallery/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/quilted-gallery/ui/tooltip"

// Define the image item type with date and size
interface ImageItem {
  id: string
  src: string
  title: string
  cols: number
  rows: number
  uploadDate: Date
  importance: number // 1-3, with 3 being most important
}

// Sortable image component
const SortableImage = ({
  image,
  onSizeChange,
}: {
  image: ImageItem
  onSizeChange: (id: string, size: "small" | "medium" | "large") => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${image.cols}`,
    gridRow: `span ${image.rows}`,
    zIndex: isDragging ? 10 : 0,
    position: "relative" as const,
  }

  // Determine current size
  const currentSize =
    image.cols === 1 && image.rows === 1 ? "small" : image.cols === 2 && image.rows === 1 ? "medium" : "large"

  // Determine available size changes
  const canEnlarge = currentSize === "small" || currentSize === "medium"
  const canShrink = currentSize === "medium" || currentSize === "large"

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
      <div className="absolute inset-0">
        <Image
          src={image.src || "/placeholder.svg"}
          alt={image.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes={`(max-width: 768px) 100vw, ${image.cols * 25}vw`}
        />
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

// Date picker component
function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  minDate: Date
  maxDate: Date
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="grid gap-2">
        <Label htmlFor="start-date">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="start-date"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMMM d, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
              fromDate={minDate}
              toDate={maxDate}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="end-date">End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="end-date"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMMM d, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
              fromDate={startDate || minDate}
              toDate={maxDate}
            />
          </PopoverContent>
        </Popover>
      </div>
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          className="h-10 px-3 mt-auto"
          onClick={() => {
            onStartDateChange(undefined)
            onEndDateChange(undefined)
          }}
        >
          Reset
        </Button>
      )}
    </div>
  )
}

// Main quilted gallery component
export default function QuiltedGallery() {
  // March 2025 date range
  const marchStart = new Date(2025, 2, 1) // March 1, 2025
  const marchEnd = new Date(2025, 2, 31) // March 31, 2025

  // Sample image data with dates in March 2025 and real San Francisco images
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: "1",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img4.jpg-S0V496bxPHGoudT92STmL9VsimgdPE.jpeg",
      title: "San Francisco Skyline at Dusk",
      cols: 2,
      rows: 2,
      uploadDate: new Date(2025, 2, 3), // March 3, 2025
      importance: 3,
    },
    {
      id: "2",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img9.jpg-LF4GZtQpcIKw3kHaNiH6E8Hj6EFt6f.jpeg",
      title: "Evening Moon Over City",
      cols: 1,
      rows: 1,
      uploadDate: new Date(2025, 2, 5), // March 5, 2025
      importance: 1,
    },
    {
      id: "3",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img13.jpg-JHoyZfhlEKbUBK2N8VjLzwxdsnDkuQ.jpeg",
      title: "Golden Gate Sunset",
      cols: 2,
      rows: 1,
      uploadDate: new Date(2025, 2, 8), // March 8, 2025
      importance: 2,
    },
    {
      id: "4",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img12.jpg-eDbkteGihCYgh8ZrHfB3fR9IiBZBc1.jpeg",
      title: "Marina in Fog",
      cols: 1,
      rows: 2,
      uploadDate: new Date(2025, 2, 12), // March 12, 2025
      importance: 2,
    },
    {
      id: "5",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img2.jpg-2fqoGTKuI1T820TjXYCPBm0tlAIhfE.jpeg",
      title: "City View Through Window",
      cols: 1,
      rows: 1,
      uploadDate: new Date(2025, 2, 15), // March 15, 2025
      importance: 1,
    },
    {
      id: "6",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img6.jpg-cTNK6Fz5iF7QfnO09lPwtaztRcYq4K.jpeg",
      title: "Moon Through Pine Trees",
      cols: 1,
      rows: 1,
      uploadDate: new Date(2025, 2, 18), // March 18, 2025
      importance: 1,
    },
    {
      id: "7",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img11.jpg-WFsmJQsNFdthOvSB0tQvcImm5kUZMq.jpeg",
      title: "Marina Sunset with Bridge",
      cols: 2,
      rows: 1,
      uploadDate: new Date(2025, 2, 21), // March 21, 2025
      importance: 2,
    },
    {
      id: "8",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img8.jpg-9mkUqUJLETCp9dpNu3R3WElqxuuw0N.jpeg",
      title: "Downtown SF with Agave Plants",
      cols: 1,
      rows: 2,
      uploadDate: new Date(2025, 2, 25), // March 25, 2025
      importance: 2,
    },
    {
      id: "9",
      src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
      title: "Golden Gate in Fog",
      cols: 1,
      rows: 1,
      uploadDate: new Date(2025, 2, 28), // March 28, 2025
      importance: 1,
    },
    {
      id: "10",
      src: "https://images.unsplash.com/photo-1534050359320-02900022671e",
      title: "Bay Bridge Lights",
      cols: 2,
      rows: 1,
      uploadDate: new Date(2025, 2, 30), // March 30, 2025
      importance: 2,
    },
  ])

  // Date range state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Filter images based on date range using useMemo to prevent unnecessary recalculations
  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      if (!startDate && !endDate) return true

      const imageDate = image.uploadDate

      if (startDate && endDate) {
        return imageDate >= startDate && imageDate <= endDate
      }

      if (startDate && !endDate) {
        return imageDate >= startDate
      }

      if (!startDate && endDate) {
        return imageDate <= endDate
      }

      return true
    })
  }, [images, startDate, endDate])

  // State for arranged image IDs
  const [arrangedImageIds, setArrangedImageIds] = useState<string[]>([])

  // Update arranged image IDs when filtered images change
  useEffect(() => {
    setArrangedImageIds(filteredImages.map((img) => img.id))
  }, [filteredImages])

  // Get the actual arranged images based on IDs and filter
  const arrangedImages = useMemo(() => {
    // Create a map of all filtered images by ID for quick lookup
    const imageMap = new Map(filteredImages.map((img) => [img.id, img]))

    // Return images in the order of arrangedImageIds, but only if they exist in the filtered set
    return arrangedImageIds.map((id) => imageMap.get(id)).filter((img): img is ImageItem => img !== undefined)
  }, [filteredImages, arrangedImageIds])

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Find the images being swapped
      const activeImage = images.find((img) => img.id === active.id)
      const overImage = images.find((img) => img.id === over.id)

      if (activeImage && overImage) {
        // Update the arranged image IDs
        setArrangedImageIds((items) => {
          const oldIndex = items.indexOf(active.id.toString())
          const newIndex = items.indexOf(over.id.toString())

          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(items, oldIndex, newIndex)
          }
          return items
        })

        // Swap image sizes based on importance
        setImages((currentImages) => {
          return currentImages.map((img) => {
            if (img.id === active.id) {
              // The dragged image takes the size of the target position
              return { ...img, cols: overImage.cols, rows: overImage.rows }
            }
            if (img.id === over.id) {
              // The target image takes the size of the dragged image
              return { ...img, cols: activeImage.cols, rows: activeImage.rows }
            }
            return img
          })
        })
      }
    }
  }

  // Handle image size change
  const handleSizeChange = (id: string, size: "small" | "medium" | "large") => {
    setImages((currentImages) => {
      return currentImages.map((img) => {
        if (img.id === id) {
          // Update the image size based on the requested size
          if (size === "small") {
            return { ...img, cols: 1, rows: 1 }
          } else if (size === "medium") {
            return { ...img, cols: 2, rows: 1 }
          } else {
            // large
            return { ...img, cols: 2, rows: 2 }
          }
        }
        return img
      })
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">San Francisco Photo Gallery</h1>
        <p className="text-muted-foreground mb-6">
          Browse and organize your March 2025 San Francisco photos. Filter by date range, drag to reposition, and resize
          images.
        </p>

        <div className="p-4 bg-muted/50 rounded-lg border mb-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Filter by Date Range
            <Badge variant="outline" className="ml-2">
              March 2025
            </Badge>
          </h2>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minDate={marchStart}
            maxDate={marchEnd}
          />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag images to reposition them. Hover over an image to resize it or see its priority.
          </p>
        </div>

        {arrangedImages.length === 0 && (
          <div className="mt-8 p-8 text-center border border-dashed rounded-md">
            <p className="text-muted-foreground">No photos found in the selected date range.</p>
          </div>
        )}
      </div>

      {arrangedImages.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={arrangedImageIds} strategy={rectSortingStrategy}>
            <div
              className="grid gap-4 auto-rows-[150px]"
              style={{
                gridTemplateColumns: "repeat(4, 1fr)",
              }}
            >
              {arrangedImages.map((image) => (
                <SortableImage key={image.id} image={image} onSizeChange={handleSizeChange} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-6 text-sm text-muted-foreground flex items-center justify-between">
        <p>
          Showing {arrangedImages.length} of {images.length} photos
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-muted/50">
            Small: 1×1
          </Badge>
          <Badge variant="outline" className="bg-muted/50">
            Medium: 2×1
          </Badge>
          <Badge variant="outline" className="bg-muted/50">
            Large: 2×2
          </Badge>
        </div>
      </div>
    </div>
  )
}

