import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Gamepad2, Target, Puzzle, Brain, Rocket, Zap, Star, Play, Trophy, Code, Palette, Crosshair,
  FlaskConical, Orbit as OrbitIcon, Binary, Music, CircuitBoard, TreePine
} from 'lucide-react';
import { GameModalV2 } from './GameModalV2';
import { useLanguage } from '@/context/LanguageContext';

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: typeof Gamepad2;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skills: string[];
  type: 'particle' | 'physics' | 'math' | 'logic' | 'memory' | 'reaction' | 'color' | 'audio' | 'strategy';
}

const games: Game[] = [
  { id: 'particle-catch', title: 'Particle Catcher', description: 'Catch falling particles by moving your cursor. Learn about gravity and acceleration!', icon: Target, color: 'neon-cyan', difficulty: 'Easy', skills: ['Reaction Time', 'Physics Concepts'], type: 'particle' },
  { id: 'orbit-puzzle', title: 'Orbit Puzzle', description: 'Arrange planets in correct orbital order. Master the solar system!', icon: Puzzle, color: 'neon-magenta', difficulty: 'Medium', skills: ['Astronomy', 'Spatial Reasoning'], type: 'physics' },
  { id: 'math-flow', title: 'Math Flow', description: 'Solve equations as they flow across screen. Quick math with visual feedback!', icon: Brain, color: 'neon-lime', difficulty: 'Medium', skills: ['Mental Math', 'Speed'], type: 'math' },
  { id: 'wave-rider', title: 'Wave Rider', description: 'Navigate through sine and cosine waves. Learn trigonometry through play!', icon: Rocket, color: 'neon-orange', difficulty: 'Hard', skills: ['Trigonometry', 'Timing'], type: 'math' },
  { id: 'memory-matrix', title: 'Memory Matrix', description: 'Remember and recreate particle patterns. Train your visual memory!', icon: Star, color: 'neon-purple', difficulty: 'Medium', skills: ['Memory', 'Pattern Recognition'], type: 'memory' },
  { id: 'reaction-burst', title: 'Reaction Burst', description: 'Click particles before they disappear. Test your reflexes and earn points!', icon: Zap, color: 'neon-cyan', difficulty: 'Easy', skills: ['Reflexes', 'Focus'], type: 'reaction' },
  { id: 'code-breaker', title: 'Code Breaker', description: 'Arrange code blocks in the correct order. Learn programming logic!', icon: Code, color: 'neon-lime', difficulty: 'Medium', skills: ['Logic', 'Programming'], type: 'logic' },
  { id: 'color-match', title: 'Color Match Rush', description: 'Find matching color pairs before time runs out!', icon: Palette, color: 'neon-magenta', difficulty: 'Easy', skills: ['Color Recognition', 'Memory'], type: 'color' },
  { id: 'physics-launcher', title: 'Physics Launcher', description: 'Launch projectiles at targets using angle and force!', icon: Crosshair, color: 'neon-orange', difficulty: 'Hard', skills: ['Physics', 'Trajectory'], type: 'physics' },
  { id: 'element-builder', title: 'Element Builder', description: 'Build molecules by selecting the right atoms. Learn chemistry!', icon: FlaskConical, color: 'neon-lime', difficulty: 'Medium', skills: ['Chemistry', 'Molecular Structure'], type: 'logic' },
  { id: 'gravity-golf', title: 'Gravity Golf', description: 'Launch balls using gravitational slingshots to hit targets!', icon: OrbitIcon, color: 'neon-purple', difficulty: 'Hard', skills: ['Gravity', 'Trajectory Planning'], type: 'physics' },
  { id: 'binary-decoder', title: 'Binary Decoder', description: 'Convert binary numbers to decimal under time pressure!', icon: Binary, color: 'neon-cyan', difficulty: 'Medium', skills: ['Binary Math', 'Number Systems'], type: 'math' },
  { id: 'sound-matcher', title: 'Sound Matcher', description: 'Listen to notes and match their frequencies. Train your ear!', icon: Music, color: 'neon-orange', difficulty: 'Medium', skills: ['Audio Recognition', 'Music Theory'], type: 'audio' },
  { id: 'circuit-builder', title: 'Circuit Builder', description: 'Connect components to complete circuits and light up bulbs!', icon: CircuitBoard, color: 'neon-magenta', difficulty: 'Medium', skills: ['Electronics', 'Circuit Design'], type: 'logic' },
  { id: 'ecosystem-balance', title: 'Ecosystem Balance', description: 'Balance predator-prey populations across seasons!', icon: TreePine, color: 'neon-lime', difficulty: 'Hard', skills: ['Ecology', 'Strategy'], type: 'strategy' },
];

const difficultyColors = {
  Easy: 'text-neon-lime',
  Medium: 'text-neon-orange',
  Hard: 'text-neon-magenta',
};

export const GamesSection = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const { t } = useLanguage();

  const handleGameComplete = (gameId: string, score: number) => {
    setHighScores(prev => ({ ...prev, [gameId]: Math.max(prev[gameId] || 0, score) }));
  };

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6" whileHover={{ scale: 1.05 }} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Gamepad2 className="w-4 h-4 text-neon-orange" />
            <span className="text-sm font-mono-lab text-muted-foreground">{t('games.sectionTitle')}</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6"><span className="gradient-text">{t('games.title')}</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('games.sectionSubtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.slice(0, 6).map((game, index) => {
            const Icon = game.icon;
            const hasHighScore = highScores[game.id] !== undefined;
            return (
              <motion.div key={game.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -8, scale: 1.02 }} className="group">
                <motion.div className={`glass-panel p-6 rounded-2xl h-full cursor-pointer border-2 border-transparent hover:border-${game.color}/50 transition-all relative overflow-hidden`} onClick={() => setSelectedGame(game)}>
                  <div className="flex items-start justify-between mb-4 relative">
                    <motion.div className={`p-3 rounded-xl bg-${game.color}/20`} whileHover={{ rotate: 10, scale: 1.1 }}>
                      <Icon className={`w-6 h-6 text-${game.color}`} />
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono-lab ${difficultyColors[game.difficulty]}`}>{game.difficulty}</span>
                      {hasHighScore && (
                        <div className="flex items-center gap-1 text-neon-orange">
                          <Trophy className="w-3 h-3" />
                          <span className="text-xs font-mono-lab">{highScores[game.id]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">{game.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{game.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.skills.map(skill => (
                      <span key={skill} className="text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground">{skill}</span>
                    ))}
                  </div>
                  <motion.div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:text-neon-cyan transition-colors" whileHover={{ x: 5 }}>
                    <Play className="w-4 h-4" />
                    <span>{t('games.playNow')}</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedGame && (
        <GameModalV2 game={selectedGame} isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
      )}
    </section>
  );
};
