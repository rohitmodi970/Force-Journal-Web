'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, UserPlus, Mail, Phone, Calendar, Globe, Moon, Heart, ChevronRight } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-24">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden">
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
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-50 transition-colors"
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{userData.phone || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>{profile.dob ? formatDate(profile.dob) : 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Personality Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Personality & Preferences</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Personality Type</p>
                    <p>{profile.personalityType || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Moon className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Sleeping Habits</p>
                    <p>{profile.sleepingHabits || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interests Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Interests</h2>
              
              <div className="flex items-start">
                <Heart className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Things I Like</p>
                  {profile.interests && profile.interests.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {profile.interests.map((interest, index) => (
                        <li key={index}>{interest}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No interests specified</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Languages Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Languages</h2>
              
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Languages I Know</p>
                  {profile.languages && profile.languages.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {profile.languages.map((language, index) => (
                        <li key={index}>{language}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No languages specified</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Social Media</h2>
              
              {profile.socialMedia && Object.keys(profile.socialMedia).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(profile.socialMedia).map(([platform, link]) => (
                    <li key={platform} className="flex items-center">
                      <span className="text-gray-500 capitalize mr-2">{platform}:</span>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No social media links provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}