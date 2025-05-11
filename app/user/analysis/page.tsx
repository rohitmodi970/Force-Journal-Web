"use client"; // Enable client-side features
import React from 'react';
import { useRouter } from 'next/navigation';

const Analysis = () => {
    const router = useRouter();

    return (
        <div className="p-8 flex flex-col items-center justify-center mt-10">
            <h1 className="text-2xl font-bold mb-6">Analysis Dashboard</h1>
            <div className="flex flex-col space-y-4">
                <button
                    onClick={() => router.push('/user/analysis/voiceAnalysis')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Go to Voice Analysis
                </button>
                <button
                    onClick={() => router.push('/user/analysis/sentiment-analysis')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                    Go to Sentiment Analysis
                </button>
            </div>
        </div>
    )
}

export default Analysis;
