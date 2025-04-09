import React, { useState } from 'react';
import { Image, Mic, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { FileData } from './types';
import AudioAnalyzer from './AudioAnalyzer';

interface FileAttachmentsProps {
  files: FileData;
  handleFileChange: (type: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: any;
  onAnalysisComplete?: (results: any) => void;
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({
  files,
  handleFileChange,
  styles,
  onAnalysisComplete
}) => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  
  const handleAnalysisComplete = (results: any) => {
    if (onAnalysisComplete) {
      onAnalysisComplete(results);
    }
    // Optionally hide the analyzer after completion
    // setShowAnalyzer(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full cursor-pointer"
          style={{ backgroundColor: styles.primaryLight }}
          aria-label="Upload image"
        >
          <Image size={20} style={{ color: styles.primaryColor }} />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('image', e)}
            className="hidden"
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
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange('audio', e)}
            className="hidden"
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
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileChange('other', e)}
            className="hidden"
          />
        </motion.label>
        
        <div className="text-sm flex-1" style={{ color: styles.textSecondary }}>
          {files.image?.name && `Image: ${files.image.name}`}
          {files.audio?.name && `Audio: ${files.audio.name}`}
          {files.other?.name && `File: ${files.other.name}`}
        </div>
      </div>

      {files.audio && (
        <div className="mt-2">
          {!showAnalyzer ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{
                backgroundColor: styles.primaryColor,
                color: '#FFFFFF'
              }}
              onClick={() => setShowAnalyzer(true)}
            >
              Analyze Audio
            </motion.button>
          ) : (
            <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: styles.borderColor }}>
              <div className="flex justify-between mb-3">
                <h3 className="font-medium" style={{ color: styles.textPrimary }}>Voice Analysis</h3>
                <button 
                  className="text-sm" 
                  style={{ color: styles.textSecondary }}
                  onClick={() => setShowAnalyzer(false)}
                >
                  Close
                </button>
              </div>
              <AudioAnalyzer 
                audioFile={files.audio} 
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileAttachments;