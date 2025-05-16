"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext';
import { useSession } from 'next-auth/react';
import Question1 from '@/components/onBoarding/Question1';
import Question2 from '@/components/onBoarding/Question2';
import Question3 from '@/components/onBoarding/Question3';

export interface FormData {
  goal: string;
  feelingAudio?: File;
  prettyPhoto?: File;
}

const OnboardingForm = () => {
  const router = useRouter();
  const { currentTheme, isDarkMode } = useTheme();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<FormData>({
    goal: ''
  });
  
  const [currentSection, setCurrentSection] = useState(1);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/onboarding');
    }
  }, [status, router]);

  // Handle text input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle audio recording
  const handleAudioRecording = (file: File, url: string) => {
    setAudioURL(url);
    setFormData(prev => ({ ...prev, feelingAudio: file }));
  };

  // Handle photo upload
  const handlePhotoUpload = (file: File, url: string) => {
    setPhotoURL(url);
    setFormData(prev => ({ ...prev, prettyPhoto: file }));
  };

  const goToNextSection = () => {
    if (currentSection < 3) {
      setCurrentSection(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Make sure user is authenticated
      if (!session || !session.user) {
        throw new Error('You must be signed in to complete onboarding');
      }
      
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('goal', formData.goal);
      
      if (formData.feelingAudio) {
        formDataToSubmit.append('feelingAudio', formData.feelingAudio);
      }
      
      if (formData.prettyPhoto) {
        formDataToSubmit.append('prettyPhoto', formData.prettyPhoto);
      }
      
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        body: formDataToSubmit,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit onboarding data');
      }
      
      const result = await response.json();
      
      // Redirect to dashboard on success
      router.push('/user/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError((error as Error).message || 'There was an error submitting your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state while checking auth
  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: currentTheme.primary }} />
      </div>
    );
  }

  // Theme-dependent styles
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const headingTextColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${bgColor} transition-colors duration-300`}>
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className={`text-3xl font-bold ${headingTextColor} transition-colors duration-300`}>
            Welcome to Force
          </h1>
          <p className={`mt-2 ${subTextColor} transition-colors duration-300`}> 
            Let's personalize your experience with a few quick questions 
          </p> 
           
          {/* Progress indicator */} 
          <div className="flex justify-center mt-6"> 
            {[1, 2, 3].map((step) => ( 
              <div 
                key={step} 
                className="h-2 w-16 mx-1 rounded-full transition-all duration-300" 
                style={{
                  backgroundColor: step === currentSection 
                    ? currentTheme.primary
                    : step < currentSection 
                      ? currentTheme.medium 
                      : isDarkMode ? '#374151' : '#E5E7EB'
                }}
              />
            ))}
          </div>
        </div>
        
        <motion.div
          className={`shadow-xl rounded-2xl p-6 md:p-8 ${cardBgColor} transition-colors duration-300`}
          style={{
            boxShadow: `0 10px 25px -5px ${currentTheme.light}, 0 8px 10px -6px ${currentTheme.light}`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Error message if any */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-300 text-red-800">
              {error}
            </div>
          )}
          
          {isSubmitting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl z-10">
              <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-5 rounded-lg flex flex-col items-center transition-colors duration-300`}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: currentTheme.primary }} />
                <p className="mt-3 font-medium">Submitting your responses...</p>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {currentSection === 1 && (
              <Question1 
                value={formData.goal}
                handleInputChange={handleInputChange}
                goToNextSection={goToNextSection}
              />
            )}
            
            {currentSection === 2 && (
              <Question2 
                audioFile={formData.feelingAudio}
                audioURL={audioURL}
                handleAudioRecording={handleAudioRecording}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
              />
            )}
            
            {currentSection === 3 && (
              <Question3 
                photoFile={formData.prettyPhoto}
                photoURL={photoURL}
                handlePhotoUpload={handlePhotoUpload}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
                currentSection={currentSection}
                totalSections={3}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingForm;