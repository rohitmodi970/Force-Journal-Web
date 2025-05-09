// app/journal/analysis/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { JournalEntry } from '@/components/Journal/types';
import JournalAnalysis from '@/components/Journal/JournalAnalysis';
import { getAllJournalEntries } from '@/utilities/journal-data';

export default function JournalAnalysisPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const journalEntries = await getAllJournalEntries();
        setEntries(journalEntries);
      } catch (err) {
        console.error('Failed to fetch journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Get current user info (simplified for this example)
    const getUserInfo = async () => {
      try {
        // If you have a user API, you would fetch from there
        // This is just a placeholder
        const userInfo = { name: 'Journal User' };
        setUserName(userInfo.name);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        // Default name is already set
      }
    };

    fetchEntries();
    getUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Journal Analysis Dashboard</h1>
      
      {entries.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No journal entries found. Start journaling to see analysis.</p>
        </div>
      ) : (
        <JournalAnalysis entries={entries} userName={userName} />
      )}
    </div>
  );
}