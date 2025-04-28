import React, { useState } from 'react';
import { X, RefreshCw, FileText, Image, Music, Video, Loader } from 'lucide-react';
import { MediaFile } from '../../types';
import AudioAnalyzer from '../AudioAnalyzer';

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
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ 
  title, 
  files, 
  onRemove, 
  isUploading, 
  analyzingFiles, 
  analysisResults, 
  onStartAnalysis, 
  onAnalysisComplete 
}) => {
  
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={16} className="mr-1" />;
      case 'audio':
        return <Music size={16} className="mr-1" />;
      case 'video':
        return <Video size={16} className="mr-1" />;
      case 'document':
        return <FileText size={16} className="mr-1" />;
      default:
        return null;
    }
  };
  
  const renderAnalysisResults = (fileId: string) => {
    const results = analysisResults[fileId];
    if (!results) return null;
    
    // Display AudioAnalyzer results based on the actual structure
    return (
      <div className="mt-3 text-xs bg-gray-50 p-3 rounded border border-gray-200">
        <div className="font-semibold mb-2">Analysis Results:</div>
        {results.linguistics && (
          <div className="space-y-2">
            {results.linguistics.transcript && (
              <div>
                <span className="font-medium">Transcript:</span>
                <p className="mt-1 text-gray-700">{results.linguistics.transcript.length > 100 
                  ? `${results.linguistics.transcript.substring(0, 100)}...` 
                  : results.linguistics.transcript}
                </p>
              </div>
            )}
            <div>
              <span className="font-medium">Summary:</span>
              <p className="mt-1 text-gray-700">{results.linguistics.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Sentiment:</span>
                <p className="text-gray-700">{results.linguistics.sentiment.overall} 
                  ({results.linguistics.sentiment.score?.toFixed(2)})
                </p>
              </div>
              <div>
                <span className="font-medium">Confidence:</span>
                <p className="text-gray-700">{(results.linguistics.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            {results.linguistics.topics.length > 0 && (
              <div>
                <span className="font-medium">Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {results.linguistics.topics.map((topic, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
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
    
    switch (file.type) {
      case 'image':
        return (
          <div className="relative">
            <div className="flex items-center mb-1">
              {getMediaTypeIcon('image')}
              <div className="text-xs font-medium truncate">{file.file.name}</div>
            </div>
            <img 
              src={file.url || URL.createObjectURL(file.file)} 
              alt={file.file.name} 
              className="w-full h-28 object-cover rounded" 
            />
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center justify-center w-full"
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
              <div className="text-xs font-medium truncate">{file.file.name}</div>
            </div>
            <audio 
              controls 
              className="w-full h-12" 
              src={file.url || URL.createObjectURL(file.file)}
            />
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className={`text-xs px-2 py-1 rounded flex items-center justify-center w-full ${
                  isAnalyzing 
                    ? 'bg-blue-100 text-blue-700' 
                    : hasResults 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-500 text-white'
                }`}
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
              <div className="text-xs font-medium truncate">{file.file.name}</div>
            </div>
            <video 
              controls 
              className="w-full h-40 object-cover rounded" 
              src={file.url || URL.createObjectURL(file.file)}
            />
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center justify-center w-full"
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
              <div className="text-xs font-medium truncate">{file.file.name}</div>
            </div>
            <div className="text-xs text-gray-500">
              {(file.file.size / 1024).toFixed(2)} KB
            </div>
            {renderUploadStatus(file)}
            <div className="mt-2">
              <button
                className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center justify-center w-full"
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
    if (file.status === 'uploading') {
      return (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${file.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <RefreshCw size={12} className="mr-1 animate-spin" />
            {file.progress}% uploaded
          </div>
        </div>
      );
    } else if (file.status === 'success') {
      return (
        <div className="text-xs text-green-600 mt-2">Upload complete</div>
      );
    } else if (file.status === 'error') {
      return (
        <div className="text-xs text-red-600 mt-2">Upload failed</div>
      );
    }
    return null;
  };

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <h3 className="font-medium mb-3 flex items-center">
        {getMediaTypeIcon(files[0].type)}
        {title} ({files.length})
      </h3>
      <div className={`grid ${files[0].type === 'image' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        {files.map((file) => (
          <div key={file.id} className="relative border rounded p-3 hover:shadow-md transition-shadow duration-200">
            {!isUploading && file.status !== 'uploading' && (
              <button 
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 z-10 transition-colors duration-200"
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