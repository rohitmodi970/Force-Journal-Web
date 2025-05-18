import React, { useState } from 'react';
import { X, RefreshCw, FileText, Image, Music, Video, Loader } from 'lucide-react';
import { MediaFile } from '../../types';
import AudioAnalyzer from '../AudioAnalyzer';
import { useTheme } from '@/utilities/context/ThemeContext';

interface MediaPreviewProps {
  mediaFiles: MediaFile[];
  onRemove: (id: string) => void;
  isUploading: boolean;
}

interface AnalysisResults {
  status?: string;
  linguistics: {
    transcript?: string;
    summary: string;
    sentiment: {
      overall: string;
      score: number;
    };
    confidence: number;
    topics: string[];
  };
  data?: {
    [key: string]: any;
  };
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ mediaFiles, onRemove, isUploading }) => {
  // Get theme context
  const { currentTheme, isDarkMode } = useTheme();
  
  // Store analysis states and results for all files
  const [analyzingFiles, setAnalyzingFiles] = useState<{[key: string]: boolean}>({});
  const [analysisResults, setAnalysisResults] = useState<{[key: string]: AnalysisResults}>({});

  const handleStartAnalysis = (fileId: string) => {
    setAnalyzingFiles(prev => ({
      ...prev,
      [fileId]: true
    }));
  };

  const handleAnalysisComplete = (fileId: string, results: AnalysisResults) => {
    setAnalyzingFiles(prev => ({
      ...prev,
      [fileId]: false
    }));
    
    setAnalysisResults(prev => ({
      ...prev,
      [fileId]: results
    }));
  };

  const renderPreviewByType = () => {
    const imageFiles = mediaFiles.filter((file) => file.type === 'image');
    const audioFiles = mediaFiles.filter((file) => file.type === 'audio');
    const videoFiles = mediaFiles.filter((file) => file.type === 'video');
    const documentFiles = mediaFiles.filter((file) => file.type === 'document');

    return (
      <>
        {imageFiles.length > 0 && (
          <PreviewSection 
            title="Images" 
            files={imageFiles} 
            onRemove={onRemove} 
            isUploading={isUploading}
            analyzingFiles={analyzingFiles}
            analysisResults={analysisResults}
            onStartAnalysis={handleStartAnalysis}
            onAnalysisComplete={handleAnalysisComplete}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />
        )}
        
        {audioFiles.length > 0 && (
          <PreviewSection 
            title="Audio Files" 
            files={audioFiles} 
            onRemove={onRemove} 
            isUploading={isUploading}
            analyzingFiles={analyzingFiles}
            analysisResults={analysisResults}
            onStartAnalysis={handleStartAnalysis}
            onAnalysisComplete={handleAnalysisComplete}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />
        )}
        
        {videoFiles.length > 0 && (
          <PreviewSection 
            title="Videos" 
            files={videoFiles} 
            onRemove={onRemove} 
            isUploading={isUploading}
            analyzingFiles={analyzingFiles}
            analysisResults={analysisResults}
            onStartAnalysis={handleStartAnalysis}
            onAnalysisComplete={handleAnalysisComplete}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />
        )}
        
        {documentFiles.length > 0 && (
          <PreviewSection 
            title="Documents" 
            files={documentFiles} 
            onRemove={onRemove} 
            isUploading={isUploading}
            analyzingFiles={analyzingFiles}
            analysisResults={analysisResults}
            onStartAnalysis={handleStartAnalysis}
            onAnalysisComplete={handleAnalysisComplete}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />
        )}
      </>
    );
  };

  if (mediaFiles.length === 0) {
    return null;
  }

  return <div className="space-y-4">{renderPreviewByType()}</div>;
};

