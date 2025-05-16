"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mic, MicOff, Upload } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext';

interface Question2Props {
  audioFile?: File;
  audioURL: string | null;
  handleAudioRecording: (file: File, url: string) => void;
  goToNextSection: () => void;
  goToPrevSection: () => void;
}

const Question2: React.FC<Question2Props> = ({
  audioURL,
  handleAudioRecording,
  goToNextSection,
  goToPrevSection
}) => {
  const { currentTheme, isDarkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Save audio file to form data via props
        handleAudioRecording(
          new File([audioBlob], 'feeling-recording.wav', { type: 'audio/wav' }),
          audioUrl
        );
        
        // Release media stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access your microphone. Please check your browser permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setIsUploading(true);
      const audioUrl = URL.createObjectURL(file);
      handleAudioRecording(file, audioUrl);
      setIsUploading(false);
    }
  };
  
  const canProceed = audioURL !== null;

  return (
    <motion.div 
      className="space-y-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={`text-2xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        How are you feeling today?
      </h2>
      <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Record or upload an audio message to share your feelings.
      </p>
      
      <div className="space-y-6">
        <div className="rounded-lg border p-5" style={{
          borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
          backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.5)'
        }}>
          <p className={`mb-4 font-medium text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Express how you're feeling with your voice
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-8 w-full">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center p-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'text-white'
                }`}
                style={{
                  backgroundColor: isRecording ? '#EF4444' : currentTheme.primary,
                }}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
              
              <button
                onClick={handleUploadClick}
                className="flex items-center justify-center p-6 rounded-full transition-all duration-300 shadow-lg text-white transform hover:scale-105"
                style={{
                  backgroundColor: currentTheme.primary,
                  opacity: isRecording ? 0.6 : 1,
                  cursor: isRecording ? 'not-allowed' : 'pointer'
                }}
                disabled={isRecording}
              >
                <Upload className="w-8 h-8" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
            </div>
            
            <div className="w-full mt-2">
              {isRecording ? (
                <motion.div 
                  className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  animate={{ boxShadow: ['0 0 0 rgba(239, 68, 68, 0)', '0 0 10px rgba(239, 68, 68, 0.5)', '0 0 0 rgba(239, 68, 68, 0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <motion.span 
                      className="h-3 w-3 bg-red-500 rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    ></motion.span>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recording...</span>
                  </div>
                  
                  {/* Enhanced animated waveform */}
                  <div className="flex items-center justify-center h-24">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 mx-1 rounded-full"
                        style={{ backgroundColor: currentTheme.primary }}
                        animate={{
                          height: [
                            Math.random() * 10 + 5,
                            Math.random() * 30 + 10,
                            Math.random() * 10 + 5
                          ],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: i * 0.07
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : audioURL ? (
                <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-md`}>
                  <p className={`text-center mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your recording
                  </p>
                  <audio 
                    src={audioURL} 
                    controls 
                    className="w-full" 
                    style={{ 
                      accentColor: currentTheme.primary,
                      borderRadius: '8px',
                    }} 
                  />
                </div>
              ) : (
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isUploading ? 'Processing audio...' : 'Click the microphone to record or the upload button to select an audio file'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default Question2;