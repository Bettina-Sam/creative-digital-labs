import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  lifetime: number;
  maxLifetime: number;
  type: 'normal' | 'fast' | 'shrinking' | 'growing';
  points: number;
}

interface ReactionBurstGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
}

export const ReactionBurstGame = ({ difficulty, onScoreUpdate, isPlaying }: ReactionBurstGameProps) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [missedCount, setMissedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const difficultySettings = {
    Easy: { spawnRate: 1500, minLifetime: 2500, types: ['normal'] },
    Medium: { spawnRate: 1200, minLifetime: 2000, types: ['normal', 'fast'] },
    Hard: { spawnRate: 800, minLifetime: 1500, types: ['normal', 'fast', 'shrinking', 'growing'] },
  };

  const settings = difficultySettings[difficulty];

  const spawnTarget = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const type = settings.types[Math.floor(Math.random() * settings.types.length)] as Target['type'];
    const lifetime = settings.minLifetime + Math.random() * 1000;
    
    const target: Target = {
      id: Date.now() + Math.random(),
      x: Math.random() * (rect.width - 80) + 40,
      y: Math.random() * (rect.height - 120) + 40,
      size: type === 'shrinking' ? 60 : type === 'growing' ? 20 : 50,
      lifetime,
      maxLifetime: lifetime,
      type,
      points: type === 'fast' ? 20 : type === 'shrinking' ? 25 : type === 'growing' ? 15 : 10,
    };

    setTargets(prev => [...prev, target]);
  }, [settings]);

  // Spawn targets
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(spawnTarget, settings.spawnRate);
    return () => clearInterval(interval);
  }, [isPlaying, spawnTarget, settings.spawnRate]);

  // Update targets
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTargets(prev => {
        const updated = prev.map(t => {
          let newSize = t.size;
          if (t.type === 'shrinking') {
            newSize = Math.max(15, t.size - 0.5);
          } else if (t.type === 'growing') {
            newSize = Math.min(70, t.size + 0.3);
          }
          
          return {
            ...t,
            lifetime: t.lifetime - 16,
            size: newSize,
          };
        });

        // Track missed targets
        const expired = updated.filter(t => t.lifetime <= 0);
        if (expired.length > 0) {
          setMissedCount(m => m + expired.length);
        }

        return updated.filter(t => t.lifetime > 0);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTargetClick = (target: Target) => {
    const reactionTime = target.maxLifetime - target.lifetime;
    setReactionTimes(prev => [...prev.slice(-10), reactionTime]);
    
    // Bonus for quick reactions
    const speedBonus = reactionTime < 500 ? 10 : reactionTime < 800 ? 5 : 0;
    const sizeBonus = target.type === 'shrinking' && target.size < 25 ? 15 : 0;
    const totalPoints = target.points + speedBonus + sizeBonus;
    
    onScoreUpdate(totalPoints);
    setTargets(prev => prev.filter(t => t.id !== target.id));
  };

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const getTargetColor = (target: Target) => {
    switch (target.type) {
      case 'fast': return 'hsl(320, 100%, 60%)';
      case 'shrinking': return 'hsl(270, 100%, 65%)';
      case 'growing': return 'hsl(85, 100%, 55%)';
      default: return 'hsl(185, 100%, 50%)';
    }
  };

  const getLifetimePercent = (target: Target) => target.lifetime / target.maxLifetime;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Stats */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="glass-panel px-3 py-2 rounded-lg text-sm">
          <span className="text-muted-foreground">Avg Reaction: </span>
          <span className={`font-bold ${avgReactionTime < 600 ? 'text-neon-lime' : 'text-neon-orange'}`}>
            {avgReactionTime}ms
          </span>
        </div>
        <div className="glass-panel px-3 py-2 rounded-lg text-sm">
          <span className="text-muted-foreground">Missed: </span>
          <span className="font-bold text-neon-magenta">{missedCount}</span>
        </div>
      </div>

      {/* Targets */}
      <AnimatePresence>
        {targets.map(target => (
          <motion.div
            key={target.id}
            className="absolute cursor-pointer"
            style={{
              left: target.x - target.size / 2,
              top: target.y - target.size / 2,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            onClick={() => handleTargetClick(target)}
          >
            {/* Lifetime ring */}
            <svg
              width={target.size + 10}
              height={target.size + 10}
              className="absolute -left-[5px] -top-[5px]"
            >
              <circle
                cx={(target.size + 10) / 2}
                cy={(target.size + 10) / 2}
                r={target.size / 2 + 2}
                fill="none"
                stroke={getTargetColor(target)}
                strokeWidth="3"
                strokeDasharray={`${getLifetimePercent(target) * Math.PI * (target.size + 4)} ${Math.PI * (target.size + 4)}`}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                opacity={0.5}
              />
            </svg>
            
            {/* Target circle */}
            <motion.div
              className="rounded-full flex items-center justify-center font-bold text-xs"
              style={{
                width: target.size,
                height: target.size,
                backgroundColor: getTargetColor(target),
                boxShadow: `0 0 20px ${getTargetColor(target)}`,
              }}
              whileHover={{ scale: 1.1 }}
              animate={target.type === 'fast' ? { 
                x: [0, 5, -5, 0],
              } : {}}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              +{target.points}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Legend */}
      {difficulty !== 'Easy' && (
        <div className="absolute bottom-16 left-4 flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-neon-cyan" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-neon-magenta" />
            <span>Fast (moves!)</span>
          </div>
          {difficulty === 'Hard' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-neon-purple" />
                <span>Shrinking</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-neon-lime" />
                <span>Growing</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground font-mono-lab">
          Click targets before they disappear! Fast reactions = bonus points!
        </p>
      </div>
    </div>
  );
};
