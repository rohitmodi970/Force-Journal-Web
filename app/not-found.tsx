// src/app/not-found.tsx
'use'
import Link from 'next/link';
import dynamic from 'next/dynamic';



export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse mb-4">
          Oops!
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-2">
          It seems you've drifted into uncharted territory.
        </p>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-md">
          The page you're looking for might be lost in another dimension or perhaps never existed.
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-50"
        >
          Return to Home Base
        </Link>
      </div>

      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 z-10">
        Don't worry, even the best explorers get lost sometimes.
      </footer>
    </div>
  );
}