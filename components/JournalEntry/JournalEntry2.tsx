"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark,
  PenLine,
  Sparkles,
  FileText,
  Save,
  Clock,
  Keyboard,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/utilities/context/ThemeContext';
import JournalHeader from './JournalHeader';
import SettingsPanel from './SettingsPanel';
import TagsInput from './TagsInput';
import FileAttachments from './FileAttachments';
import { FileData, JournalType, ViewMode, Mood } from './types';

const JournalEntry2: React.FC = () => {
  const { currentTheme, isDarkMode, colorOptions, setCurrentTheme } = useTheme();
  const currentDate = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<string>(currentDate);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [files, setFiles] = useState<FileData>({
    image: null,
    audio: null,
    other: null
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
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Journal types
  const journalTypes: JournalType[] = [
    {
      id: 'personal',
      name: 'Personal',
      icon: '📔',
      description: 'Record your thoughts and daily experiences'
    },
    {
      id: 'gratitude',
      name: 'Gratitude',
      icon: '🙏',
      description: "Focus on what you're thankful for"
    },
    {
      id: 'goals',
      name: 'Goals',
      icon: '🎯',
      description: 'Track your progress toward objectives'
    },
    {
      id: 'creative',
      name: 'Creative',
      icon: '🎨',
      description: 'Explore ideas and creative writing'
    }
  ];

  // View modes
  const viewModes: ViewMode[] = [
    {
      id: 'writing',
      name: 'Writing Mode',
      description: 'Standard editor with all tools'
    },
    {
      id: 'focus',
      name: 'Focus Mode',
      description: 'Distraction-free writing environment'
    },
    {
      id: 'preview',
      name: 'Preview Mode',
      description: 'See how your entry looks formatted'
    }
  ];

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

  // Keyboard shortcuts
  const keyboardShortcuts = [
    { key: 'Ctrl + S', action: 'Save entry' },
    { key: 'Ctrl + D', action: 'Toggle dark mode' },
    { key: 'Ctrl + F', action: 'Toggle focus mode' },
    { key: 'Ctrl + P', action: 'Toggle preview mode' },
    { key: 'Ctrl + K', action: 'Show keyboard shortcuts' },
    { key: 'Esc', action: 'Exit current dialog/panel' }
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
    shadowLight: isDarkMode ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
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

  // Calculate word count whenever content changes
  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
    
    // Set unsaved state
    if (content || title) {
      setIsUnsaved(true);
    }
  }, [content, title]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save - Ctrl+S
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (content.trim()) saveEntry();
      }
      
      // Toggle dark mode - Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        // This would need to be implemented in your ThemeContext
        // toggleDarkMode();
      }
      
      // Focus mode - Ctrl+F
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setViewMode('focus');
      }
      
      // Preview mode - Ctrl+P
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setViewMode('preview');
      }
      
      // Show keyboard shortcuts - Ctrl+K
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      
      // Escape key to close modals
      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        if (showSettings) setShowSettings(false);
        if (showMood) setShowMood(false);
        if (showColorPalette) setShowColorPalette(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showShortcuts, showSettings, showMood, showColorPalette, content]);

  // Handle file uploads
  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev: FileData) => ({
        ...prev,
        [type]: e.target.files?.[0] || null
      }));
      setIsUnsaved(true);
    }
  };

  // Save journal entry
  const saveEntry = () => {
    if (!content.trim()) return;
    
    // Here you would implement actual saving logic to a backend or local storage
    setLastSaved(new Date());
    setIsUnsaved(false);
    
    // Show save success animation
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    // Example of saving to localStorage (just for demonstration)
    const entry = {
      id: Date.now().toString(),
      title,
      content,
      date,
      tags,
      mood: selectedMood,
      journalType,
      timestamp: new Date().toISOString()
    };
    
    // For demo purposes only
    localStorage.setItem(`journal_entry_${entry.id}`, JSON.stringify(entry));
    
    // Show confirmation (could be replaced with a toast notification)
    console.log('Entry saved', entry);
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

  const saveButtonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    success: { 
      backgroundColor: "#22C55E",
      transition: { duration: 0.3 }
    }
  };

  // Empty state content
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div 
        className="mb-4 p-3 rounded-full" 
        style={{ backgroundColor: styles.primaryLight }}
      >
        <PenLine size={24} style={{ color: styles.primaryColor }} />
      </div>
      <h3 
        className="text-xl font-medium mb-2"
        style={{ color: styles.textPrimary }}
      >
        Start Your Journal Entry
      </h3>
      <p 
        className="mb-4 max-w-md"
        style={{ color: styles.textSecondary }}
      >
        Begin typing your thoughts, reflections, or ideas. Your words matter.
      </p>
      <div 
        className="text-sm p-2 rounded-lg"
        style={{ backgroundColor: styles.bgInput, color: styles.textSecondary }}
      >
        <Keyboard size={14} className="inline mr-1" />
        <span>Pro tip: Press Ctrl+K to see keyboard shortcuts</span>
      </div>
    </div>
  );

  return (
    <div 
      className="flex flex-col h-screen transition-all duration-300"
      style={{ backgroundColor: styles.bgPage }}
    >
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
        setShowShortcuts={setShowShortcuts}
      />
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
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
        )}
      </AnimatePresence>
      
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
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="relative rounded-lg overflow-hidden p-8"
              style={{ 
                backgroundColor: styles.bgCard,
                boxShadow: styles.shadowLight
              }}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
            >
              {/* Minimal header for focus mode */}
              <div className="mb-6 border-b pb-4" style={{ borderColor: styles.borderColor }}>
                <h2 
                  className="text-xl font-medium mb-2"
                  style={{ color: styles.primaryColor }}
                >
                  Focus Mode
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: styles.textSecondary }}
                >
                  Distraction-free writing environment. Press Esc to exit.
                </p>
              </div>
              
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed transition-all duration-300"
                style={{ 
                  color: styles.textPrimary,
                  height: 'calc(100vh - 320px)',
                  fontFamily: '"Noto Serif", serif'
                }}
                placeholder="Start writing your thoughts..."
                autoFocus
              />
              
              {/* Bottom toolbar for focus mode */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-opacity-80 backdrop-blur-sm py-2 px-4"
                style={{ 
                  backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderTop: `1px solid ${styles.borderColor}`
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span style={{ color: styles.textSecondary }}>
                      {wordCount} words
                    </span>
                    {isUnsaved && (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: '#F59E0B' }}
                      >
                        <AlertCircle size={14} />
                        <span>Unsaved changes</span>
                      </span>
                    )}
                  </div>
                  
                  <motion.button
                    onClick={saveEntry}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium"
                    variants={saveButtonVariants}
                    initial="idle"
                    animate={saveSuccess ? "success" : "idle"}
                    whileHover="hover"
                    whileTap="tap"
                    style={{ 
                      backgroundColor: styles.primaryColor,
                      color: '#FFFFFF'
                    }}
                    disabled={!content.trim()}
                  >
                    {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                    <span>{saveSuccess ? 'Saved' : 'Save'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Standard Writing or Preview Mode */
          <div className="max-w-4xl mx-auto w-full">
            <motion.div
              className="mb-6 p-6 rounded-lg"
              style={{ 
                backgroundColor: styles.bgCard,
                boxShadow: styles.shadowLight
              }}
              variants={itemVariants}
            >
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry Title"
                className="w-full bg-transparent border-none outline-none text-3xl font-bold mb-3 transition-all duration-300 focus:ring-2 focus:ring-offset-2 rounded"
                style={{ 
                  color: styles.textPrimary,
                  focusRing: styles.primaryColor
                }}
              />
              
              {/* Date and mood display */}
              <div 
                className="flex items-center text-sm mb-4 p-2 rounded-md"
                style={{ 
                  color: styles.textSecondary,
                  backgroundColor: styles.bgInput
                }}
              >
                <Clock size={16} className="mr-1" />
                <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {selectedMood && (
                  <span className="ml-3 flex items-center">
                    <span className="mr-1">{moods.find(m => m.id === selectedMood)?.emoji}</span>
                    <span>{moods.find(m => m.id === selectedMood)?.label}</span>
                  </span>
                )}
              </div>
            </motion.div>
            
            {viewMode === 'writing' && (
              <motion.div 
                className="mb-6 p-6 rounded-lg"
                style={{ 
                  backgroundColor: styles.bgCard,
                  boxShadow: styles.shadowLight
                }}
                variants={itemVariants}
              >
                <div className="flex items-start gap-4 mb-4 pb-4 border-b" style={{ borderColor: styles.borderColor }}>
                  <div 
                    className="p-3 rounded-full bg-opacity-10 flex-shrink-0"
                    style={{ backgroundColor: styles.primaryLight }}
                  >
                    {journalType === 'personal' && <PenLine size={20} style={{ color: styles.primaryColor }} />}
                    {journalType === 'gratitude' && <Sparkles size={20} style={{ color: styles.primaryColor }} />}
                    {journalType === 'goals' && <Bookmark size={20} style={{ color: styles.primaryColor }} />}
                    {journalType === 'creative' && <FileText size={20} style={{ color: styles.primaryColor }} />}
                  </div>
                  <div>
                    <div 
                      className="text-md font-medium mb-1"
                      style={{ color: styles.textPrimary }}
                    >
                      {journalTypes.find(t => t.id === journalType)?.name} Journal
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: styles.textSecondary }}
                    >
                      {journalTypes.find(t => t.id === journalType)?.description}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
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
                  />
                </div>
              </motion.div>
            )}
            
            {/* Main Content Card */}
            <motion.div 
              className="p-6 rounded-lg mb-6"
              style={{ 
                backgroundColor: styles.bgCard,
                boxShadow: styles.shadowLight,
                minHeight: viewMode === 'writing' ? '400px' : 'auto'
              }}
              variants={itemVariants}
              whileHover={{ boxShadow: styles.shadowHover }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'preview' ? (
                /* Preview Mode Content Display */
                content ? (
                  <div 
                    className="prose prose-lg max-w-none transition-all duration-300"
                    style={{ 
                      color: styles.textPrimary,
                      fontFamily: '"Noto Serif", serif'
                    }}
                  >
                    {content.split('\n').map((paragraph, index) => (
                      paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                    ))}
                  </div>
                ) : <EmptyState />
              ) : (
                /* Writing Mode Editor */
                <>
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none mb-4 text-lg leading-relaxed transition-all duration-300 focus:ring-2 focus:ring-offset-2 rounded"
                    style={{ 
                      color: styles.textPrimary,
                      minHeight: '300px',
                      fontFamily: '"Noto Serif", serif',
                      focusRing: styles.primaryColor
                    }}
                    placeholder="Start writing your thoughts..."
                  />
                  
                  {!content && viewMode === 'writing' && <EmptyState />}
                </>
              )}
            </motion.div>
            
            {/* Bottom Status Bar */}
            <motion.div 
              className="flex justify-between items-center p-4 rounded-lg"
              style={{ 
                backgroundColor: styles.bgCard,
                boxShadow: styles.shadowLight
              }}
              variants={itemVariants}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm" style={{ color: styles.textSecondary }}>
                  <span className="mr-1">{wordCount}</span>
                  <span>words</span>
                </div>
                
                {lastSaved && (
                  <div className="flex items-center text-sm" style={{ color: styles.textSecondary }}>
                    <span className="mr-1">Last saved:</span>
                    <span>{getFormattedTime(lastSaved)}</span>
                  </div>
                )}
                
                {isUnsaved && (
                  <div
                    className="flex items-center gap-1 text-sm"
                    style={{ color: '#F59E0B' }}
                  >
                    <AlertCircle size={14} />
                    <span>Unsaved changes</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowShortcuts(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-md text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    backgroundColor: styles.bgInput,
                    color: styles.textSecondary
                  }}
                >
                  <Keyboard size={14} />
                  <span>Shortcuts</span>
                </motion.button>
                
                <motion.button
                  onClick={saveEntry}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                  variants={saveButtonVariants}
                  initial="idle"
                  animate={saveSuccess ? "success" : "idle"}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ 
                    backgroundColor: styles.primaryColor,
                    color: '#FFFFFF'
                  }}
                  disabled={!content.trim()}
                >
                  {saveSuccess ? <Check size={18} /> : <Save size={18} />}
                  <span>{saveSuccess ? 'Saved' : 'Save Entry'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
      
      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              className="rounded-lg max-w-md w-full p-6"
              style={{ backgroundColor: styles.bgCard }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: styles.textPrimary }}
              >
                Keyboard Shortcuts
              </h3>
              
              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 rounded"
                    style={{ backgroundColor: styles.bgInput }}
                  >
                    <span style={{ color: styles.textPrimary }}>{shortcut.action}</span>
                    <kbd 
                      className="px-2 py-1 rounded font-mono text-sm"
                      style={{ 
                        backgroundColor: styles.primaryLight,
                        color: styles.primaryColor,
                        boxShadow: '0 1px 1px rgba(0,0,0,0.2)'
                      }}
                    >
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={() => setShowShortcuts(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    backgroundColor: styles.primaryColor,
                    color: '#FFFFFF'
                  }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Saving indicator */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <Check size={18} />
            <span>Entry saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEntry2;