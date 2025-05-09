"use client"

import React from 'react'
import { useTheme } from "@/utilities/context/ThemeContext"
import Link from 'next/link'

const NotificationPage = () => {
    const { currentTheme } = useTheme()
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>
            
            <div className="bg-white dark:bg-white rounded-lg shadow p-8 text-center">
                <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: currentTheme?.primary }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                
                <h2 className="text-xl font-semibold mb-3">Coming Soon!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We're working hard to bring you notification settings. This feature will be available soon.
                </p>
                
                <Link href="/user/settings" 
                    className="inline-block px-4 py-2 rounded-md text-white transition-colors"
                    style={{ backgroundColor: currentTheme?.primary }}>
                    Return to Settings
                </Link>
            </div>
        </div>
    )
}

export default NotificationPage
