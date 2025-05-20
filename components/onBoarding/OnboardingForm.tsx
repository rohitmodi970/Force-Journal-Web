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

interface Theme {
  primary: string;
  medium: string;
  light: string;
}

interface SessionData {
  user?: {
    [key: string]: any;
  };
  onboardingComplete?: boolean;
  new_user?: boolean;
  [key: string]: any;
}

const OnboardingForm: React.FC = () => {
  const router = useRouter();
  const { currentTheme, isDarkMode } = useTheme() as {
    currentTheme: Theme;
    isDarkMode: boolean;
  };

  const { data: session, status, update: updateSession } = useSession() as {
    data: SessionData | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    update: (data: Partial<SessionData>) => Promise<SessionData | null>;
  };

  const [formData, setFormData] = useState<FormData>({
    goal: ''
  });

  const [currentSection, setCurrentSection] = useState<number>(1);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionInProgress, setSubmissionInProgress] = useState<boolean>(false);

  // File size limits
  const MAX_AUDIO_SIZE: number = 10 * 1024 * 1024; // 10MB
  const MAX_PHOTO_SIZE: number = 10 * 1024 * 1024; // 10MB

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/register');
    }
  }, [status, router]);

  // Image compression function
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const img = new Image();
          img.src = event.target.result as string;
          img.onload = () => {
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;

            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Blob with reduced quality
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }
              // Create a new File from the compressed blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }, 'image/jpeg', 0.3); // Adjust quality (0.3 = 30%)
          };
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  // Handle text input changes
  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle audio recording
  const handleAudioRecording = (file: File, url: string): void => {
    // Validate audio file size
    if (file.size > MAX_AUDIO_SIZE) {
      setError(`Audio file is too large. Maximum size is ${MAX_AUDIO_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    setAudioURL(url);
    setFormData(prev => ({ ...prev, feelingAudio: file }));
  };

  // Handle photo upload with compression
  const handlePhotoUpload = async (file: File, url: string): Promise<void> => {
    try {
      // Validate original file size first
      if (file.size > MAX_PHOTO_SIZE * 2) { // Allow for files up to 2x the limit before compression
        setError(`Photo file is too large. Maximum size is ${MAX_PHOTO_SIZE / (1024 * 1024) * 2}MB before compression.`);
        return;
      }

      // Compress the image
      const compressedFile = await compressImage(file);

      // Check if compression was effective enough
      if (compressedFile.size > MAX_PHOTO_SIZE) {
        setError(`Photo is still too large after compression. Please choose a smaller image.`);
        return;
      }

      // Use the compressed file
      const compressedURL = URL.createObjectURL(compressedFile);
      setPhotoURL(compressedURL);
      setFormData(prev => ({ ...prev, prettyPhoto: compressedFile }));
    } catch (error) {
      console.error('Error compressing image:', error);
      // Show error to user
      setError('Failed to process the image. Please try again with a different photo.');
    }
  };

  const goToNextSection = (): void => {
    // Clear any previous errors
    setError(null);

    if (currentSection < 3) {
      setCurrentSection(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPrevSection = (): void => {
    setError(null);
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  };

  // Improved function to force session refresh and handle navigation
  const handleSessionUpdateAndRedirect = async (): Promise<void> => {
    try {
      console.log('Updating session and preparing to redirect...');

      // Update the session with onboarding complete
      await updateSession({
        onboardingComplete: true,
        new_user: false
      });

      // Wait for session changes to propagate
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use window.location for a hard redirect instead of router.push
      window.location.href = '/user/dashboard';
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError('Failed to update your profile. Please try refreshing the page.');
      setSubmissionInProgress(false);
      setIsSubmitting(false);
    }
  };

  // Form submission with debounce protection
  const handleSubmit = useCallback(async (): Promise<void> => {
    // Prevent multiple submissions
    if (submissionInProgress) {
      console.log('Submission already in progress, ignoring additional submit attempt');
      return;
    }

    // Validate form data before submission
    if (!formData.goal || formData.goal.trim() === '') {
      setError('Please enter your goal before continuing.');
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

        // Call the improved redirect function
        await handleSessionUpdateAndRedirect();

      } else {
        // For non-JSON responses
        const textResponse = await response.text();
        console.log('Received non-JSON response:', textResponse);

        if (response.ok) {
          // Call the improved redirect function
          await handleSessionUpdateAndRedirect();
        } else {
          throw new Error('Server returned an unexpected response format');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError((error as Error).message || 'There was an error submitting your information.');
      setSubmissionInProgress(false); // Reset submission lock on error
      setIsSubmitting(false);
    }
  }, [formData, session, updateSession, submissionInProgress]);

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
                handleInputChange={(value) => handleInputChange('goal', value)}
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