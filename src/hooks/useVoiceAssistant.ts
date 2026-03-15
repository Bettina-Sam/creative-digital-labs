import { useState, useCallback, useRef, useEffect } from 'react';

export type VoiceGender = 'male' | 'female';

interface UseVoiceAssistantOptions {
  enabled?: boolean;
  defaultGender?: VoiceGender;
  rate?: number;
  pitch?: number;
  language?: string; // 'en', 'ta', 'hi'
}

export const useVoiceAssistant = ({
  enabled = true,
  defaultGender = 'female',
  rate = 1,
  pitch = 1,
  language = 'en',
}: UseVoiceAssistantOptions = {}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gender, setGender] = useState<VoiceGender>(defaultGender);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const getVoice = useCallback(() => {
    const langPrefix = language === 'ta' ? 'ta' : language === 'hi' ? 'hi' : 'en';
    
    const femaleKeywords = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona'];
    const maleKeywords = ['male', 'man', 'boy', 'daniel', 'alex', 'fred', 'bruce', 'ralph'];
    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;
    
    // Filter voices by language
    const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
    
    // Try gender-matched voice in target language
    for (const keyword of keywords) {
      const match = langVoices.find(v => 
        v.name.toLowerCase().includes(keyword) || 
        v.voiceURI.toLowerCase().includes(keyword)
      );
      if (match) return match;
    }

    // Fallback: any voice in target language
    if (langVoices.length > 0) {
      return langVoices[gender === 'female' ? 0 : Math.min(1, langVoices.length - 1)];
    }

    // Final fallback: English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    for (const keyword of keywords) {
      const match = englishVoices.find(v => 
        v.name.toLowerCase().includes(keyword) || 
        v.voiceURI.toLowerCase().includes(keyword)
      );
      if (match) return match;
    }

    if (englishVoices.length > 0) {
      return englishVoices[gender === 'female' ? 0 : Math.min(1, englishVoices.length - 1)];
    }

    return voices[0];
  }, [voices, gender, language]);

  const speak = useCallback((text: string) => {
    if (!isEnabled || !text.trim()) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice();
    utterance.rate = language === 'en' ? rate * 0.85 : rate * 0.75;
    utterance.pitch = gender === 'female' ? pitch + 0.1 : pitch - 0.1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isEnabled, getVoice, rate, pitch, gender]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleEnabled = useCallback(() => {
    if (isEnabled) {
      stop();
    }
    setIsEnabled(prev => !prev);
  }, [isEnabled, stop]);

  const toggleGender = useCallback(() => {
    setGender(prev => prev === 'female' ? 'male' : 'female');
  }, []);

  return {
    speak,
    stop,
    isEnabled,
    isSpeaking,
    gender,
    setGender,
    toggleEnabled,
    toggleGender,
    voices,
  };
};
