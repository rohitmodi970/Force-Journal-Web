// utils/audioAnalysisUtils.ts
import { JournalEntry } from '@/components/Journal/types';

// Function to extract audio entries from journal data
export function extractAudioEntries(entries: JournalEntry[]): JournalEntry[] {
  return entries.filter(entry => 
    entry.mediaType.includes('audio') && 
    entry.mediaUrl.audio && 
    entry.mediaUrl.audio.length > 0
  );
}

// Function to prepare audio entries for LLM analysis
export async function prepareAudioEntriesForAnalysis(
  entries: JournalEntry[]
): Promise<{ entriesWithTranscripts: JournalEntry[], audioUrls: string[] }> {
  const audioEntries = extractAudioEntries(entries);
  const audioUrls = audioEntries.flatMap(entry => entry.mediaUrl.audio || []);
  
  // For now, we'll just pass the audio URLs to the LLM
  // In a real application, you might want to transcribe the audio first
  
  return {
    entriesWithTranscripts: audioEntries,
    audioUrls
  };
}

// API call to analyze audio journal entries
export async function analyzeAudioJournal(
  entries: JournalEntry[],
  options: {
    timeframe?: 'day' | 'week' | 'month';
    analysisTypes?: string[];
  } = {}
): Promise<any> {
  try {
    const { entriesWithTranscripts, audioUrls } = await prepareAudioEntriesForAnalysis(entries);
    
    if (entriesWithTranscripts.length === 0) {
      return { error: 'No audio journal entries found' };
    }
    
    // We don't need to pass the actual audio files to Gemini API
    // Instead, we'll include the existence of audio in our prompt
    // so Gemini knows to incorporate that in its analysis
    
    const response = await fetch('/api/journal-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entries: entriesWithTranscripts,
        timeframe: options.timeframe || 'day',
        analysisTypes: options.analysisTypes || ['all'],
        analysisMode: 'audio',
        audioCount: audioUrls.length,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze audio journal entries');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Audio analysis error:', error);
    return { error: (error as Error).message };
  }
}

// Enhanced journal-analysis endpoint for audio (add this to your route.ts)
// This is a code suggestion for your journal-analysis API
/* 
// In app/api/journal-analysis/route.ts, add this to the POST function:

// Check if this is an audio analysis request
if (request.body?.analysisMode === 'audio') {
  // Modify the prompt for audio analysis
  prompt += `\nNOTE: These journal entries contain audio recordings. 
  There are ${request.body.audioCount} audio files mentioned.
  Please specifically analyze patterns in the user's voice journal entries,
  considering tone, emotion, and speaking patterns mentioned in the content.`;
}
*/