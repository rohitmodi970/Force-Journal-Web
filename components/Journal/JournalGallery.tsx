// src/app/journal/JournalGallery.tsx
"use client";
import React from "react";
import { useState, useMemo, Suspense, lazy, useContext, useEffect } from "react";
import Image from "next/image";
import { JournalEntry } from "./types";
import { Button } from "@/components/ui/button2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, Book, FileAudio, Film, FileText, Image as ImageIcon, View, Filter, Tag,Search,CalendarClock,Sparkles 
} from "lucide-react";
import JournalModal from "./JournalModal";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "@/utilities/context/ThemeContext";
import { Input } from "../ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useTheme } from "@/utilities/context/ThemeContext";
// Lazy load the 3D component
const Journal3DView = lazy(() => import('./Journal3DView'));



interface JournalGalleryProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

const getPreviewInfo = (entry: JournalEntry, selectedImageIndex: number): { 
  type: 'image' | 'video' | 'audio' | 'doc' | 'none', 
  src: string | null, 
  icon?: React.ComponentType<any> 
} => {
  const images = entry.mediaUrl?.image || [];
  const videos = entry.mediaUrl?.video || [];
  const audios = entry.mediaUrl?.audio || [];
  const docs = entry.mediaUrl?.document || [];

  if (images.length > 0 && images[selectedImageIndex]) {
    return { type: 'image', src: images[selectedImageIndex] };
  }
  if (videos.length > 0) return { type: 'video', src: null, icon: Film };
  if (audios.length > 0) return { type: 'audio', src: null, icon: FileAudio };
  if (docs.length > 0) return { type: 'doc', src: null, icon: FileText };
  return { type: 'none', src: null, icon: ImageIcon };
};

const moodEmoji: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  excited: "😃",
  calm: "😌",
  anxious: "😰",
  angry: "😠",
  neutral: "😐",
  inspired: "✨",
  creative: "🎨",
  focused: "🎯"
};

