"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Check, RefreshCw, PenLine, Sparkles, Bookmark, ChevronRight, Layout, Image } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { motion } from 'framer-motion';
import { useTheme } from '@/utilities/context/ThemeContext';

// Define template type
interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  tags: string[];
  journalType: string;
}

// Props interface for the component
interface NewEntryLandingProps {
  onStartNewEntry: (props: {
    title: string;
    content: string;
    tags: string[];
    journalType: string;
  }) => void;
}

const NewEntryLanding: React.FC<NewEntryLandingProps> = ({ onStartNewEntry }) => {
  // Get theme context
  const { currentTheme, isDarkMode, elementColors, currentFont } = useTheme();
  
  // States for OCR functionality
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'blank' | 'template' | 'ocr'>('blank');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [workerReady, setWorkerReady] = useState<boolean>(false);
  
  // State for title extracted from OCR
  const [ocrTitle, setOcrTitle] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use a local reference to hold the worker instance
  const workerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Tesseract worker
    const initWorker = async () => {
      try {
        // Use static CDN URLs instead of blob URLs
        const worker = await createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round((m.progress || 0) * 100));
            }
          },
          // Specify explicit paths to avoid CSP issues with blob URLs
          workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v4.0.2/dist/worker.min.js',
          corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v4.0.2/tesseract-core.wasm.js',
          langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        });

        workerRef.current = worker;
        setWorkerReady(true);
      } catch (error) {
        console.error("Error initializing Tesseract worker:", error);
      }
    };

    initWorker();

    // Cleanup worker when component unmounts
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate().catch(console.error);
      }
    };
  }, []);

  // Templates for journal entries
  const templates: Template[] = [
    {
      id: 'daily-reflection',
      title: 'Daily Reflection',
      description: 'Reflect on your day with guided prompts',
      content: `What went well today?\n\nWhat challenges did I face?\n\nWhat am I grateful for?\n\nWhat did I learn today?\n\nHow do I feel right now?`,
      icon: <PenLine size={24} />,
      tags: ['reflection', 'daily'],
      journalType: 'personal'
    },
    {
      id: 'gratitude-journal',
      title: 'Gratitude Journal',
      description: 'Focus on things you\'re thankful for',
      content: `Three things I'm grateful for today:\n\n1. \n\n2. \n\n3. \n\nWhy these matter to me:\n\nHow gratitude is changing my perspective:`,
      icon: <Sparkles size={24} />,
      tags: ['gratitude', 'positivity'],
      journalType: 'gratitude'
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting',
      description: 'Plan and track your goals',
      content: `My goal:\n\nWhy this matters to me:\n\nSteps to achieve this:\n\n1. \n\n2. \n\n3. \n\nPotential obstacles and solutions:\n\nDeadline:`,
      icon: <Bookmark size={24} />,
      tags: ['goals', 'planning'],
      journalType: 'goals'
    },
    {
      id: 'creative-writing',
      title: 'Creative Writing',
      description: 'Express your creativity',
      content: `Story title:\n\nMain character(s):\n\nSetting:\n\nPlot idea:\n\n`,
      icon: <FileText size={24} />,
      tags: ['creative', 'writing'],
      journalType: 'creative'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setExtractedText('');
    };
    reader.readAsDataURL(file);
  };

  const recognizeText = async () => {
    if (!image || !workerRef.current || !workerReady) return;

    setIsProcessing(true);
    setExtractedText('');
    setProgress(0);

    try {
      // Use the worker directly for OCR
      const result = await workerRef.current.recognize(image);
      
      const fullText = result.data.text;
      setExtractedText(fullText);
      
      // Extract title from first line if possible
      const lines: string[] = fullText.split('\n').filter((line: string) => line.trim().length > 0);
      if (lines.length > 0) {
        // Use the first line as title if it's not too long
        const potentialTitle = lines[0].trim();
        if (potentialTitle.length <= 50) {
          setOcrTitle(potentialTitle);
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setExtractedText('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetOcr = () => {
    setImage(null);
    setExtractedText('');
    setOcrTitle('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartWithOcr = () => {
    onStartNewEntry({
      title: ocrTitle || 'Extracted Journal Entry',
      content: extractedText,
      tags: ['extracted'],
      journalType: 'personal'
    });
  };

  const handleStartWithTemplate = () => {
    if (selectedTemplate) {
      onStartNewEntry({
        title: selectedTemplate.title,
        content: selectedTemplate.content,
        tags: selectedTemplate.tags,
        journalType: selectedTemplate.journalType
      });
    }
  };

  const handleStartBlankEntry = () => {
    onStartNewEntry({
      title: '',
      content: '',
      tags: [],
      journalType: 'personal'
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Theme-based styles
  const headerBgStyle = { backgroundColor: currentTheme.primary };
  const activeTabStyle = { color: currentTheme.primary, borderBottomColor: currentTheme.primary };
  const iconBgStyle = { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : currentTheme.light };
  const buttonStyle = { 
    backgroundColor: elementColors.button,
    color: isDarkMode ? '#ffffff' : '#ffffff',
    ':hover': { backgroundColor: currentTheme.hover }
  };
  const selectedTemplateStyle = {
    borderColor: currentTheme.primary,
    backgroundColor: currentTheme.light
  };
  const selectedTemplateBgStyle = {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : currentTheme.light
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 font-${currentFont}`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl overflow-hidden`}>
        <div style={headerBgStyle} className="px-6 py-5">
          <h1 className="text-2xl font-bold text-white">New Journal Entry</h1>
          <p className="text-white opacity-80">Choose how you want to start your journal entry</p>
        </div>

        {/* Tab navigation */}
        <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('blank')}
            className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
              activeTab === 'blank' 
                ? 'border-b-2' 
                : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
            style={activeTab === 'blank' ? activeTabStyle : undefined}
          >
            <div className="flex justify-center items-center gap-2">
              <PenLine size={18} />
              <span>Start from Scratch</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
              activeTab === 'template' 
                ? 'border-b-2' 
                : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
            style={activeTab === 'template' ? activeTabStyle : undefined}
          >
            <div className="flex justify-center items-center gap-2">
              <Layout size={18} />
              <span>Use Template</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
              activeTab === 'ocr' 
                ? 'border-b-2' 
                : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
            style={activeTab === 'ocr' ? activeTabStyle : undefined}
          >
            <div className="flex justify-center items-center gap-2">
              <Image size={18} />
              <span>Extract from Image</span>
            </div>
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Blank Entry Tab */}
          {activeTab === 'blank' && (
            <motion.div 
              className="py-8 flex flex-col items-center text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={iconBgStyle}
                variants={itemVariants}
              >
                <PenLine size={40} style={{ color: currentTheme.primary }} />
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-xl font-bold mb-3">Start with a Blank Page</motion.h2>
              <motion.p variants={itemVariants} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} max-w-md mb-8`}>
                Begin with a clean slate and write whatever comes to mind. 
                Perfect for free-form journaling without any constraints.
              </motion.p>
              <motion.button
                variants={itemVariants}
                onClick={handleStartBlankEntry}
                className="px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={buttonStyle}
              >
                Start Writing <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* Template Tab */}
          {activeTab === 'template' && (
            <motion.div 
              className="py-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2 variants={itemVariants} className="text-xl font-bold mb-6">Choose a Template</motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    variants={itemVariants}
                    className={`border rounded-lg p-5 cursor-pointer hover:shadow-md transition-all ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    } ${
                      selectedTemplate?.id === template.id 
                        ? 'shadow-md' 
                        : ''
                    }`}
                    style={selectedTemplate?.id === template.id ? selectedTemplateStyle : undefined}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start">
                      <div className="p-3 rounded-full mr-4"
                        style={selectedTemplate?.id === template.id 
                          ? selectedTemplateBgStyle
                          : { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                      >
                        {template.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{template.title}</h3>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-2`}>{template.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map(tag => (
                            <span 
                              key={tag} 
                              className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div variants={itemVariants} className="mt-8 flex justify-center">
                <button
                  onClick={handleStartWithTemplate}
                  disabled={!selectedTemplate}
                  className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 ${
                    !selectedTemplate && 'opacity-50 cursor-not-allowed'
                  } transition-colors`}
                  style={selectedTemplate ? buttonStyle : {
                    backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    color: isDarkMode ? '#9CA3AF' : '#9CA3AF'
                  }}
                >
                  Use Selected Template <ChevronRight size={18} />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* OCR Tab */}
          {activeTab === 'ocr' && (
            <motion.div 
              className="py-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2 variants={itemVariants} className="text-xl font-bold mb-2">Extract Text from Image</motion.h2>
              <motion.p variants={itemVariants} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-6`}>
                Upload an image of handwritten or printed text and we'll extract the content for your journal entry
              </motion.p>
              
              <motion.div variants={itemVariants} className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <div 
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    image 
                      ? `${isDarkMode ? 'border-green-600 bg-green-900 bg-opacity-20' : 'border-green-400 bg-green-50'}`
                      : `${isDarkMode 
                          ? 'border-gray-600 hover:border-gray-400 hover:bg-gray-800' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`
                  }`}
                >
                  {image ? (
                    <div className="flex flex-col items-center">
                      <Check className={`h-12 w-12 ${isDarkMode ? 'text-green-400' : 'text-green-500'} mb-2`} />
                      <p className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>Image uploaded successfully</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className={`h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mb-2`} />
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Click to upload an image</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Supports JPG, PNG, GIF</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {image && (
                <motion.div variants={containerVariants}>
                  <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preview</span>
                      <button
                        onClick={resetOcr}
                        className={`text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-2 flex justify-center`}>
                      <img
                        src={image}
                        alt="Uploaded"
                        className="max-h-64 rounded"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex gap-4 mb-6">
                    <button
                      onClick={recognizeText}
                      disabled={isProcessing || !workerReady}
                      className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium flex-1 ${
                        isProcessing || !workerReady ? 'bg-gray-400 cursor-not-allowed' : ''
                      }`}
                      style={isProcessing || !workerReady ? undefined : buttonStyle}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing ({progress}%)
                        </>
                      ) : !workerReady ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading OCR Engine...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Extract Text
                        </>
                      )}
                    </button>
                  </motion.div>

                  {extractedText && (
                    <motion.div variants={itemVariants}>
                      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Extracted Text</h3>
                      
                      <div className="mb-6">
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Title</label>
                        <input 
                          type="text"
                          value={ocrTitle}
                          onChange={(e) => setOcrTitle(e.target.value)}
                          placeholder="Journal Entry Title"
                          className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-opacity-50' 
                              : 'border border-gray-300 focus:ring-opacity-50'
                          }`}
                          style={{ 
                            borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                            '--focus-ring-color': currentTheme.primary
                          } as React.CSSProperties}
                        />
                      </div>
                      
                      <div className={`${
                        isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                      } border rounded-lg p-4 mb-6`}>
                        <pre className={`whitespace-pre-wrap font-mono text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        } max-h-60 overflow-y-auto`}>
                          {extractedText}
                        </pre>
                      </div>
                      
                      <div className="flex justify-center">
                        <button
                          onClick={handleStartWithOcr}
                          className="px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                          style={buttonStyle}
                        >
                          Continue with Extracted Text <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewEntryLanding;