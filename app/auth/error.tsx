'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const AuthErrorPage = () => {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    // Map error codes to user-friendly messages
    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case 'CredentialsSignin':
                return 'Invalid credentials. Please check your email and password.'
            case 'AccessDenied':
                return 'Access denied. You don\'t have permission to sign in.'
            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
                return 'There was a problem with your Google sign in. Please try again.'
            case 'EmailCreateAccount':
                return 'There was a problem creating your account. Please try again.'
            case 'Callback':
                return 'There was a problem during the authentication process.'
            default:
                return 'An unexpected authentication error occurred. Please try again.'
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
                    <div className="mt-4 text-gray-600">
                        <p className="text-lg font-medium">{getErrorMessage(error)}</p>
                        {error && <p className="mt-2 text-sm text-gray-500">Error code: {error}</p>}
                    </div>
                </div>
                <div className="flex flex-col space-y-4 mt-6">
                    <Link 
                        href="/auth/login" 
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-center"
                    >
                        Return to Login
                    </Link>
                    <Link 
                        href="/" 
                        className="w-full px-4 py-2 text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-50 text-center"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AuthErrorPage
