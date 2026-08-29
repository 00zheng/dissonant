import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQueryList = window.matchMedia(query);
    const updateMatch = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', updateMatch);
    return () => mediaQueryList.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
}
