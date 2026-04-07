import { motion } from 'framer-motion';
import { Heart, Sparkles, Download, Share } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useEasterEggs } from '@/hooks/useEasterEggs';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export const CreativeFooter = () => {
  const { t } = useLanguage();
  const { handleFooterClick } = useEasterEggs();
  const { isInstallable, isIos, isInstalled, install } = usePwaInstall();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative z-10 py-6 px-4"
    >
      <div className="container mx-auto">
        <div className="glass-panel rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left - Branding */}
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer"
                onClick={handleFooterClick}
                animate={{ boxShadow: ['0 0 15px hsl(185 100% 50% / 0.3)', '0 0 30px hsl(320 100% 60% / 0.4)', '0 0 15px hsl(185 100% 50% / 0.3)'] }}
                transition={{ repeat: Infinity, duration: 3 }}
                whileTap={{ scale: 0.9 }}
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h3 className="font-bold gradient-text text-sm">Creative Digital Labs</h3>
                <p className="text-xs text-muted-foreground">{t('footer.tagline')}</p>
              </div>
            </motion.div>

            {/* Center - Attribution */}
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="flex flex-col items-center">
              <motion.div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20" whileHover={{ scale: 1.05 }}>
                <span className="text-sm text-muted-foreground">{t('footer.createdBy')}</span>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Heart className="w-4 h-4 text-neon-magenta fill-neon-magenta" />
                </motion.div>
                <span className="text-sm font-bold gradient-text">FAITH TECH</span>
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 italic">{t('footer.chaos')}</p>
            </motion.div>

            {/* Right - Install + Year */}
            <div className="flex items-center gap-4">
              {isInstalled ? (
                <motion.div className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 text-primary-foreground text-sm font-medium flex items-center gap-2 opacity-80">
                  <Download className="w-4 h-4" />
                  {t('footer.installed')}
                </motion.div>
              ) : isIos ? (
                <motion.button
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const msg = 'Tap Share, then "Add to Home Screen".';
                    if ('vibrate' in navigator) navigator.vibrate(50);
                    alert(msg);
                  }}
                >
                  <Share className="w-4 h-4" />
                  {t('footer.install')}
                </motion.button>
              ) : (
                <motion.button
                  onClick={async () => {
                    if (isInstallable) {
                      const ok = await install();
                      if (!ok) {
                        alert('Install was cancelled. You can tap Install again anytime.');
                      }
                      return;
                    }

                    alert('Install prompt is not ready yet. Open this site in Chrome or Edge, stay on the page for a few seconds, refresh once, then click Install again (or use browser menu > Install app).');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  {t('footer.install')}
                </motion.button>
              )}
              <span className="text-sm font-mono-lab text-muted-foreground">(c) 2026</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
