import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useTheme } from "@/utilities/context/ThemeContext";
import Link from "next/link";
import { JournalEntry } from "../types";
import Toast from "@/components/ui/toast";

interface JournalEditorProps {
  selectedDate: Date;
  entries: JournalEntry[];
  onSave?: (newEntry: boolean) => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  selectedDate,
  entries,
  onSave
}) => {
  // Theme context
  const { currentTheme, isDarkMode, elementColors } = useTheme();

  // Form state
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [journalType, setJournalType] = useState<string>("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("info");
  
  // Current entry management
  const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);
  const [entriesForDate, setEntriesForDate] = useState<JournalEntry[]>([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);

  // Show toast notification
  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Format date to YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Get entries for the selected date
  useEffect(() => {
    const dateString = formatDateString(selectedDate);
    const filteredEntries = entries.filter(entry => entry.date === dateString)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setEntriesForDate(filteredEntries);
    
    // Select the most recent entry, or reset form if no entries
    if (filteredEntries.length > 0) {
      setSelectedEntryIndex(0);
      loadEntry(filteredEntries[0]);
    } else {
      resetForm();
    }
  }, [selectedDate, entries]);
  
  // Load an entry into the form
  const loadEntry = (entry: JournalEntry): void => {
    setTitle(entry.title || "");
    setContent(entry.content || "");
    setJournalType(entry.journalType || "personal");
    setTags(entry.tags || []);
    setCurrentJournalId(entry.journalId);
  };
  
  // Reset the form for a new entry
  const resetForm = (): void => {
    setTitle("");
    setContent("");
    setJournalType("personal");
    setTags([]);
    setCurrentJournalId(null);
  };
  
  // Handle selecting a different entry for the same day
  const handleEntrySelect = (index: number): void => {
    if (index >= 0 && index < entriesForDate.length) {
      setSelectedEntryIndex(index);
      loadEntry(entriesForDate[index]);
    }
  };
  
  // Handle creating a new entry
  const handleNewEntry = (): void => {
    resetForm();
    setSelectedEntryIndex(-1); // -1 indicates creating a new entry
    showToast("Started new journal entry", "info");
  };
  
  // Tag management
  const handleAddTag = (): void => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      showToast(`Tag "${tagInput.trim()}" added`, "success");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string): void => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    showToast(`Tag "${tagToRemove}" removed`, "info");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && tagInput.trim() !== "") {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Save journal entry
  const handleSave = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const timestamp = new Date().toISOString();
      
      const entryData = {
        title,
        content,
        journalType,
        tags,
        date: formatDateString(selectedDate),
        timestamp
      };
      
      // Update existing entry
      if (currentJournalId) {
        const response = await fetch('/api/journal-entry', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journalId: currentJournalId,
            ...entryData
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update journal entry');
        }
        
        showToast('Journal entry updated', 'success');
      } 
      // Create new entry
      else {
        const response = await fetch('/api/journal-entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create journal entry');
        }
        
        const data = await response.json();
        setCurrentJournalId(data.entry.journalId);
        showToast('Journal entry created', 'success');
      }
      
      // Callback to parent component to refresh entries
      if (onSave) onSave(currentJournalId === null);
      
    } catch (error) {
      console.error('Error saving journal:', error);
      showToast('Failed to save journal entry', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format time for display
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Dynamic styles based on theme
  const containerStyle = {
    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
    borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
    color: elementColors.text
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? '#4A5568' : '#FFFFFF',
    borderColor: isDarkMode ? '#718096' : '#E2E8F0',
    color: elementColors.text
  };

  const buttonStyle = {
    backgroundColor: elementColors.button,
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    hoverBackgroundColor: currentTheme.hover
  };
  
  return (
    <div 
      className="rounded-xl shadow-sm border p-6 transition-colors"
      style={containerStyle}
    >
      {/* Toast notification */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
        duration={3000}
      />
      
      {/* Entry selector for multiple entries on the same day */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="flex overflow-x-auto scrollbar-thin pb-2 mr-2">
            {entriesForDate.map((entry, index) => (
              <button
                key={entry.journalId}
                onClick={() => handleEntrySelect(index)}
                className={`px-3 py-1.5 mr-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                  selectedEntryIndex === index
                    ? 'font-medium'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: selectedEntryIndex === index 
                    ? currentTheme.light 
                    : isDarkMode ? '#4A5568' : '#F1F5F9',
                  color: selectedEntryIndex === index 
                    ? currentTheme.primary 
                    : elementColors.text
                }}
              >
                {formatTime(entry.timestamp)}
                {entry.title && ` - ${entry.title.substring(0, 15)}${entry.title.length > 15 ? '...' : ''}`}
              </button>
            ))}
          </div>
          <button
            onClick={handleNewEntry}
            className="px-3 py-1.5 rounded-md text-sm whitespace-nowrap hover:opacity-90 transition-colors"
            style={{
              backgroundColor: currentTheme.light,
              color: currentTheme.primary
            }}
          >
            + New Entry
          </button>
        </div>
        
        <Link 
          href="/user/journal-entry"
          className="text-sm flex items-center hover:underline transition-colors"
          style={{ color: currentTheme.primary }}
        >
          Advanced Journal Writing →
        </Link>
      </div>
      
      {/* Rest of your component... */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 text-xl font-medium border-b focus:outline-none transition-colors"
          style={{
            borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
            color: elementColors.text,
            backgroundColor: 'transparent'
          }}
        />
      </div>
      
      <div className="mb-6">
        <textarea
          placeholder="What's on your mind today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors"
          style={{
            ...inputStyle,
            borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
            //@ts-ignore
            focusRing: currentTheme.primary
          }}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: elementColors.text }}
          >
            Journal Type
          </label>
          <select
            value={journalType}
            onChange={(e) => setJournalType(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors"
            style={{
              ...inputStyle,
              borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
              //@ts-ignore
              focusRing: currentTheme.primary
            }}
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="travel">Travel</option>
            <option value="gratitude">Gratitude</option>
            <option value="dream">Dream</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: elementColors.text }}
          >
            Add Tags
          </label>
          <div className="flex">
            <input
              type="text"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 transition-colors"
              style={{
                ...inputStyle,
                borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
                //@ts-ignore
                focusRing: currentTheme.primary
              }}
            />
            <button
              onClick={handleAddTag}
              className="px-3 rounded-r-md hover:opacity-90 transition-colors"
              style={{
                backgroundColor: currentTheme.primary,
                color: '#FFFFFF'
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-sm px-3 py-1 rounded-full flex items-center transition-colors"
              style={{
                backgroundColor: currentTheme.light,
                color: currentTheme.primary
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 hover:opacity-80 focus:outline-none"
                style={{ color: currentTheme.primary }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={!content.trim() || isLoading}
          className={`px-4 py-2 rounded-md flex items-center transition-colors ${
            !content.trim() || isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{
            backgroundColor: !content.trim() || isLoading ? '#9CA3AF' : elementColors.button,
            color: '#FFFFFF'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {currentJournalId ? 'Update Entry' : 'Save Entry'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default JournalEditor;