interface PreviewSectionProps {
  title: string;
  files: MediaFile[];
  onRemove: (id: string) => void;
  isUploading: boolean;
  analyzingFiles: {[key: string]: boolean};
  analysisResults: {[key: string]: AnalysisResults};
  onStartAnalysis: (fileId: string) => void;
  onAnalysisComplete: (fileId: string, results: AnalysisResults) => void;
  currentTheme: any;
  isDarkMode: boolean;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ 
  title, 
  files, 
  onRemove, 
  isUploading, 
  analyzingFiles, 
  analysisResults, 
  onStartAnalysis, 
  onAnalysisComplete,
  currentTheme,
  isDarkMode
}) => {
  
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={16} className="mr-1" style={{ color: currentTheme.primary }} />;
      case 'audio':
        return <Music size={16} className="mr-1" style={{ color: currentTheme.primary }} />;
      case 'video':
        return <Video size={16} className="mr-1" style={{ color: currentTheme.primary }} />;
      case 'document':
        return <FileText size={16} className="mr-1" style={{ color: currentTheme.primary }} />;
      default:
        return null;
    }
  };
  
  const renderAnalysisResults = (fileId: string) => {
    const results = analysisResults[fileId];
    if (!results) return null;
    
    const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
    
    return (
      <div className={`mt-3 text-xs ${bgColor} p-3 rounded border ${borderColor}`}>
        <div className="font-semibold mb-2">Analysis Results:</div>
        {results.linguistics && (
          <div className="space-y-2">
            {results.linguistics.transcript && (
              <div>
                <span className="font-medium">Transcript:</span>
                <p className={`mt-1 ${textColor}`}>{results.linguistics.transcript.length > 100 
                  ? `${results.linguistics.transcript.substring(0, 100)}...` 
                  : results.linguistics.transcript}
                </p>
              </div>
            )}
            <div>
              <span className="font-medium">Summary:</span>
              <p className={`mt-1 ${textColor}`}>{results.linguistics.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Sentiment:</span>
                <p className={textColor}>{results.linguistics.sentiment.overall} 
                  ({results.linguistics.sentiment.score?.toFixed(2)})
                </p>
              </div>
              <div>
                <span className="font-medium">Confidence:</span>
                <p className={textColor}>{(results.linguistics.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            {results.linguistics.topics.length > 0 && (
              <div>
                <span className="font-medium">Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {results.linguistics.topics.map((topic, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: currentTheme.light,
                        color: currentTheme.active
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {results.data && Object.keys(results.data).length > 0 && (
          <div className="grid grid-cols-2 gap-1 mt-2">
            {Object.entries(results.data).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span> {value.toString()}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderPreviewContent = (file: MediaFile) => {
    const isAnalyzing = analyzingFiles[file.id] || false;
    const hasResults = !!analysisResults[file.id];
    
    // Theme-based colors
    const bgCardColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
    const secondaryTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    
    switch (file.type) {
      case 'image':
        return (
          <div className="relative">
            <div className="flex items-center mb-1">
              {getMediaTypeIcon('image')}
              <div className={`text-xs font-medium truncate ${textColor}`}>{file.file.name}</div>
            </div>
            <img 
              src={file.url || URL.createObjectURL(file.file)} 
              alt={file.file.name} 
              className="w-full h-28 object-cover rounded" 
            />
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className="text-xs px-2 py-1 rounded flex items-center justify-center w-full"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                  color: isDarkMode ? '#D1D5DB' : '#4B5563'
                }}
                disabled={true}
              >
                Analysis features coming soon
              </button>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="relative">
            <div className="flex items-center mb-1">
              {getMediaTypeIcon('audio')}
              <div className={`text-xs font-medium truncate ${textColor}`}>{file.file.name}</div>
            </div>
            <audio 
              controls 
              className="w-full h-12" 
              src={file.url || URL.createObjectURL(file.file)}
            />
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className={`text-xs px-2 py-1 rounded flex items-center justify-center w-full`}
                style={{ 
                  backgroundColor: isAnalyzing 
                    ? currentTheme.light
                    : hasResults 
                      ? isDarkMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.1)'
                      : currentTheme.primary,
                  color: isAnalyzing 
                    ? currentTheme.active
                    : hasResults 
                      ? isDarkMode ? '#4ADE80' : '#166534'
                      : '#FFFFFF'
                }}
                onClick={() => onStartAnalysis(file.id)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader size={14} className="mr-1 animate-spin" /> 
                    Analyzing...
                  </>
                ) : hasResults ? (
                  'View Analysis Results'
                ) : (
                  'Analyze Audio'
                )}
              </button>
              {isAnalyzing && (
                <div className="hidden">
                  <AudioAnalyzer
                    audioFile={file.file}
                    onAnalysisComplete={(results) => onAnalysisComplete(file.id, results)}
                  />
                </div>
              )}
              {hasResults && renderAnalysisResults(file.id)}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative">
            <div className="flex items-center mb-1">
              {getMediaTypeIcon('video')}
              <div className={`text-xs font-medium truncate ${textColor}`}>{file.file.name}</div>
            </div>
            <video 
              controls 
              className="w-full h-40 object-cover rounded" 
              src={file.url || URL.createObjectURL(file.file)}
            />
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className="text-xs px-2 py-1 rounded flex items-center justify-center w-full"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                  color: isDarkMode ? '#D1D5DB' : '#4B5563'
                }}
                disabled={true}
              >
                Analysis features coming soon
              </button>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              {getMediaTypeIcon('document')}
              <div className={`text-xs font-medium truncate ${textColor}`}>{file.file.name}</div>
            </div>
            <div className={`text-xs ${secondaryTextColor}`}>
              {(file.file.size / 1024).toFixed(2)} KB
            </div>
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className="text-xs px-2 py-1 rounded flex items-center justify-center w-full"
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                  color: isDarkMode ? '#D1D5DB' : '#4B5563'
                }}
                disabled={true}
              >
                Analysis features coming soon
              </button>
            </div>
          </div>
        );
    }
  };

  const renderUploadStatus = (file: MediaFile) => {
    const secondaryTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    
    if (file.status === 'uploading') {
      return (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ 
                width: `${file.progress}%`,
                backgroundColor: currentTheme.primary
              }}
            ></div>
          </div>
          <div className={`text-xs ${secondaryTextColor} mt-1 flex items-center`}>
            <RefreshCw size={12} className="mr-1 animate-spin" />
            {file.progress}% uploaded
          </div>
        </div>
      );
    } else if (file.status === 'success') {
      return (
        <div className="text-xs mt-2" style={{ color: isDarkMode ? '#4ADE80' : '#16A34A' }}>Upload complete</div>
      );
    } else if (file.status === 'error') {
      return (
        <div className="text-xs mt-2" style={{ color: isDarkMode ? '#F87171' : '#DC2626' }}>Upload failed</div>
      );
    }
    return null;
  };

  const bgCardColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  const shadowClass = isDarkMode ? 'shadow-gray-900' : 'shadow-sm';

  return (
    <div className={`border rounded-lg p-3 ${bgCardColor} ${shadowClass}`} style={{ borderColor: isDarkMode ? '#374151' : '#E5E7EB' }}>
      <h3 className={`font-medium mb-3 flex items-center ${textColor}`}>
        {getMediaTypeIcon(files[0].type)}
        {title} ({files.length})
      </h3>
      <div className={`grid ${files[0].type === 'image' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        {files.map((file) => (
          <div 
            key={file.id} 
            className="relative border rounded p-3 transition-shadow duration-200"
            style={{ 
              borderColor: isDarkMode ? '#374151' : '#E5E7EB',
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF'
            }}
          >
            {!isUploading && file.status !== 'uploading' && (
              <button 
                className="absolute top-2 right-2 rounded-full p-1 z-10 transition-colors duration-200"
                style={{ backgroundColor: '#EF4444' }}
                onClick={() => onRemove(file.id)}
                aria-label="Remove file"
              >
                <X size={14} color="white" />
              </button>
            )}
            {renderPreviewContent(file)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;