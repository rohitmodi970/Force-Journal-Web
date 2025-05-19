import { format } from "date-fns";
import { JournalEntry } from "./types";
import { Play, FileText, Edit } from "lucide-react";
import { Button } from "@/components/ui/button2";
import { useRouter } from "next/navigation";

interface JournalPageProps {
  entry: JournalEntry;
  isEven: boolean;
  backgroundClass?: string;
  backgroundStyle?: React.CSSProperties;
}

const JournalPage = ({ entry, isEven, backgroundClass, backgroundStyle }: JournalPageProps) => {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const handleEditEntry = () => {
    router.push(`/journal-entry-edit/${entry.journalId}`);
  };
  
  // Function to open media in a modal or new page
  const handleOpenMedia = (url: string, type: string) => {
    // Here you would implement your modal or viewer logic
    // For now, we'll just open in a new tab
    window.open(url, '_blank');
  };

  // Default background if none provided
  const defaultBackgroundClass = isEven 
    ? 'bg-gradient-to-br from-card to-muted/30' 
    : 'bg-gradient-to-br from-muted/30 to-card';

  return (
    <div 
      className={backgroundClass || defaultBackgroundClass}
      style={backgroundStyle}
    >
      <div className="p-8 overflow-y-auto h-full">
        <div className="mb-6 border-b pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold font-journal text-primary mb-2 tracking-wide">
              {entry.title}
            </h2>
            <p className="text-sm text-muted-foreground font-journal flex items-center gap-2">
              {formatDate(entry.date)}
              {entry.mood && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                  Mood: {entry.mood}
                </>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/50 hover:bg-background/80 rounded-full shadow-sm backdrop-blur-sm z-50"
            onClick={handleEditEntry}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="journal-content whitespace-pre-line mb-6 font-journal text-lg leading-relaxed">
          {entry.content}
        </div>
        
        {/* Image Gallery */}
        {entry.mediaUrl?.image && entry.mediaUrl.image.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {entry.mediaUrl.image.map((image, index) => (
                <div
                key={index}
                className="relative rounded-lg overflow-hidden aspect-square group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleOpenMedia(image, 'image')}
                >
                <iframe 
                  src={image.replace('/view', '/preview')}
                  className="w-full h-full border-0"
                  title={`Image ${index + 1} for ${entry.title}`}
                  loading="lazy"
                  allow="autoplay"
                />
                </div>
            ))}
          </div>
        )}
        
        {/* Audio Files */}
        {entry.mediaUrl?.audio && entry.mediaUrl.audio.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Audio Recordings</h3>
            {entry.mediaUrl.audio.map((audio, index) => (
                <div 
                key={index}
                className="flex flex-col gap-2 p-3 bg-background/70 rounded-lg hover:bg-background/90 transition-colors"
                >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                  <p className="text-sm font-medium">Audio Recording {index + 1}</p>
                  <p className="text-xs text-muted-foreground">From {entry.title}</p>
                  </div>
                  <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleOpenMedia(audio, 'audio')}
                  >
                  <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-full">
                  <iframe 
                  src={audio.replace('/view', '/preview')}
                  className="w-full h-12 rounded border-0"
                  allow="autoplay"
                  title={`Audio recording ${index + 1}`}
                  />
                </div>
                </div>
            ))}
          </div>
        )}
        
        {/* Video Files */}
        {entry.mediaUrl?.video && entry.mediaUrl.video.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Videos</h3>
            {entry.mediaUrl.video.map((video, index) => (
                <div 
                key={index}
                className="relative rounded-lg overflow-hidden aspect-video group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleOpenMedia(video, 'video')}
                >
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors z-10">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <iframe 
                  src={video.replace('/view', '/preview')}
                  className="w-full h-full border-0"
                  title={`Video ${index + 1} for ${entry.title}`}
                  loading="lazy"
                  allow="autoplay"
                  allowFullScreen
                />
                </div>
            ))}
          </div>
        )}
        
        {/* Document Files */}
        {entry.mediaUrl?.document && entry.mediaUrl.document.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents</h3>
            {entry.mediaUrl.document.map((doc, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-background/70 rounded-lg hover:bg-background/90 transition-colors cursor-pointer"
                onClick={() => handleOpenMedia(doc, 'document')}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {entry.fileName || `Document ${index + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.fileSize ? `${(entry.fileSize / 1024).toFixed(2)} KB` : 'Document'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-journal transition-colors duration-300 hover:bg-primary/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;