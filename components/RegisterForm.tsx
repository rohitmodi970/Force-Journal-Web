"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { SkipBack } from 'lucide-react';

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword: string;
  ip_address: string;
}

const RegisterForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState: RegistrationData = {
    email: '',
    password: '',
    name: '',
    phone: '+91 ',
    confirmPassword: '',
    ip_address: '',
  };

  const [formData, setFormData] = useState<RegistrationData>(initialFormState);
  const [error, setError] = useState<string>('');

  // Fetch IP address on component mount
  useEffect(() => {
    const getIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ip_address: data.ip
        }));
      } catch (error) {
        console.error('Failed to fetch IP address:', error);
      }
    };

    getIpAddress();
  }, [isSubmitting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setError('');
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate form
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const registrationResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone.trim(),
          ip_address: formData.ip_address || '0.0.0.0', // Send IP address and provide fallback
        }),
      });

      if (!registrationResponse.ok) {
        const data = await registrationResponse.json();
        setError(data.error || 'Registration failed');
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        ipAddress: formData.ip_address || '0.0.0.0'
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        setIsSubmitting(false);
        return;
      }

      // Reset form after successful registration
      resetForm();
      
      // Redirect to dashboard
      router.push('/');

    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Handle phone input with country code
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    const countryCode = formData.phone.split(' ')[0] || '+91';
    setFormData({
      ...formData,
      phone: `${countryCode} ${phoneNumber}`,
    });
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    // Extract phone number or use empty string if not available
    const phoneNumber = formData.phone.includes(' ') ? formData.phone.split(' ')[1] : '';
    setFormData({
      ...formData,
      phone: `${countryCode} ${phoneNumber}`,
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8 flex flex-col items-center justify-center'>
      <div className='container mx-auto max-w-lg px-6 py-8 bg-gray-800 rounded-xl shadow-2xl'>
        <h1 className='font-bold text-3xl text-center mb-6'>
          Register Your Organization
        </h1>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegistration} className="flex flex-col gap-5">
          <div className="w-full space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone *
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="countryCode"
                  name="countryCode"
                  value={formData.phone.split(' ')[0]}
                  onChange={handleCountryCodeChange}
                  className="px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+81">🇯🇵 +81</option>
                </select>
                <input
                  id="phone"
                  name="phoneNumber"
                  type="text"
                  value={formData.phone.includes(' ') ? formData.phone.split(' ')[1] : ''}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-2 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Log in
            </a>
          </p>
        </form>
      </div>
      <div className="fixed bottom-8 right-8 z-50 ">
              <Link
                href="/"
                className="flex items-center gap-2 bg-red-600 hover:bg-primary/90 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
              >
                <SkipBack className="w-5 h-5" />
                <span>Back</span>
              </Link>
            </div>
    </div>
  );
};

export default RegisterForm;