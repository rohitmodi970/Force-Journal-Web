"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Check,
  RefreshCw,
  Image as ImageIcon,
  AlignLeft,
  Tag,
  Calendar,
  Smile,
  Settings,
  Save,
  Eye,
  Edit,
  Maximize,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader,
  X,
  BookOpen,
  Briefcase,
  Heart,
  Moon,
  Sun,
} from 'lucide-react';
import * as Tesseract from 'tesseract.js';

type JournalTemplate = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  content: string;
};

interface JournalEntryWithOCRProps {
  currentTheme: {
    primary: string;
  };
}

const JournalEntryWithOCR: React.FC<JournalEntryWithOCRProps> = ({ currentTheme }) => {
  // Journal entry states from your existing component
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

  // OCR related states
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Template states
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  
  // Define journal templates
  const journalTemplates: JournalTemplate[] = [
    {
      id: 'gratitude',
      name: 'Gratitude Journal',
      icon: <Heart className="h-5 w-5" />,
      description: 'Record things you are thankful for today',
      content: `# Gratitude Journal Entry

Today, I am grateful for:

1. 
2. 
3. 

These things brought me joy because:

`
    },
    {
      id: 'daily',
      name: 'Daily Reflection',
      icon: <Sun className="h-5 w-5" />,
      description: 'Reflect on your day and experiences',
      content: `# Daily Reflection

## How was my day?

## What went well today?

## What could have gone better?

## What did I learn today?

## Tomorrow, I will focus on:

`
    },
    {
      id: 'work',
      name: 'Work Journal',
      icon: <Briefcase className="h-5 w-5" />,
      description: 'Track work accomplishments and challenges',
      content: `# Work Journal

## Tasks completed today:
- 

## Challenges faced:

## Solutions and ideas:

## Follow-up needed:

## Goals for tomorrow:

`
    },
    {
      id: 'dream',
      name: 'Dream Journal',
      icon: <Moon className="h-5 w-5" />,
      description: 'Record and analyze your dreams',
      content: `# Dream Journal

## Dream description:

## Setting and characters:

## Emotions felt:

## Possible interpretations:

## Recurring symbols or themes:

`
    },
  ];

  // Mood options
  const moodOptions = [
    { emoji: '😊', name: 'Happy' },
    { emoji: '😌', name: 'Calm' },
    { emoji: '😔', name: 'Sad' },
    { emoji: '😡', name: 'Angry' },
    { emoji: '😴', name: 'Tired' },
    { emoji: '🤔', name: 'Thoughtful' },
    { emoji: '😰', name: 'Anxious' },
    { emoji: '🥳', name: 'Excited' },
  ];

  // Update word count whenever content changes
  useEffect(() => {
    if (content) {
      const wordArray = content.trim().split(/\s+/);
      setWordCount(content.trim() === '' ? 0 : wordArray.length);
    } else {
      setWordCount(0);
    }
  }, [content]);

  // Handle auto save
  useEffect(() => {
    if (title || content) {
      setIsUnsaved(true);
      
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 5000); // Auto save after 5 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, tags, journalType, selectedMood, selectedAccent]);

  const handleAutoSave = () => {
    console.log('Auto saving...');
    // Here you would implement your auto-save logic
    // For now we just update the state to simulate saving
    setLastAutoSaved(new Date());
    setPendingBackendSync(true);
    
    // Simulate sync completion after 1 second
    setTimeout(() => {
      setPendingBackendSync(false);
      setLastSaved(new Date());
      setIsUnsaved(false);
    }, 1000);
  };

  const handleManualSave = () => {
    setIsSaving(true);
    
    // Here you would implement your save logic
    // For now we just simulate the save process
    
    setTimeout(() => {
      setLastSaved(new Date());
      setIsUnsaved(false);
      setIsSaving(false);
      setSuccessMessage('Journal entry saved successfully!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 1000);
  };

  // OCR Functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const recognizeText = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        image,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round((m.progress || 0) * 100));
            }
          }
        }
      );
      
      // Extract text and update content
      const extractedText = result.data.text;
      setContent(prevContent => {
        if (prevContent.trim() === '') {
          return extractedText;
        } else {
          return prevContent + '\n\n' + extractedText;
        }
      });
      
      // Show success message
      setSuccessMessage('Text extracted successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('OCR Error:', error);
      setErrorMessage('Error processing image. Please try again.');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    } finally {
      setIsProcessing(false);
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const applyTemplate = (template: JournalTemplate) => {
    if (content && content.trim() !== '') {
      if (window.confirm('This will replace your current entry content. Continue?')) {
        setContent(template.content);
        if (!title) {
          setTitle(template.name);
        }
      }
    } else {
      setContent(template.content);
      if (!title) {
        setTitle(template.name);
      }
    }
    setShowTemplates(false);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleHeader = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden min-h-screen">
      <div className="bg-indigo-600" style={{ backgroundColor: selectedAccent }}>
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">New Journal Entry</h1>
            <p className="text-indigo-100">Express your thoughts, ideas, and feelings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setViewMode(viewMode === 'writing' ? 'preview' : 'writing')}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              title={viewMode === 'writing' ? 'Preview mode' : 'Writing mode'}
            >
              {viewMode === 'writing' ? <Eye size={18} /> : <Edit size={18} />}
            </button>
            <button 
              onClick={() => setViewMode('focus')}
              className={`p-2 rounded-full ${viewMode === 'focus' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white hover:bg-white/30'} transition`}
              title="Focus mode"
            >
              <Maximize size={18} />
            </button>
            <button 
              onClick={toggleHeader}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              title={isHeaderCollapsed ? 'Expand header' : 'Collapse header'}
            >
              {isHeaderCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>
      </div>

      {!isHeaderCollapsed && (
        <div className="border-b">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Entry Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Journal Type</label>
                <select
                  id="type"
                  value={journalType}
                  onChange={(e) => setJournalType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="dream">Dream</option>
                  <option value="travel">Travel</option>
                  <option value="food">Food</option>
                  <option value="fitness">Fitness</option>
                  <option value="creative">Creative</option>
                  <option value="study">Study</option>
                </select>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-indigo-600 hover:text-indigo-800">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag..."
                    className="flex-grow min-w-[100px] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMood(!showMood)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {selectedMood ? (
                      <span>
                        {moodOptions.find(m => m.name === selectedMood)?.emoji}{' '}
                        {selectedMood}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select your mood</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showMood && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="p-2 grid grid-cols-4 gap-1">
                        {moodOptions.map(mood => (
                          <button
                            key={mood.name}
                            onClick={() => {
                              setSelectedMood(mood.name);
                              setShowMood(false);
                            }}
                            className={`p-2 rounded-md flex flex-col items-center justify-center hover:bg-indigo-50 ${
                              selectedMood === mood.name ? 'bg-indigo-100' : ''
                            }`}
                          >
                            <span className="text-xl">{mood.emoji}</span>
                            <span className="text-xs mt-1">{mood.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-6">
                <button
                  onClick={triggerFileInput}
                  className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Extract text from image</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Use template</span>
              </button>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Not saved yet</span>
              )}
              
              {pendingBackendSync && (
                <span className="ml-2 flex items-center">
                  <Loader className="h-3 w-3 mr-1 animate-spin" />
                  Syncing...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {image && (
        <div className="p-6 bg-gray-50 border-b">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Image Preview</h3>
            <button
              onClick={() => {
                setImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
            <div className="flex justify-center mb-4">
              <img
                src={image}
                alt="Uploaded"
                className="max-h-64 rounded"
              />
            </div>
            
            <button
              onClick={recognizeText}
              disabled={isProcessing}
              className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing ({progress}%)
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Extract Text and Add to Entry
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showTemplates && (
        <div className="p-6 bg-gray-50 border-b">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Journal Templates</h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {journalTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="bg-white p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition flex flex-col items-center text-center"
              >
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-3">
                  {template.icon}
                </div>
                <h4 className="font-medium text-gray-800 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status messages */}
      {(errorMessage || successMessage) && (
        <div className={`px-6 py-2 ${errorMessage ? 'bg-red-100' : 'bg-green-100'}`}>
          <p className={`text-sm ${errorMessage ? 'text-red-600' : 'text-green-600'}`}>
            {errorMessage || successMessage}
          </p>
        </div>
      )}
      
      <div className="flex-grow p-6 relative">
        {viewMode === 'focus' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your journal entry..."
            className="w-full h-full min-h-[70vh] p-4 border-0 focus:outline-none focus:ring-0 text-lg resize-none"
            autoFocus
          />
        ) : viewMode === 'preview' ? (
          <div className="prose max-w-none">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content.split('\n').map(line => 
                line.startsWith('# ') ? `<h1>${line.substring(2)}</h1>` :
                line.startsWith('## ') ? `<h2>${line.substring(3)}</h2>` :
                line.startsWith('### ') ? `<h3>${line.substring(4)}</h3>` :
                line.startsWith('- ') ? `<ul><li>${line.substring(2)}</li></ul>` :
                line ? `<p>${line}</p>` : '<br />'
              ).join('')}} />
            ) : (
              <p className="text-gray-400">Nothing to preview yet...</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your journal entry..."
            className="w-full min-h-[70vh] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            autoFocus
          />
        )}
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">Settings</span>
          </button>
          
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className={`flex items-center px-4 py-2 rounded-md text-white font-medium ${
              isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            style={{ backgroundColor: isSaving ? undefined : selectedAccent }}
          >
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Journal
              </>
            )}
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="px-6 py-4 bg-white border-t">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Journal Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedAccent(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedAccent === color ? 'border-gray-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryWithOCR;