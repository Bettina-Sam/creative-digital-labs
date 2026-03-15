import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

export const VoiceAssistantControls = () => {
  const { isEnabled, isSpeaking, gender, toggleEnabled, toggleGender } = useVoice();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <motion.button
        onClick={toggleEnabled}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${
          isEnabled
            ? 'bg-gradient-to-br from-primary/80 to-secondary/80 border border-primary/30'
            : 'bg-muted/60 backdrop-blur-sm border border-border/50'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isEnabled ? t('voice.on') : t('voice.off')}
      >
        <AnimatePresence>
          {isSpeaking && (
            <>
              <motion.div className="absolute inset-0 rounded-full border-2 border-primary/60" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.2 }} />
              <motion.div className="absolute inset-0 rounded-full border-2 border-secondary/40" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }} />
              <motion.div className="absolute inset-0 rounded-full border border-primary/20" initial={{ scale: 1, opacity: 0.4 }} animate={{ scale: 2.6, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} />
            </>
          )}
        </AnimatePresence>

        {isEnabled ? (
          <Volume2 className="w-6 h-6 text-primary-foreground" />
        ) : (
          <VolumeX className="w-6 h-6 text-muted-foreground" />
        )}
      </motion.button>

      <AnimatePresence>
        {isEnabled && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.5 }}
            onClick={toggleGender}
            className={`absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-md backdrop-blur-md ${
              gender === 'female'
                ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40'
                : 'bg-neon-lime/20 text-neon-lime border border-neon-lime/40'
            }`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title={gender === 'female' ? t('voice.female') : t('voice.male')}
          >
            {gender === 'female' ? '♀' : '♂'}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="glass-panel px-3 py-1.5 rounded-full text-xs font-mono-lab flex items-center gap-2 backdrop-blur-md">
              <Mic className={`w-3 h-3 ${isSpeaking ? 'text-neon-lime animate-pulse' : 'text-primary'}`} />
              <span className="text-foreground">{isSpeaking ? t('voice.speaking') : t('voice.on')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
