'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileImage, Globe, Zap, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/quilted-gallery/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/utilities/context/ThemeContext';

const WhatNext = () => {
  const { isDarkMode, currentTheme, elementColors } = useTheme();

  // Enhance light mode colors for better visual appeal
  const cardBgColor = isDarkMode ? 'bg-gray-800/80' : 'bg-white/90';
  const pageBgColor = isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const feedbackBgColor = isDarkMode ? 'bg-gray-800/50' : 'bg-white/80';
  const cardHoverBgColor = isDarkMode ? 'hover:bg-gray-700/90' : 'hover:bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-100';
  const cardShadow = isDarkMode ? 'shadow-md shadow-gray-900/30' : 'shadow-xl shadow-blue-900/5';

  // Define color type for type safety
    type FeatureColor = 'purple' | 'blue' | 'green' | 'yellow';
  // Feature data for easy mapping
  const features = [
    {
      icon: FileImage,
      color: 'purple' as FeatureColor,
      title: 'Deeper Insights: Image & Video Analysis',
      description: 'Upload images and videos to your journal for even deeper personal insight.',
      content: 'Our AI will analyze the visual content you share, helping you understand the environments, people, and moments that matter most to you. Connect visual experiences with your written and spoken reflections.'
    },
    {
      icon: MessageSquare,
      color: 'blue'as FeatureColor,
      title: 'Transcribing Meetings & Lectures',
      description: 'Turn any audio conversation into searchable, analyzable text.',
      content: 'Record important meetings or lectures, and Force will automatically transcribe them for you. You\'ll be able to highlight key points, search for specific topics, and even get AI-powered summaries.'
    },
    {
      icon: Zap,
      color: 'green'as FeatureColor,
      title: 'Force Experiences',
      description: 'Guided reflection sessions designed for specific life events.',
      content: 'Whether you\'re preparing for a job interview, processing a breakup, or celebrating a personal win, Force Experiences will guide you through specially designed reflection sessions tailored to important life moments.'
    },
    {
      icon: Globe,
      color: 'yellow'as FeatureColor,
      title: 'Force Community',
      description: 'Connect with others on their personal growth journeys.',
      content: 'Join groups focused on specific goals or interests, share selected insights from your journal (always with your explicit permission), and learn from others\' reflections to accelerate your personal growth.'
    }
  ];

  // Enhanced color palette for light mode
  const featureColors = {
    purple: {
      bg: isDarkMode ? 'bg-purple-900/30' : 'bg-force-purple/25',
      text: isDarkMode ? 'text-purple-400' : 'text-force-purple',
      border: isDarkMode ? 'border-purple-800/50' : 'border-force-purple/40',
      shadow: isDarkMode ? 'shadow-purple-900/20' : 'shadow-force-purple/20',
      gradient: isDarkMode ? '' : 'bg-gradient-to-br from-purple-50 to-force-purple/10'
    },
    blue: {
      bg: isDarkMode ? 'bg-blue-900/30' : 'bg-force-blue/25',
      text: isDarkMode ? 'text-blue-400' : 'text-force-blue',
      border: isDarkMode ? 'border-blue-800/50' : 'border-force-blue/40',
      shadow: isDarkMode ? 'shadow-blue-900/20' : 'shadow-force-blue/20',
      gradient: isDarkMode ? '' : 'bg-gradient-to-br from-blue-50 to-force-blue/10'
    },
    green: {
      bg: isDarkMode ? 'bg-green-900/30' : 'bg-force-green/25',
      text: isDarkMode ? 'text-green-400' : 'text-force-green',
      border: isDarkMode ? 'border-green-800/50' : 'border-force-green/40',
      shadow: isDarkMode ? 'shadow-green-900/20' : 'shadow-force-green/20',
      gradient: isDarkMode ? '' : 'bg-gradient-to-br from-green-50 to-force-green/10'
    },
    yellow: {
      bg: isDarkMode ? 'bg-yellow-900/30' : 'bg-force-yellow/25',
      text: isDarkMode ? 'text-yellow-400' : 'text-force-yellow',
      border: isDarkMode ? 'border-yellow-800/50' : 'border-force-yellow/40',
      shadow: isDarkMode ? 'shadow-yellow-900/20' : 'shadow-force-yellow/20',
      gradient: isDarkMode ? '' : 'bg-gradient-to-br from-yellow-50 to-force-yellow/10'
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 400
      }
    }
  };

  return (
    <motion.div 
      className={`transition-colors duration-300 ${pageBgColor} p-6 rounded-xl min-h-screen`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className={`mb-8 ${textColor} max-w-2xl mx-auto text-center`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-3">What's Next for Force</h1>
        <p className={`${mutedTextColor} text-lg`}>
          Welcome to the Force beta! We're focused on perfecting your AI journaling companion, 
          but we're also dreaming big. Here's a sneak peek at exciting features we're building 
          to support your growth journey even further.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            className="h-full"
          >
            <Card className={`feature-coming-soon border ${borderColor} ${cardBgColor} transition-all duration-300 h-full
                              ${cardHoverBgColor} cursor-pointer relative overflow-hidden backdrop-blur-sm
                              ${cardShadow} ${featureColors[feature?.color].gradient} group`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${feature.color === 'purple' ? 'purple' : feature.color === 'blue' ? 'blue' : feature.color === 'green' ? 'green' : 'yellow'}-400 to-transparent opacity-60`}></div>
              <CardHeader className="pb-2">
                <motion.div 
                  className={`w-14 h-14 ${featureColors[feature?.color].bg} rounded-xl flex items-center justify-center mb-4
                              border ${featureColors[feature?.color].border} shadow-inner`}
                  variants={iconVariants}
                  whileHover="hover"
                >
                  <feature.icon className={`w-7 h-7 ${featureColors[feature?.color].text} ${isDarkMode ? 'opacity-90' : 'opacity-100'}`} strokeWidth={2} />
                </motion.div>
                <CardTitle className={`flex items-center gap-2 ${textColor} text-xl`}>
                  {feature.title}
                  <motion.span 
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ml-auto
                                ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200 text-gray-600'} 
                                whitespace-nowrap`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Clock className="w-3 h-3" /> Coming Soon
                  </motion.span>
                </CardTitle>
                <CardDescription className={`${mutedTextColor} text-sm font-medium mt-1`}>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${mutedTextColor} leading-relaxed`}>
                  {feature.content}
                </p>
                <motion.div 
                  className={`mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                >
                  <div className={`flex items-center ${featureColors[feature.color].text} text-sm font-medium`}>
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              </CardContent>
              
              {/* Enhanced gradient border effect */}
              <motion.div 
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className={`absolute inset-0 rounded-lg border-2 ${featureColors[feature.color].border}`}></div>
              </motion.div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className={`mt-12 text-center p-8 ${feedbackBgColor} rounded-2xl transition-colors duration-300 max-w-2xl mx-auto shadow-xl backdrop-blur-sm`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <h3 className={`text-xl font-semibold mb-3 ${textColor}`}>Which of these ideas excites you most?</h3>
        <p className={`${mutedTextColor} mb-6`}>
          We'd love your feedback to help us prioritize our development roadmap.
        </p>
        <motion.div
          onClick={() => window.open('/user/feedback', '_blank')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button className="bg-force-purple hover:bg-force-purple/90 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300">
            Share Your Feedback
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WhatNext;