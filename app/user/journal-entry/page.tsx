"use client"

import JournalEntry from '@/components/Journal/JournalEntry/JournalEntry'
import NewEntryLanding from '@/components/Journal/JournalEntry/NewEntryLanding';
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';

interface EntryData {
  title: string;
  content: string;
  tags: string[];
  journalType: string;
}

const NewEntry = () => {
  // State for journal entry
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [journalType, setJournalType] = useState('personal');
  const [showJournalEntry, setShowJournalEntry] = useState(false);
  
  // Get URL search params to check for quick link
  const searchParams = useSearchParams();
  
  // On component mount, check for quickLink and templateId in the URL
  useEffect(() => {
    const quickLinkParam = searchParams.get('quick');
    const templateIdParam = searchParams.get('templateId');
    
    if (quickLinkParam === 'blank' || quickLinkParam === 'template' || quickLinkParam === 'ocr') {
      // When quick link is specified, show entry right away unless it's a template that needs selection
      if (quickLinkParam !== 'template' || templateIdParam) {
        setShowJournalEntry(true);
      }
    }
  }, [searchParams]);

  const handleStartNewEntry = (entryData: EntryData) => {
    // Update journal entry states with the provided data
    setTitle(entryData.title);
    setContent(entryData.content);
    setTags(entryData.tags);
    setJournalType(entryData.journalType);
    setShowJournalEntry(true);
  };

  return (
    <div className="min-h-screen">
      {showJournalEntry ? (
        <JournalEntry 
          title={title} 
          content={content} 
          tags={tags} 
          journalType={journalType} 
        />
      ) : (
        <NewEntryLanding 
          onStartNewEntry={handleStartNewEntry}
          quickLink={searchParams.get('quick') as 'blank' | 'template' | 'ocr' | undefined}
          templateId={searchParams.get('templateId') || undefined}
        />
      )}
    </div>
  );
}

export default NewEntry
