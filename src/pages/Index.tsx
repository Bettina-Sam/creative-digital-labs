import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Atom, Palette, Zap, MousePointer2,
  GraduationCap, Trophy, BookOpen, Gamepad2, PenTool, Users, Globe, Star,
  FlaskConical, Wand2, Eye, Hand
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { ParticleField } from '@/components/ParticleField';
import { ChallengePanel } from '@/components/challenges/ChallengePanel';
import { Challenge, useChallengeProgress } from '@/components/challenges/ChallengeSystem';
import { LearningHub } from '@/components/learning/LearningHub';
import { WhiteboardModule } from '@/components/whiteboard/WhiteboardModule';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMode } from '@/context/ModeContext';
import { labsCatalog } from '@/catalog/labs';
import { gamesCatalog } from '@/catalog/games';
import { toolsCatalog } from '@/catalog/tools';
import { learnCatalog } from '@/catalog/learn';
import { filterByMode, CatalogItem, NeonColor } from '@/catalog/types';
import { colorBg, colorText, colorBorder } from '@/lib/colorMap';
import { useVisitorCounter } from '@/hooks/useVisitorCounter';

const FeaturedSection = ({ 
  items, titleKey, badgeKey, badgeIcon: BadgeIcon, morePath, actionKey, badgeColor 
}: {
  items: CatalogItem[];
  titleKey: string;
  badgeKey: string;
  badgeIcon: typeof FlaskConical;
  morePath: string;
  actionKey: string;
  badgeColor: string;
}) => {
  const { t } = useLanguage();
  const featured = items.slice(0, 6);

  return (
    <div className="mb-20">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
        <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-4" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
          <BadgeIcon className={`w-4 h-4 ${badgeColor}`} />
          <span className="text-sm font-mono-lab text-muted-foreground">{t(badgeKey)}</span>
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold">
          <span className="font-mono-lab text-primary">{'<'}</span>
          <span className="gradient-text">{t(titleKey)}</span>
          <span className="font-mono-lab text-primary">{'/>'}</span>
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {featured.map((item, index) => {
          const Icon = item.icon;
          const color = item.color as NeonColor;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileHover={{ y: -8, scale: 1.02 }} className="group">
              <div className={`glass-panel p-5 rounded-2xl h-full border-2 border-transparent ${colorBorder[color]} transition-all`}>
                <motion.div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`} whileHover={{ rotate: 5 }}>
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold mb-1 group-hover:gradient-text transition-all">{t(item.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
        <Link to={morePath}>
          <motion.div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-panel text-primary font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {t('home.viewAll')} ({items.length})
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};

const Index = () => {
  const { normalizedX, normalizedY } = useMousePosition();
  const [showChallenges, setShowChallenges] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const { totalPoints } = useChallengeProgress();
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();
  const { mode } = useMode();
  const { count: visitorCount, loading: visitorLoading } = useVisitorCounter();

  const labs = filterByMode(labsCatalog, mode);
  const games = filterByMode(gamesCatalog, mode);
  const tools = filterByMode(toolsCatalog, mode);
  const learns = filterByMode(learnCatalog, mode);

  useEffect(() => {
    if (isEnabled) speak(t('voice.welcome'));
  }, [isEnabled]);

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setShowChallenges(false);
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" animate={{ x: normalizedX * 50, y: normalizedY * 50 }} transition={{ type: 'spring', damping: 30 }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" animate={{ x: -normalizedX * 30, y: -normalizedY * 30 }} transition={{ type: 'spring', damping: 30 }} />

        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          {/* Hero */}
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <Zap className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-mono-lab text-muted-foreground">{t('home.interactive')}</span>
                </motion.div>
                <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}>
                  <GraduationCap className="w-4 h-4 text-neon-lime" />
                  <span className="text-sm font-mono-lab text-muted-foreground">{t('learn.badge')}</span>
                </motion.div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="block">{t('home.welcome')}</span>
                <span className="gradient-text">{t('home.title')}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">{t('home.subtitle')}</p>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {[
                  { icon: Atom, label: t('home.badge.physics') },
                  { icon: BookOpen, label: t('home.badge.voice') },
                  { icon: Palette, label: t('home.badge.creative') },
                ].map((badge, i) => (
                  <motion.div key={i} className="inline-flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full" whileHover={{ scale: 1.05 }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.8 + i * 0.3, delay: i * 0.15 }}>
                    <badge.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono-lab text-muted-foreground">{badge.label}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex items-center justify-center mb-8">
                <div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-neon-cyan/40">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-mono-lab text-muted-foreground">
                    {visitorLoading ? 'Loading visitors...' : `${visitorCount ?? 0} ${t('stats.visitors')}`}
                  </span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/experiments" data-cursor-hover>
                  <motion.div className="btn-glow px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Sparkles className="w-5 h-5" />{t('home.startLearning')}<ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
                <motion.button onClick={() => setShowChallenges(true)} className="px-6 py-4 rounded-xl glass-panel font-bold flex items-center gap-2 hover:border-neon-orange/50" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} data-cursor-hover>
                  <Trophy className="w-5 h-5 text-neon-orange" />{t('home.challenges')}
                  {totalPoints > 0 && <span className="text-xs bg-neon-orange/20 text-neon-orange px-2 py-0.5 rounded-full">{totalPoints} pts</span>}
                </motion.button>
                <motion.button onClick={() => setShowWhiteboard(true)} className="px-6 py-4 rounded-xl glass-panel font-bold flex items-center gap-2 hover:border-neon-lime/50" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} data-cursor-hover>
                  <PenTool className="w-5 h-5 text-neon-lime" />{t('home.whiteboard')}
                </motion.button>
                <motion.a
                  href="https://air-sculpt-studio.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl font-bold flex items-center gap-2 text-white relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #84cc16 100%)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.15)',
                  }}
                  whileHover={{ scale: 1.07, y: -3, boxShadow: '0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.25)' }}
                  whileTap={{ scale: 0.95 }}
                  data-cursor-hover
                >
                  <Hand className="w-5 h-5" />
                  Air Sculpt Studio
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </motion.div>

              <motion.div className="flex items-center justify-center gap-6 mt-6 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <div className="flex items-center gap-2"><MousePointer2 className="w-4 h-4" /><span className="text-sm">{t('home.interactive')}</span></div>
                <div className="flex items-center gap-2"><Gamepad2 className="w-4 h-4" /><span className="text-sm">{t('home.gamesIncluded')}</span></div>
              </motion.div>
            </motion.div>
          </div>

          {/* 4 Featured Sections */}
          <FeaturedSection items={labs} titleKey="home.experiments" badgeKey="labs.badge" badgeIcon={FlaskConical} morePath="/experiments" actionKey="labs.launch" badgeColor="text-neon-cyan" />
          <FeaturedSection items={games} titleKey="games.title" badgeKey="games.badge" badgeIcon={Gamepad2} morePath="/games" actionKey="games.playNow" badgeColor="text-neon-orange" />
          <FeaturedSection items={tools} titleKey="create.title" badgeKey="create.badge" badgeIcon={Wand2} morePath="/create" actionKey="create.openTool" badgeColor="text-neon-magenta" />
          <FeaturedSection items={learns} titleKey="learn.title" badgeKey="learn.badge" badgeIcon={GraduationCap} morePath="/learn" actionKey="learn.startLearning" badgeColor="text-neon-lime" />

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {[
              { icon: Eye, value: visitorLoading ? '...' : String(visitorCount ?? 'N/A'), label: t('stats.visitors'), colorClass: 'text-neon-cyan' },
              { icon: Globe, value: String(labs.length), label: t('stats.labs'), colorClass: 'text-neon-magenta' },
              { icon: Gamepad2, value: String(games.length), label: t('stats.games'), colorClass: 'text-neon-lime' },
              { icon: Star, value: String(labs.length + games.length + tools.length + learns.length), label: t('stats.features'), colorClass: 'text-neon-orange' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.08, y: -10 }} className="glass-panel p-6 rounded-2xl text-center cursor-default">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.colorClass}`} />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <ChallengePanel isOpen={showChallenges} onClose={() => setShowChallenges(false)} onStartChallenge={handleStartChallenge} activeChallenge={activeChallenge} />
        <LearningHub isOpen={showLearning} onClose={() => setShowLearning(false)} />
        <WhiteboardModule isOpen={showWhiteboard} onClose={() => setShowWhiteboard(false)} onSpeak={speak} />
      </div>
    </PageTransition>
  );
};

export default Index;

