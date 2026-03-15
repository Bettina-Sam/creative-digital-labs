import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { ParticleField } from '@/components/ParticleField';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMode } from '@/context/ModeContext';
import { labsCatalog } from '@/catalog/labs';
import { filterByMode } from '@/catalog/types';
import { CatalogCard } from '@/components/CatalogCard';

const ExperimentsPage = () => {
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();
  const { mode } = useMode();

  const labs = filterByMode(labsCatalog, mode);

  useEffect(() => {
    if (isEnabled) speak(t('voice.labsWelcome'));
  }, [isEnabled]);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <FlaskConical className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm font-mono-lab text-muted-foreground">{t('labs.badge')}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6"><span className="gradient-text">{t('labs.title')}</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('labs.subtitle')}</p>
            <p className="text-sm text-muted-foreground mt-2">{labs.length} {t('labs.badge')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {labs.map((lab, index) => (
              <Link key={lab.id} to={lab.legacyPath || `/labs/${lab.id}`}>
                <CatalogCard item={lab} index={index} actionLabelKey="labs.launch" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ExperimentsPage;
