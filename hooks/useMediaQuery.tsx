"use client";
import { useState, useEffect } from 'react';

/**
 * Custom hook that returns true if the window matches the given media query.
 * @param query Media query string, e.g. '(max-width: 640px)'
 * @returns Boolean indicating if the query matches
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Default to false during SSR
    if (typeof window === 'undefined') {
      return;
    }
    
    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Update the state when the match changes
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};

export default useMediaQuery;