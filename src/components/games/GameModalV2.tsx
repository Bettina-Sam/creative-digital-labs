import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { X, Trophy, RotateCcw, Play, Star, Clock, Target } from 'lucide-react';
import { Game } from './GamesSection';
import { ParticleCatcherGame } from './ParticleCatcherGame';
import { MathFlowGame } from './MathFlowGame';
import { MemoryMatrixGame } from './MemoryMatrixGame';
import { WaveRiderGame } from './WaveRiderGame';
import { OrbitPuzzleGame } from './OrbitPuzzleGame';
import { ReactionBurstGame } from './ReactionBurstGame';
import { CodeBreakerGame } from './CodeBreakerGame';
import { ColorMatchGame } from './ColorMatchGame';
import { PhysicsLauncherGame } from './PhysicsLauncherGame';
import { ElementBuilderGame } from './ElementBuilderGame';
import { GravityGolfGame } from './GravityGolfGame';
import { BinaryDecoderGame } from './BinaryDecoderGame';
import { SoundMatcherGame } from './SoundMatcherGame';
import { CircuitBuilderGame } from './CircuitBuilderGame';
import { EcosystemBalanceGame } from './EcosystemBalanceGame';
import { FractionPuzzleGame } from './FractionPuzzleGame';
import { WordScrambleGame } from './WordScrambleGame';
import { PatternSequenceGame } from './PatternSequenceGame';
// New games
import { NumberNinjaGame } from './NumberNinjaGame';
import { DiceProbabilityGame } from './DiceProbabilityGame';
import { PixelPuzzleGame } from './PixelPuzzleGame';
import { AtomBuilderGame } from './AtomBuilderGame';
import { CompassQuestGame } from './CompassQuestGame';
import { LayerStackGame } from './LayerStackGame';
import { SpeedCalcGame } from './SpeedCalcGame';
import { LightPathGame } from './LightPathGame';
import { DnaMatchGame } from './DnaMatchGame';
import { MagnetMazeGame } from './MagnetMazeGame';
import { StarChartGame } from './StarChartGame';
import { WaterCycleGame } from './WaterCycleGame';
import { useLanguage } from '@/context/LanguageContext';

