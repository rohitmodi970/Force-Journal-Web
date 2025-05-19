"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Types for our data
interface Media {
  driveFileId: string;
  name: string;
  mimeType: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface JournalMedia {
  image: Media[];
  audio: Media[];
  video: Media[];
  document: Media[];
}

interface Journal {
  id: string;
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
  const journalId = params.journalId as string;
  
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading journal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/user/dashboard" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Back to Journals
          </Link>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 max-w-lg">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Journal Not Found</h2>
          <p className="text-yellow-600">The requested journal entry could not be found.</p>
          <Link href="/user/journal/my-diary" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Back to Journals
          </Link>
        </div>
      </div>
    );
  }

  // Calculate media counts
  const imageCounts = journal.media.image.length;
  const audioCounts = journal.media.audio.length;
  const videoCounts = journal.media.video.length;
  const documentCounts = journal.media.document.length;
  const totalMediaCount = imageCounts + audioCounts + videoCounts + documentCounts;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Journal Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/user/journal/my-diary" className="mr-4 text-blue-500 hover:text-blue-700">
            &larr; Back to Journals
          </Link>
          <div 
            className="w-6 h-6 rounded-full mr-2" 
            style={{ backgroundColor: getMoodColorHex(journal.moodColor) }}
          ></div>
          <span className="text-gray-600">{journal.mood}</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{journal.title}</h1>
        <div className="text-gray-500 mb-4">{new Date(journal.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
        
        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {journal.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Journal Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="prose max-w-none">
          {journal.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Media Section */}
      {totalMediaCount > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Media ({totalMediaCount})</h2>
          
          {/* Images */}
          {imageCounts > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Images ({imageCounts})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {journal.media.image.map((image) => (
                  <div key={image.driveFileId} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                      {image.thumbnailUrl ? (
                        <img 
                          src={image.thumbnailUrl} 
                          alt={image.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="truncate text-sm mt-1">{image.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Audio */}
          {audioCounts > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Audio Recordings ({audioCounts})</h3>
              <div className="space-y-4">
                {journal.media.audio.map((audio) => (
                  <div key={audio.driveFileId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{audio.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(audio.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Videos */}
          {videoCounts > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Videos ({videoCounts})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journal.media.video.map((video) => (
                  <div key={video.driveFileId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-full mr-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{video.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Documents */}
          {documentCounts > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Documents ({documentCounts})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journal.media.document.map((doc) => (
                  <div key={doc.driveFileId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full mr-4">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to convert mood color names to hex codes
function getMoodColorHex(color: string): string {
  const colorMap: {[key: string]: string} = {
    yellow: '#FCD34D', // Happy
    blue: '#60A5FA',   // Sad, Peaceful
    red: '#F87171',    // Angry, Frustrated
    orange: '#FBBF24', // Excited
    purple: '#A78BFA', // Anxious, Stressed, Thoughtful
    green: '#34D399',  // Optimistic, Grateful
    gray: '#9CA3AF'    // Neutral
  };
  
  return colorMap[color] || '#9CA3AF'; // Default to gray
}

export default JournalPage;