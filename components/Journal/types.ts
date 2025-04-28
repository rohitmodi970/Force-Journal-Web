export interface FileData {
  image?: File[];
  audio?: File[];
  video?: File[];
  other?: File[];
}
export interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface FileAnalysisResult {
  type: string;
  data: any;
}
 
  
 
  export interface Mood {
    id: string;
    emoji: string;
    label: string;
  }
 
  export interface AnalyticsData {
    wordCountByDay: {
      date: string;
      count: number;
    }[];
    moodDistribution: {
      mood: string;
      count: number;
    }[];
    topWords: {
      word: string;
      count: number;
    }[];
    entriesPerWeekday: {
      day: string;
      count: number;
    }[];
    tagsUsage: {
      tag: string;
      count: number;
    }[];
  }
  export interface MediaFile {
    file: File;
    type: 'image' | 'audio' | 'video' | 'document';
    progress: number;
    id: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    url?: string;
    cloudinaryPublicId?: string;
    cloudinaryResourceType?: string;
  }
  
  export interface UploadResponse {
    url: string;
    publicId: string;
    resourceType: string;
    mediaId: string;
  }
  
  export interface MediaLimits {
    image: { count: number; size: number };
    audio: { count: number; size: number };
    video: { count: number; size: number };
    document: { count: number; size: number };
  }







  export interface MediaFile {
    id: string;
    file: File;
    type: 'image' | 'audio' | 'video' | 'document';
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    url?: string;
    cloudinaryPublicId?: string;
    cloudinaryResourceType?: string;
  }
  
  // Media limits configuration
  export interface MediaLimits {
    image: { count: number; size: number };
    audio: { count: number; size: number };
    video: { count: number; size: number };
    document: { count: number; size: number };
  }
  
  // Response from the upload API
  export interface UploadResponse {
    url: string;
    publicId: string;
    resourceType: string;
  }
  
  // Journal entry interface for database interactions
  export interface JournalEntry {
    journalId: string;
    title: string;
    content: string;
    date: string;
    tags: string[];
    mood: string | null;
    journalType: string;
    timestamp: string;
    userId: number;
    mediaType: string[];
    mediaUrl: {
      image: string[];
      audio: string[];
      video: string[];
      document: string[];
    };
    cloudinaryPublicId: string;
    cloudinaryResourceType: string;
    fileName: string;
    fileSize: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // View modes for the journal UI
  export interface ViewMode {
    id: string;
    name: string;
    description: string;
  }
  
  // Journal types for the journal UI
  export interface JournalType {
    id: string;
    name: string;
    icon: string;
    description: string;
  }
  
  // Mood options for the journal UI
  export interface Mood {
    id: string;
    emoji: string;
    label: string;
  }