interface GameModalV2Props {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const getBaseGameId = (id: string) => id.replace(/-c$/, '');

export const GameModalV2 = ({ game, isOpen, onClose, onComplete }: GameModalV2Props) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [difficulty, setDifficulty] = useState<Difficulty>(game.difficulty);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const { t } = useLanguage();

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(difficulty === 'Easy' ? 60 : difficulty === 'Medium' ? 45 : 30);
  }, [difficulty]);

  const endGame = useCallback(() => {
    setGameState('finished');
    onComplete(score);
  }, [score, onComplete]);

  const handleScoreUpdate = useCallback((points: number) => {
    setScore(prev => Math.max(0, prev + points));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { endGame(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, endGame]);

  const renderGame = () => {
    const props = { difficulty, onScoreUpdate: handleScoreUpdate, isPlaying: gameState === 'playing' };
    const baseId = getBaseGameId(game.id);
    switch (baseId) {
      case 'particle-catch': return <ParticleCatcherGame {...props} />;
      case 'math-flow': return <MathFlowGame {...props} />;
      case 'memory-matrix': return <MemoryMatrixGame {...props} />;
      case 'wave-rider': return <WaveRiderGame {...props} />;
      case 'orbit-puzzle': return <OrbitPuzzleGame {...props} />;
      case 'reaction-burst': return <ReactionBurstGame {...props} />;
      case 'code-breaker': return <CodeBreakerGame {...props} />;
      case 'color-match': return <ColorMatchGame {...props} />;
      case 'physics-launcher': return <PhysicsLauncherGame {...props} />;
      case 'element-builder': return <ElementBuilderGame {...props} />;
      case 'gravity-golf': return <GravityGolfGame {...props} />;
      case 'binary-decoder': return <BinaryDecoderGame {...props} />;
      case 'sound-matcher': return <SoundMatcherGame {...props} />;
      case 'circuit-builder': return <CircuitBuilderGame {...props} />;
      case 'ecosystem-balance': return <EcosystemBalanceGame {...props} />;
      case 'fraction-puzzle': return <FractionPuzzleGame {...props} />;
      case 'word-scramble': return <WordScrambleGame {...props} />;
      case 'pattern-sequence': return <PatternSequenceGame {...props} />;
      // New school games
      case 'number-ninja': return <NumberNinjaGame {...props} />;
      case 'dice-probability': return <DiceProbabilityGame {...props} />;
      case 'pixel-puzzle': return <PixelPuzzleGame {...props} />;
      case 'atom-builder': return <AtomBuilderGame {...props} />;
      case 'compass-quest': return <CompassQuestGame {...props} />;
      case 'layer-stack': return <LayerStackGame {...props} />;
      case 'speed-calc': return <SpeedCalcGame {...props} />;
      case 'light-path': return <LightPathGame {...props} />;
      case 'dna-match': return <DnaMatchGame {...props} />;
      case 'magnet-maze': return <MagnetMazeGame {...props} />;
      case 'star-chart': return <StarChartGame {...props} />;
      case 'water-cycle': return <WaterCycleGame {...props} />;
      // College-only games reuse similar mechanics
      case 'fourier-builder': return <MathFlowGame {...props} />;
      case 'vector-field': return <CompassQuestGame {...props} />;
      case 'quantum-quiz': return <StarChartGame {...props} />;
      case 'logic-optimizer': return <PatternSequenceGame {...props} />;
      case 'data-sort': return <LayerStackGame {...props} />;
      case 'graph-traverse': return <MagnetMazeGame {...props} />;
      case 'crypto-cipher': return <CodeBreakerGame {...props} />;
      case 'neural-train': return <NumberNinjaGame {...props} />;
      case 'signal-decode': return <BinaryDecoderGame {...props} />;
      case 'matrix-ops': return <SpeedCalcGame {...props} />;
      case 'stat-detective': return <DiceProbabilityGame {...props} />;
      case 'topology-puzzle': return <PixelPuzzleGame {...props} />;
      default: return <ParticleCatcherGame {...props} />;
    }
  };

  const difficultyColors = {
    Easy: 'text-neon-lime border-neon-lime/50 bg-neon-lime/10',
    Medium: 'text-neon-orange border-neon-orange/50 bg-neon-orange/10',
    Hard: 'text-neon-magenta border-neon-magenta/50 bg-neon-magenta/10',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <game.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{game.title}</h2>
                  <p className="text-xs text-muted-foreground">{game.skills.join(' • ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {gameState === 'playing' && (
                  <>
                    <div className="flex items-center gap-2 text-sm font-mono-lab"><Target className="w-4 h-4 text-neon-cyan" /><span className="text-neon-cyan font-bold">{score}</span></div>
                    <div className="flex items-center gap-2 text-sm font-mono-lab"><Clock className="w-4 h-4" /><span className={`font-bold ${timeLeft <= 10 ? 'text-neon-magenta animate-pulse' : 'text-neon-lime'}`}>{timeLeft}s</span></div>
                  </>
                )}
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="relative h-[450px] bg-background/50 overflow-hidden">
              {gameState === 'ready' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
                  <motion.div className="p-6 rounded-2xl bg-primary/10" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <game.icon className="w-16 h-16 text-primary" />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold gradient-text mb-2">{game.title}</h3>
                    <p className="text-muted-foreground max-w-md">{game.description}</p>
                  </div>
                  <div className="flex gap-3">
                    {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                      <motion.button key={d} onClick={() => setDifficulty(d)} className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${difficulty === d ? difficultyColors[d] : 'border-border hover:border-muted-foreground'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {d}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button onClick={startGame} className="mt-2 px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold flex items-center gap-3 text-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Play className="w-6 h-6" />{t('games.startGame')}
                  </motion.button>
                </motion.div>
              )}
              {gameState === 'playing' && renderGame()}
              {gameState === 'finished' && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Trophy className="w-20 h-20 text-neon-orange" />
                  <h3 className="text-3xl font-bold">{t('games.gameComplete')}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-8 h-8 text-neon-orange" />
                    <span className="text-5xl font-bold gradient-text">{score}</span>
                    <span className="text-xl text-muted-foreground">{t('games.points')}</span>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <motion.button onClick={startGame} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                      <RotateCcw className="w-5 h-5" />{t('games.playAgain')}
                    </motion.button>
                    <motion.button onClick={onClose} className="px-8 py-3 rounded-xl glass-panel font-medium" whileHover={{ scale: 1.05 }}>
                      {t('common.close')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
