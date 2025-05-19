"use client"
import JournalEntry from '@/components/Journal/JournalEntry/JournalEntry'
import NewEntryLanding from '@/components/NewEntryLanding';
import React, { useState } from 'react'
interface EntryData {
  title: string;
  content: string;
  tags: string[];
  journalType: string;
}
const NewEntry = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [journalType, setJournalType] = useState('personal');
  const [showJournalEntry, setShowJournalEntry] = useState(false);

const handleStartNewEntry = (entryData: EntryData) => {
  // Update your journal entry states with the provided data
  setTitle(entryData.title);
  setContent(entryData.content);
  setTags(entryData.tags);
  setJournalType(entryData.journalType);
  setShowJournalEntry(true);
};

return (
  <div>
    {showJournalEntry ? (
      <JournalEntry title={title} content={content} tags={tags} journalType={journalType} />
    ) : (
      <NewEntryLanding onStartNewEntry={handleStartNewEntry} />
    )}
  </div>
);
}
export default NewEntry
