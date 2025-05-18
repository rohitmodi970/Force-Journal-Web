import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { useTheme } from '@/utilities/context/ThemeContext';

interface RecordedAudio {
  id: string;
  file: File;
  url: string;
  type: 'audio';
  status: 'idle' | string;
  progress: number;
}

interface AudioRecorderProps {
  onRecordingComplete: (audio: RecordedAudio) => void;
  onCancel: () => void;
}

const generateUniqueId = () => {
  return `recording-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const { currentTheme, isDarkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      stopMediaTracks();
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsProcessing(false);
      };

      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    setIsProcessing(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopMediaTracks();
    }
  };

  const handleSave = () => {
    if (!audioBlob) return;

    const fileName = `recording-${new Date().toISOString()}.webm`;
    const audioFile = new File([audioBlob], fileName, { type: 'audio/webm' });

    onRecordingComplete({
      id: generateUniqueId(),
      file: audioFile,
      url: audioUrl || '',
      type: 'audio',
      status: 'idle',
      progress: 0
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {audioBlob ? 'Recording Ready' : isRecording ? 'Recording in Progress' : 'Record Audio'}
        </h3>
      </div>

      {!audioBlob ? (
        <div className="flex flex-col items-center space-y-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRecording
                ? 'bg-red-500 animate-pulse'
                : `bg-${currentTheme.light} hover:bg-${currentTheme.medium}`
            }`}
          >
            {isRecording ? (
              <Square
                size={24}
                className="text-white cursor-pointer"
                onClick={stopRecording}
              />
            ) : (
              <Mic
                size={24}
                className={`text-${currentTheme.primary} cursor-pointer`}
                onClick={startRecording}
              />
            )}
          </div>

          {isRecording && (
            <div className="text-sm">
              <span>{formatTime(duration)}</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center space-x-2">
              <Loader size={16} className="animate-spin" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Processing...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <audio src={audioUrl || undefined} controls className="w-full" />

          <div className="flex justify-between space-x-2">
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded flex-1 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded flex-1 bg-${currentTheme.medium} hover:bg-${currentTheme.primary} text-white`}
            >
              Save Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
