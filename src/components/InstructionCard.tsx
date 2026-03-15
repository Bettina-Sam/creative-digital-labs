import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Lightbulb, Target, Beaker, Volume2, Info } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useVoice } from '@/context/VoiceContext';

interface InstructionCardProps {
  titleKey: string;
  overviewKey?: string;
  howToUseKey?: string;
  objectiveKey?: string;
  tryThisKey?: string;
  conceptKey?: string;
  /** If true, show as overlay on mount */
  showOnMount?: boolean;
}

export const InstructionCard = ({
  titleKey,
  overviewKey,
  howToUseKey,
  objectiveKey,
  tryThisKey,
  conceptKey,
  showOnMount = false,
}: InstructionCardProps) => {
  const [isOpen, setIsOpen] = useState(showOnMount);
  const { t } = useLanguage();
  const { speak, isEnabled } = useVoice();

  const sections = [
    { key: overviewKey, icon: BookOpen, labelKey: 'instruction.overview' },
    { key: howToUseKey, icon: Lightbulb, labelKey: 'instruction.howToUse' },
    { key: objectiveKey, icon: Target, labelKey: 'instruction.objective' },
    { key: tryThisKey, icon: Beaker, labelKey: 'instruction.tryThis' },
    { key: conceptKey, icon: Info, labelKey: 'instruction.concept' },
  ].filter(s => s.key);

  const readAll = () => {
    if (!isEnabled) return;
    const text = sections.map(s => `${t(s.labelKey)}. ${t(s.key!)}`).join('. ');
    speak(text);
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 p-3 rounded-full glass-panel border border-primary/30 text-primary"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={t('instruction.title')}
      >
        <Info className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 bottom-4 w-80 max-w-[90vw] z-50 glass-panel rounded-2xl p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold gradient-text">{t(titleKey)}</h3>
              <div className="flex gap-2">
                <motion.button onClick={readAll} className="p-1.5 rounded-lg bg-primary/20 text-primary" whileTap={{ scale: 0.9 }}>
                  <Volume2 className="w-4 h-4" />
                </motion.button>
                <motion.button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg bg-muted text-muted-foreground" whileTap={{ scale: 0.9 }}>
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {sections.map((section, i) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.labelKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-panel p-3 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary">{t(section.labelKey)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(section.key!)}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
