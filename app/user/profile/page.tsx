'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, UserPlus, Mail, Phone, Calendar, Globe, Moon, Heart, ChevronRight } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext'; // Import the theme context

// Types based on the Mongoose schema
interface SocialMedia {
  [platform: string]: string;
}

interface UserProfile {
  bio?: string;
  personalityType?: string;
  dob?: Date;
  languages?: string[];
  socialMedia?: SocialMedia;
  sleepingHabits?: string;
  interests?: string[];
  photoUrl?: string;
}

interface UserData {
  _id: string;
  userId: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isActive?: boolean;
  provider?: string;
  providerId?: string;
  profile?: UserProfile;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Use the theme context
  const { currentTheme, isDarkMode, elementColors } = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fetchUserData');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data.user);
      } catch (error) {
        console.error('Error:', error);
        setError('Could not load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2`} style={{ borderColor: currentTheme.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`${isDarkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded`}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`${isDarkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-100' : 'bg-yellow-100 border-yellow-400 text-yellow-700'} border px-4 py-3 rounded`}>
          <p>No user data available.</p>
        </div>
      </div>
    );
  }

  const profile = userData.profile || {};
  
  const formatDate = (dateString?: Date): string => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Define gradient colors based on theme
  const gradientFrom = currentTheme.primary;
  const gradientTo = currentTheme.active;

  // Define card background and text colors based on dark mode
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const sectionBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textMuted = isDarkMode ? 'text-gray-300' : 'text-gray-500';
  const textItalic = isDarkMode ? 'text-gray-400 italic' : 'text-gray-500 italic';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-24">
      <div className={`${cardBg} shadow rounded-lg overflow-hidden`}>
        
        {/* Profile Header */}
        <div style={{ 
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` 
        }} className="p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4" style={{ borderColor: currentTheme.light }}>
                {profile.photoUrl ? (
                  <img 
                    src={profile.photoUrl} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-blue-100">@{userData.username}</p>
              <div className="mt-2">
                {profile.bio ? (
                  <p className="text-sm">{profile.bio}</p>
                ) : (
                  <p className="text-sm italic opacity-75">No bio available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link 
              href="/user/profile/manage-profile" 
              className="bg-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-opacity-90 transition-colors"
              style={{ color: currentTheme.primary }}
            >
              <UserPlus size={16} className="mr-2" />
              Edit Profile
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info Section */}
            <div className={`${sectionBg} p-4 rounded-lg`} style={{ borderLeft: `4px solid ${currentTheme.primary}` }}>
              <h2 className={`text-lg font-medium ${textColor} mb-4`}>Basic Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                  <div>
                    <p className={`text-sm ${textMuted}`}>Email</p>
                    <p className={textColor}>{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                  <div>
                    <p className={`text-sm ${textMuted}`}>Phone</p>
                    <p className={textColor}>{userData.phone || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                  <div>
                    <p className={`text-sm ${textMuted}`}>Date of Birth</p>
                    <p className={textColor}>{profile.dob ? formatDate(profile.dob) : 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Personality Section */}
            <div className={`${sectionBg} p-4 rounded-lg`} style={{ borderLeft: `4px solid ${currentTheme.primary}` }}>
              <h2 className={`text-lg font-medium ${textColor} mb-4`}>Personality & Preferences</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                  <div>
                    <p className={`text-sm ${textMuted}`}>Personality Type</p>
                    <p className={textColor}>{profile.personalityType || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Moon className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                  <div>
                    <p className={`text-sm ${textMuted}`}>Sleeping Habits</p>
                    <p className={textColor}>{profile.sleepingHabits || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interests Section */}
            <div className={`${sectionBg} p-4 rounded-lg`} style={{ borderLeft: `4px solid ${currentTheme.primary}` }}>
              <h2 className={`text-lg font-medium ${textColor} mb-4`}>Interests</h2>
              
              <div className="flex items-start">
                <Heart className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                <div>
                  <p className={`text-sm ${textMuted}`}>Things I Like</p>
                  {profile.interests && profile.interests.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {profile.interests.map((interest, index) => (
                        <li key={index} className={textColor}>{interest}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={textColor}>No interests specified</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Languages Section */}
            <div className={`${sectionBg} p-4 rounded-lg`} style={{ borderLeft: `4px solid ${currentTheme.primary}` }}>
              <h2 className={`text-lg font-medium ${textColor} mb-4`}>Languages</h2>
              
              <div className="flex items-start">
                <Globe className={`w-5 h-5 ${textMuted} mt-0.5 mr-3`} style={{ color: currentTheme.primary }} />
                <div>
                  <p className={`text-sm ${textMuted}`}>Languages I Know</p>
                  {profile.languages && profile.languages.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {profile.languages.map((language, index) => (
                        <li key={index} className={textColor}>{language}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={textColor}>No languages specified</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className={`${sectionBg} p-4 rounded-lg col-span-1 md:col-span-2`} style={{ borderLeft: `4px solid ${currentTheme.primary}` }}>
              <h2 className={`text-lg font-medium ${textColor} mb-4`}>Social Media</h2>
              
              {profile.socialMedia && Object.keys(profile.socialMedia).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(profile.socialMedia).map(([platform, link]) => (
                    <li key={platform} className="flex items-center">
                      <span className={`${textMuted} capitalize mr-2`}>{platform}:</span>
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline truncate"
                        style={{ color: currentTheme.primary }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={textItalic}>No social media links provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}