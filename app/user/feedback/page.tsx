'use client';

import React, { useState } from 'react';
import { useTheme } from '@/utilities/context/ThemeContext';
import { useRouter } from 'next/navigation';
import Toast, { ToastType } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { FiSend, FiMessageSquare, FiUser, FiMail } from 'react-icons/fi';

type FeedbackFormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

const Feedback = () => {
    const { isDarkMode, currentTheme } = useTheme()
    const router = useRouter();
    const [formData, setFormData] = useState<FeedbackFormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: ToastType;
    }>({
        visible: false,
        message: '',
        type: 'info'
    });

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/user/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            // Show success toast
            setToast({
                visible: true,
                type: 'success',
                message: 'Thank you for your feedback! We appreciate your input.'
            });
            
            // Reset form after successful submission
            setFormData({ name: '', email: '', subject: '', message: '' });
            
            // Optional: redirect after successful submission
            // setTimeout(() => router.push('/thank-you'), 2000);
        } catch (error) {
            // Show error toast
            setToast({
                visible: true,
                type: 'error',
                message: 'Failed to submit feedback. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dynamic styles based on theme
    const cardBgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const headingColor = isDarkMode ? 'text-blue-300' : 'text-blue-600';
    const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const inputBgColor = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
    const inputBorderColor = isDarkMode ? 'border-gray-600' : 'border-gray-300';
    const inputTextColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const labelColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
    const buttonBgColor = isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
    const iconColor = currentTheme.primary;

    return (
        <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <Toast 
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={handleCloseToast}
                duration={4000}
            />
            
            <motion.div 
                className="max-w-3xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                {/* Value statement banner */}
                <motion.div 
                    className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border-l-4 border-blue-500 flex items-start`}
                    variants={fadeIn}
                >
                    <div className={`mr-4 ${headingColor}`}>
                        <FiMessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className={`text-lg font-semibold mb-1 ${headingColor}`}>We Value Your Feedback</h2>
                        <p className={subTextColor}>Your insights help us improve our platform and better serve your needs. Every comment is reviewed by our team.</p>
                    </div>
                </motion.div>
                
                <h1 className={`text-3xl font-bold mb-6 ${headingColor}`}>
                    Share Your Thoughts
                </h1>
                
                <motion.div 
                    className={`p-6 md:p-8 rounded-lg shadow-lg ${cardBgColor}`}
                    variants={staggerChildren}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={staggerChildren}>
                            <motion.div variants={fadeIn}>
                                <label 
                                    htmlFor="name" 
                                    className={`block mb-2 font-medium ${labelColor} flex items-center`}
                                >
                                    <FiUser className="mr-2" style={{ color: iconColor }} />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder='Your name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-md border ${
                                        inputBgColor
                                    } ${inputBorderColor} ${inputTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                />
                            </motion.div>
                            
                            <motion.div variants={fadeIn}>
                                <label 
                                    htmlFor="email" 
                                    className={`block mb-2 font-medium ${labelColor} flex items-center`}
                                >
                                    <FiMail className="mr-2" style={{ color: iconColor }} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder='Email address'
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-md border ${
                                        inputBgColor
                                    } ${inputBorderColor} ${inputTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                />
                            </motion.div>
                        </motion.div>
                        
                        <motion.div variants={fadeIn}>
                            <label 
                                htmlFor="subject" 
                                className={`block mb-2 font-medium ${labelColor}`}
                            >
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder='What is your feedback about?'
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 rounded-md border ${
                                    inputBgColor
                                } ${inputBorderColor} ${inputTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                            />
                        </motion.div>
                        
                        <motion.div variants={fadeIn}>
                            <label 
                                htmlFor="message" 
                                className={`block mb-2 font-medium ${labelColor}`}
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                placeholder='Share your experience, suggestions, or concerns...'
                                onChange={handleChange}
                                required
                                rows={6}
                                className={`w-full px-4 py-3 rounded-md border ${
                                    inputBgColor
                                } ${inputBorderColor} ${inputTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                            />
                        </motion.div>
                        
                        <motion.div variants={fadeIn} className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center ${
                                    buttonBgColor
                                } text-white shadow-md hover:shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <FiSend className="mr-2" />
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
                
                <motion.div 
                    className={`mt-6 text-center ${subTextColor} text-sm`}
                    variants={fadeIn}
                >
                    We typically respond to feedback within 2-3 business days if a response is needed.
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Feedback;