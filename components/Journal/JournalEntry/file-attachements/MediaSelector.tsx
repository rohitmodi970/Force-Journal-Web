import React, { useRef } from 'react';
import { Image, Mic, FileText, Film, Plus } from 'lucide-react';
import { MediaFile, MediaLimits } from '../../types';

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

  const handleButtonClick = (type: 'image' | 'audio' | 'video' | 'document') => {
    if (disabled) return;
    if (fileInputRefs[type]?.current) {
      fileInputRefs[type].current!.click();
    }
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

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <button
        onClick={() => handleButtonClick('image')}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200'
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
          disabled={disabled}
        />
      </button>

      <button
        onClick={() => handleButtonClick('audio')}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-green-100 hover:bg-green-200'
        }`}
        aria-label="Upload audio"
      >
        <Mic size={20} className="text-green-600" />
        <input
          ref={fileInputRefs.audio}
          type="file"
          accept="audio/*"
          onChange={(e) => onFileSelect(e.target.files, 'audio')}
          className="hidden"
          multiple
          disabled={disabled}
        />
      </button>

      <button
        onClick={() => handleButtonClick('video')}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-100 hover:bg-purple-200'
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
          disabled={disabled}
        />
      </button>

      <button
        onClick={() => handleButtonClick('document')}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-amber-100 hover:bg-amber-200'
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
          disabled={disabled}
        />
      </button>

      <div className="text-sm flex-1 text-gray-600">
        {getFileSummary()}
      </div>
    </div>
  );
};

export default MediaSelector;