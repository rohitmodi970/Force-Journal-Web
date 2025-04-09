import React, { useRef } from "react";

interface AudioUploaderProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ handleFileUpload }) => {
  const fileInputRef = useRef(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event triggered");
    console.log("Files selected:", e.target.files);
    
    // Call the parent component's handler
    handleFileUpload(e);
    
    // Reset the input if needed (this helps if users try to upload the same file twice)
    // fileInputRef.current.value = "";
  };
  
  return (
    <div className="border-t md:border-t-0 md:border-l border-gray-300 md:pl-4 pt-4 md:pt-0 flex-1">
      <h3 className="text-lg mb-2">Upload Audio File</h3>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      <p className="mt-2 text-xs text-gray-500">
        Supported formats: MP3, WAV, M4A, etc.
      </p>
    </div>
  );
};

export default AudioUploader;