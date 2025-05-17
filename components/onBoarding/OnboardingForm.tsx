"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext';
import { useSession } from 'next-auth/react';
import Question1 from '@/components/onBoarding/Question1';
import Question2 from '@/components/onBoarding/Question2';
import Question3 from '@/components/onBoarding/Question3';
import { signOut } from 'next-auth/react';
export interface FormData {
  goal: string;
  feelingAudio?: File;
  prettyPhoto?: File;
}

const OnboardingForm = () => {
  const router = useRouter();
  const { currentTheme, isDarkMode } = useTheme();
  const { data: session, status, update: updateSession } = useSession();
  
  const [formData, setFormData] = useState<FormData>({
    goal: ''
  });
  
  const [currentSection, setCurrentSection] = useState(1);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/register');
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
const forceSessionRefresh = async () => {
  try {
    // This will force NextAuth to refresh the token
    // Use the correct property name (lowercase 'b')
await updateSession();
    
    // Wait briefly to ensure the update propagates
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to dashboard
    router.push('/user/dashboard');
  } catch (error) {
    console.error('Error refreshing session:', error);
    await signOut({ redirect: false });
    window.location.href = '/auth/login?error=session_refresh_failed';
  }
};
  // Form submission with debounce protection
// Modified handleSubmit function with proper session update
const handleSubmit = useCallback(async () => {
  // Prevent multiple submissions
  if (submissionInProgress) {
    console.log('Submission already in progress, ignoring additional submit attempt');
    return;
  }
  
  setIsSubmitting(true);
  setError(null);
  setSubmissionInProgress(true);
  
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
    
    console.log('Submitting form data...');
    
    const response = await fetch('/api/user/onboarding', {
      method: 'POST',
      body: formDataToSubmit,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to submit onboarding data';
        throw new Error(errorMessage);
      }
      
      // Update the session client-side
      console.log('Updating session...');
      
      // Use the next-auth's update method to update the session
      // Use the correct property name (lowercase 'b')
await updateSession({
  onboardingComplete: true,
  new_user: false // Also update new_user status if needed
});
      
      // Wait briefly to ensure DB updates propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the router to navigate (no page reload)
      router.push('/user/dashboard');
      
    } else {
      // For non-JSON responses
      const textResponse = await response.text();
      console.log('Received non-JSON response:', textResponse);
      
      if (response.ok) {
        // Update the session here too
        // Use the correct property name (lowercase 'b')
await updateSession({
  onboardingComplete: true,
  new_user: false // Also update new_user status if needed
});
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/user/dashboard');
      } else {
        throw new Error('Server returned an unexpected response format');
      }
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    setError((error as Error).message || 'There was an error submitting your information.');
    setSubmissionInProgress(false); // Reset submission lock on error
  } finally {
    setIsSubmitting(false);
    // Reset submission lock after completion
    setSubmissionInProgress(false);
  }
}, [formData, session, updateSession, router, submissionInProgress]);

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
          className={`shadow-xl rounded-2xl p-6 md:p-8 ${cardBgColor} transition-colors duration-300 relative`}
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