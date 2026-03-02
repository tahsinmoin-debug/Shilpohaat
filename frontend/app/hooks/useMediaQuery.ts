import { useState, useEffect } from 'react';

/**
 * Custom hook to detect viewport breakpoints using media queries
 * @param query - The media query string to match
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Create listener function
    const listener = () => setMatches(media.matches);
    
    // Add event listener
    media.addEventListener('change', listener);
    
    // Cleanup function to remove event listener
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Predefined breakpoint hooks for convenience
export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
} as const;

export function useIsMobile() {
  return useMediaQuery(BREAKPOINTS.mobile);
}

export function useIsTablet() {
  return useMediaQuery(BREAKPOINTS.tablet);
}

export function useIsDesktop() {
  return useMediaQuery(BREAKPOINTS.desktop);
}
