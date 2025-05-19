"use client";

import React, { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout";
import { getAllJournalEntries } from "@/utilities/journal-data";
import JournalGallery from "@/components/Journal/JournalGallery";
import Link from "next/link";
import { NotebookPen, Sparkles } from "lucide-react";
import { JournalEntry } from "@/components/Journal/types";

const JournalGalleryPage = () => {
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
    console.log(entries)
    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold font-journal mb-2">My Journal</h1>
                    <p className="text-muted-foreground font-handwriting text-xl">
                        A collection of Journal
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
                ) : entries.length === 0 ? (
                    <div className="text-center py-8">
                        <p>No journal entries found. Start creating your first entry!</p>
                    </div>
                ) : (
                    <JournalGallery entries={entries} />
                )}
            </div>
            <div className="fixed bottom-8 right-8 z-50 flex gap-4">
                <Link
                    href="/user/journal/analysis/entries-analysis"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 bg-amber-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
                >
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze</span>
                </Link>
                <Link
                    href="/user/journal/my-diary"
                    className="flex items-center gap-2 bg-amber-800 hover:bg-primary/90 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
                >
                    <NotebookPen className="w-5 h-5" />
                    <span>Diary</span>
                </Link>
            </div>
        </Layout>
    );
};

export default JournalGalleryPage;