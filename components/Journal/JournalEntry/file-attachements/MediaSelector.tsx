import React, { useRef, useState, useCallback } from 'react';
import { Image, Mic, FileText, Film, Plus, StopCircle } from 'lucide-react';
import { MediaFile, MediaLimits } from '../../types';

// Add helper function for WAV conversion
function audioBufferToWAV(buffer: AudioBuffer): Promise<Blob> {
  return new Promise(resolve => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2;
    const sampleRate = buffer.sampleRate;
    
    // Create the WAV file
    const audioData = new ArrayBuffer(44 + length);
    const view = new DataView(audioData);
    
    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeUTFBytes(view, 8, 'WAVE');
    
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    
    // Data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write the PCM samples
    const data = new Float32Array(buffer.getChannelData(0));
    let offset = 44;
    
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    
    resolve(new Blob([view], { type: 'audio/wav' }));
  });
}

function writeUTFBytes(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

interface MediaSelectorProps {
  onFileSelect: (files: FileList | null, type: 'image' | 'audio' | 'video' | 'document') => void;
  mediaLimits: MediaLimits;
  disabled?: boolean;
  currentFiles: MediaFile[];
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  onFileSelect,
  mediaLimits,
  disabled = false,
  currentFiles
}) => {
  const fileInputRefs = {
    image: useRef<HTMLInputElement>(null),
    audio: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    document: useRef<HTMLInputElement>(null),
  };

  // Added states for tooltips and audio recording
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [showAudioOptions, setShowAudioOptions] = useState(false);

  // Function to start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Use higher quality audio settings for better analysis results
      const recorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 128000,
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 
          'audio/webm;codecs=opus' : 'audio/webm'
      });
      
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        // Create a more compatible audio format - MP3 is more widely supported
        // First create the initial blob from recording chunks
        const webmBlob = new Blob(chunks, { type: 'audio/webm' });
        
        try {
          // Convert to WAV format which is better supported by most audio analysis APIs
          const audioContext = new AudioContext();
          const arrayBuffer = await webmBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert AudioBuffer to WAV format
          const wavBlob = await audioBufferToWAV(audioBuffer);
          
          // Create a proper file with a .wav extension
          // Use a safe filename format without special characters like colons that cause file system issues
          const timestamp = new Date().toISOString()
            .replace(/:/g, '-')     // Replace colons with hyphens
            .replace(/\./g, '-')    // Replace periods with hyphens
            .replace(/T/g, '_');    // Replace T with underscore
          
          const file = new File([wavBlob], `recording_${timestamp}.wav`, { 
            type: 'audio/wav'
          });
          
          // Create a FileList-like object
          const container = new DataTransfer();
          container.items.add(file);
          onFileSelect(container.files, 'audio');
        } catch (err) {
          console.error('Error converting audio format:', err);
          // Fallback to original format if conversion fails
          const timestamp = new Date().toISOString()
            .replace(/:/g, '-')     // Replace colons with hyphens
            .replace(/\./g, '-')    // Replace periods with hyphens
            .replace(/T/g, '_');    // Replace T with underscore
            
          const file = new File([webmBlob], `recording_${timestamp}.webm`, { 
            type: 'audio/webm'
          });
          const container = new DataTransfer();
          container.items.add(file);
          onFileSelect(container.files, 'audio');
        } finally {
          // Clean up
          setIsRecording(false);
          setRecordedChunks([]);
        }
      };
      
      recorder.start();
      setAudioRecorder(recorder);
      setRecordedChunks(chunks);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access your microphone. Please check your permissions.');
    }
  };
  
  // Function to stop recording
  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      // Stop all tracks in the stream
      audioRecorder.stream.getTracks().forEach(track => track.stop());
      setAudioRecorder(null);
    }
  };

  const handleButtonClick = (type: 'image' | 'audio' | 'video' | 'document') => {
    if (disabled) return;
    
    if (type === 'audio') {
      setShowAudioOptions(!showAudioOptions);
    } else if (fileInputRefs[type]?.current) {
      fileInputRefs[type].current!.click();
    }
  };
  
  const handleAudioUpload = () => {
    setShowAudioOptions(false);
    if (fileInputRefs.audio?.current) {
      fileInputRefs.audio.current.click();
    }
  };
  
  const handleAudioRecord = () => {
    setShowAudioOptions(false);
    startRecording();
  };

  const getFileSummary = () => {
    const counts = {
      image: currentFiles.filter(f => f.type === 'image').length,
      audio: currentFiles.filter(f => f.type === 'audio').length,
      video: currentFiles.filter(f => f.type === 'video').length,
      document: currentFiles.filter(f => f.type === 'document').length,
    };

    const summaries = [];
    
    if (counts.image > 0) {
      summaries.push(`Images: ${counts.image}/${mediaLimits.image.count}`);
    }
    if (counts.audio > 0) {
      summaries.push(`Audio: ${counts.audio}/${mediaLimits.audio.count}`);
    }
    if (counts.video > 0) {
      summaries.push(`Videos: ${counts.video}/${mediaLimits.video.count}`);
    }
    if (counts.document > 0) {
      summaries.push(`Files: ${counts.document}/${mediaLimits.document.count}`);
    }
    
    return summaries.join(', ') || 'No files selected';
  };

  // Helper function for tooltips
  const getTooltipText = (type: string) => {
    switch(type) {
      case 'image': return 'Upload images';
      case 'audio': return isRecording ? 'Stop recording' : 'Audio options';
      case 'video': return 'Upload videos';
      case 'document': return 'Upload documents';
      case 'record': return 'Record audio';
      case 'upload': return 'Upload audio file';
      default: return '';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      {/* Image Button */}
      <div className="relative">
        <button
          onClick={() => handleButtonClick('image')}
          disabled={disabled || isRecording}
          onMouseEnter={() => setActiveTooltip('image')}
          onMouseLeave={() => setActiveTooltip(null)}
          className={`p-2 rounded-full transition-all duration-200 ${
            disabled || isRecording ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200'
          }`}
          aria-label="Upload image"
        >
          <Image size={20} className="text-blue-600" />
          <input
            ref={fileInputRefs.image}
            type="file"
            accept="image/*"
            onChange={(e) => onFileSelect(e.target.files, 'image')}
            className="hidden"
            multiple
            disabled={disabled || isRecording}
          />
        </button>
        {activeTooltip === 'image' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {getTooltipText('image')}
          </div>
        )}
      </div>

      {/* Audio Button */}
      <div className="relative">
        {isRecording ? (
          <button
            onClick={stopRecording}
            onMouseEnter={() => setActiveTooltip('audio')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-200"
            aria-label="Stop recording"
          >
            <StopCircle size={20} className="text-red-600 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={() => handleButtonClick('audio')}
            disabled={disabled}
            onMouseEnter={() => setActiveTooltip('audio')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`p-2 rounded-full transition-all duration-200 ${
              disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-green-100 hover:bg-green-200'
            }`}
            aria-label="Audio options"
          >
            <Mic size={20} className="text-green-600" />
            <input
              ref={fileInputRefs.audio}
              type="file"
              accept="audio/*"
              onChange={(e) => onFileSelect(e.target.files, 'audio')}
              className="hidden"
              multiple
              disabled={disabled || isRecording}
            />
          </button>
        )}
        {activeTooltip === 'audio' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {getTooltipText('audio')}
          </div>
        )}
        
        {/* Audio options dropdown */}
        {showAudioOptions && !isRecording && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-md p-2 z-10 border border-gray-200">
            <div className="relative">
              <button
                onClick={handleAudioRecord}
                onMouseEnter={() => setActiveTooltip('record')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md w-full text-left text-sm"
              >
                <Mic size={16} className="text-red-600" />
                <span>Record Audio</span>
              </button>
              {activeTooltip === 'record' && (
                <div className="absolute -right-32 top-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {getTooltipText('record')}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={handleAudioUpload}
                onMouseEnter={() => setActiveTooltip('upload')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md w-full text-left text-sm"
              >
                <Plus size={16} className="text-green-600" />
                <span>Upload Audio File</span>
              </button>
              {activeTooltip === 'upload' && (
                <div className="absolute -right-32 top-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {getTooltipText('upload')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video Button */}
      <div className="relative">
        <button
          onClick={() => handleButtonClick('video')}
          disabled={disabled || isRecording}
          onMouseEnter={() => setActiveTooltip('video')}
          onMouseLeave={() => setActiveTooltip(null)}
          className={`p-2 rounded-full transition-all duration-200 ${
            disabled || isRecording ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-100 hover:bg-purple-200'
          }`}
          aria-label="Upload video"
        >
          <Film size={20} className="text-purple-600" />
          <input
            ref={fileInputRefs.video}
            type="file"
            accept="video/*"
            onChange={(e) => onFileSelect(e.target.files, 'video')}
            className="hidden"
            multiple
            disabled={disabled || isRecording}
          />
        </button>
        {activeTooltip === 'video' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {getTooltipText('video')}
          </div>
        )}
      </div>

      {/* Document Button */}
      <div className="relative">
        <button
          onClick={() => handleButtonClick('document')}
          disabled={disabled || isRecording}
          onMouseEnter={() => setActiveTooltip('document')}
          onMouseLeave={() => setActiveTooltip(null)}
          className={`p-2 rounded-full transition-all duration-200 ${
            disabled || isRecording ? 'bg-gray-200 cursor-not-allowed' : 'bg-amber-100 hover:bg-amber-200'
          }`}
          aria-label="Upload document"
        >
          <FileText size={20} className="text-amber-600" />
          <input
            ref={fileInputRefs.document}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => onFileSelect(e.target.files, 'document')}
            className="hidden"
            multiple
            disabled={disabled || isRecording}
          />
        </button>
        {activeTooltip === 'document' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {getTooltipText('document')}
          </div>
        )}
      </div>

      {/* File summary */}
      <div className="text-sm flex-1 text-gray-600">
        {isRecording ? (
          <span className="text-red-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Recording audio...
          </span>
        ) : (
          getFileSummary()
        )}
      </div>
    </div>
  );
};

export default MediaSelector;