import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface VideoAnalyzerProps {
  videoFile: File;
  onAnalysisComplete?: (results: any) => void;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ videoFile, onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const analyzeVideo = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      // This is a placeholder for actual video analysis
      // In a real implementation, you would send the video to a server or API
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock analysis results
      const mockResults = {
        duration: '3:45',
        resolution: '1920x1080',
        format: videoFile.type,
        size: `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`,
        frameRate: '30 fps',
        bitrate: '3.5 Mbps',
        hasAudio: true
      };
      
      setResults(mockResults);
      
      // In a real implementation, these would be actual thumbnails extracted from the video
      // For mock purposes, we'll use the same placeholder for multiple thumbnails
      setThumbnails([
        '/api/placeholder/120/68',
        '/api/placeholder/120/68',
        '/api/placeholder/120/68'
      ]);
      
      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...mockResults,
          thumbnails: ['thumbnail1', 'thumbnail2', 'thumbnail3'] // Placeholder paths
        });
      }
    } catch (err) {
      setError('Failed to analyze video. Please try again.');
      console.error('Video analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeVideo();
  }, [videoFile]);

  return (
    <div className="text-xs">
      {analyzing && (
        <div className="flex items-center justify-center p-4">
          <RefreshCw className="animate-spin mr-2" size={16} />
          <span>Analyzing video...</span>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 p-2">
          {error}
          <button 
            className="ml-2 underline"
            onClick={analyzeVideo}
          >
            Try again
          </button>
        </div>
      )}
      
      {!analyzing && !error && results && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1">
            <div>Duration:</div>
            <div>{results.duration}</div>
            
            <div>Resolution:</div>
            <div>{results.resolution}</div>
            
            <div>Format:</div>
            <div>{results.format}</div>
            
            <div>Size:</div>
            <div>{results.size}</div>
            
            <div>Frame Rate:</div>
            <div>{results.frameRate}</div>
            
            <div>Bitrate:</div>
            <div>{results.bitrate}</div>
            
            <div>Has Audio:</div>
            <div>{results.hasAudio ? 'Yes' : 'No'}</div>
          </div>
          
          {thumbnails.length > 0 && (
            <div>
              <div className="font-medium mt-2">Thumbnails:</div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {thumbnails.map((url, i) => (
                  <img 
                    key={i} 
                    src={url}
                    alt={`Thumbnail ${i+1}`}
                    className="w-20 h-12 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;