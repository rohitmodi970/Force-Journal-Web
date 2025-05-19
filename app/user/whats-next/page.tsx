'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/utilities/context/ThemeContext'
import { FiUsers, FiMessageCircle, FiBook, FiGlobe } from 'react-icons/fi'

const WhatsNext = () => {
  const { isDarkMode, elementColors, currentTheme } = useTheme()
  
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: isDarkMode 
        ? "0px 10px 20px rgba(0,0,0,0.3)" 
        : "0px 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  }

  // Derive theme-based styles
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900'
  const cardBgColor = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600'
  const headingColor = isDarkMode ? 'text-gray-100' : 'text-gray-800'
  const infoBoxBg = isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'
  const infoBoxBorder = isDarkMode ? 'border-gray-700' : 'border-blue-100'
  const disabledBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
  const disabledText = isDarkMode ? 'text-gray-300' : 'text-gray-800'

  // Button with current theme primary color
  const PrimaryButton = ({ children, href }: { children: React.ReactNode, href?: string }) => (
    <Link href={href || "#"}>
      <motion.div 
        className={`inline-block px-4 py-2 rounded-md text-white transition-colors`}
        style={{ backgroundColor: elementColors.button }}
        whileHover={{ scale: 1.05, backgroundColor: currentTheme.hover }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.div>
    </Link>
  )

  return (
    <div className={`container mx-auto py-12 px-4 sm:px-6 ${bgColor} ${textColor}`}>
      <motion.h1 
        className="text-3xl md:text-4xl font-bold mb-2 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        What's Next
      </motion.h1>
      
      <motion.p 
        className={`text-center mb-8 md:mb-12 ${subTextColor}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Explore our AI tools and community features to enhance your experience
      </motion.p>
      
      <motion.div 
        className="mb-12 md:mb-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${headingColor} flex items-center`}>
          <span className="inline-block mr-2">⚡</span> AI Tools
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
        >
          {/* Image to Text Card */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="relative h-40 md:h-48">
              <Image 
                src="/images/img-to-text.png" 
                alt="Image to Text Extraction" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Image to Text Extraction</h2>
              <p className={`mb-4 ${subTextColor}`}>
                Extract text from images using our advanced AI-powered OCR technology. 
                Upload any image containing text and get accurate text extraction in seconds.
              </p>
              <PrimaryButton href="/user/ocr">
                Extract Text from Images
              </PrimaryButton>
            </div>
          </motion.div>

          {/* Video Analysis Card */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="relative h-40 md:h-48">
              <Image 
                src="/images/video-analysis.jpg" 
                alt="Video Analysis" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Video Analysis</h2>
              <p className={`mb-4 ${subTextColor}`}>
                Analyze videos for content, objects, activities, and more using AI. 
                Get insights and data from your video content automatically.
              </p>
              <div className={`inline-block ${disabledBg} ${disabledText} px-4 py-2 rounded cursor-not-allowed`}>
                <div className="flex items-center">
                  <span>Coming Soon</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Document Summarization Card */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="relative h-40 md:h-48">
              <Image 
                src="/images/document-summary.jpg" 
                alt="Document Summarization" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Document Summarization</h2>
              <p className={`mb-4 ${subTextColor}`}>
                Automatically generate concise summaries of lengthy documents.
                Save time and extract key information with our AI summarization tool.
              </p>
              <div className={`inline-block ${disabledBg} ${disabledText} px-4 py-2 rounded cursor-not-allowed`}>
                <div className="flex items-center">
                  <span>Coming Soon</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Speech-to-Text Card */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="relative h-40 md:h-48">
              <Image 
                src="/images/speech-to-text.jpg" 
                alt="Speech to Text" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Speech-to-Text</h2>
              <p className={`mb-4 ${subTextColor}`}>
                Convert spoken language into written text with high accuracy.
                Perfect for transcribing meetings, lectures, and interviews.
              </p>
              <div className={`inline-block ${disabledBg} ${disabledText} px-4 py-2 rounded cursor-not-allowed`}>
                <div className="flex items-center">
                  <span>Coming Soon</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Generation Card */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="relative h-40 md:h-48">
              <Image 
                src="/images/image-generation.jpg" 
                alt="AI Image Generation" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">AI Image Generation</h2>
              <p className={`mb-4 ${subTextColor}`}>
                Create stunning, unique images from text descriptions.
                Generate artwork, product visualizations, and more with AI.
              </p>
              <div className={`inline-block ${disabledBg} ${disabledText} px-4 py-2 rounded cursor-not-allowed`}>
                <div className="flex items-center">
                  <span>Coming Soon</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Translation Card */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="relative h-40 md:h-48">
              <Image 
                src="/images/translation.jpg" 
                alt="AI Translation" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">AI Translation</h2>
              <p className={`mb-4 ${subTextColor}`}>
                Translate content between multiple languages with contextual accuracy.
                Support for documents, websites, and real-time translation.
              </p>
              <div className={`inline-block ${disabledBg} ${disabledText} px-4 py-2 rounded cursor-not-allowed`}>
                <div className="flex items-center">
                  <span>Coming Soon</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Community Features */}
      <motion.div 
        className="mb-12 md:mb-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${headingColor} flex items-center`}>
          <span className="inline-block mr-2">🤝</span> Force Community Features
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          variants={containerVariants}
        >
          {/* Community Forums */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className={`p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start`}
                style={{ color: currentTheme.primary }}>
              <FiMessageCircle className="text-3xl md:text-4xl mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-center sm:text-left">Community Forums</h2>
                <p className={`mb-4 ${subTextColor} text-center sm:text-left`}>
                  Connect with other Force users to discuss topics, share ideas, and get help.
                  Our moderated forums provide a supportive environment for collaboration.
                </p>
                <div className="text-center sm:text-left">
                  <PrimaryButton href="/user/community/forums">
                    Join Discussions
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Expert Network */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className={`p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start`} style={{ color: currentTheme.primary }}>
              <FiUsers className="text-3xl md:text-4xl mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-center sm:text-left">Expert Network</h2>
                <p className={`mb-4 ${subTextColor} text-center sm:text-left`}>
                  Connect with AI experts, data scientists, and experienced practitioners.
                  Schedule 1-on-1 consultations or participate in expert-led workshops.
                </p>
                <div className="text-center sm:text-left">
                  <PrimaryButton href="/user/community/experts">
                    Connect with Experts
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Learning Resources */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className={`p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start`} style={{ color: currentTheme.primary }}>
              <FiBook className="text-3xl md:text-4xl mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-center sm:text-left">Learning Resources</h2>
                <p className={`mb-4 ${subTextColor} text-center sm:text-left`}>
                  Access tutorials, guides, and educational content to enhance your AI skills.
                  From beginner concepts to advanced techniques, expand your knowledge.
                </p>
                <div className="text-center sm:text-left">
                  <PrimaryButton href="/user/community/learning">
                    Explore Resources
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Events & Webinars */}
          <motion.div 
            className={`rounded-lg overflow-hidden ${cardBgColor} shadow-lg`}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className={`p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start`} style={{ color: currentTheme.primary }}>
              <FiGlobe className="text-3xl md:text-4xl mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-center sm:text-left">Events & Webinars</h2>
                <p className={`mb-4 ${subTextColor} text-center sm:text-left`}>
                  Stay up to date with the latest AI trends through our virtual events.
                  Participate in webinars, workshops, and networking opportunities.
                </p>
                <div className="text-center sm:text-left">
                  <PrimaryButton href="/user/community/events">
                    View Upcoming Events
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className={`mt-8 md:mt-12 p-6 md:p-8 rounded-xl shadow-lg ${infoBoxBg} border ${infoBoxBorder}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4">About Our Platform</h2>
        <p className={subTextColor}>
          The Force platform combines cutting-edge AI tools with a vibrant community to support your projects and growth.
          Our AI-powered tools help you extract information and gain insights from various media types, while our 
          community features connect you with like-minded individuals and experts.
        </p>
        <p className={`mt-4 ${subTextColor}`}>
          Stay tuned as we roll out new tools and features throughout the year. Our roadmap includes advanced capabilities 
          for data analysis, media processing, language translation, and creative content generation, as well as 
          expanded community resources to help you connect, learn, and innovate.
        </p>
        
        <motion.div 
          className="mt-6 text-center md:text-left"
          whileHover={{ scale: 1.02 }}
        >
          <Link href="/user/feedback">
            <div 
              className="inline-block text-white px-6 py-3 rounded-md transition-colors" 
              style={{ backgroundColor: elementColors.button }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentTheme.hover}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = elementColors.button}
            >
              Share Your Feedback
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WhatsNext