// src/components/analyzers/ImageAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface ImageAnalyzerProps {
  imageFile: File;
  onAnalysisComplete?: (results: any) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ imageFile, onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      // This is a placeholder for actual image analysis
      // In a real implementation, you would send the image to a server or use client-side libraries
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock analysis results
      const mockResults = {
        dimensions: { width: 1200, height: 800 },
        format: imageFile.type,
        size: `${(imageFile.size / 1024).toFixed(2)} KB`,
        dominantColors: ['#3B82F6', '#10B981', '#F59E0B'],
        hasText: Math.random() > 0.5,
        objects: ['person', 'tree', 'building'].filter(() => Math.random() > 0.5)
      };
      
      setResults(mockResults);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(mockResults);
      }
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Image analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeImage();
  }, [imageFile]);

  return (
    <div className="text-xs">
      {analyzing && (
        <div className="flex items-center justify-center p-4">
          <RefreshCw className="animate-spin mr-2" size={16} />
          <span>Analyzing image...</span>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 p-2">
          {error}
          <button 
            className="ml-2 underline"
            onClick={analyzeImage}
          >
            Try again
          </button>
        </div>
      )}
      
      {!analyzing && !error && results && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1">
            <div>Dimensions:</div>
            <div>{results.dimensions.width} x {results.dimensions.height}</div>
            
            <div>Format:</div>
            <div>{results.format}</div>
            
            <div>Size:</div>
            <div>{results.size}</div>
            
            <div>Contains text:</div>
            <div>{results.hasText ? 'Yes' : 'No'}</div>
          </div>
          
          {results.objects.length > 0 && (
            <div>
              <div className="font-medium mt-2">Detected objects:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {results.objects.map((obj: string, i: number) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {results.dominantColors.length > 0 && (
            <div>
              <div className="font-medium mt-2">Dominant colors:</div>
              <div className="flex gap-1 mt-1">
                {results.dominantColors.map((color: string, i: number) => (
                  <div 
                    key={i} 
                    className="w-6 h-6 rounded-full border" 
                    style={{ backgroundColor: color }}
                    title={color}
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

export default ImageAnalyzer;