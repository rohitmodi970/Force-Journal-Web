// app/user/refresh-google-token/page.tsx
'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshGoogleToken() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Checking your Google integration...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    // If not logged in, redirect to login
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    checkTokenStatus();
  }, [status, router]);

  const checkTokenStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/refresh');
      const data = await response.json();

      if (!data.success) {
        setError("We couldn't verify your Google connection.");
        setIsLoading(false);
        return;
      }

      // If no Google token or token is valid and not expiring soon, redirect back
      if (!data.tokenInfo.hasGoogleToken) {
        setError("You don't have a Google connection set up.");
        setIsLoading(false);
        return;
      }

      // If token is still valid, try refreshing it automatically
      if (!data.tokenInfo.isExpired) {
        await attemptTokenRefresh();
      } else {
        // Token is expired, show reconnect button
        setMessage("Your Google connection needs to be refreshed.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking token:", error);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const attemptTokenRefresh = async () => {
    try {
      setMessage("Attempting to refresh your Google connection...");
      
      const refreshResponse = await fetch('/api/auth/refresh', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const refreshData = await refreshResponse.json();
      
      if (refreshData.success) {
        setMessage("Connection refreshed successfully! Redirecting...");
        // Redirect back to previous page or dashboard after short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        // Manual reconnect needed
        setMessage("Your Google connection needs to be reauthorized.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Failed to refresh your Google connection.");
      setIsLoading(false);
    }
  };

  const handleGoogleReconnect = () => {
    signIn('google', { 
      callbackUrl: '/user/dashboard',
      redirect: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Google Connection
            </h2>
            
            <div className="mt-8 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">{message}</p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push('/user/dashboard')}
                    className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-6">
                    {message}
                  </p>
                  
                  <button
                    onClick={handleGoogleReconnect}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Reconnect with Google
                  </button>
                  
                  <button
                    onClick={() => router.back()}
                    className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}