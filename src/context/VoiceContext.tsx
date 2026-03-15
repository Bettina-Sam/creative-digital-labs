import { createContext, useContext, ReactNode } from 'react';
import { useVoiceAssistant, VoiceGender } from '@/hooks/useVoiceAssistant';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceContextType {
  speak: (text: string) => void;
  stop: () => void;
  isEnabled: boolean;
  isSpeaking: boolean;
  gender: VoiceGender;
  setGender: (gender: VoiceGender) => void;
  toggleEnabled: () => void;
  toggleGender: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const voiceAssistant = useVoiceAssistant({ enabled: false, language });

  return (
    <VoiceContext.Provider value={voiceAssistant}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
};
