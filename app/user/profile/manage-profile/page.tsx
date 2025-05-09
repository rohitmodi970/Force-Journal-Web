'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Plus, Trash, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Toast from '@/components/ui/toast';
interface SocialMedia {
  [platform: string]: string;
}

interface UserProfile {
  bio?: string;
  personalityType?: string;
  dob?: string;  // Use string for form handling
  languages?: string[];
  socialMedia?: SocialMedia;
  sleepingHabits?: string;
  interests?: string[];
  photoUrl?: string;
}

interface FormData {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profile: UserProfile;
}

export default function ManageProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profile: {
      bio: '',
      personalityType: '',
      dob: '',
      languages: [],
      socialMedia: {},
      sleepingHabits: '',
      interests: [],
      photoUrl: ''
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [socialPlatform, setSocialPlatform] = useState<string>('');
  const [socialUrl, setSocialUrl] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('');
  const [newInterest, setNewInterest] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fetchUserData');

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        const user = data.user;

        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          password: '',
          confirmPassword: '',
          profile: {
            bio: user.profile?.bio || '',
            personalityType: user.profile?.personalityType || '',
            dob: user.profile?.dob ? new Date(user.profile.dob).toISOString().split('T')[0] : '',
            languages: user.profile?.languages || [],
            socialMedia: user.profile?.socialMedia || {},
            sleepingHabits: user.profile?.sleepingHabits || '',
            interests: user.profile?.interests || [],
            photoUrl: user.profile?.photoUrl || user.profileImage || ''
          }
        });
      } catch (error) {
        console.error('Error:', error);
        setError('Could not load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof FormData] as Record<string, any>,
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      // Prepare data for submission (omit confirmPassword)
      const { confirmPassword, ...submitData } = formData;

      const response = await fetch('/api/updateProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Show success toast
      showToast('Profile updated successfully!', 'success');

      // Clear password fields after successful update
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });

      // Redirect to profile page after a brief delay
      setTimeout(() => {
        router.push('/user/profile');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const addSocialMedia = () => {
    if (socialPlatform && socialUrl) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          socialMedia: {
            ...formData.profile.socialMedia,
            [socialPlatform.toLowerCase()]: socialUrl
          }
        }
      });
      setSocialPlatform('');
      setSocialUrl('');
    }
  };

  const removeSocialMedia = (platform: string) => {
    const updatedSocialMedia = { ...formData.profile.socialMedia };
    if (updatedSocialMedia) {
      delete updatedSocialMedia[platform];

      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          socialMedia: updatedSocialMedia
        }
      });
    }
  };

  const addLanguage = () => {
    if (newLanguage && formData.profile.languages && !formData.profile.languages.includes(newLanguage)) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          languages: [...formData.profile.languages, newLanguage]
        }
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    if (formData.profile.languages) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          languages: formData.profile.languages.filter(lang => lang !== language)
        }
      });
    }
  };

  const addInterest = () => {
    if (newInterest && formData.profile.interests && !formData.profile.interests.includes(newInterest)) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          interests: [...formData.profile.interests, newInterest]
        }
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    if (formData.profile.interests) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          interests: formData.profile.interests.filter(item => item !== interest)
        }
      });
    }
  };

  const handleCancel = () => {
    router.push('/user/profile');
  };
  const languageSuggestions = ['English', 'Hindi', 'Bengali', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic'];
  const interestSuggestions = ['Reading', 'Traveling', 'Photography', 'Cooking', 'Music', 'Gaming', 'Fitness', 'Art', 'Blogging', 'Coding', 'Dancing', 'Movies', 'Gardening', 'Crafts'];
  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8  mt-24">
      {/* Toast component */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onClose={hideToast}
        duration={5000}
      />
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Manage Your Profile</h1>
          <p className="text-blue-100">Update your personal information and preferences</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-4 rounded">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Photo */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Profile Photo</label>
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                  {formData.profile.photoUrl ? (
                    <img src={formData.profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  name="profile.photoUrl"
                  value={formData.profile.photoUrl || ''}
                  onChange={handleChange}
                  placeholder="Enter photo URL"
                  className="flex-grow p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Bio</label>
                <textarea
                  name="profile.bio"
                  value={formData.profile.bio || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                ></textarea>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="profile.dob"
                  value={formData.profile.dob || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Change Password</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password Field */}
                <div className="relative flex flex-col justify-end">   
                  <label className="block text-gray-700 font-medium mb-2">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded pr-10 "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-9 right-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative flex flex-col justify-end">
                  <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-9 right-3 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>
              </div>
            </div>


            {/* Personality & Preferences Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Personality & Preferences</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Personality Type</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="profile.personalityType"
                      value={formData.profile.personalityType || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Select from below or type your own"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        'INTJ', 'INTP', 'ENTJ', 'ENTP',
                        'INFJ', 'INFP', 'ENFJ', 'ENFP',
                        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
                        'ISTP', 'ISFP', 'ESTP', 'ESFP'
                      ].map((type) => {
                        let bgColor = 'bg-gray-200';
                        let textColor = 'text-gray-700';
                        let hoverColor = 'hover:bg-gray-300';

                        if (type.startsWith('INT')) {
                          bgColor = formData.profile.personalityType === type ? 'bg-indigo-600' : 'bg-indigo-100';
                          textColor = formData.profile.personalityType === type ? 'text-white' : 'text-indigo-800';
                          hoverColor = 'hover:bg-indigo-200';
                        } else if (type.startsWith('ENT')) {
                          bgColor = formData.profile.personalityType === type ? 'bg-purple-600' : 'bg-purple-100';
                          textColor = formData.profile.personalityType === type ? 'text-white' : 'text-purple-800';
                          hoverColor = 'hover:bg-purple-200';
                        } else if (type.startsWith('INF')) {
                          bgColor = formData.profile.personalityType === type ? 'bg-blue-600' : 'bg-blue-100';
                          textColor = formData.profile.personalityType === type ? 'text-white' : 'text-blue-800';
                          hoverColor = 'hover:bg-blue-200';
                        } else if (type.startsWith('ENF')) {
                          bgColor = formData.profile.personalityType === type ? 'bg-green-600' : 'bg-green-100';
                          textColor = formData.profile.personalityType === type ? 'text-white' : 'text-green-800';
                          hoverColor = 'hover:bg-green-200';
                        } else if (type.startsWith('IST') || type.startsWith('ISF')) {
                          bgColor = formData.profile.personalityType === type ? 'bg-amber-600' : 'bg-amber-100';
                          textColor = formData.profile.personalityType === type ? 'text-white' : 'text-amber-800';
                          hoverColor = 'hover:bg-amber-200';
                        } else if (type.startsWith('EST') || type.startsWith('ESF')) {
                          bgColor = formData.profile.personalityType === type ? 'bg-red-600' : 'bg-red-100';
                          textColor = formData.profile.personalityType === type ? 'text-white' : 'text-red-800';
                          hoverColor = 'hover:bg-red-200';
                        }

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                profile: { ...formData.profile, personalityType: type }
                              })
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} ${hoverColor} transition-colors duration-200`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>


                <div>
                  <label className="block text-gray-700 font-medium mb-2">Sleeping Habits</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="profile.sleepingHabits"
                      value={formData.profile.sleepingHabits || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Select from below or type your own"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Early Bird', 'Night Owl', 'Regular Sleeper', 'Irregular Sleeper', 'Sleeps Less than 6 hrs', 'Sleeps More than 9 hrs'].map((habit) => {
                        const isSelected = formData.profile.sleepingHabits === habit;
                        const bgColor = isSelected ? 'bg-teal-600' : 'bg-teal-100';
                        const textColor = isSelected ? 'text-white' : 'text-teal-800';
                        const hoverColor = 'hover:bg-teal-200';

                        return (
                          <button
                            key={habit}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                profile: { ...formData.profile, sleepingHabits: habit }
                              })
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} ${hoverColor} transition-colors duration-200`}
                          >
                            {habit}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Languages</label>

                <div className="flex items-center">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    className="flex-grow p-2 border border-gray-300 rounded mr-2 italic"
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                  >
                    Add
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {languageSuggestions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (!formData.profile.languages?.includes(lang)) {
                          setFormData({
                            ...formData,
                            profile: {
                              ...formData.profile,
                              languages: [...(formData.profile.languages || []), lang]
                            }
                          });
                        }
                      }}
                      className="px-3 py-1 rounded-full text-sm italic font-medium bg-blue-200 text-gray-800 hover:bg-blue-400 transition duration-200"
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Selected Languages */}
                {formData.profile.languages && formData.profile.languages.length > 0 && (
                  <ul className="mt-2">
                    {formData.profile.languages.map((lang, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-blue-100 p-2 rounded mt-1 italic"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          <Trash size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Interests</label>

                <div className="flex items-center">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    className="flex-grow p-2 border border-gray-300 rounded mr-2 italic"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                  >
                    Add
                  </button>
                </div>

                {/* Suggested Interests */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {interestSuggestions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        if (!formData.profile.interests?.includes(interest)) {
                          setFormData({
                            ...formData,
                            profile: {
                              ...formData.profile,
                              interests: [...(formData.profile.interests || []), interest]
                            }
                          });
                        }
                      }}
                      className="px-3 py-1 rounded-full text-sm italic font-medium bg-yellow-200 text-gray-800 hover:bg-yellow-400 transition duration-200"
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                {/* Selected Interests */}
                {formData.profile.interests && formData.profile.interests.length > 0 && (
                  <ul className="mt-2">
                    {formData.profile.interests.map((interest, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-yellow-100 p-2 rounded mt-1 italic"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          <Trash size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Social Media</label>
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={socialPlatform}
                      onChange={(e) => setSocialPlatform(e.target.value)}
                      className="p-2 border border-gray-300 rounded min-w-[160px]"
                    >
                      <option value="">Select Platform</option>
                      <option value="instagram">
                        Instagram
                      </option>
                      <option value="twitter">
                        X (Twitter)
                      </option>
                      <option value="linkedin">
                        LinkedIn
                      </option>
                      <option value="facebook">
                        Facebook
                      </option>
                      <option value="github">
                        GitHub
                      </option>
                      <option value="custom">Other</option>
                    </select>

                    {socialPlatform && socialPlatform !== 'custom' && (
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full overflow-hidden">
                        {socialPlatform === 'instagram' && (
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                            <radialGradient id="yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1" cx="19.38" cy="42.035" r="44.899" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fd5"></stop><stop offset=".328" stop-color="#ff543f"></stop><stop offset=".348" stop-color="#fc5245"></stop><stop offset=".504" stop-color="#e64771"></stop><stop offset=".643" stop-color="#d53e91"></stop><stop offset=".761" stop-color="#cc39a4"></stop><stop offset=".841" stop-color="#c837ab"></stop></radialGradient><path fill="url(#yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20	C42.014,38.383,38.417,41.986,34.017,41.99z"></path><radialGradient id="yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2" cx="11.786" cy="5.54" r="29.813" gradientTransform="matrix(1 0 0 .6663 0 1.849)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4168c9"></stop><stop offset=".999" stop-color="#4168c9" stop-opacity="0"></stop></radialGradient><path fill="url(#yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20	C42.014,38.383,38.417,41.986,34.017,41.99z"></path><path fill="#fff" d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5	s2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"></path><circle cx="31.5" cy="16.5" r="1.5" fill="#fff"></circle><path fill="#fff" d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12	C37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"></path>
                          </svg>
                        )}
                        {socialPlatform === 'twitter' && (
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                            <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
                          </svg>
                        )}
                        {socialPlatform === 'linkedin' && (
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                            <path fill="#0078d4" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5	V37z"></path><path d="M30,37V26.901c0-1.689-0.819-2.698-2.192-2.698c-0.815,0-1.414,0.459-1.779,1.364	c-0.017,0.064-0.041,0.325-0.031,1.114L26,37h-7V18h7v1.061C27.022,18.356,28.275,18,29.738,18c4.547,0,7.261,3.093,7.261,8.274	L37,37H30z M11,37V18h3.457C12.454,18,11,16.528,11,14.499C11,12.472,12.478,11,14.514,11c2.012,0,3.445,1.431,3.486,3.479	C18,16.523,16.521,18,14.485,18H18v19H11z" opacity=".05"></path><path d="M30.5,36.5v-9.599c0-1.973-1.031-3.198-2.692-3.198c-1.295,0-1.935,0.912-2.243,1.677	c-0.082,0.199-0.071,0.989-0.067,1.326L25.5,36.5h-6v-18h6v1.638c0.795-0.823,2.075-1.638,4.238-1.638	c4.233,0,6.761,2.906,6.761,7.774L36.5,36.5H30.5z M11.5,36.5v-18h6v18H11.5z M14.457,17.5c-1.713,0-2.957-1.262-2.957-3.001	c0-1.738,1.268-2.999,3.014-2.999c1.724,0,2.951,1.229,2.986,2.989c0,1.749-1.268,3.011-3.015,3.011H14.457z" opacity=".07"></path><path fill="#fff" d="M12,19h5v17h-5V19z M14.485,17h-0.028C12.965,17,12,15.888,12,14.499C12,13.08,12.995,12,14.514,12	c1.521,0,2.458,1.08,2.486,2.499C17,15.887,16.035,17,14.485,17z M36,36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698	c-1.501,0-2.313,1.012-2.707,1.99C24.957,25.543,25,26.511,25,27v9h-5V19h5v2.616C25.721,20.5,26.85,19,29.738,19	c3.578,0,6.261,2.25,6.261,7.274L36,36L36,36z"></path>
                          </svg>
                        )}
                        {socialPlatform === 'facebook' && (
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                            <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path><path fill="#FFF" d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0.002-3.508,1.459-5.59,5.592-5.59H35v4h-2.287C31.104,17,31,17.6,31,18.723V21h4L34.368,25z"></path>
                          </svg>
                        )}
                        {socialPlatform === 'github' && (
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                            <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
                          </svg>
                        )}
                      </div>
                    )}

                    {socialPlatform === 'custom' && (
                      <input
                        type="text"
                        placeholder="Custom platform name"
                        className="flex-grow p-2 border border-gray-300 rounded"
                        onChange={(e) => setSocialPlatform(e.target.value)}
                      />
                    )}

                    <input
                      type="text"
                      value={socialUrl}
                      onChange={(e) => setSocialUrl(e.target.value)}
                      placeholder="URL"
                      className="flex-grow p-2 border border-gray-300 rounded"
                    />

                    <button
                      type="button"
                      onClick={addSocialMedia}
                      disabled={!socialPlatform || !socialUrl}
                      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 ${(!socialPlatform || !socialUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                {formData.profile.socialMedia && Object.keys(formData.profile.socialMedia).length > 0 && (
                  <ul className="mt-2">
                    {Object.entries(formData.profile.socialMedia).map(([platform, url]) => (
                      <li key={platform} className="flex items-center justify-between bg-gray-100 p-2 rounded mt-1">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}: {url}
                        <button
                          type="button"
                          onClick={() => removeSocialMedia(platform)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          <Trash size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center px-6 py-3 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
            >
              <ArrowLeft size={18} className="mr-2" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save size={18} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}