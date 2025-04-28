import React, { useState, useRef } from 'react';
import { Image, Mic, FileText, Film, RefreshCw, BarChart, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { FileData } from '../types';
import AudioAnalyzer from './AudioAnalyzer';
import VideoAnalyzer from './VideoAnalyzer';
import ImageAnalyzer from './ImageAnalyzer';

// Update the interface to support multiple files
interface FileAttachmentsProps {
  files: {
    image: File[];
    audio: File[];
    video: File[];
    other: File[];
  };
  handleFileChange: (type: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: any;
  onAnalysisComplete?: (results: any, type: string, fileIndex: number) => void;
  removeFile?: (type: string, index: number) => void;
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({
  files,
  handleFileChange,
  styles,
  onAnalysisComplete,
  removeFile
}) => {
  // Track active analyzers with file index
  const [activeAnalyzers, setActiveAnalyzers] = useState<{
    image: number[];
    audio: number[];
    video: number[];
  }>({
    image: [],
    audio: [],
    video: []
  });
  
  const [selectedImageForPopup, setSelectedImageForPopup] = useState<{ file: File, index: number } | null>(null);
  
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  
  const fileInputRefs = {
    image: useRef<HTMLInputElement>(null),
    audio: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    other: useRef<HTMLInputElement>(null),
  };
  
  type FileInputRefKey = keyof typeof fileInputRefs;
  
  const handleAnalysisComplete = (results: any, type: string, fileIndex: number) => {
    if (onAnalysisComplete) {
      onAnalysisComplete(results, type, fileIndex);
    }
  };
  
  const triggerFileInput = (type: string) => {
    const validType = type as FileInputRefKey;
    if (fileInputRefs[validType]?.current) {
      fileInputRefs[validType].current.click();
    }
  };

  const toggleAnalyzer = (type: keyof typeof activeAnalyzers, fileIndex: number) => {
    setActiveAnalyzers(prev => {
      const isActive = prev[type].includes(fileIndex);
      if (isActive) {
        return {
          ...prev,
          [type]: prev[type].filter((idx: number) => idx !== fileIndex)
        };
      } else {
        return {
          ...prev,
          [type]: [...prev[type], fileIndex]
        };
      }
    });
  };

  const handleRemoveFile = (type: keyof typeof activeAnalyzers | 'other', index: number) => {
    if (removeFile) {
      removeFile(type, index);
      
      // Also remove any active analyzers for this file
      if (type !== 'other') {
        setActiveAnalyzers(prev => ({
          ...prev,
          [type]: prev[type].filter((idx: number) => idx !== index)
        }));
      }
    }
  };

  // Function to get file summary for the top bar
  const getFileSummary = () => {
    const summaries = [];
    
    if (files.image?.length > 0) {
      summaries.push(`Images: ${files.image.length}`);
    }
    if (files.audio?.length > 0) {
      summaries.push(`Audio: ${files.audio.length}`);
    }
    if (files.video?.length > 0) {
      summaries.push(`Videos: ${files.video.length}`);
    }
    if (files.other?.length > 0) {
      summaries.push(`Files: ${files.other.length}`);
    }
    
    return summaries.join(', ');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2  ">
        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full cursor-pointer"
          style={{ backgroundColor: styles.primaryLight }}
          aria-label="Upload image"
        >
          <Image size={20} style={{ color: styles.primaryColor }} />
          <input
            ref={fileInputRefs.image}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('image', e)}
            className="hidden"
            multiple
          />
        </motion.label>

        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full cursor-pointer"
          style={{ backgroundColor: styles.primaryLight }}
          aria-label="Upload audio"
        >
          <Mic size={20} style={{ color: styles.primaryColor }} />
          <input
            ref={fileInputRefs.audio}
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange('audio', e)}
            className="hidden"
            multiple
          />
        </motion.label>

        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full cursor-pointer"
          style={{ backgroundColor: styles.primaryLight }}
          aria-label="Upload video"
        >
          <Film size={20} style={{ color: styles.primaryColor }} />
          <input
            ref={fileInputRefs.video}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange('video', e)}
            className="hidden"
            multiple
          />
        </motion.label>

        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full cursor-pointer"
          style={{ backgroundColor: styles.primaryLight }}
          aria-label="Upload document"
        >
          <FileText size={20} style={{ color: styles.primaryColor }} />
          <input
            ref={fileInputRefs.other}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileChange('other', e)}
            className="hidden"
            multiple
          />
        </motion.label>
        
        <div className="text-sm flex-1" style={{ color: styles.textSecondary }}>
          {getFileSummary()}
        </div>
      </div>

      {/* Media Preview Section */}
      <div className="grid grid-row-1 md:grid-row-2 gap-4 mt-2">
        {/* Image Previews */}
        {files.image?.length > 0 && (
          <div className="border rounded-lg p-3" style={{ borderColor: styles.borderColor }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium" style={{ color: styles.textPrimary }}>
                Images ({files.image?.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                onClick={() => triggerFileInput('image')}
              >
                <Plus size={12} />
                Add More
              </motion.button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {files.image.map((file, index) => (
                <div key={`image-${index}`} className="relative">
                  <button 
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    onClick={() => handleRemoveFile('image', index)}
                  >
                    <X size={14} color="white" />
                  </button>
                  <div 
                    className="cursor-pointer" 
                    onClick={() => setSelectedImageForPopup({ file, index })}
                  >
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-28 object-cover rounded"
                    />
                    <p className="text-xs mt-1 truncate" style={{ color: styles.textSecondary }}>
                      {file.name}
                    </p>
                  </div>
                  <div className="mt-1">
                    {!activeAnalyzers.image.includes(index) ? (
                      <button
                        className="w-full text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                        style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                        onClick={() => toggleAnalyzer('image', index)}
                      >
                        <BarChart size={12} />
                        Analyze
                      </button>
                    ) : (
                      <div className="mt-1 p-2 border rounded" style={{ borderColor: styles.borderColor }}>
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium text-xs" style={{ color: styles.textPrimary }}>Analysis</h4>
                          <button 
                            className="text-xs" 
                            style={{ color: styles.textSecondary }}
                            onClick={() => toggleAnalyzer('image', index)}
                          >
                            Close
                          </button>
                        </div>
                        <ImageAnalyzer 
                          // Pass necessary props
                          // imageFile={file}
                          // onAnalysisComplete={(results) => handleAnalysisComplete(results, 'image', index)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Players */}
        {files.audio?.length > 0 && (
          <div className="border rounded-lg p-3" style={{ borderColor: styles.borderColor }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium" style={{ color: styles.textPrimary }}>
                Audio Files ({files.audio?.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                onClick={() => triggerFileInput('audio')}
              >
                <Plus size={12} />
                Add More
              </motion.button>
            </div>
            
            <div className="flex flex-col gap-4">
              {files.audio.map((file, index) => (
                <div key={`audio-${index}`} className="relative border rounded p-2" style={{ borderColor: styles.borderColor }}>
                  <button 
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                    onClick={() => handleRemoveFile('audio', index)}
                  >
                    <X size={14} color="white" />
                  </button>
                  <p className="text-sm mb-1 truncate" style={{ color: styles.textPrimary }}>{file.name}</p>
                  <audio 
                    ref={el => { audioRefs.current[index] = el; }}
                    controls 
                    className="w-full" 
                    src={URL.createObjectURL(file)}
                  />
                  <div className="mt-2">
                    {!activeAnalyzers.audio.includes(index) ? (
                      <button
                        className="w-full text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                        style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                        onClick={() => toggleAnalyzer('audio', index)}
                      >
                        <BarChart size={12} />
                        Analyze Audio
                      </button>
                    ) : (
                      <div className="mt-2 p-2 border rounded" style={{ borderColor: styles.borderColor }}>
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium text-xs" style={{ color: styles.textPrimary }}>Voice Analysis</h4>
                          <button 
                            className="text-xs" 
                            style={{ color: styles.textSecondary }}
                            onClick={() => toggleAnalyzer('audio', index)}
                          >
                            Close
                          </button>
                        </div>
                        <AudioAnalyzer 
                          audioFile={file} 
                          onAnalysisComplete={(results) => handleAnalysisComplete(results, 'audio', index)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Players */}
        {files.video?.length > 0 && (
          <div className="border rounded-lg p-3" style={{ borderColor: styles.borderColor }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium" style={{ color: styles.textPrimary }}>
                Videos ({files.video?.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                onClick={() => triggerFileInput('video')}
              >
                <Plus size={12} />
                Add More
              </motion.button>
            </div>
            
            <div className="flex flex-col gap-4">
              {files.video.map((file, index) => (
                <div key={`video-${index}`} className="relative border rounded p-2" style={{ borderColor: styles.borderColor }}>
                  <button 
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1 z-10"
                    onClick={() => handleRemoveFile('video', index)}
                  >
                    <X size={14} color="white" />
                  </button>
                  <p className="text-sm mb-1 truncate" style={{ color: styles.textPrimary }}>{file.name}</p>
                  <video 
                    ref={el => { videoRefs.current[index] = el; }}
                    controls 
                    className="w-full h-40 rounded"
                    src={URL.createObjectURL(file)}
                  />
                  <div className="flex justify-between mt-2">
                    <button
                      className="px-3 py-1 rounded text-xs"
                      style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                      onClick={() => {
                        if (videoRefs.current[index]) {
                          if (videoRefs.current[index]?.paused) {
                            videoRefs.current[index]?.play();
                          } else {
                            videoRefs.current[index]?.pause();
                          }
                        }
                      }}
                    >
                      Play/Pause
                    </button>
                    <button
                      className="px-3 py-1 rounded text-xs"
                      style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                      onClick={() => {
                        if (videoRefs.current[index]) {
                          videoRefs.current[index]!.currentTime = 0;
                        }
                      }}
                    >
                      Restart
                    </button>
                  </div>
                  <div className="mt-2">
                    {!activeAnalyzers.video.includes(index) ? (
                      <button
                        className="w-full text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                        style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                        onClick={() => toggleAnalyzer('video', index)}
                      >
                        <BarChart size={12} />
                        Analyze Video
                      </button>
                    ) : (
                      <div className="mt-2 p-2 border rounded" style={{ borderColor: styles.borderColor }}>
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium text-xs" style={{ color: styles.textPrimary }}>Video Analysis</h4>
                          <button 
                            className="text-xs" 
                            style={{ color: styles.textSecondary }}
                            onClick={() => toggleAnalyzer('video', index)}
                          >
                            Close
                          </button>
                        </div>
                        <VideoAnalyzer 
                          // Pass necessary props
                          // videoFile={file}
                          // onAnalysisComplete={(results) => handleAnalysisComplete(results, 'video', index)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Info */}
        {files.other?.length > 0 && (
          <div className="border rounded-lg p-3" style={{ borderColor: styles.borderColor }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium" style={{ color: styles.textPrimary }}>
                Documents ({files.other?.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: styles.primaryLight, color: styles.primaryColor }}
                onClick={() => triggerFileInput('other')}
              >
                <Plus size={12} />
                Add More
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {files.other.map((file, index) => (
                <div key={`doc-${index}`} className="flex items-center border rounded p-2 relative" style={{ borderColor: styles.borderColor }}>
                  <button 
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                    onClick={() => handleRemoveFile('other', index)}
                  >
                    <X size={14} color="white" />
                  </button>
                  <FileText size={24} style={{ color: styles.primaryColor }} className="mr-3 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate" style={{ color: styles.textPrimary }}>{file.name}</p>
                    <p className="text-xs" style={{ color: styles.textSecondary }}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Popup */}
      {selectedImageForPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageForPopup(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img 
              src={URL.createObjectURL(selectedImageForPopup.file)} 
              alt="Full size preview" 
              className="max-w-full max-h-screen object-contain"
            />
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageForPopup(null);
              }}
            >
              <X size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {selectedImageForPopup.file.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAttachments;