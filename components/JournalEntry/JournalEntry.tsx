"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark,
  PenLine,
  Sparkles,
  FileText,
  Save,
  Clock
} from 'lucide-react';
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

const [savedEntries, setSavedEntries] = useState<any[]>([]);

useEffect(() => {
    // Load saved entries from localStorage on component mount
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
}, []);
  //previous journalEntries


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

  // Calculate word count whenever content changes
  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
    
    // Set unsaved state
    setIsUnsaved(true);
  }, [content, title]);

  // Handle file uploads
  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev: FileData) => ({
        ...prev,
        [type]: e.target.files?.[0] || null
      }));
    }
  };

  // Save journal entry
  const saveEntry = () => {
    // Here you would implement actual saving logic to a backend or local storage
    setLastSaved(new Date());
    setIsUnsaved(false);

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


  
 // Then use these variables in your functions
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
            //   className="shadow-sm border border-gray-200 rounded-lg p-2"
            />
            
            <FileAttachments
              files={files}
              handleFileChange={handleFileChange}
              styles={styles}
            //   className="shadow-sm border border-gray-200 rounded-lg p-2"
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
            <div className="flex items-center text-sm" style={{ color: styles.textSecondary }}>
              <span>{wordCount} words</span>
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
              disabled={!content.trim()}
            >
              <Save size={18} />
              <span>Save Entry</span>
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
