"use client"
import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, RefreshCw } from 'lucide-react';
import * as Tesseract from 'tesseract.js';

const OcrComponent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setText('');
    };
    reader.readAsDataURL(file);
  };

  const recognizeText = async () => {
    if (!image) return;

    setIsProcessing(true);
    setText('');
    setProgress(0);

    try {
      // Using the Tesseract.recognize method directly which handles worker creation internally
      const result = await Tesseract.recognize(
        image,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round((m.progress || 0) * 100));
            }
          }
        }
      );
      
      setText(result.data.text);
    } catch (error) {
      console.error('OCR Error:', error);
      setText('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetComponent = () => {
    setImage(null);
    setText('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Image to Text Converter</h2>
        <p className="text-indigo-100">Extract text from images using OCR technology</p>
      </div>

      <div className="p-6">
        <div className="mb-6">
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
              image ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
          >
            {image ? (
              <div className="flex flex-col items-center">
                <Check className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-green-600 font-medium">Image uploaded successfully</p>
                <p className="text-sm text-gray-500 mt-1">Click to change image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Click to upload an image</p>
                <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, GIF</p>
              </div>
            )}
          </div>
        </div>

        {image && (
          <>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Preview</span>
                <button
                  onClick={resetComponent}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                <img
                  src={image}
                  alt="Uploaded"
                  className="max-h-64 rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={recognizeText}
                disabled={isProcessing}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium flex-1 ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing ({progress}%)
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Extract Text
                  </>
                )}
              </button>
            </div>

            {text && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Extracted Text</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">{text}</pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OcrComponent;