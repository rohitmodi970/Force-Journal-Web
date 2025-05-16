// src/app/journal/JournalModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { JournalEntry } from "./types";
import { ChevronLeft, ChevronRight, X, Download, FileAudio, Film, FileText, Image as ImageIcon } from "lucide-react";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  entries: JournalEntry[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
}

const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  entry,
  entries,
  currentIndex,
  onNavigate,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false); // For audio/video players
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
console.log("Journal",entry)
  // --- Effects ---

  // Reset states when entry changes
  useEffect(() => {
    if (entry) {
      setCurrentImageIndex(0);
      setIsMediaPlaying(false);
      // Attempt to pause any media from the previous entry
      audioRef.current?.pause();
      videoRef.current?.pause();
    }
  }, [entry?.journalId]); // Depend only on journalId

  // Keyboard navigation and close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNavigateClick("next");
      } else if (e.key === "ArrowLeft") {
        handleNavigateClick("prev");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentIndex, entries.length]); // Add dependencies

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // --- Handlers ---

  const handleNavigateClick = (direction: "next" | "prev") => {
    const totalEntries = entries.length;
    if (totalEntries <= 1) return; // No navigation needed

    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % totalEntries;
    } else {
      newIndex = (currentIndex - 1 + totalEntries) % totalEntries;
    }
    onNavigate(newIndex);
  };

  const handleImageNavigate = (direction: "next" | "prev") => {
      const images = entry?.mediaUrl?.image || [];
      if (images.length <= 1) return;

      let newIndex;
      if (direction === "next") {
          newIndex = (currentImageIndex + 1) % images.length;
      } else {
          newIndex = (currentImageIndex - 1 + images.length) % images.length;
      }
      setCurrentImageIndex(newIndex);
  }

  // --- Render Functions ---

  // Render content based on its type (string or ReactNode)
  const renderTextContent = () => {
    if (!entry?.content) return <p className="text-muted-foreground italic">No text content available.</p>;

    if (typeof entry.content === 'string') {
      // Basic paragraph splitting for display
      return entry.content.split('\n').map((paragraph, index) => (
        <p key={index} className={paragraph.trim() === '' ? 'h-4' : '' /* Add space for empty lines */}>
          {paragraph}
        </p>
      ));
    } else if (React.isValidElement(entry.content)) {
      return entry.content; // Render if it's already a React element
    } else {
      return <p className="text-muted-foreground italic">Content format not supported.</p>;
    }
  };


  // Primary media rendering (Image Carousel, Video, Audio, Doc Links)
  const renderPrimaryMedia = () => {
    if (!entry) return <div className="flex items-center justify-center h-full bg-gray-700 text-gray-400">No Entry Data</div>;

    const images = entry.mediaUrl?.image || [];
    const videos = entry.mediaUrl?.video || [];
    const audios = entry.mediaUrl?.audio || [];
    const documents = entry.mediaUrl?.document || [];

    // 1. Image Carousel
    if (images.length > 0) {
        const hasMultipleImages = images.length > 1;
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group">
                 <AnimatePresence initial={false}>
                    <motion.div
                        key={`${entry.journalId}-${currentImageIndex}`} // Key change triggers animation
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Image
                            src={images[currentImageIndex]}
                            alt={`Journal image ${currentImageIndex + 1} for ${entry.title}`}
                            fill
                            className="object-contain" // Contain preserves aspect ratio
                            priority // Load modal image immediately
                            sizes="(max-width: 768px) 100vw, 50vw" // Adjust sizes
                        />
                    </motion.div>
                 </AnimatePresence>

                {/* Image Navigation */}
                {hasMultipleImages && (
                    <>
                        <button
                            onClick={() => handleImageNavigate("prev")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-2 text-white opacity-50 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none ring-offset-black focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                            aria-label="Previous image"
                        > <ChevronLeft className="h-5 w-5" /> </button>
                         <button
                            onClick={() => handleImageNavigate("next")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-2 text-white opacity-50 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none ring-offset-black focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                            aria-label="Next image"
                        > <ChevronRight className="h-5 w-5" /> </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full z-10">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </>
                )}
                 {/* Fullscreen button? */}
                 {/* <button className="absolute top-2 right-2 ..."><Maximize2/></button> */}
            </div>
        );
    }

    // 2. Video Player (using first video)
    if (videos.length > 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            controls
            src={videos[0]}
            className="max-w-full max-h-full rounded"
            onPlay={() => setIsMediaPlaying(true)}
            onPause={() => setIsMediaPlaying(false)}
            onError={(e) => console.error("Video load error:", e)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // 3. Audio Player (using first audio)
    if (audios.length > 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4">
           <FileAudio className="w-24 h-24 text-gray-500 mb-4" />
           <audio
             ref={audioRef}
             controls
             src={audios[0]}
             className="w-full max-w-md"
             onPlay={() => setIsMediaPlaying(true)}
             onPause={() => setIsMediaPlaying(false)}
             onError={(e) => console.error("Audio load error:", e)}
           >
             Your browser does not support the audio element.
           </audio>
        </div>
      );
    }

    // 4. Document List (if no other primary media)
    if (documents.length > 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700 p-6 text-white overflow-y-auto">
          <FileText className="w-20 h-20 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-3">Attached Documents</h3>
          <ul className="space-y-2 text-center">
            {documents.map((docUrl, index) => {
              const fileName = docUrl.substring(docUrl.lastIndexOf('/') + 1);
              return (
                <li key={index}>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName || true}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {fileName || `Document ${index + 1}`}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    // Fallback if absolutely no media
    return <div className="flex items-center justify-center h-full bg-gray-700 text-gray-400"><ImageIcon className="w-16 h-16 mr-2"/> No media available for this entry.</div>;
  };


  // Render secondary media links (if primary media is shown)
  const renderSecondaryMedia = () => {
     if (!entry) return null;
     const images = entry.mediaUrl?.image || [];
     const videos = entry.mediaUrl?.video || [];
     const audios = entry.mediaUrl?.audio || [];
     const documents = entry.mediaUrl?.document || [];

     const showAudio = audios.length > 0 && images.length > 0; // Show audio links if primary was image
     const showVideo = videos.length > 0 && images.length > 0; // Show video links if primary was image
     const showDocs = documents.length > 0 && (images.length > 0 || videos.length > 0 || audios.length > 0); // Show docs if any other media was primary

     if (!showAudio && !showVideo && !showDocs) return null;
console.log("Journal MOdal",entry.content)
     return (
         <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600 space-y-3">
             {showVideo && (
                 <div>
                     <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1"><Film className="h-4 w-4"/> Video</h4>
                     {videos.map((url, i) => <a key={`vid-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block truncate dark:text-blue-400">{url.substring(url.lastIndexOf('/') + 1) || `Video ${i+1}`}</a>)}
                 </div>
             )}
             {showAudio && (
                 <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1"><FileAudio className="h-4 w-4"/> Audio</h4>
                      {audios.map((url, i) => <a key={`aud-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block truncate dark:text-blue-400">{url.substring(url.lastIndexOf('/') + 1) || `Audio ${i+1}`}</a>)}
                 </div>
             )}
             {showDocs && (
                 <div>
                     <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-4 w-4"/> Documents</h4>
                     {documents.map((url, i) => {
                        const fileName = url.substring(url.lastIndexOf('/') + 1);
                        return (
                            <a key={`doc-${i}`} href={url} target="_blank" rel="noopener noreferrer" download={fileName || true} className="text-sm text-blue-600 hover:underline block truncate dark:text-blue-400">
                                {fileName || `Document ${i+1}`}
                            </a>
                        );
                     })}
                 </div>
             )}
         </div>
     );
  }

  // --- Main Return ---

  if (!entry) return null; // Ensure entry exists before rendering

  const entryDate = entry.date ? new Date(entry.date) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="journal-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose} // Close on backdrop click
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row bg-background dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-30 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50 transition-colors"
              aria-label="Close modal"
            > <X className="h-5 w-5" /> </button>

             {/* Navigation Buttons (Desktop) */}
             {entries.length > 1 && (
                <>
                 <button
                    onClick={() => handleNavigateClick("prev")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors hidden md:block"
                    aria-label="Previous entry"
                 > <ChevronLeft className="h-6 w-6" /> </button>
                 <button
                    onClick={() => handleNavigateClick("next")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors hidden md:block"
                    aria-label="Next entry"
                > <ChevronRight className="h-6 w-6" /> </button>
                </>
             )}


            {/* Media Panel */}
            <div className="w-full md:w-1/2 lg:w-3/5 h-64 md:h-auto bg-gray-900 relative flex-shrink-0 order-1 md:order-2">
                {renderPrimaryMedia()}
            </div>


            {/* Content Panel */}
            <div className="w-full md:w-1/2 lg:w-2/5 p-5 sm:p-6 overflow-y-auto order-2 md:order-1 flex flex-col">
               <div> {/* Header info */}
                  <h2 id="journal-title" className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">{entry.title || "Untitled Entry"}</h2>
                   {/*<p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                   {entryDate
                      ? entryDate.toLocaleDateString(undefined, { // Use user's locale
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })
                      : "No Date"}
                     {entry.location && ` - ${entry.location}`}
                  </p>
                  */}
                   {/* Mood & Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                     {entry.mood && <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">Mood: {entry.mood}</span>}
                     {entry.tags?.map(tag => <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-200">{tag}</span>)}
                 </div>
               </div>

               {/* Scrollable text content */}
               <div className="prose prose-sm dark:prose-invert max-w-none flex-grow mb-4 text-gray-700 dark:text-gray-300">
                  {renderTextContent()}
               </div>

                {/* Secondary media links */}
                {renderSecondaryMedia()}

                {/* Mobile Navigation Footer */}
                 {entries.length > 1 && (
                     <div className="mt-auto pt-4 border-t border-gray-300 dark:border-gray-600 md:hidden flex justify-between">
                         <button onClick={() => handleNavigateClick("prev")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            <ChevronLeft className="h-4 w-4" /> Prev
                         </button>
                         <button onClick={() => handleNavigateClick("next")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            Next <ChevronRight className="h-4 w-4" />
                         </button>
                     </div>
                 )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JournalModal;