const JournalGallery = ({ entries = [] }: JournalGalleryProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);
  const [selectedImageIndices, setSelectedImageIndices] = useState<Record<string, number>>({});
  const [gridColumns, setGridColumns] = useState(4);
  const { colorOptions, currentTheme, toggleDarkMode, setCurrentTheme } = useTheme();
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Extract all available tags, types, and moods from entries
  const { allTags, allTypes, allMoods } = useMemo(() => {
    const tags = new Set<string>();
    const types = new Set<string>();
    const moods = new Set<string>();

    entries.forEach(entry => {
      if (entry.tags) entry.tags.forEach(tag => tags.add(tag));
      if (entry.journalType) types.add(entry.journalType);
      if (entry.mood) moods.add(entry.mood);
    });

    return {
      allTags: Array.from(tags),
      allTypes: Array.from(types),
      allMoods: Array.from(moods)
    };
  }, [entries]);

  // Filter entries based on all filter criteria
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Search term filter
      const matchesSearch = debouncedSearchTerm === "" || 
        entry.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        entry.content?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => entry.tags?.includes(tag));

      // Types filter
      const matchesTypes = selectedTypes.length === 0 || 
        selectedTypes.includes(entry.journalType);

      // Moods filter
      const matchesMoods = selectedMoods.length === 0 || 
        (entry.mood && selectedMoods.includes(entry.mood));

      // Date range filter
      const entryDate = new Date(entry.date);
      const matchesDateRange = 
        (!dateRange.start || entryDate >= dateRange.start) && 
        (!dateRange.end || entryDate <= dateRange.end);

      return matchesSearch && matchesTags && matchesTypes && matchesMoods && matchesDateRange;
    });
  }, [entries, debouncedSearchTerm, selectedTags, selectedTypes, selectedMoods, dateRange]);

  // Group entries by month
  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};
    if (!filteredEntries || filteredEntries.length === 0) return groups;
    
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedEntries.forEach(entry => {
      try {
        const date = new Date(entry.date);
        if (isNaN(date.getTime())) { 
          console.warn(`Invalid date: ${entry.journalId}`); 
          return; 
        }
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(entry);
      } catch (error) { 
        console.error(`Error processing date: ${entry.journalId}`, error); 
      }
    });
    
    return groups;
  }, [filteredEntries]);

  const currentEntry = typeof selectedEntryIndex === 'number' ? filteredEntries[selectedEntryIndex] : null;

  // Handle grid layout adjustment based on window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setGridColumns(1);
      else if (width < 1024) setGridColumns(2);
      else if (width < 1280) setGridColumns(3);
      else setGridColumns(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Unified handler to open the modal
  const handleEntryClick = (index: number) => {
    if (index >= 0 && index < filteredEntries.length) {
      setSelectedEntryIndex(index);
      setIsModalOpen(true);
    } else {
      console.error("Attempted to select invalid entry index:", index);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEntryIndex(null), 300);
  };

  // Handler for modal navigation
  const handleModalNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < filteredEntries.length) {
      setSelectedEntryIndex(newIndex);
    }
  };

  // Image cycling for previews
  const handleImageChange = (journalId: string, direction: 'next' | 'prev') => {
    const entry = filteredEntries.find(e => e.journalId === journalId);
    if (!entry || !entry.mediaUrl.image || entry.mediaUrl.image.length <= 1) return;
    
    const totalImages = entry.mediaUrl.image.length;
    const currentIndex = selectedImageIndices[journalId] || 0;
    let newIndex;
    
    if (direction === 'next') newIndex = (currentIndex + 1) % totalImages;
    else newIndex = (currentIndex - 1 + totalImages) % totalImages;
    
    setSelectedImageIndices(prev => ({ ...prev, [journalId]: newIndex }));
  };

  // Media Icons helper
  const renderMediaIcons = (entry: JournalEntry) => (
    <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
      {entry.mediaUrl?.audio?.length > 0 && 
        <FileAudio className="h-4 w-4 text-white bg-black/50 rounded p-0.5" />}
      {entry.mediaUrl?.video?.length > 0 && 
        <Film className="h-4 w-4 text-white bg-black/50 rounded p-0.5" />}
      {entry.mediaUrl?.document?.length > 0 && 
        <FileText className="h-4 w-4 text-white bg-black/50 rounded p-0.5" />}
    </div>
  );

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedTypes([]);
    setSelectedMoods([]);
    setDateRange({ start: null, end: null });
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-journal text-gray-800 dark:text-gray-100 mb-6">
          Design Journal Gallery
        </h2>
        
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            
            {/* Filter Dropdowns */}
            <div className="flex gap-2 flex-wrap">
              {/* Tags Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger >
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags(prev => [...prev, tag]);
                        } else {
                          setSelectedTags(prev => prev.filter(t => t !== tag));
                        }
                      }}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Types Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger >
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Types</span>
                    {selectedTypes.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allTypes.map(type => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes(prev => [...prev, type]);
                        } else {
                          setSelectedTypes(prev => prev.filter(t => t !== type));
                        }
                      }}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Moods Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger >
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Moods</span>
                    {selectedMoods.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedMoods.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allMoods.map(mood => (
                    <DropdownMenuCheckboxItem
                      key={mood}
                      checked={selectedMoods.includes(mood)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMoods(prev => [...prev, mood]);
                        } else {
                          setSelectedMoods(prev => prev.filter(m => m !== mood));
                        }
                      }}
                    >
                      {moodEmoji[mood.toLowerCase()] || ''} {mood}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Clear Filters */}
              {(selectedTags.length > 0 || selectedTypes.length > 0 || 
                selectedMoods.length > 0 || searchTerm !== "") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(selectedTags.length > 0 || selectedTypes.length > 0 || selectedMoods.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedTags.map(tag => (
                <Badge 
                  key={`tag-${tag}`} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button 
                    className="ml-1 hover:text-destructive" 
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {selectedTypes.map(type => (
                <Badge 
                  key={`type-${type}`} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  {type}
                  <button 
                    className="ml-1 hover:text-destructive" 
                    onClick={() => setSelectedTypes(prev => prev.filter(t => t !== type))}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {selectedMoods.map(mood => (
                <Badge 
                  key={`mood-${mood}`} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span>{moodEmoji[mood.toLowerCase()] || ''}</span>
                  {mood}
                  <button 
                    className="ml-1 hover:text-destructive" 
                    onClick={() => setSelectedMoods(prev => prev.filter(m => m !== mood))}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-end mb-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {/* Grid Tab */}
            <TabsTrigger value="grid" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <Grid3X3 className="h-4 w-4" />
              <span>Grid</span>
            </TabsTrigger>
            {/* Timeline Tab */}
            <TabsTrigger value="timeline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <Book className="h-4 w-4" />
              <span>Timeline</span>
            </TabsTrigger>
            {/* 3D View Tab */}
            <TabsTrigger value="3dview" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <View className="h-4 w-4" />
              <span>3D View</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>

        {/* Grid View Content */}
        <TabsContent value="grid" className="mt-0">
          <motion.div 
            layout 
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridColumns} gap-5`}
          >
            <AnimatePresence>
              {filteredEntries.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-16 text-center"
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No entries found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your filters or search terms</p>
                </motion.div>
              ) : (
                filteredEntries.map((entry, index) => {
                  const imageIndex = selectedImageIndices[entry.journalId] || 0;
                  const preview = getPreviewInfo(entry, imageIndex);
                  const hasMultipleImages = (entry.mediaUrl?.image?.length ?? 0) > 1;
                  
                  return (
                    <motion.div
                      key={entry.journalId || `grid-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="group relative rounded-lg overflow-hidden shadow-md bg-card border border-border hover:shadow-lg transition-shadow"
                      onClick={() => handleEntryClick(index)}
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleEntryClick(index)}
                    >
                      {/* Preview Area */}
                      <div className="h-56 w-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        {preview.src ? (
                          <Image 
                            src={preview.src} 
                            alt={entry.title || '...'} 
                            fill 
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                            className="object-cover" 
                            priority={index < 8} 
                          />
                        ) : preview.icon ? (
                          <div className="flex items-center justify-center w-full h-full">
                            {React.createElement(preview.icon, { className: "w-16 h-16 text-gray-400" })}
                          </div>
                        ) : (
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                        
                        {/* Mood Badge if available */}
                        {entry.mood && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="px-2 py-0.5 text-xs bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                              {moodEmoji[entry.mood.toLowerCase()] || ''} {entry.mood}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Media Icons */}
                      {renderMediaIcons(entry)}
                      
                      {/* Image Navigation Buttons */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-16 right-2 flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 p-0 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageChange(entry.journalId, 'prev');
                            }}
                          >
                            &lt;
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 p-0 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageChange(entry.journalId, 'next');
                            }}
                          >
                            &gt;
                          </Button>
                        </div>
                      )}
                      
                      {/* Info Panel */}
                      <div className="p-3 bg-card">
                        <div className="flex items-center justify-between">
                          <h3 className="font-journal font-medium">{entry.title || "Untitled Entry"}</h3>
                          <p className="text-xs text-muted-foreground">
                            {entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                        
                        {/* Tags Display */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.tags.slice(0, 3).map(tag => (
                              <Badge 
                                key={`${entry.journalId}-${tag}`} 
                                variant="outline" 
                                className="text-xs px-1.5 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {entry.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                +{entry.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        {/* Timeline View Content */}
        <TabsContent value="timeline" className="mt-0">
          <div className="space-y-12 relative">
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/30"></div>
            
            {Object.keys(groupedEntries).length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center pl-10 sm:pl-16"
              >
                <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No entries found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters or search terms</p>
              </motion.div>
            ) : (
              Object.entries(groupedEntries).map(([month, monthEntries]) => (
                <div key={month} className="relative pl-10 sm:pl-16 py-4">
                  {/* Month Marker */}
                  <div className="absolute -left-2 sm:left-0 p-2 rounded-full bg-primary">
                    <span className="sr-only">{month}</span>
                  </div>
                  <h3 className="text-xl font-bold font-journal mb-2">{month}</h3>
                  <div className="space-y-6 mt-8">
                    {monthEntries.map((entry) => {
                      const entryIndex = filteredEntries.findIndex(e => e.journalId === entry.journalId);
                      if (entryIndex === -1) return null;
                      
                      return (
                        <motion.div
                          key={entry.journalId || `timeline-${entryIndex}`}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="group relative p-4 rounded-lg shadow-md border border-border bg-card hover:shadow-lg transition-shadow"
                          onClick={() => handleEntryClick(entryIndex)}
                          tabIndex={0}
                          onKeyPress={(e) => e.key === 'Enter' && handleEntryClick(entryIndex)}
                        >
                          {/* Timeline Dot */}
                          <div className="absolute -left-12 sm:-left-20 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-secondary"></div>
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            {/* Preview Area */}
                            <div className="w-full sm:w-48 h-32 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                              {entry.mediaUrl?.image && entry.mediaUrl.image.length > 0 ? (
                                <Image 
                                  src={entry.mediaUrl.image[0]} 
                                  alt={entry.title || 'Journal entry'} 
                                  fill 
                                  className="object-cover" 
                                  sizes="(max-width: 640px) 100vw, 192px"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Mood Indicator */}
                              {entry.mood && (
                                <div className="absolute bottom-1 right-1 z-10">
                                  <div className="text-lg" title={entry.mood}>
                                    {moodEmoji[entry.mood.toLowerCase()] || ''}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Content Area */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm text-muted-foreground">
                                  {entry.date ? new Date(entry.date).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  }) : 'No date'}
                                </p>
                                {entry.journalType && (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.journalType}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="text-lg font-medium mt-1">{entry.title || "Untitled Entry"}</h4>
                              <p className="text-sm line-clamp-2 mt-1 text-muted-foreground">
                                {entry.content || "No content"}
                              </p>
                              
                              {/* Tags Display */}
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {entry.tags.map(tag => (
                                    <Badge 
                                      key={`${entry.journalId}-${tag}`} 
                                      variant="secondary" 
                                      className="text-xs px-1.5 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {/* Media Type Indicators */}
                              {(entry.mediaUrl?.audio?.length > 0 || 
                                entry.mediaUrl?.video?.length > 0 || 
                                entry.mediaUrl?.document?.length > 0) && (
                                <div className="mt-2 flex gap-2">
                                  {entry.mediaUrl?.audio?.length > 0 && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <FileAudio className="h-3 w-3 mr-1" />
                                      <span>{entry.mediaUrl.audio.length}</span>
                                    </div>
                                  )}
                                  {entry.mediaUrl?.video?.length > 0 && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Film className="h-3 w-3 mr-1" />
                                      <span>{entry.mediaUrl.video.length}</span>
                                    </div>
                                  )}
                                  {entry.mediaUrl?.document?.length > 0 && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <FileText className="h-3 w-3 mr-1" />
                                      <span>{entry.mediaUrl.document.length}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* 3D View Content */}
        <TabsContent value="3dview" className="mt-0">
          <Suspense fallback={
            <div className="w-full h-[60vh] md:h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-xl font-medium">Initializing 3D Experience...</p>
                <p className="text-sm text-muted-foreground mt-2">Creating immersive visualization of your design journal</p>
              </div>
            </div>
          }>
            {/* Pass filtered entries and the click handler */}
            <Journal3DView 
              entries={filteredEntries} 
              
              onSelectEntry={(index: number) => {
                if (index >= 0 && index < filteredEntries.length) {
                  handleEntryClick(index);
                }
              }} 
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && currentEntry && (
          <JournalModal
            key={currentEntry.journalId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            entry={currentEntry}
            entries={filteredEntries}
            currentIndex={selectedEntryIndex!}
            onNavigate={handleModalNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalGallery;