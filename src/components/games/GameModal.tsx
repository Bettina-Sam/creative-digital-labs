import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trophy, RotateCcw, Play } from 'lucide-react';
import { Game } from './GamesSection';

interface GameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  value?: number;
}

export const GameModal = ({ game, isOpen, onClose, onComplete }: GameModalProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const colors = ['#00FFD1', '#FF00FF', '#CCFF00', '#FF6600'];

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setParticles([]);
  }, []);

  const endGame = useCallback(() => {
    setGameState('finished');
    onComplete(score);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [score, onComplete]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endGame]);

  // Spawn particles for certain game types
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnParticle = () => {
      const id = Date.now() + Math.random();
      const particle: Particle = {
        id,
        x: Math.random() * 400 + 50,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 20 + 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        value: Math.floor(Math.random() * 10) + 1,
      };
      setParticles(prev => [...prev, particle]);
    };

    const interval = setInterval(spawnParticle, 800);
    return () => clearInterval(interval);
  }, [gameState]);

  // Update particles
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updateParticles = () => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.05, // gravity
          }))
          .filter(p => p.y < 450) // Remove particles that fall off screen
      );
      animationRef.current = requestAnimationFrame(updateParticles);
    };

    animationRef.current = requestAnimationFrame(updateParticles);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  const handleParticleClick = (particle: Particle) => {
    if (gameState !== 'playing') return;
    
    setScore(prev => prev + (particle.value || 10));
    setParticles(prev => prev.filter(p => p.id !== particle.id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <game.icon className={`w-6 h-6 text-${game.color}`} />
                <h2 className="text-xl font-bold">{game.title}</h2>
              </div>
              <div className="flex items-center gap-4">
                {gameState === 'playing' && (
                  <>
                    <div className="text-sm font-mono-lab">
                      <span className="text-muted-foreground">Score: </span>
                      <span className="text-neon-cyan font-bold">{score}</span>
                    </div>
                    <div className="text-sm font-mono-lab">
                      <span className="text-muted-foreground">Time: </span>
                      <span className={`font-bold ${timeLeft <= 10 ? 'text-neon-magenta' : 'text-neon-lime'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                  </>
                )}
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Game Area */}
            <div className="relative h-[400px] bg-background/50 overflow-hidden">
              {gameState === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  <game.icon className={`w-16 h-16 text-${game.color}`} />
                  <h3 className="text-2xl font-bold">{game.title}</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-muted">
                      {game.difficulty}
                    </span>
                    <span className="text-muted-foreground">• 30 seconds</span>
                  </div>
                  <motion.button
                    onClick={startGame}
                    className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </motion.button>
                </motion.div>
              )}

              {gameState === 'playing' && (
                <div className="absolute inset-0">
                  {/* Particles */}
                  {particles.map(particle => (
                    <motion.div
                      key={particle.id}
                      className="absolute cursor-pointer"
                      style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                      }}
                      onClick={() => handleParticleClick(particle)}
                      whileHover={{ scale: 1.2 }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: particle.color,
                          boxShadow: `0 0 20px ${particle.color}`,
                        }}
                      >
                        +{particle.value}
                      </div>
                    </motion.div>
                  ))}

                  {/* Instructions */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <p className="text-sm text-muted-foreground font-mono-lab">
                      Click the particles to score points!
                    </p>
                  </div>
                </div>
              )}

              {gameState === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  <Trophy className="w-16 h-16 text-neon-orange" />
                  <h3 className="text-3xl font-bold">Game Over!</h3>
                  <div className="text-5xl font-bold gradient-text">{score}</div>
                  <p className="text-muted-foreground">points</p>
                  <div className="flex gap-3 mt-4">
                    <motion.button
                      onClick={startGame}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                      Play Again
                    </motion.button>
                    <motion.button
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl glass-panel font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex gap-2">
                  {game.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 rounded bg-muted">
                      {skill}
                    </span>
                  ))}
                </div>
                <span className="font-mono-lab">Educational Game</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
