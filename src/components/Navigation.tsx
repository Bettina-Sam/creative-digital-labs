import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, FlaskConical, GraduationCap, Gamepad2, PenTool, Globe, School, Building2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Language, languageCodes, languageNames } from '@/i18n/translations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMode, AppMode } from '@/context/ModeContext';

const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Sparkles },
  { path: '/experiments', labelKey: 'nav.labs', icon: FlaskConical },
  { path: '/learn', labelKey: 'nav.learn', icon: GraduationCap },
  { path: '/games', labelKey: 'nav.games', icon: Gamepad2 },
  { path: '/create', labelKey: 'nav.create', icon: PenTool },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { mode, setMode } = useMode();

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 hidden md:block"
      >
        <div className="glass-panel m-4 p-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" data-cursor-hover>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg gradient-text">Creative Tech Lab</span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-cursor-hover
                    className="relative"
                  >
                    <motion.div
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-lg border border-primary/50 bg-primary/10 -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}

              {/* Mode Toggle */}
              <div className="ml-2 flex items-center glass-panel rounded-full p-1" data-cursor-hover>
                {(['school', 'college'] as AppMode[]).map((m) => {
                  const isActive = mode === m;
                  const ModeIcon = m === 'school' ? School : Building2;
                  return (
                    <motion.button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ModeIcon className="w-3.5 h-3.5" />
                      {t(`mode.${m}`)}
                    </motion.button>
                  );
                })}
              </div>

              {/* Language Switcher */}
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    className="ml-2 px-3 py-2 rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-cursor-hover
                  >
                    <Globe className="w-4 h-4" />
                    <span className="font-mono-lab text-xs font-bold">{languageCodes[language]}</span>
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-2 glass-panel" align="end">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <motion.button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${
                        language === lang
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <span>{languageNames[lang]}</span>
                      <span className="font-mono-lab text-xs">{languageCodes[lang]}</span>
                    </motion.button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="fixed top-4 right-4 z-50 md:hidden flex gap-2">
        {/* Mobile Mode Toggle */}
        <div className="flex items-center glass-panel rounded-full p-1">
          {(['school', 'college'] as AppMode[]).map((m) => {
            const isActive = mode === m;
            const ModeIcon = m === 'school' ? School : Building2;
            return (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                className={`p-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <ModeIcon className="w-4 h-4" />
              </motion.button>
            );
          })}
        </div>

        {/* Mobile Language Switcher */}
        <Popover>
          <PopoverTrigger asChild>
            <motion.button
              className="glass-panel p-3"
              whileTap={{ scale: 0.9 }}
              data-cursor-hover
            >
              <Globe className="w-5 h-5" />
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2 glass-panel" align="end">
            {(Object.keys(languageNames) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  language === lang ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                }`}
              >
                {languageNames[lang]}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-panel p-3"
          whileTap={{ scale: 0.9 }}
          data-cursor-hover
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-center h-full gap-6">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 text-2xl font-medium ${
                          isActive ? 'neon-text-cyan' : 'text-muted-foreground'
                        }`}
                        data-cursor-hover
                      >
                        <Icon className="w-8 h-8" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
