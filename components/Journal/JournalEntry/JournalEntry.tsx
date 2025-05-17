"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bookmark, PenLine, Sparkles, FileText, Save, Clock, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/utilities/context/ThemeContext';
import JournalHeader from './JournalHeader';
import SettingsPanel from './SettingsPanel';
import TagsInput from './TagsInput';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import MediaSelector from './file-attachements/MediaSelector';
import MediaPreview from './file-attachements/MediaPreview';

import Toast from '@/components/ui/toast';
import SentimentAnalysisDashboard from '@/components/Journal/JournalEntry/SentimentAnalysis';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'audio' | 'video' | 'document';
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  url?: string;
  cloudinaryPublicId?: string;
  cloudinaryResourceType?: string;
  driveFileId?: string;
  driveMimeType?: string;
}
const JournalEntry: React.FC = () => {
  const { currentTheme, isDarkMode, colorOptions, setCurrentTheme } = useTheme();
  const currentDate = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<string>(currentDate);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [journalType, setJournalType] = useState<string>('personal');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<string>('writing'); // 'writing', 'preview', 'focus'
  const [showMood, setShowMood] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(false);
  const [revealAnimation, setRevealAnimation] = useState<boolean>(true);
  const [wordCount, setWordCount] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [selectedAccent, setSelectedAccent] = useState<string>(currentTheme.primary);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Auto-save related states
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [pendingBackendSync, setPendingBackendSync] = useState<boolean>(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backendSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaUploadState, setMediaUploadState] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // New state to track uploaded media
  const [journalMedia, setJournalMedia] = useState<Record<string, Array<Record<string, unknown>>>>({
    image: [],
    audio: [],
    video: [],
    document: []
  });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Journal types
  const journalTypes = [
    { id: 'personal', name: 'Personal', icon: '📔', description: 'Record your thoughts and daily experiences' },
    { id: 'gratitude', name: 'Gratitude', icon: '🙏', description: "Focus on what you're thankful for" },
    { id: 'goals', name: 'Goals', icon: '🎯', description: 'Track your progress toward objectives' },
    { id: 'creative', name: 'Creative', icon: '🎨', description: 'Explore ideas and creative writing' }
  ];

  // View modes
  const viewModes = [
    { id: 'writing', name: 'Writing Mode', description: 'Standard editor with all tools' },
    { id: 'focus', name: 'Focus Mode', description: 'Distraction-free writing environment' },
    { id: 'preview', name: 'Preview Mode', description: 'See how your entry looks formatted' }
  ];
  // Define media limits
  const MEDIA_LIMITS = {
    image: { count: 6, size: 25 * 1024 * 1024 }, // 25MB
    audio: { count: 11, size: 5 * 1024 * 1024 }, // 5MB
    video: { count: 2, size: 200 * 1024 * 1024 }, // 200MB
    document: { count: 5, size: 5 * 1024 * 1024 }, // 5MB
  };
  const [savedEntries, setSavedEntries] = useState<Record<string, unknown>[]>([]);

  // Add new state for analysis result
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  useEffect(() => {
    // Load saved entries from localStorage on component mount
    const loadEntriesFromLocalStorage = () => {
      const entries = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('journal_entry_')) {
          const entry = localStorage.getItem(key);
          if (entry) {
            entries.push(JSON.parse(entry));
          }
        }
      }
      setSavedEntries(entries);
    };

    // Load entries from API
    const loadEntriesFromAPI = async () => {
      try {
        const response = await fetch('/api/journal-entry');
        if (response.ok) {
          const data: Record<string, unknown>[] = await response.json();
          setSavedEntries(data);
        } else {
          // If API fails, fall back to localStorage
          loadEntriesFromLocalStorage();
        }
      } catch (error) {
        console.error("Failed to load entries from API:", error);
        // Fall back to localStorage
        loadEntriesFromLocalStorage();
      }
    };

    loadEntriesFromAPI();

    // Cleanup function for timers when component unmounts
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (backendSyncTimerRef.current) {
        clearTimeout(backendSyncTimerRef.current);
      }
    };
  }, []);

  // Moods
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' },
    { id: 'excited', emoji: '🤩', label: 'Excited' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'angry', emoji: '😠', label: 'Angry' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'tired', emoji: '😴', label: 'Tired' },
    { id: 'grateful', emoji: '🙏', label: 'Grateful' }
  ];

  // Accent colors (using the theme's color options)
  const accentColors = [
    '#F43F5E', // Red
    '#F97316', // Orange
    '#FACC15', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6'  // Violet
  ];

  // Dynamic styles based on theme
  const styles = {
    primaryColor: currentTheme.primary,
    primaryHover: currentTheme.hover,
    primaryActive: currentTheme.active,
    primaryLight: currentTheme.light,
    primaryMedium: currentTheme.medium,
    bgPage: isDarkMode ? '#1F2937' : '#F7F9FC',
    bgCard: isDarkMode ? '#2D3748' : '#FFFFFF',
    bgInput: isDarkMode ? '#374151' : '#F9FAFB',
    textPrimary: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#4B5563',
    borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    shadowHover: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.08)'
  };

  // Handle initial reveal animation
  useEffect(() => {
    if (revealAnimation) {
      const timer = setTimeout(() => {
        setRevealAnimation(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [revealAnimation]);

  // Focus on title input when component mounts
  useEffect(() => {
    if (titleRef.current && !revealAnimation) {
      titleRef.current.focus();
    }
  }, [revealAnimation]);

  // Calculate word count whenever content changes and set up auto-save
  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }

    // Set unsaved state
    setIsUnsaved(true);

    // Clear any existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set a new auto-save timer (save to localStorage after 3 seconds of inactivity)
    if (title.trim() && content.trim()) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveToLocalStorage();
      }, 3000);
    }
  }, [content, title, tags, date, selectedMood, journalType]);
  const handleFileSelect = useCallback(
    (files: FileList | null, type: 'image' | 'audio' | 'video' | 'document') => {
      // Implementation from MediaUploader component
      if (!files || files.length === 0) return;

      // Filter existing files of this type
      const existingFilesOfType = mediaFiles.filter((m) => m.type === type);

      // Check if adding these files would exceed limit
      if (existingFilesOfType.length + files.length > MEDIA_LIMITS[type].count) {
        alert(
          `You can only upload up to ${MEDIA_LIMITS[type].count} ${type} files. You already have ${existingFilesOfType.length}.`
        );
        return;
      }

      // Process each file
      const newMediaFiles: MediaFile[] = [];

      Array.from(files).forEach((file) => {
        // Check file size
        if (file.size > MEDIA_LIMITS[type].size) {
          alert(`File ${file.name} exceeds the maximum size for ${type} uploads (${MEDIA_LIMITS[type].size / (1024 * 1024)}MB)`);
          return;
        }

        newMediaFiles.push({
          file,
          type,
          progress: 0,
          id: uuidv4(),
          status: 'idle'
        });
      });

      setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    },
    [mediaFiles]
  );

 // Handle media upload process
