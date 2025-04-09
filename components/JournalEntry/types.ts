export interface FileData {
    image: File | null;
    audio: File | null;
    other: File | null;
  }
  
  export interface JournalType {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
  }
  
  export interface ViewMode {
    id: 'writing' | 'focus' | 'preview';
    name: string;
    description: string;
  }
  
  export interface Mood {
    id: string;
    emoji: string;
    label: string;
  }
  