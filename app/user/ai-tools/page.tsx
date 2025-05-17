import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const AItools = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Image to Text Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-48">
            <Image 
              src="/images/img-to-text.png" 
              alt="Image to Text Extraction" 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Image to Text Extraction</h2>
            <p className="text-gray-600 mb-4">
              Extract text from images using our advanced AI-powered OCR technology. 
              Upload any image containing text and get accurate text extraction in seconds.
            </p>
            <Link href="/user/ocr" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Extract Text from Images
            </Link>
          </div>
        </div>

        {/* Video Analysis Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-48">
            <Image 
              src="/images/video-analysis.jpg" 
              alt="Video Analysis" 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Video Analysis</h2>
            <p className="text-gray-600 mb-4">
              Analyze videos for content, objects, activities, and more using AI. 
              Get insights and data from your video content automatically.
            </p>
            <div className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-not-allowed">
              <div className="flex items-center">
                <span>Coming Soon</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Document Summarization Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-48">
            <Image 
              src="/images/document-summary.jpg" 
              alt="Document Summarization" 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Document Summarization</h2>
            <p className="text-gray-600 mb-4">
              Automatically generate concise summaries of lengthy documents.
              Save time and extract key information with our AI summarization tool.
            </p>
            <div className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-not-allowed">
              <div className="flex items-center">
                <span>Coming Soon</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Speech-to-Text Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-48">
            <Image 
              src="/images/speech-to-text.jpg" 
              alt="Speech to Text" 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Speech-to-Text</h2>
            <p className="text-gray-600 mb-4">
              Convert spoken language into written text with high accuracy.
              Perfect for transcribing meetings, lectures, and interviews.
            </p>
            <div className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-not-allowed">
              <div className="flex items-center">
                <span>Coming Soon</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Image Generation Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-48">
            <Image 
              src="/images/image-generation.jpg" 
              alt="AI Image Generation" 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">AI Image Generation</h2>
            <p className="text-gray-600 mb-4">
              Create stunning, unique images from text descriptions.
              Generate artwork, product visualizations, and more with AI.
            </p>
            <div className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-not-allowed">
              <div className="flex items-center">
                <span>Coming Soon</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Translation Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-48">
            <Image 
              src="/images/translation.jpg" 
              alt="AI Translation" 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">AI Translation</h2>
            <p className="text-gray-600 mb-4">
              Translate content between multiple languages with contextual accuracy.
              Support for documents, websites, and real-time translation.
            </p>
            <div className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-not-allowed">
              <div className="flex items-center">
                <span>Coming Soon</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About Our AI Tools</h2>
        <p className="text-gray-700">
          Our AI-powered tools are designed to help you extract information and gain insights from various media types. 
          From extracting text from images to analyzing video content, our tools leverage cutting-edge artificial intelligence 
          to deliver accurate results quickly and efficiently. We're constantly working to improve and expand our AI capabilities.
        </p>
        <p className="text-gray-700 mt-4">
          Stay tuned as we roll out new tools throughout the year. Our roadmap includes advanced features for document analysis,
          media processing, language translation, and creative content generation to help streamline your workflows.
        </p>
      </div>
    </div>
  )
}

export default AItools
