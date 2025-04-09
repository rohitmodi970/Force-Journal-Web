import React from "react";
import { useTheme } from "@/utilities/context/ThemeContext";

interface AudioRecorderProps {
  startRecording: () => void;
  stopRecording: () => void;
  recording: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ startRecording, stopRecording, recording }) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  return (
    <div className="flex-1">
      <h3 className="text-lg mb-2">Record Audio</h3>
      <div className="flex space-x-2">
        {!recording ? (
          <button
            onClick={startRecording}
            style={{ backgroundColor: currentTheme.primary }}
            className="px-4 py-2 text-white rounded hover:bg-blue-700"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;