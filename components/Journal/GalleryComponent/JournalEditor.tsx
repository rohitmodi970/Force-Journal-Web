import React, { useState } from "react";
import { JournalEntry } from "../types";

interface JournalEditorProps {
  selectedDate: Date;
  entries: JournalEntry[];
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  selectedDate,
  entries
}) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [journalType, setJournalType] = useState<string>("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Find existing entry for the selected date
  const dateString = formatDateString(selectedDate);
  const existingEntry = entries.find(entry => entry.date === dateString);
  
  // Initialize form with existing entry data if available
  React.useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title || "");
      setContent(existingEntry.content || "");
      setJournalType(existingEntry.journalType || "personal");
      setTags(existingEntry.tags || []);
    } else {
      // Reset form when switching to a date with no entry
      setTitle("");
      setContent("");
      setJournalType("personal");
      setTags([]);
    }
  }, [selectedDate, existingEntry]);
  
  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() !== "") {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSave = () => {
    // Here you would save the journal entry
    // This is just a placeholder for the actual save functionality
    alert(`Journal entry saved for ${selectedDate.toLocaleDateString()}`);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 text-xl font-medium border-b border-gray-200 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="mb-6">
        <textarea
          placeholder="What's on your mind today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Journal Type</label>
          <select
            value={journalType}
            onChange={(e) => setJournalType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="travel">Travel</option>
            <option value="gratitude">Gratitude</option>
            <option value="dream">Dream</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Tags</label>
          <div className="flex">
            <input
              type="text"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTag}
              className="px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none"
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
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
        
        <div>
          <button 
            onClick={handleSave}
            disabled={!content.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              !content.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;