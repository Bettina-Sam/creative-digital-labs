import { useState, useEffect, useCallback, useRef } from 'react';

interface EasterEggState {
  konamiActivated: boolean;
  devModeActivated: boolean;
  showConfetti: boolean;
}

export const useEasterEggs = () => {
  const [state, setState] = useState<EasterEggState>({
    konamiActivated: false,
    devModeActivated: false,
    showConfetti: false,
  });

  const konamiRef = useRef<string[]>([]);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout>();

  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

  // Konami Code listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      konamiRef.current.push(e.code);
      if (konamiRef.current.length > KONAMI_CODE.length) {
        konamiRef.current.shift();
      }

      if (konamiRef.current.length === KONAMI_CODE.length &&
          konamiRef.current.every((key, i) => key === KONAMI_CODE[i])) {
        setState(prev => ({ ...prev, konamiActivated: true, showConfetti: true }));
        konamiRef.current = [];
        
        // Auto-hide confetti after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, showConfetti: false }));
        }, 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Footer click counter for dev mode
  const handleFooterClick = useCallback(() => {
    clickCountRef.current++;
    
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    if (clickCountRef.current >= 7) {
      setState(prev => ({ ...prev, devModeActivated: !prev.devModeActivated }));
      clickCountRef.current = 0;
    }
  }, []);

  const triggerConfetti = useCallback(() => {
    setState(prev => ({ ...prev, showConfetti: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, showConfetti: false }));
    }, 5000);
  }, []);

  return {
    ...state,
    handleFooterClick,
    triggerConfetti,
  };
};
