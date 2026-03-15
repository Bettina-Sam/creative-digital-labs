import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Gamepad2, Trophy } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { ParticleField } from '@/components/ParticleField';
import { GameModalV2 } from '@/components/games/GameModalV2';
import { Game } from '@/components/games/GamesSection';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMode } from '@/context/ModeContext';
import { gamesCatalog } from '@/catalog/games';
import { filterByMode, NeonColor } from '@/catalog/types';
import { colorBg, colorText, colorBorder } from '@/lib/colorMap';

const GamesPage = () => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('game-high-scores');
    return saved ? JSON.parse(saved) : {};
  });
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();
  const { mode } = useMode();

  const games = filterByMode(gamesCatalog, mode);

  useEffect(() => {
    if (isEnabled) speak(t('voice.gamesWelcome'));
  }, [isEnabled]);

  const handleGameComplete = (gameId: string, score: number) => {
    setHighScores(prev => {
      const updated = { ...prev, [gameId]: Math.max(prev[gameId] || 0, score) };
      localStorage.setItem('game-high-scores', JSON.stringify(updated));
      return updated;
    });
  };

  // Build a legacy Game object for GameModalV2 compatibility
  const selectedCatalogItem = games.find(g => g.id === selectedGameId);
  const selectedGame: Game | null = selectedCatalogItem ? {
    id: selectedCatalogItem.id,
    title: t(selectedCatalogItem.titleKey),
    description: t(selectedCatalogItem.descKey),
    icon: selectedCatalogItem.icon,
    color: selectedCatalogItem.color,
    difficulty: 'Medium' as const,
    skills: selectedCatalogItem.featureKeys.map(k => t(k)),
    type: (selectedCatalogItem.engineType || 'logic') as Game['type'],
  } : null;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Gamepad2 className="w-4 h-4 text-neon-orange" />
              <span className="text-sm font-mono-lab text-muted-foreground">{t('games.badge')}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6"><span className="gradient-text">{t('games.title')}</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('games.subtitle')}</p>
            <p className="text-sm text-muted-foreground mt-2">{games.length} {t('games.badge')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {games.map((game, index) => {
              const Icon = game.icon;
              const color = game.color as NeonColor;
              const hasHighScore = highScores[game.id] !== undefined;
              return (
                <motion.div key={game.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ y: -8, scale: 1.02 }} className="group">
                  <motion.div
                    className={`glass-panel p-6 rounded-2xl h-full cursor-pointer border-2 border-transparent ${colorBorder[color]} transition-all`}
                    onClick={() => setSelectedGameId(game.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <motion.div className={`p-3 rounded-xl ${colorBg[color]}`} whileHover={{ rotate: 10, scale: 1.1 }}>
                        <Icon className={`w-6 h-6 ${colorText[color]}`} />
                      </motion.div>
                      {hasHighScore && (
                        <div className="flex items-center gap-1 text-neon-orange">
                          <Trophy className="w-3 h-3" />
                          <span className="text-xs font-mono-lab">{highScores[game.id]}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">{t(game.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{t(game.descKey)}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {game.featureKeys.map(sk => (
                        <span key={sk} className="text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground">{t(sk)}</span>
                      ))}
                    </div>
                    <motion.div className={`flex items-center gap-2 text-sm font-medium text-primary group-hover:text-neon-cyan transition-colors`} whileHover={{ x: 5 }}>
                      <Gamepad2 className="w-4 h-4" /><span>{t('games.playNow')}</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
        {selectedGame && (
          <GameModalV2 game={selectedGame} isOpen={!!selectedGame} onClose={() => setSelectedGameId(null)} onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
        )}
      </div>
    </PageTransition>
  );
};

export default GamesPage;
