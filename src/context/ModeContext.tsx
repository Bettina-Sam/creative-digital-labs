import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AppMode = 'school' | 'college';
export type GradeBand = '8-12' | '13-17';

interface ModeContextType {
  mode: AppMode;
  gradeBand: GradeBand;
  setMode: (mode: AppMode) => void;
  setGradeBand: (band: GradeBand) => void;
}

const ModeContext = createContext<ModeContextType | null>(null);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    return (localStorage.getItem('app-mode') as AppMode) || 'school';
  });

  const [gradeBand, setGradeBandState] = useState<GradeBand>(() => {
    return (localStorage.getItem('app-grade-band') as GradeBand) || '13-17';
  });

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    localStorage.setItem('app-mode', m);
  }, []);

  const setGradeBand = useCallback((b: GradeBand) => {
    setGradeBandState(b);
    localStorage.setItem('app-grade-band', b);
  }, []);

  return (
    <ModeContext.Provider value={{ mode, gradeBand, setMode, setGradeBand }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
};
