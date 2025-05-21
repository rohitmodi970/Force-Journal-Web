"use client"
import React, { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useTheme } from '@/utilities/context/ThemeContext'

const AccountDeleted = () => {
  const { isDarkMode, currentTheme } = useTheme()
  
  // Sign out user on component mount as their account has been deleted
  useEffect(() => {
    signOut({ redirect: false })
  }, [])
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full space-y-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-8 rounded-lg shadow-lg text-center`}>
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Account Deleted Successfully
        </h2>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700">Your account and all associated information have been permanently deleted.</p>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
          We're sorry to see you go. Thank you for being a part of our community.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            style={{ 
              backgroundColor: currentTheme.primary,
              borderColor: currentTheme.primary
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AccountDeleted