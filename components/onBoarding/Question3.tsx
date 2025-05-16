"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Camera, Upload, X } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext';

interface Question3Props {
  photoFile?: File;
  photoURL: string | null;
  handlePhotoUpload: (file: File, url: string) => void;
  goToNextSection: () => void;
  goToPrevSection: () => void;
  currentSection: number;
  totalSections: number;
}

const Question3: React.FC<Question3Props> = ({
  photoFile,
  photoURL,
  handlePhotoUpload,
  goToNextSection,
  goToPrevSection,
  currentSection,
  totalSections
}) => {
  const { currentTheme, isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  
  // Check if device is mobile or tablet
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobileOrTablet(isMobile);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handlePhotoUpload(file, imageUrl);
    }
  };
  
  const takePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const imageUrl = URL.createObjectURL(file);
      handlePhotoUpload(file, imageUrl);
    }
  };
  
  const removePhoto = () => {
    if (photoURL) {
      URL.revokeObjectURL(photoURL);
      handlePhotoUpload(undefined as any, "");
    }
  };
  
  const canProceed = !!photoFile && !!photoURL;

  return (
    <motion.div 
      className="space-y-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={`text-2xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Take a photo of something you find pretty right now
      </h2>
      <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        This helps us understand what brings you joy and appreciate the little things in life.
      </p>
      
      <div className="flex flex-col items-center justify-center">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {photoURL ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative rounded-lg overflow-hidden max-h-80 w-full flex items-center justify-center bg-black">
              <img 
                src={photoURL} 
                alt="Uploaded" 
                className="max-h-80 object-contain" 
              />
              <button
                onClick={removePhoto}
                className="absolute top-2 right-2 rounded-full p-2 bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 text-white"
                aria-label="Remove photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mt-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Beautiful! This captures what brings you joy.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div 
              className={`relative border-2 border-dashed rounded-lg p-6 ${
                dragActive ? 'border-opacity-100' : 'border-opacity-50'
              } transition-all duration-200 flex flex-col items-center justify-center min-h-64 w-full ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}
              style={{
                borderColor: dragActive ? currentTheme.primary : isDarkMode ? '#4B5563' : '#D1D5DB',
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <motion.div 
                  className="p-4 rounded-full"
                  style={{
                    backgroundColor: currentTheme.light,
                    color: currentTheme.primary
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="w-8 h-8" />
                </motion.div>
                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <p className="font-medium">Drag and drop your photo here</p>
                  <p className="text-sm mt-1 opacity-75">or select an option below</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row mt-4 gap-4">
              {isMobileOrTablet && (
                <button
                  onClick={takePhoto}
                  className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg transition-all duration-300 shadow-md"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: 'white'
                  }}
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </button>
              )}
              
              <button
                onClick={triggerFileInput}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg transition-all duration-300 shadow-md ${
                  isMobileOrTablet ? '' : 'w-full'
                }`}
                style={{
                  backgroundColor: currentTheme.primary,
                  color: 'white'
                }}
              >
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={goToPrevSection}
          className={`flex items-center px-5 py-2 rounded-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={goToNextSection}
          disabled={!canProceed}
          className="flex items-center px-6 py-2 rounded-lg transition-all duration-300"
          style={{
            backgroundColor: canProceed ? currentTheme.primary : isDarkMode ? '#4B5563' : '#9CA3AF',
            color: 'white',
            opacity: canProceed ? 1 : 0.6,
            cursor: canProceed ? 'pointer' : 'not-allowed'
          }}
        >
          Complete
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
      
      {/* Progress Indicator */}
      <ProgressIndicator currentSection={currentSection} totalSections={totalSections} />
    </motion.div>
  );
};

// Integrated ProgressIndicator Component
const ProgressIndicator: React.FC<{currentSection: number; totalSections: number}> = ({ 
  currentSection, 
  totalSections 
}) => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
      <div className="px-4 py-2 bg-black/30 backdrop-blur-md rounded-full">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSections }).map((_, index) => (
            <motion.div
              key={index}
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: index < currentSection 
                  ? currentTheme.primary 
                  : index === currentSection 
                    ? 'white' 
                    : 'rgba(255, 255, 255, 0.3)'
              }}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: index === currentSection - 1 ? 1.2 : 1,
                opacity: index <= currentSection - 1 ? 1 : 0.5 
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Question3;