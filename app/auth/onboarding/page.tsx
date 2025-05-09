// app/auth/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      // Not authenticated, redirect to login
      router.push('/auth/login');
      return;
    }

    // Check if user is new
    if (session.user.new_user) {
      // New user, stay on this page
      setLoading(false);
    } else {
      // Existing user, redirect to dashboard
      router.push('/user/dashboard');
    }
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Platform!</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Complete Your Registration</h2>
        <p className="mb-4">
          Thanks for signing up! Please complete your profile to get started.
        </p>
        
        {/* Form could be added here or imported from a component */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              defaultValue={session?.user?.username || ''}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              defaultValue={session?.user?.name || ''}
            />
          </div>
          
          <div className="pt-4">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              onClick={() => {
                // Here you would save the profile data
                // and then redirect to dashboard
                router.push('/user/dashboard');
              }}
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}