const handleUpload = async () => {
  if (mediaFiles.length === 0 || isUploading) return;

  setIsUploading(true);

  // Get or create journalId if needed
  let journalId = currentJournalId;

  if (!journalId) {
    // Create new journal entry first with minimal data
    try {
      const newEntryData = {
        title: title || '',
        content: content || '',
        date: date || new Date().toISOString(),
        tags: tags || [],
        mood: selectedMood || null,
        journalType: journalType || 'general',
        timestamp: new Date().toISOString(),
        media: { image: [], audio: [], video: [], document: [] }
      };

      const response = await fetch('/api/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntryData),
      });

      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }

      const result = await response.json();
      journalId = result.entry.journalId;
      setCurrentJournalId(journalId);

    } catch (error) {
      console.error('Error creating entry before upload:', error);
      setIsUploading(false);
      showMessage('Failed to create journal before upload', true);
      return;
    }
  }

  const uploadPromises = mediaFiles
    .filter((media) => media.status === 'idle')
    .map(async (media) => {
      try {
        // Update status to uploading
        setMediaFiles((prev) =>
          prev.map((m) =>
            m.id === media.id ? { ...m, status: 'uploading' } : m
          )
        );

        // Create FormData for the file upload
        const formData = new FormData();
        formData.append('file', media.file);
        formData.append('journalId', journalId as string);
        formData.append('mediaType', media.type);
        formData.append('fileName', media.file.name);
        formData.append('fileSize', media.file.size.toString());

        // Upload to media API endpoint which handles Google Drive uploads
        const uploadResponse = await axios.post<{
          url: string;
          fileId: string;
          mimeType: string;
        }>('/api/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // @ts-expect-error: onUploadProgress is not recognized by axios types
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && progressEvent.loaded) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setMediaFiles((prev) =>
                prev.map((m) =>
                  m.id === media.id ? { ...m, progress: percentCompleted } : m
                )
              );
            }
          },
        });

        const response = uploadResponse.data;

        // Update mediaFiles state with the Drive response
        const updatedMedia: MediaFile = {
          ...media,
          status: 'success' as const,
          progress: 100,
          url: response.url,
          driveFileId: response.fileId,
          driveMimeType: response.mimeType
        };

        setMediaFiles((prev) =>
          prev.map((m) => (m.id === media.id ? updatedMedia : m))
        );

        // Add media to journal in database using the PATCH endpoint
        await fetch('/api/journal-entry', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journalId,
            operation: 'add',
            mediaType: media.type,
            mediaData: {
              url: response.url,
              driveFileId: response.fileId,
              driveMimeType: response.mimeType,
              fileName: media.file.name,
              fileSize: media.file.size
            }
          }),
        });

        return updatedMedia;
      } catch (error) {
        console.error('Upload error:', error);

        // Update status to error
        setMediaFiles((prev) =>
          prev.map((m) =>
            m.id === media.id ? { ...m, status: 'error' } : m
          )
        );

        return null;
      }
    });

  const results = await Promise.all(uploadPromises);
  setIsUploading(false);

  // Update journalMedia state with successful uploads
  const successfulUploads = results.filter(Boolean) as MediaFile[];
  if (successfulUploads.length > 0) {
    // Convert MediaFile[] to Record<string, unknown>[] for handleMediaUploadComplete
    const mediaRecords = successfulUploads.map(file => ({
      ...file,
      fileName: file.file.name,
      fileSize: file.file.size
    } as Record<string, unknown>));
    
    handleMediaUploadComplete(mediaRecords);

    // Update any text content if needed
    if (content || title) {
      saveEntry();
    }
  }
};


// Handle file removal
const handleRemoveFile = async (mediaId: string) => {
  // Find the file to be removed
  const fileToRemove = mediaFiles.find(m => m.id === mediaId);

  if (fileToRemove && fileToRemove.status === 'success' && fileToRemove.driveFileId) {
    try {
      // Only call the API if this is a saved journal (not a temp journal)
      if (currentJournalId && !currentJournalId.startsWith('temp_')) {
        // Remove the file from Google Drive and database
        await axios.delete(`/api/journal-entry?action=remove-media`, {
          // @ts-expect-error: onUploadProgress is not recognized by axios types
          data: {
            journalId: currentJournalId,
            mediaType: fileToRemove.type,
            driveFileId: fileToRemove.driveFileId
          },
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Error removing file from Google Drive:', error);
      alert('Failed to remove file. Please try again.');
      return;
    }

    // Also update the journalMedia state after successful deletion
    const updatedMediaState = { ...journalMedia };
    const mediaType = fileToRemove.type as MediaType;
    if (mediaType === 'image' || mediaType === 'audio' || mediaType === 'video' || mediaType === 'document') {
      updatedMediaState[mediaType] = updatedMediaState[mediaType].filter(
        item => item.driveFileId !== fileToRemove.driveFileId
      );
      setJournalMedia(updatedMediaState);
      setIsUnsaved(true); // Mark as unsaved so changes are saved
    }
  }

  // Remove from state regardless of database operation
  setMediaFiles((prev) => prev.filter((m) => m.id !== mediaId));
};
 // Auto-save to localStorage
const autoSaveToLocalStorage = () => {
  // Only save if there's something to save (either content or uploaded media)
  const hasContent = title.trim() || content.trim();
  const hasMedia = mediaFiles.some(m => m.status === 'success');

  if (!hasContent && !hasMedia) {
    return;
  }

  let entryId = currentJournalId;
  if (!entryId) {
    entryId = `temp_${Date.now().toString()}`;
    setCurrentJournalId(entryId);
  }

  const entry = {
    journalId: entryId,
    title,
    content,
    date,
    tags,
    mood: selectedMood,
    journalType,
    timestamp: new Date().toISOString(),
    media: journalMedia
  };

  // Save to localStorage
  localStorage.setItem(`journal_entry_${entryId}`, JSON.stringify(entry));
  setLastAutoSaved(new Date());
  setPendingBackendSync(true);

  // Update savedEntries state if needed
  const existingEntryIndex = savedEntries.findIndex(e => e.journalId === entryId);
  if (existingEntryIndex >= 0) {
    const updatedEntries = [...savedEntries];
    updatedEntries[existingEntryIndex] = entry;
    setSavedEntries(updatedEntries);
  } else {
    setSavedEntries([...savedEntries, entry]);
  }

  // Set timer for backend sync (2 minutes)
  if (backendSyncTimerRef.current) {
    clearTimeout(backendSyncTimerRef.current);
  }
  backendSyncTimerRef.current = setTimeout(() => {
    syncToBackend(entryId);
  }, 120000); // 2 min
};



  // Sync entry to backend
  const syncToBackend = async (journalId: string) => {
    try {
      // Get the entry from localStorage
      const localEntryStr = localStorage.getItem(`journal_entry_${journalId}`);
      if (!localEntryStr) {
        return;
      }

      const localEntry = JSON.parse(localEntryStr);

      setIsSaving(true);

      // If the journalId starts with "temp_", it's a new entry that hasn't been saved to backend yet
      const isNewEntry = journalId.startsWith('temp_');

      if (isNewEntry) {
        // Create a new entry in the backend
        const response = await fetch('/api/journal-entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localEntry),
        });

        if (!response.ok) {
          throw new Error('Failed to create journal entry in backend');
        }

        const result = await response.json();
        // Type assertion to define expected structure
        const newJournalId = (result as { entry: { journalId: string } }).entry.journalId;

        // Update the local storage with the new ID from backend
        localStorage.removeItem(`journal_entry_${journalId}`);

        const updatedEntry = {
          ...localEntry,
          journalId: newJournalId,
        };

        localStorage.setItem(`journal_entry_${newJournalId}`, JSON.stringify(updatedEntry));

        // Update the current journal ID
        setCurrentJournalId(newJournalId);

        // Update saved entries list
        const updatedEntries = savedEntries.map(e =>
          e.journalId === journalId ? { ...updatedEntry } : e
        );
        setSavedEntries(updatedEntries);

        showMessage('Entry saved to server', false);
        // Enable media upload state after successful sync to backend
        setMediaUploadState(true);
      } else {
        // Update an existing entry
        const response = await fetch('/api/journal-entry', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localEntry),
        });

        if (!response.ok) {
          throw new Error('Failed to update journal entry in backend');
        }

        // Update the entry in localStorage to mark it as synced
        const updatedEntry = {
          ...localEntry,
        };

        localStorage.setItem(`journal_entry_${journalId}`, JSON.stringify(updatedEntry));

        // Update saved entries list
        const updatedEntries = savedEntries.map(e =>
          e.journalId === journalId ? { ...updatedEntry } : e
        );
        setSavedEntries(updatedEntries);

        showMessage('Changes synced to server', false);
        // Enable media upload state after successful sync to backend
        setMediaUploadState(true);
      }

      setPendingBackendSync(false);
      setIsUnsaved(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error syncing to backend:', error);
      // We don't show an error to the user here, as their data is still saved locally
      // The sync will be attempted again later
    } finally {
      setIsSaving(false);
    }
  };

  // Define valid media types
  type MediaType = 'image' | 'audio' | 'video' | 'document';

  // Handle when media uploads are completed
const handleMediaUploadComplete = (mediaFiles: Record<string, unknown>[]) => {
  // Group media files by type and update journal media state
  const newMediaState = { ...journalMedia };

  mediaFiles.forEach(file => {
    if (file.url && file.driveFileId && file.type) {
      // Convert MediaFile to format matching our schema
      const mediaFileRecord = {
        url: file.url as string,
        driveFileId: file.driveFileId as string,
        driveMimeType: file.driveMimeType as string || 'application/octet-stream',
        fileName: file.fileName as string,
        fileSize: file.fileSize as number,
        uploadedAt: new Date()
      };

      // Add to appropriate media type array if it's a valid media type
      const mediaType = file.type as MediaType;
      if (mediaType === 'image' || mediaType === 'audio' || mediaType === 'video' || mediaType === 'document') {
        newMediaState[mediaType] = [...newMediaState[mediaType], mediaFileRecord];
      }
    }
  });

  setJournalMedia(newMediaState);
  setIsUnsaved(true); // Mark as unsaved so it will be saved next auto-save cycle
};

  // Show message with auto-dismiss
  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Manual save - saves to localStorage and immediately syncs to backend
  const saveEntry = async () => {
    try {
      setIsSaving(true);

      // Don't require title or content anymore - they're optional per your schema
      // Only validate that we have something to save (either content or media)
      const hasContent = title.trim() || content.trim();
      const hasMedia = mediaFiles.some(m => m.status === 'success');

      if (!hasContent && !hasMedia) {
        showMessage("Please add either content or media to your journal", true);
        setIsSaving(false);
        return;
      }

      let entryId = currentJournalId;
      if (!entryId) {
        entryId = `temp_${Date.now().toString()}`;
        setCurrentJournalId(entryId);
      }

      // First save to localStorage
      const entry = {
        journalId: entryId,
        title, // Can be empty
        content, // Can be empty
        date,
        tags,
        mood: selectedMood,
        journalType,
        timestamp: new Date().toISOString(),
        media: journalMedia
      };

      localStorage.setItem(`journal_entry_${entryId}`, JSON.stringify(entry));

      // Sync to backend
      await syncToBackend(entryId);

      // Cancel any pending auto-sync
      if (backendSyncTimerRef.current) {
        clearTimeout(backendSyncTimerRef.current);
        backendSyncTimerRef.current = null;
      }

      setLastSaved(new Date());
      setIsUnsaved(false);
      setPendingBackendSync(false);
      showMessage('Journal entry saved successfully');
    } catch (error: unknown) {
      console.error('Error saving journal entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save journal entry';
      showMessage(`Error: ${errorMessage}`, true);
    } finally {
      setIsSaving(false);
    }
  };


  // Get formatted time for display
  const getFormattedTime = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Change accent color
  const changeAccentColor = (color: string) => {
    setSelectedAccent(color);

    // Use the colorOptions from the hook called at the top level
    const foundTheme = colorOptions.find((c) => c.primary === color);
    if (foundTheme) {
      setCurrentTheme(foundTheme);
    }
  };

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  // Add this useEffect to load journal media
  useEffect(() => {
    const fetchJournalMedia = async () => {
      if (currentJournalId && !currentJournalId.startsWith('temp_')) {
        try {
          interface MediaResponse {
            success: boolean;
            media: Record<string, Array<Record<string, unknown>>>;
          }

          const response = await axios.get<MediaResponse>(`/api/journal-entry?action=get-media&journalId=${currentJournalId}`);

          if (response.data.success) {
            const existingMediaFiles: MediaFile[] = [];

            // Process each media type from the response
            Object.entries(response.data.media).forEach(([type, files]) => {
              files.forEach((file, index) => {
                if (file.url) {
                  existingMediaFiles.push({
                    id: `existing-${type}-${index}`,
                    // Creating a placeholder file object since we don't have the actual file
                    //@ts-ignore
                    file: new File([], file.fileName || `${type}-file-${index}`, { type: `${type}/*` as string }),
                    type: type as 'image' | 'audio' | 'video' | 'document',
                    progress: 100,
                    status: 'success',
                    url: file.url as string,
                    cloudinaryPublicId: file.cloudinaryPublicId as string,
                    cloudinaryResourceType: file.cloudinaryResourceType as string
                  });
                }
              });
            });

            if (existingMediaFiles.length > 0) {
              setMediaFiles(existingMediaFiles);
            }
          }
        } catch (error) {
          console.error('Error fetching journal media:', error);
        }
      } else if (journalMedia) {
        // Fall back to journalMedia if provided and journalId is temporary
        const existingMediaFiles: MediaFile[] = [];

        // Process each media type
       

        if (existingMediaFiles.length > 0) {
          setMediaFiles(existingMediaFiles);
        }
      }
    };

    fetchJournalMedia();
  }, [currentJournalId, journalMedia]);

  // Add function to call the sentiment analysis API
  const handleAnalyzeSentiment = async () => {
    if (!content) {
      showMessage("Please write something before analyzing sentiment", true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("text", content);
      
      // Find the first successful image upload
      const imageFile = mediaFiles.find(m => m.type === 'image' && m.status === 'success');
      if (imageFile && imageFile.file) {
        formData.append("image", imageFile.file);
      }

      // First try the sentiment analysis API
      const sentimentResponse = await fetch("/api/sentiment/analyze-entry", {
        method: "POST",
        body: formData,
      });

      if (!sentimentResponse.ok) {
        throw new Error("Failed to analyze sentiment");
      }

      const result = await sentimentResponse.json();
      setAnalysisResult(result);
      setShowAnalysis(true);
      showMessage("Sentiment analysis completed successfully");

      // Then try to get AI insights through the proxy
      try {
        const aiResponse = await fetch("/api/aitopia/ai/prompts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: content,
            type: "journal_analysis"
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          // Merge AI insights with sentiment analysis
          setAnalysisResult(prev => ({
            ...prev,
            ai_insights: aiResult
          }));
        }
      } catch (aiError) {
        console.error("Error getting AI insights:", aiError);
        // Don't show error to user since this is optional
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      showMessage("Failed to analyze sentiment. Please try again.", true);
    }
  };

  return (
    <div
      className="flex flex-col h-screen transition-all duration-300"
      style={{ backgroundColor: styles.bgPage }}
    >

      {/* Success Message Toast */}
      {successMessage && (
        <Toast message={successMessage} type="success" visible={true} duration={3000} />
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center"
          style={{ maxWidth: "calc(100% - 2rem)" }}
        >
          <div className="mr-2">⚠</div>
          <p>{errorMessage}</p>
        </motion.div>
      )}
      {/* Error Message Toast */}
      {errorMessage && (
        <Toast message={errorMessage} type="error" visible={true} duration={2000} />
      )}
      {/* Journal Header */}
      <JournalHeader
        title={title}
        date={date}
        setDate={setDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isHeaderCollapsed={isHeaderCollapsed}
        setIsHeaderCollapsed={setIsHeaderCollapsed}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showMood={showMood}
        setShowMood={setShowMood}
        selectedMood={selectedMood}
        setSelectedMood={setSelectedMood}
        moods={moods}
        journalType={journalType}
        journalTypes={journalTypes}
        showColorPalette={showColorPalette}
        setShowColorPalette={setShowColorPalette}
        accentColors={accentColors}
        selectedAccent={selectedAccent}
        changeAccentColor={changeAccentColor}
        revealAnimation={revealAnimation}
        wordCount={wordCount}
        lastSaved={lastSaved}
        isUnsaved={isUnsaved}
        viewModes={viewModes}
        styles={styles}
        getFormattedTime={getFormattedTime}
      />

      {/* Settings Panel */}
      <SettingsPanel
        showSettings={showSettings}
        viewMode={viewMode}
        journalType={journalType}
        setJournalType={setJournalType}
        setViewMode={setViewMode}
        journalTypes={journalTypes}
        viewModes={viewModes}
        styles={styles}
        isDarkMode={isDarkMode}
      />

      {/* Main content area */}
      <motion.div
        className="flex-1 overflow-auto px-6 py-4"
        style={{ backgroundColor: styles.bgPage }}
        variants={contentVariants}
        initial="hidden"
        animate={revealAnimation ? "hidden" : "visible"}
      >
        {viewMode === 'focus' ? (
          /* Focus Mode Editor */
          <div className="max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none p-6 text-lg leading-relaxed transition-all duration-300"
              style={{
                color: styles.textPrimary,
                height: 'calc(100vh - 120px)',
                fontFamily: '"Noto Serif", serif'
              }}
              placeholder="Start writing your thoughts..."
              autoFocus
            />
          </div>
        ) : (
          /* Standard Writing or Preview Mode */
          <div className="max-w-4xl mx-auto w-full shadow-md rounded-lg p-6 border border-gray-200">
            <motion.div
              className="mb-6"
              variants={itemVariants}
            >
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry Title"
                className="w-full bg-transparent border-none outline-none text-3xl font-bold mb-2 transition-all duration-300"
                style={{ color: styles.textPrimary }}
              />

              {/* Date and mood display */}
              <div className="flex items-center text-sm mb-4 border-b pb-3" style={{ color: styles.textSecondary, borderColor: 'rgba(209, 213, 219, 0.5)' }}>
                <Clock size={16} className="mr-1" />
                <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {selectedMood && (
                  <span className="ml-3">
                    {moods.find(m => m.id === selectedMood)?.emoji}
                    {moods.find(m => m.id === selectedMood)?.label}
                  </span>
                )}
              </div>
            </motion.div>

            {viewMode === 'writing' && (
              <motion.div
                className="mb-6 flex flex-col space-y-4"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-2 p-3 bg-opacity-5 rounded-lg border shadow-sm"
                  style={{
                    backgroundColor: `${styles.primaryLight}30`,
                    borderColor: styles.primaryLight
                  }}>
                  <div
                    className="p-2 rounded-full bg-opacity-10"
                    style={{ backgroundColor: styles.primaryLight }}
                  >
                    {journalType === 'personal' && <PenLine size={18} style={{ color: styles.primaryColor }} />}
                    {journalType === 'gratitude' && <Sparkles size={18} style={{ color: styles.primaryColor }} />}
                    {journalType === 'goals' && <Bookmark size={18} style={{ color: styles.primaryColor }} />}
                    {journalType === 'creative' && <FileText size={18} style={{ color: styles.primaryColor }} />}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: styles.textPrimary }}
                  >
                    {journalTypes.find(t => t.id === journalType)?.name} Journal
                  </div>
                </div>

                <TagsInput
                  tags={tags}
                  setTags={setTags}
                  newTag={newTag}
                  setNewTag={setNewTag}
                  styles={styles}
                />

                {/* Media uploader component - updated to handle the new media schema */}
                <div className="flex flex-col gap-4">
                  <MediaSelector
                    onFileSelect={handleFileSelect}
                    mediaLimits={MEDIA_LIMITS}
                    disabled={isUploading}
                    currentFiles={mediaFiles}
                  />

                  <MediaPreview
                    mediaFiles={mediaFiles}
                    onRemove={handleRemoveFile}
                    isUploading={isUploading}
                  />

                  {mediaFiles.length > 0 && mediaFiles.some(m => m.status === 'idle') && (
                    <motion.button
                      onClick={handleUpload}
                      disabled={isUploading || !mediaUploadState}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        backgroundColor: isUploading || !mediaUploadState ? '#9CA3AF' : styles.primaryColor,
                        color: '#FFFFFF',
                        opacity: isUploading || !mediaUploadState ? 0.7 : 1,
                        cursor: isUploading || !mediaUploadState ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Save size={18} />
                      <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {viewMode === 'preview' ? (
              /* Preview Mode Content Display */
              <motion.div
                className="prose prose-lg max-w-none transition-all duration-300 border border-gray-200 rounded-lg p-5 shadow-inner"
                style={{
                  color: styles.textPrimary,
                  fontFamily: '"Noto Serif", serif',
                  backgroundColor: `${styles.bgPage}80`
                }}
                variants={itemVariants}
              >
                {content.split('\n').map((paragraph, index) => (
                  paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                ))}
              </motion.div>
            ) : (
              /* Writing Mode Editor */
              <motion.div variants={itemVariants} className="border border-gray-200 rounded-lg shadow-inner">
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent border-none outline-none resize-none p-5 text-lg leading-relaxed transition-all duration-300 rounded-lg"
                  style={{
                    color: styles.textPrimary,
                    minHeight: '400px',
                    fontFamily: '"Noto Serif", serif'
                  }}
                  placeholder="Start writing your thoughts..."
                />
              </motion.div>
            )}

            {viewMode === 'writing' && (
              <motion.div
                className="flex justify-between items-center mt-6 pt-4 border-t"
                style={{ borderColor: 'rgba(209, 213, 219, 0.5)' }}
                variants={itemVariants}
              >
                <div className="flex items-center space-x-4 text-sm" style={{ color: styles.textSecondary }}>
                  <span>{wordCount} words</span>
                  {lastAutoSaved && (
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      Auto-saved at {getFormattedTime(lastAutoSaved)}
                    </span>
                  )}
                  {pendingBackendSync && (
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${styles.primaryLight}50`, color: styles.primaryColor }}>
                      Pending sync
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    onClick={handleAnalyzeSentiment}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: styles.primaryMedium,
                      color: '#FFFFFF'
                    }}
                    disabled={!content.trim() || isSaving}
                  >
                    <Brain size={18} />
                    <span>Analyze Sentiment</span>
                  </motion.button>

                  <motion.button
                    onClick={saveEntry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: styles.primaryColor,
                      color: '#FFFFFF'
                    }}
                    disabled={!content.trim() || isSaving}
                  >
                    <Save size={18} />
                    <span>{isSaving ? 'Saving...' : 'Save Entry'}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Show Analysis Results */}
            {showAnalysis && analysisResult && (
              <div className="mb-6">
                <SentimentAnalysisDashboard data={analysisResult as any} />
              </div>
            )}
          </div>
        )}
</motion.div>


    </div>
  );
};

export default JournalEntry;