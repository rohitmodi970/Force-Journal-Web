"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, PenLine, Sparkles, FileText, Save, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/utilities/context/ThemeContext';
import JournalHeader from './JournalHeader';
import SettingsPanel from './SettingsPanel';
import TagsInput from './TagsInput';
import FileAttachments from './FileAttachments';
import { FileData, JournalType, ViewMode, Mood } from './types';

const JournalEntry: React.FC = () => {
  const { currentTheme, isDarkMode, colorOptions, setCurrentTheme } = useTheme();
  const currentDate = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<string>(currentDate);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [files, setFiles] = useState<FileData>({
    image: [],
    audio: [],
    video: [],
    other: []
  });

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

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Journal types
  const journalTypes: JournalType[] = [
    { id: 'personal', name: 'Personal', icon: '📔', description: 'Record your thoughts and daily experiences' },
    { id: 'gratitude', name: 'Gratitude', icon: '🙏', description: "Focus on what you're thankful for" },
    { id: 'goals', name: 'Goals', icon: '🎯', description: 'Track your progress toward objectives' },
    { id: 'creative', name: 'Creative', icon: '🎨', description: 'Explore ideas and creative writing' }
  ];

  // View modes
  const viewModes: ViewMode[] = [
    { id: 'writing', name: 'Writing Mode', description: 'Standard editor with all tools' },
    { id: 'focus', name: 'Focus Mode', description: 'Distraction-free writing environment' },
    { id: 'preview', name: 'Preview Mode', description: 'See how your entry looks formatted' }
  ];

  const [savedEntries, setSavedEntries] = useState<any[]>([]);

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
          const data = await response.json();
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
  const moods: Mood[] = [
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
  const accentColors: string[] = [
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

  // Auto-save to localStorage
  const autoSaveToLocalStorage = () => {
    // Skip if there's nothing meaningful to save
    if (!title.trim() || !content.trim()) {
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
      pendingSync: true
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
    }, 120000); // 2 minutes
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

      // Remove the pendingSync flag before sending to backend
      const { pendingSync, ...entryToSync } = localEntry;

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
          body: JSON.stringify(entryToSync),
        });

        if (!response.ok) {
          throw new Error('Failed to create journal entry in backend');
        }

        const result = await response.json();
        const newJournalId = result.entry.journalId;

        // Update the local storage with the new ID from backend
        localStorage.removeItem(`journal_entry_${journalId}`);

        const updatedEntry = {
          ...entryToSync,
          journalId: newJournalId,
          pendingSync: false
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
      } else {
        // Update an existing entry
        const response = await fetch('/api/journal-entry', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSync),
        });

        if (!response.ok) {
          throw new Error('Failed to update journal entry in backend');
        }

        // Update the entry in localStorage to mark it as synced
        const updatedEntry = {
          ...entryToSync,
          pendingSync: false
        };

        localStorage.setItem(`journal_entry_${journalId}`, JSON.stringify(updatedEntry));

        // Update saved entries list
        const updatedEntries = savedEntries.map(e =>
          e.journalId === journalId ? { ...updatedEntry } : e
        );
        setSavedEntries(updatedEntries);

        showMessage('Changes synced to server', false);
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

  // Handle file uploads
  const handleFileChange = (type: keyof FileData, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev: FileData) => ({
        ...prev,
        [type]: [...(prev[type] || []), ...newFiles]
      }));
    }
  };

  // Add this function to handle removing files
  const removeFile = (type: keyof FileData, index: number) => {
    setFiles((prev: FileData) => ({
      ...prev,
      [type]: prev[type] ? prev[type].filter((_: File, i: number) => i !== index) : []
    }));
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

      // Basic validation
      if (!title.trim()) {
        showMessage("Please enter a title for your journal entry", true);
        setIsSaving(false);
        return;
      }

      if (!content.trim()) {
        showMessage("Please enter some content for your journal entry", true);
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
        title,
        content,
        date,
        tags,
        mood: selectedMood,
        journalType,
        timestamp: new Date().toISOString(),
        pendingSync: false  // We're going to sync immediately
      };

      localStorage.setItem(`journal_entry_${entryId}`, JSON.stringify(entry));

      // Then immediately sync to backend
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
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      showMessage(`Error: ${error.message || 'Failed to save journal entry'}`, true);
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

  // Load a journal entry
  const loadJournalEntry = async (journalId: string) => {
    try {
      // First check if there are unsaved changes
      if (isUnsaved && (title || content)) {
        const confirmLoad = window.confirm('You have unsaved changes. Do you want to continue without saving?');
        if (!confirmLoad) return;
      }

      // Clear any pending auto-save and sync timers
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      if (backendSyncTimerRef.current) {
        clearTimeout(backendSyncTimerRef.current);
      }

      // First try to load from localStorage for the most up-to-date version
      const localEntryStr = localStorage.getItem(`journal_entry_${journalId}`);
      if (localEntryStr) {
        try {
          const entry = JSON.parse(localEntryStr);
          setTitle(entry.title);
          setContent(entry.content);
          setDate(entry.date);
          setTags(entry.tags || []);
          setSelectedMood(entry.mood);
          setJournalType(entry.journalType);
          setCurrentJournalId(entry.journalId);
          setPendingBackendSync(entry.pendingSync || false);

          setIsUnsaved(false);
          showMessage('Journal entry loaded from local storage');
          return;
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          // Fall through to try loading from API
        }
      }

      // If not found in localStorage or error occurred, try the API
      const response = await fetch(`/api/journal-entry?journalId=${journalId}`);

      if (!response.ok) {
        throw new Error('Failed to load journal entry');
      }

      const entry = await response.json();

      // Populate the form with the loaded entry
      setTitle(entry.title);
      setContent(entry.content);
      setDate(entry.date);
      setTags(entry.tags || []);
      setSelectedMood(entry.mood);
      setJournalType(entry.journalType);
      setCurrentJournalId(entry.journalId);
      setPendingBackendSync(false);

      // Also save to localStorage
      localStorage.setItem(`journal_entry_${entry.journalId}`, JSON.stringify({
        ...entry,
        pendingSync: false
      }));

      setIsUnsaved(false);
      showMessage('Journal entry loaded successfully');
    } catch (error) {
      console.error('Error loading journal entry:', error);
      showMessage('Failed to load journal entry', true);
    }
  };

  // Delete a journal entry
  const deleteJournalEntry = async (journalId: string) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this journal entry?');
      if (!confirmDelete) return;

      // Clear any pending timers related to this entry
      if (currentJournalId === journalId) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        if (backendSyncTimerRef.current) {
          clearTimeout(backendSyncTimerRef.current);
        }
      }

      // Remove from localStorage first
      localStorage.removeItem(`journal_entry_${journalId}`);

      // Only try to delete from backend if it's not a temporary ID
      if (!journalId.startsWith('temp_')) {
        const response = await fetch(`/api/journal-entry?journalId=${journalId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete journal entry from backend');
        }
      }

      // Update the savedEntries state
      setSavedEntries(savedEntries.filter(entry => entry.journalId !== journalId));

      // Clear the form if we were editing this entry
      if (currentJournalId === journalId) {
        setTitle('');
        setContent('');
        setDate(currentDate);
        setTags([]);
        setSelectedMood(null);
        setJournalType('personal');
        setCurrentJournalId(null);
        setPendingBackendSync(false);
      }

      showMessage('Journal entry deleted successfully');
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      showMessage('Failed to delete journal entry from server, but removed locally', true);
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

  return (
    <div
      className="flex flex-col h-screen transition-all duration-300"
      style={{ backgroundColor: styles.bgPage }}
    >
      {/* Success Message Toast */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 flex items-center"
          style={{ maxWidth: "calc(100% - 2rem)" }}
        >
          <div className="mr-2">✓</div>
          <p>{successMessage}</p>
        </motion.div>
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
      {/* Journal Header */}
      <JournalHeader title={title} date={date} setDate={setDate} viewMode={viewMode} setViewMode={setViewMode} isHeaderCollapsed={isHeaderCollapsed} setIsHeaderCollapsed={setIsHeaderCollapsed} showSettings={showSettings} setShowSettings={setShowSettings} showMood={showMood} setShowMood={setShowMood} selectedMood={selectedMood} setSelectedMood={setSelectedMood} moods={moods} journalType={journalType} journalTypes={journalTypes} showColorPalette={showColorPalette} setShowColorPalette={setShowColorPalette} accentColors={accentColors} selectedAccent={selectedAccent} changeAccentColor={changeAccentColor} revealAnimation={revealAnimation} wordCount={wordCount} lastSaved={lastSaved} isUnsaved={isUnsaved} viewModes={viewModes} styles={styles} getFormattedTime={getFormattedTime}
      />

      {/* Settings Panel */}
      <SettingsPanel showSettings={showSettings} viewMode={viewMode} journalType={journalType} setJournalType={setJournalType} setViewMode={setViewMode} journalTypes={journalTypes} viewModes={viewModes} styles={styles} isDarkMode={isDarkMode}
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

                <FileAttachments
                  files={files}
                  handleFileChange={handleFileChange}
                  styles={styles}
                  removeFile={removeFile}
                />
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
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JournalEntry;