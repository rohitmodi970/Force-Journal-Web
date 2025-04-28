import React from 'react';

interface DecorativePageProps {
  isEven: boolean;
  backgroundClass?: string;
  backgroundStyle?: React.CSSProperties;
}

const DecorativePage = ({ isEven, backgroundClass, backgroundStyle }: DecorativePageProps) => {
  // Random decorative elements to show on the page
  const decorativeTypes = [
    "floral", "geometric", "quotes", "doodles", "pattern"
  ];
  
  // Use a predictable "random" based on isEven
  const decorationType = decorativeTypes[isEven ? 0 : 2];
  
  // Default background if none provided
  const defaultBackgroundClass = `diary-page h-[733px] w-[550px] ${
    isEven ? 'bg-gradient-to-br from-[#f9f8f5] to-[#e8e0d5]' : 'bg-gradient-to-br from-[#e8e0d5] to-[#f9f8f5]'
  }`;

  // Get quotes for quote type
  const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Write it on your heart that every day is the best day in the year. - Ralph Waldo Emerson",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
  ];
  
  const renderDecorativeContent = () => {
    switch (decorationType) {
      case "floral":
        return (
          <div className="h-full w-full flex items-center justify-center p-10">
            <div className="relative w-full h-full border-[3px] border-primary/20 rounded-lg p-6">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/60">
                  <path d="M12 2a9 9 0 0 0-9 9c0 3.4 3.1 6.8 4.4 8.2.3.3.6.5.9.8.9.7 1.8 1 3.7 1s2.8-.3 3.7-1c.3-.2.6-.5.9-.8 1.3-1.4 4.4-4.8 4.4-8.2a9 9 0 0 0-9-9z" />
                  <path d="M12 16c2.8-4.3 4-6.5 4-8.6 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 2.1 1.2 4.3 4 8.6z" />
                </svg>
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/60">
                  <path d="M12 22c6-6.5 9-10 9-13.5a9 9 0 1 0-18 0C3 12 6 15.5 12 22z" />
                  <circle cx="12" cy="8.5" r="2" />
                </svg>
              </div>
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/40 mx-auto mb-4">
                    <path d="M12 2a9 9 0 0 0-9 9c0 3.4 3.1 6.8 4.4 8.2.3.3.6.5.9.8.9.7 1.8 1 3.7 1s2.8-.3 3.7-1c.3-.2.6-.5.9-.8 1.3-1.4 4.4-4.8 4.4-8.2a9 9 0 0 0-9-9z" />
                    <path d="M12 16c2.8-4.3 4-6.5 4-8.6 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 2.1 1.2 4.3 4 8.6z" />
                  </svg>
                  <p className="font-journal text-2xl text-primary/70">Memories Bloom</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "quotes":
        return (
          <div className="h-full w-full flex items-center justify-center p-10">
            <div className="text-center max-w-sm">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/40 mx-auto mb-4">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>
              <p className="font-journal text-lg text-primary/80 mb-4 italic">
                {quotes[isEven ? 0 : 1]}
              </p>
              <div className="w-16 h-1 bg-primary/20 mx-auto mt-6"></div>
            </div>
          </div>
        );
      
      case "geometric":
        return (
          <div className="h-full w-full">
            <div className="grid grid-cols-4 grid-rows-4 h-full">
              {Array.from({ length: 16 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`border border-primary/10 flex items-center justify-center ${
                    i % 3 === 0 ? 'bg-primary/5' : ''
                  }`}
                >
                  {i % 5 === 0 && (
                    <div className="w-8 h-8 rounded-full border border-primary/20"></div>
                  )}
                  {i % 7 === 0 && (
                    <div className="w-10 h-10 rotate-45 border border-primary/20"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case "doodles":
        return (
          <div className="h-full w-full p-8">
            <div className="border-b border-primary/20 pb-4 mb-6">
              <h3 className="font-journal text-xl text-primary/70 text-center">Journal Notes</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/40 mb-2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l2 2" />
                </svg>
                <p className="font-journal text-sm text-center">Take time to reflect</p>
              </div>
              <div className="flex flex-col items-center">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/40 mb-2">
                  <path d="M12 2a9 9 0 0 0-9 9c0 3.4 3.1 6.8 4.4 8.2.3.3.6.5.9.8.9.7 1.8 1 3.7 1s2.8-.3 3.7-1c.3-.2.6-.5.9-.8 1.3-1.4 4.4-4.8 4.4-8.2a9 9 0 0 0-9-9z" />
                  <circle cx="12" cy="8.5" r="2" />
                </svg>
                <p className="font-journal text-sm text-center">Remember the journey</p>
              </div>
              <div className="flex flex-col items-center">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/40 mb-2">
                  <path d="M16 18l2-2-4-4-4 4 2 2" />
                  <path d="M10 6h4v4" />
                  <path d="M12 2v4" />
                  <path d="M22 12h-4" />
                  <path d="M6 12H2" />
                </svg>
                <p className="font-journal text-sm text-center">Capture moments</p>
              </div>
              <div className="flex flex-col items-center">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/40 mb-2">
                  <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
                  <path d="M12 18c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zM12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                <p className="font-journal text-sm text-center">Focus on what matters</p>
              </div>
            </div>
            <div className="mt-10 border-t border-primary/20 pt-4">
              <p className="font-journal text-center text-xs text-primary/60">Your thoughts deserve a beautiful home</p>
            </div>
          </div>
        );
      
      case "pattern":
        return (
          <div className="h-full w-full overflow-hidden">
            <div className="grid grid-cols-8 grid-rows-12 h-full opacity-20">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-primary/20 flex items-center justify-center">
                  {i % 4 === 0 && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/30">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {i % 7 === 0 && (
                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                  )}
                  {i % 11 === 0 && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary/30">
                      <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-journal text-3xl text-primary/60 mb-2">Journal</p>
                <p className="font-journal text-sm text-primary/40">Capture Life's Moments</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full w-full flex items-center justify-center">
            <p className="font-journal text-2xl text-primary/50">Journal</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={backgroundClass || defaultBackgroundClass}
      style={{
        ...backgroundStyle,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {renderDecorativeContent()}
    </div>
  );
};

export default DecorativePage;