"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/utilities/context/ThemeContext';
import { Calendar, Clock, Image, Mic, Video, FileText, PenTool, ArrowLeft, Save, XCircle, Upload, Tag, Trash2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import ThemeSidebar from '@/components/Navbar/ThemeSidebar';
// Types for our data
interface Media {
  driveFileId: string;
  name?: string;
  fileName?: string;
  mimeType?: string;
  driveMimeType?: string;
  thumbnailUrl?: string;
  url?: string;
  createdAt?: string;
  uploadedAt?: string;
  fileSize?: number;
}

interface JournalMedia {
  image: Media[];
  audio: Media[];
  video: Media[];
  document: Media[];
}

interface Journal {
  id: string;
  journalId: string;
  title: string;
  content: string;
  date: string;
  mood: string;
  moodColor: string;
  tags: string[];
  media: JournalMedia;
  timestamp: string;
}

const JournalPage = () => {
  const params = useParams();
  const router = useRouter();
  const journalId = params.journalId as string;
  const { 
    currentTheme,
    isDarkMode, 
    elementColors 
  } = useTheme();
   const { data:  status } = useSession();
  // State variables
  const [journal, setJournal] = useState<Journal | null>(null);
  const [editedJournal, setEditedJournal] = useState<Partial<Journal>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string>('image');
  const [activeMediaTab, setActiveMediaTab] = useState<string>('all');
  // State for modal/lightbox
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format to YYYY-MM-DDThh:mm (format required by datetime-local input)
    return date.toISOString().slice(0, 16);
  };

  // Helper functions for styling
  const getButtonStyle = (variant = 'primary') => {
    if (variant === 'primary') {
      return {
        backgroundColor: elementColors.button,
        color: '#ffffff',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: currentTheme.hover,
        },
      };
    } else if (variant === 'secondary') {
      return {
        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        color: elementColors.text,
        transition: 'all 0.2s ease',
      };
    } else if (variant === 'danger') {
      return {
        backgroundColor: '#EF4444',
        color: '#ffffff',
        transition: 'all 0.2s ease',
      };
    }
  };

  const getTagStyle = () => ({
    backgroundColor: elementColors.accent,
    color: elementColors.text,
    transition: 'all 0.2s ease',
  });

  const getCardStyle = () => ({
    backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
    color: elementColors.text,
    boxShadow: isDarkMode 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
    borderRadius: '0.75rem',
    transition: 'all 0.3s ease',
  });
  
  const getInputStyle = () => ({
    backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
    color: elementColors.text,
    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    ':focus': {
      borderColor: elementColors.button,
      boxShadow: `0 0 0 3px ${elementColors.button}25`,
    }
  });

  // Predefined mood options with improved colors
  const moodOptions = [
    { label: 'Happy', value: 'Happy', color: 'yellow', hex: '#FCD34D' },
    { label: 'Sad', value: 'Sad', color: 'blue', hex: '#60A5FA' },
    { label: 'Excited', value: 'Excited', color: 'orange', hex: '#FBBF24' },
    { label: 'Peaceful', value: 'Peaceful', color: 'blue', hex: '#93C5FD' },
    { label: 'Anxious', value: 'Anxious', color: 'purple', hex: '#A78BFA' },
    { label: 'Frustrated', value: 'Frustrated', color: 'red', hex: '#F87171' },
    { label: 'Grateful', value: 'Grateful', color: 'green', hex: '#34D399' },
    { label: 'Optimistic', value: 'Optimistic', color: 'green', hex: '#6EE7B7' },
    { label: 'Stressed', value: 'Stressed', color: 'purple', hex: '#C084FC' },
    { label: 'Thoughtful', value: 'Thoughtful', color: 'purple', hex: '#A78BFA' },
    { label: 'Angry', value: 'Angry', color: 'red', hex: '#EF4444' },
    { label: 'Neutral', value: 'Neutral', color: 'gray', hex: '#9CA3AF' }
  ];

  // Fetch journal data
  useEffect(() => {
    const fetchJournalData = async () => {
      try {
        setLoading(true);
        
        // Fetch journal data
        const journalResponse = await fetch(`/api/fetch-journals/${journalId}`);
        
        if (!journalResponse.ok) {
          throw new Error('Failed to fetch journal entry');
        }
        
        const journalData = await journalResponse.json();
        
        // Set the journal state
        setJournal(journalData);
        setEditedJournal({
          title: journalData.title,
          content: journalData.content,
          date: journalData.date,
          mood: journalData.mood,
          tags: journalData.tags || [],
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching journal:', err);
        setError('Unable to load journal. Please try again later.');
        setLoading(false);
      }
    };

    if (journalId) {
      fetchJournalData();
    }
  }, [journalId]);

  // Function to start editing
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Function to cancel editing
  const handleCancelEditing = () => {
    setEditedJournal({
      title: journal?.title,
      content: journal?.content,
      date: journal?.date,
      mood: journal?.mood,
      tags: journal?.tags || [],
    });
    setIsEditing(false);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setEditedJournal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag changes
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsValue = e.target.value;
    const tagsArray = tagsValue.split(',').map(tag => tag.trim()).filter(Boolean);
    
    setEditedJournal((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };

  // Handle mood selection
  const handleMoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMood = e.target.value;
    const selectedMoodOption = moodOptions.find(option => option.value === selectedMood);
    
    setEditedJournal((prev) => ({
      ...prev,
      mood: selectedMood,
      moodColor: selectedMoodOption ? selectedMoodOption.color : 'gray',
    }));
  };

  // Handle media file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle media type selection
  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMediaType(e.target.value);
  };

  // Upload media file
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !journalId || !selectedMediaType) {
      setError('Please select a file and media type');
      return;
    }
    
    try {
      setMediaUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('journalId', journalId);
      formData.append('mediaType', selectedMediaType);
      formData.append('fileName', selectedFile.name);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const responseData = await response.json();
      console.log('Upload successful:', responseData);
      
      // Update journal with new media
      const journalResponse = await fetch(`/api/fetch-journals/${journalId}`);
      const updatedJournal = await journalResponse.json();
      setJournal(updatedJournal);
      
      // Reset upload states
      setSelectedFile(null);
      setMediaUploading(false);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(`Upload failed: ${err.message}`);
      setMediaUploading(false);
    }
  };

  // Delete media item
  const handleDeleteMedia = async (driveFileId: string, mediaType: string) => {
    if (!confirm('Are you sure you want to delete this media?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driveFileId,
          journalId,
          mediaType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
      
      // Update journal to reflect deletion
      const journalResponse = await fetch(`/api/fetch-journals/${journalId}`);
      const updatedJournal = await journalResponse.json();
      setJournal(updatedJournal);
      
    } catch (err: any) {
      console.error('Error deleting media:', err);
      setError(`Delete failed: ${err.message}`);
    }
  };

  // Save journal changes
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/journal-entry', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalId: journalId,
          ...editedJournal,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update journal');
      }
      
      const updatedJournal = await response.json();
      
      setJournal(prevJournal => ({
        ...prevJournal!,
        ...updatedJournal.entry,
      }));
      
      setIsEditing(false);
      setSaving(false);
      
    } catch (err: any) {
      console.error('Error updating journal:', err);
      setError(`Failed to save changes: ${err.message}`);
      setSaving(false);
    }
  };

  // Helper function to get mood color hex
  function getMoodColorHex(colorName: string): string {
    const foundMood = moodOptions.find(mood => mood.color === colorName);
    return foundMood ? foundMood.hex : '#9CA3AF'; // Default to gray
  }

  // Animated Loader Component
  const AnimatedLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="relative w-12 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-xl font-medium animate-pulse" style={{ color: elementColors.text }}>
        Loading journal...
      </p>
    </div>
  );

  // Error Screen Component
  const ErrorScreen = ({ message }: { message: string }) => (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="max-w-lg w-full rounded-lg overflow-hidden shadow-lg" style={getCardStyle()}>
        <div className="p-6 border-b border-red-200" style={{ backgroundColor: isDarkMode ? '#7F1D1D' : '#FEF2F2' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2" style={{ backgroundColor: isDarkMode ? '#991B1B' : '#FEE2E2' }}>
              <XCircle size={24} className="text-red-600" />
            </div>
            <h2 className="ml-3 text-xl font-bold text-red-700">Error</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="mb-6" style={{ color: isDarkMode ? '#FCA5A5' : '#B91C1C' }}>{message}</p>
          <Link 
            href="/user/journal/my-diary" 
            className="inline-flex items-center px-4 py-2 rounded-md transition-colors"
            style={getButtonStyle('primary')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Journals
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <AnimatedLoader />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!journal) {
    return <ErrorScreen message="The requested journal entry could not be found." />;
  }

  // Calculate media counts
  const imageCounts = journal.media.image.length;
  const audioCounts = journal.media.audio.length;
  const videoCounts = journal.media.video.length;
  const documentCounts = journal.media.document.length;
  const totalMediaCount = imageCounts + audioCounts + videoCounts + documentCounts;

  // Determine which media to show based on active tab
  const displayMedia = () => {
    if (activeMediaTab === 'all') return true;
    if (activeMediaTab === 'image' && imageCounts > 0) return true;
    if (activeMediaTab === 'audio' && audioCounts > 0) return true;
    if (activeMediaTab === 'video' && videoCounts > 0) return true;
    if (activeMediaTab === 'document' && documentCounts > 0) return true;
    return false;
  };

  

  // Function to open media in a modal/lightbox
  const handleOpenMedia = (url: string | undefined, mediaType: string) => {
    if (!url) return;
    
    setSelectedMediaUrl(url);
    setSelectedMediaType(mediaType);
    setIsMediaModalOpen(true);
    
    // For documents, we might want to open them in a new tab instead
    if (mediaType === 'document') {
      window.open(url, '_blank');
      return;
    }
  };

  // Function to close media modal
  const handleCloseMediaModal = () => {
    setIsMediaModalOpen(false);
    setSelectedMediaUrl(null);
  };

  // Media Modal/Lightbox component
  const MediaModal = () => {
    if (!isMediaModalOpen || !selectedMediaUrl) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        onClick={handleCloseMediaModal}
      >
        <div 
          className="relative max-w-4xl max-h-full w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedMediaType === 'image' && (
            <img 
              src={selectedMediaUrl} 
              alt="Media preview" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
          
          {selectedMediaType === 'audio' && (
            <audio 
              src={selectedMediaUrl} 
              controls 
              autoPlay 
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          )}
          
          {selectedMediaType === 'video' && (
            <video 
              src={selectedMediaUrl} 
              controls 
              autoPlay 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            >
              Your browser does not support video playback.
            </video>
          )}
          
          <button 
            onClick={handleCloseMediaModal}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          >
            <XCircle size={24} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl" style={{ color: elementColors.text }}>
      <ThemeSidebar />
      {/* Navigation and Controls */}
      <div className="mb-6 sticky top-0 z-10 bg-opacity-95 p-4 shadow-md rounded-lg backdrop-blur-sm" 
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link 
              href="/user/journal/my-diary" 
              className="inline-flex items-center mr-4 hover:underline transition-all" 
              style={{ color: elementColors.button }}
            >
              <ArrowLeft size={18} className="mr-1" />
              <span className="font-medium">Back to Journals</span>
            </Link>
            
            {!isEditing && journal.mood && (
              <div className="flex items-center bg-opacity-20 px-3 py-1 rounded-full" 
                style={{ backgroundColor: `${getMoodColorHex(journal.moodColor)}40` }}>
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getMoodColorHex(journal.moodColor) }}
                ></div>
                <span className="text-sm font-medium">{journal.mood}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={handleStartEditing} 
                className="inline-flex items-center px-4 py-2 rounded-md transition-colors"
                style={getButtonStyle('primary')}
              >
                <PenTool size={16} className="mr-2" />
                Edit Journal
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCancelEditing} 
                  className="inline-flex items-center px-4 py-2 rounded-md transition-colors"
                  style={getButtonStyle('secondary')}
                  disabled={saving}
                >
                  <XCircle size={16} className="mr-2" />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveChanges} 
                  className="inline-flex items-center px-4 py-2 rounded-md transition-colors"
                  style={getButtonStyle('primary')}
                  disabled={saving}
                >
                  <Save size={16} className="mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Journal Header Section */}
      <div className="mb-8">
        <div className="rounded-lg shadow-md overflow-hidden" style={getCardStyle()}>
          {isEditing ? (
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b" style={{ borderColor: isDarkMode ? '#374151' : '#E5E7EB' }}>
                Edit Journal Entry
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={editedJournal.title || ''}
                      onChange={handleInputChange}
                      className="block w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50"
                      style={getInputStyle()}
                      placeholder="Journal Title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">Date & Time</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={formatDateForInput(editedJournal.date || '')}
                        onChange={handleInputChange}
                        className="block w-full p-3 pl-10 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50"
                        style={getInputStyle()}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mood" className="block text-sm font-medium mb-1">Mood</label>
                    <div className="relative">
                      <select
                        id="mood"
                        name="mood"
                        value={editedJournal.mood || ''}
                        onChange={handleMoodChange}
                        className="block w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50 appearance-none"
                        style={getInputStyle()}
                      >
                        <option value="">Select Mood</option>
                        {moodOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Mood preview */}
                    {editedJournal.mood && (
                      <div className="mt-2 flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: getMoodColorHex(
                              moodOptions.find(m => m.value === editedJournal.mood)?.color || 'gray'
                            ) 
                          }}
                        ></div>
                        <span className="text-sm">{editedJournal.mood}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
                    <div className="relative">
                      <Tag size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={editedJournal.tags?.join(', ') || ''}
                        onChange={handleTagsChange}
                        className="block w-full p-3 pl-10 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50"
                        style={getInputStyle()}
                        placeholder="personal, thoughts, reflection (comma separated)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <label htmlFor="content" className="block text-sm font-medium mb-1">Journal Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={editedJournal.content || ''}
                  onChange={handleInputChange}
                  rows={12}
                  className="block w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50"
                  style={getInputStyle()}
                  placeholder="Write your thoughts here..."
                />
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{journal.title}</h1>
              
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 text-sm">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span>{new Date(journal.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}</span>
                </div>
                
                <div className="hidden md:block text-gray-400">•</div>
                
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>{new Date(journal.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              
              {journal.tags && journal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {journal.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={getTagStyle()}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose max-w-none" style={{ color: elementColors.text }}>
                {journal.content.split('\n').map((paragraph, idx) => (
                  paragraph ? <p key={idx} className="mb-4">{paragraph}</p> : <br key={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Upload Section */}
      {isEditing && (
        <div className="mb-8 rounded-lg shadow-md overflow-hidden" style={getCardStyle()}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Upload size={20} className="mr-2" />
              Upload Media
            </h2>
            
            <form onSubmit={handleMediaUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="mediaType" 
                    className="block text-sm font-medium mb-1"
                  >
                    Media Type
                  </label>
                  <div className="relative">
                    <select
                      id="mediaType"
                      value={selectedMediaType}
                      onChange={handleMediaTypeChange}
                      className="block w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50 appearance-none"
                      style={getInputStyle()}
                    >
                      <option value="image">Image</option>
                      <option value="audio">Audio Recording</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label 
                    htmlFor="file-upload" 
                    className="block text-sm font-medium mb-1"
                  >
                    Select File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className={`block w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50 
                        text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary/10 file:text-primary
                        hover:file:bg-primary/20`}
                      accept="image/*,audio/*,video/*,application/pdf"
                      style={getInputStyle()}
                    />  
                    {selectedFile && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button 
                  type="submit" 
                  className="inline-flex items-center px-4 py-2 rounded-md transition-colors"
                  style={getButtonStyle('primary')}
                  disabled={mediaUploading}
                >
                  {mediaUploading ? (
                    <>
                      <span className="loader mr-2"></span>
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload Media
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Media Display Section */} 
      <div className="mb-8 rounded-lg shadow-md overflow-hidden" style={getCardStyle()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Image size={20} className="mr-2" />
            Media Gallery
          </h2>
          
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setActiveMediaTab('all')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeMediaTab === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All ({totalMediaCount})
            </button>
            <button 
              onClick={() => setActiveMediaTab('image')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeMediaTab === 'image' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Images ({imageCounts})
            </button>
            <button 
              onClick={() => setActiveMediaTab('audio')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeMediaTab === 'audio' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Audio ({audioCounts})
            </button>
            <button 
              onClick={() => setActiveMediaTab('video')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeMediaTab === 'video' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Videos ({videoCounts})
            </button>
            <button 
              onClick={() => setActiveMediaTab('document')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeMediaTab === 'document' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Documents ({documentCounts})
            </button>
          </div>

          {totalMediaCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {journal.media.image.map((media, index) => (
                displayMedia() && activeMediaTab === 'image' && (
                    <div 
                    key={index} 
                    className="relative rounded-lg overflow-hidden aspect-square group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleOpenMedia(media.url, 'image')}
                    >
                    <img 
                      src={media.thumbnailUrl || media.url}
                      alt={media.name || media.fileName || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button 
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(media.driveFileId, 'image');
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    </div>
                )
              ))}
              {journal.media.audio.map((media, index) => (
                displayMedia() && activeMediaTab === 'audio' && (
                  <div 
                    key={index} 
                    className="relative rounded-lg overflow-hidden aspect-square group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleOpenMedia(media.url, 'audio')}
                  >
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <Trash2 size={16} />
                    </div>
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                      <iframe 
                      src={media.url} 
                      className="w-full h-full border-0"
                      title={`Audio ${index + 1}`}
                      loading="lazy"
                      allow="autoplay"
                      ></iframe>
                      <Mic className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 w-12 h-12" />
                    </div>
                  </div>
                )
              ))} 
              {journal.media.video.map((media, index) => (
                displayMedia() && activeMediaTab === 'video' && (
                  <div 
                    key={index} 
                    className="relative rounded-lg overflow-hidden aspect-square group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleOpenMedia(media.url, 'video')}
                  >
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <Trash2 size={16} />
                    </div>
                    <video controls className="w-full h-full">
                      <source src={media.url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  </div>
                )
              ))} 
              {journal.media.document.map((media, index) => (
                displayMedia() && activeMediaTab === 'document' && (
                  <div 
                    key={index} 
                    className="relative rounded-lg overflow-hidden aspect-square group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleOpenMedia(media.url, 'document')}
                  >
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <Trash2 size={16} />
                    </div>
                    <iframe 
                      src={media.url ? media.url.replace('/view', '/preview') : '#'}
                      className="w-full h-full border-0"
                      title={`Document ${index + 1}`}
                      loading="lazy"
                      allow="autoplay"
                    />
                  </div>
                )
              ))}
            </div>
          ) : ( 
            <div className="text-center py-8">
              <p className="text-gray-500">No media files available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default JournalPage;