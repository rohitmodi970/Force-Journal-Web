"use client";
import React, { useState } from "react";
import axios from "axios";
import AudioRecorder from "@/components/voiceAnalysis/AudioRecorder";
import AudioUploader from "@/components/voiceAnalysis/AudioUploader";
import OverviewTab from "@/components/voiceAnalysis/OverviewTab";
import EmotionsTab from "@/components/voiceAnalysis/EmotionsTab";
import SpeechTab from "@/components/voiceAnalysis/SpeechTab";
import TextTab from "@/components/voiceAnalysis/TextTab";
import CorrelationsTab from "@/components/voiceAnalysis/CorrelationsTab";
import EnergyTab from "@/components/voiceAnalysis/EnergyTab";
import { useTheme } from "@/utilities/context/ThemeContext";
import { AnalysisResults } from "@/components/voiceAnalysis/types/voiceAnalysis"; // Import the correct type

// Tab options type
type TabOption = "overview" | "emotions" | "speech" | "text" | "energy" | "correlations";

const VoiceAnalysisDashboard: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | Blob | null>(null);
    const [recording, setRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabOption>("overview");

    // Get theme context
    const { currentTheme, isDarkMode } = useTheme();

    // Start recording function
    const startRecording = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: "audio/wav" });
                setAudioFile(audioBlob);
                setAudioChunks(chunks);
            };

            setMediaRecorder(recorder);
            recorder.start();
            setRecording(true);
        } catch (err) {
            setError("Microphone access denied or not available");
            console.error("Error accessing microphone:", err);
        }
    };

    // Stop recording function
    const stopRecording = (): void => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
            mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }
    };

    // File upload handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;
        console.log("handleFileUpload called with files:", files);

        if (files && files[0]) {
            console.log("File type:", files[0].type);

            if (files[0].type.startsWith("audio/")) {
                console.log("Setting audio file:", files[0]);
                setAudioFile(files[0]);
                setError(null); // Clear any previous errors
            } else {
                console.log("Invalid file type:", files[0].type);
                setError("Please upload a valid audio file");
            }
        } else {
            console.log("No files selected");
        }
    };

    // Analyze the audio by sending to backend
    const analyzeAudio = async (): Promise<void> => {
        if (!audioFile) {
            setError("Please record or upload audio first");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("audioFile", audioFile);

            const response = await axios.post<AnalysisResults>("/api/voice-analysis", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setAnalysisResults(response.data);
        } catch (err: any) {
            setError(`Failed to analyze audio: ${err.response?.data?.message || err.message}`);
            console.error("Analysis error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Create dynamic styles based on the theme
    const themeStyles = {
        primaryButton: `bg-[${currentTheme.primary}] hover:bg-[${currentTheme.hover}] active:bg-[${currentTheme.active}] text-white`,
        activeBorder: `border-[${currentTheme.primary}] text-[${currentTheme.primary}]`,
        inactiveTab: isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-500 hover:text-gray-700",
        card: isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800",
        pageBackground: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    };

    return (
        <div className={`p-6 max-w-6xl mx-auto ${themeStyles.pageBackground}`}>
            <h1 className="text-3xl font-bold mb-6">Advanced Voice Analysis Dashboard</h1>

            <div className={`${themeStyles.card} p-6 rounded-lg shadow-md mb-6`}>
                <h2 className="text-xl font-semibold mb-4">Record or Upload Audio</h2>

                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <AudioRecorder startRecording={startRecording} stopRecording={stopRecording} recording={recording} />
                    <AudioUploader handleFileUpload={handleFileUpload} />
                </div>

                {audioFile && (
                    <div className="mt-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-600">✓</span>
                            <span>
                                {audioFile instanceof File ? audioFile.name : "Recording"}{" "}
                                {((audioFile.size / 1024 / 1024).toFixed(2))} MB
                            </span>
                        </div>

                        {/* Add debug message */}
                        <div className="text-sm text-blue-500">
                            Audio file detected! Format: {audioFile instanceof File ? audioFile.type : "Recorded blob"}
                        </div>

                        <audio
                            className="mt-2 w-full"
                            controls
                            src={audioFile instanceof Blob ? URL.createObjectURL(audioFile) : undefined}
                        />

                        <button
                            onClick={analyzeAudio}
                            disabled={isLoading}
                            className={`mt-4 px-4 py-2 rounded  bg-black ${isLoading ? "bg-gray-400" : themeStyles.primaryButton}`}
                        >
                            {isLoading ? "Analyzing..." : "Analyze Audio"}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="text-center p-8">
                    <div
                        className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
                        style={{ borderColor: `${currentTheme.primary} transparent` }}
                    ></div>
                    <p className="mt-2">Analyzing voice patterns...</p>
                </div>
            )}

            {analysisResults && (
                <div className={`${themeStyles.card} rounded-lg shadow-md`}>
                    <div className="border-b border-gray-200">
                        <nav className="flex overflow-x-auto">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`px-4 py-3 text-sm font-medium ${activeTab === "overview"
                                        ? `border-b-2 ${themeStyles.activeBorder}`
                                        : themeStyles.inactiveTab
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("emotions")}
                                className={`px-4 py-3 text-sm font-medium ${activeTab === "emotions"
                                        ? `border-b-2 ${themeStyles.activeBorder}`
                                        : themeStyles.inactiveTab
                                    }`}
                            >
                                Emotions
                            </button>
                            <button
                                onClick={() => setActiveTab("speech")}
                                className={`px-4 py-3 text-sm font-medium ${activeTab === "speech"
                                        ? `border-b-2 ${themeStyles.activeBorder}`
                                        : themeStyles.inactiveTab
                                    }`}
                            >
                                Speech Patterns
                            </button>
                            <button
                                onClick={() => setActiveTab("text")}
                                className={`px-4 py-3 text-sm font-medium ${activeTab === "text"
                                        ? `border-b-2 ${themeStyles.activeBorder}`
                                        : themeStyles.inactiveTab
                                    }`}
                            >
                                Text Analysis
                            </button>
                            <button
                                onClick={() => setActiveTab("energy")}
                                className={`px-4 py-3 text-sm font-medium ${activeTab === "energy"
                                        ? `border-b-2 ${themeStyles.activeBorder}`
                                        : themeStyles.inactiveTab
                                    }`}
                            >
                                Energy
                            </button>
                            <button
                                onClick={() => setActiveTab("correlations")}
                                className={`px-4 py-3 text-sm font-medium ${activeTab === "correlations"
                                        ? `border-b-2 ${themeStyles.activeBorder}`
                                        : themeStyles.inactiveTab
                                    }`}
                            >
                                Correlations
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === "overview" && <OverviewTab analysisResults={analysisResults} />}
                        {activeTab === "emotions" && <EmotionsTab analysisResults={{
                            ...analysisResults,
                            emotions: analysisResults.emotions || {} // Ensure emotions is never undefined
                        } as any} />}
                        {activeTab === "speech" && <SpeechTab analysisResults={{
                            ...analysisResults,
                            metadata: (analysisResults as any).metadata || { duration: 0 } // Ensure metadata is never undefined
                        } as any} />}
                        {activeTab === "text" && <TextTab analysisResults={{
                            ...analysisResults,
                            linguistics: analysisResults.linguistics || {} // Ensure linguistics is never undefined
                        } as any} />}
                        {activeTab === "energy" && <EnergyTab analysisResults={{
                            ...analysisResults,
                            energyData: (analysisResults as any).energyData || {} // Ensure energyData is never undefined
                        } as any} />}
                        {activeTab === "correlations" && <CorrelationsTab analysisResults={{
                            ...analysisResults,
                            metadata: (analysisResults as any).metadata || { duration: 0 } // Ensure metadata is never undefined
                        } as any} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAnalysisDashboard;