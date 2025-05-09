// components/Journal/AudioJournalAnalysis.tsx
import React, { useState } from 'react';
import { JournalEntry } from './types';
import { extractAudioEntries, analyzeAudioJournal } from '@/utilities/audioAnalysisUtils';

interface AudioJournalAnalysisProps {
    entries: JournalEntry[];
    userName?: string;
}

const AudioJournalAnalysis: React.FC<AudioJournalAnalysisProps> = ({ entries, userName }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [audioAnalysisResults, setAudioAnalysisResults] = useState<any>(null);
    
    // Extract only entries with audio
    const audioEntries = extractAudioEntries(entries);
    
    // Analyze audio journal entries
    const handleAnalyzeAudio = async () => {
        if (audioEntries.length === 0) {
            setError('No audio journal entries found');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const results = await analyzeAudioJournal(audioEntries, {
                timeframe: 'day',
                analysisTypes: ['sentiment', 'topics', 'mood']
            });
            
            if (results.error) {
                throw new Error(results.error);
            }
            
            setAudioAnalysisResults(results.results);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    // Render audio entries list
    const renderAudioEntries = () => {
        if (audioEntries.length === 0) {
            return (
                <div className="text-gray-500 italic">No audio journal entries found</div>
            );
        }
        
        return (
            <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Audio Journal Entries ({audioEntries.length})</h3>
                <ul className="space-y-3">
                    {audioEntries.map((entry) => (
                        <li key={entry.journalId} className="border p-3 rounded">
                            <div className="font-medium">{entry.title || 'Untitled Audio Entry'}</div>
                            <div className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</div>
                            {entry.content && <p className="text-sm mt-1">{entry.content}</p>}
                            <div className="mt-2">
                                {entry.mediaUrl.audio && entry.mediaUrl.audio.map((url, index) => (
                                    <div key={index} className="mt-1">
                                        <audio 
                                            controls 
                                            src={url} 
                                            className="w-full max-w-md mt-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
    
    // Render analysis results
    const renderAnalysisResults = () => {
        if (!audioAnalysisResults) return null;
        
        return (
            <div className="mt-6 p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Audio Journal Analysis</h3>
                
                {/* Voice tone analysis */}
                {audioAnalysisResults.voiceTone && (
                    <div className="mb-4">
                        <h4 className="font-medium">Voice Tone Analysis:</h4>
                        <p>{audioAnalysisResults.voiceTone.description}</p>
                        {audioAnalysisResults.voiceTone.patterns && (
                            <ul className="list-disc pl-5 mt-2 text-sm">
                                {audioAnalysisResults.voiceTone.patterns.map((pattern: string, i: number) => (
                                    <li key={i}>{pattern}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                
                {/* Sentiment from audio */}
                {audioAnalysisResults.sentiment && (
                    <div className="mb-4">
                        <h4 className="font-medium">Sentiment Analysis:</h4>
                        <p>Overall: {audioAnalysisResults.sentiment.overall}</p>
                        <p>Score: {audioAnalysisResults.sentiment.score}</p>
                    </div>
                )}
                
                {/* Emotional patterns */}
                {audioAnalysisResults.emotionalPatterns && (
                    <div className="mb-4">
                        <h4 className="font-medium">Emotional Patterns:</h4>
                        <ul className="list-disc pl-5">
                            {audioAnalysisResults.emotionalPatterns.map((pattern: any, i: number) => (
                                <li key={i}>{pattern.description}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Topics discussed in audio */}
                {audioAnalysisResults.topics && audioAnalysisResults.topics.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium">Topics Discussed:</h4>
                        <ul>
                            {audioAnalysisResults.topics.map((topic: any, index: number) => (
                                <li key={index}>
                                    <strong>{topic.name}</strong> (Frequency: {topic.frequency})
                                    <p className="text-sm">{topic.context}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Insights */}
                {audioAnalysisResults.insights && audioAnalysisResults.insights.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium">Insights:</h4>
                        <ul className="list-disc pl-5">
                            {audioAnalysisResults.insights.map((insight: string, index: number) => (
                                <li key={index}>{insight}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Raw analysis fallback */}
                {audioAnalysisResults.rawAnalysis && (
                    <div>
                        <h4 className="font-medium">Analysis:</h4>
                        <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm">
                            {audioAnalysisResults.rawAnalysis}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Audio Journal Analysis</h2>
            
            <div className="mb-4">
                <p className="text-gray-600">
                    Analyze your voice journal entries to discover patterns, tone, and emotional insights.
                </p>
            </div>
            
            {/* Audio entries list */}
            {renderAudioEntries()}
            
            {/* Analysis controls */}
            <div className="mt-6">
                <button
                    onClick={handleAnalyzeAudio}
                    disabled={loading || audioEntries.length === 0}
                    className={`px-4 py-2 rounded ${
                        loading || audioEntries.length === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'Analyzing...' : 'Analyze Audio Entries'}
                </button>
                
                {error && (
                    <div className="mt-3 text-red-500">
                        Error: {error}
                    </div>
                )}
            </div>
            
            {/* Analysis results */}
            {renderAnalysisResults()}
        </div>
    );
};

export default AudioJournalAnalysis;