// app\user\journal\analysis\advanced\page.tsx

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Layout from "@/components/layout/Layout";
import { getAllJournalEntries } from "@/utilities/journal-data";
import { JournalEntry } from "@/components/Journal/types";
import AdvancedAnalysisDashboard from "@/components/Journal/Advanced/AdvancedAnalysisDashboard";

const AdvancedAnalysisPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function loadJournalEntries() {
      try {
        setIsLoading(true);
        const fetchedEntries = await getAllJournalEntries();
        setEntries(fetchedEntries);
      } catch (err) {
        console.error('Failed to load journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    loadJournalEntries();
  }, []);

  return (
    <div className="flex">
      
      <div className="flex-1">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-journal mb-2">Advanced Journal Analysis</h1>
              <p className="text-muted-foreground font-handwriting text-xl">
                Deep insights and advanced analytics of your journal entries
              </p>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading your journal entries...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <AdvancedAnalysisDashboard entries={entries} />
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
};

export default AdvancedAnalysisPage; 