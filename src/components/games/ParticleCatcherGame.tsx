import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  points: number;
  type: 'normal' | 'bonus' | 'danger';
}

interface ParticleCatcherGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
}

export const ParticleCatcherGame = ({ difficulty, onScoreUpdate, isPlaying }: ParticleCatcherGameProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combo, setCombo] = useState(0);
  const [lastCatchTime, setLastCatchTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const difficultySettings = {
    Easy: { spawnRate: 1200, gravity: 0.03, maxParticles: 8 },
    Medium: { spawnRate: 800, gravity: 0.05, maxParticles: 12 },
    Hard: { spawnRate: 500, gravity: 0.08, maxParticles: 18 },
  };

  const settings = difficultySettings[difficulty];

  const colors = {
    normal: ['#00FFD1', '#CCFF00'],
    bonus: ['#FFD700', '#FF6600'],
    danger: ['#FF0066'],
  };

  const spawnParticle = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const typeRoll = Math.random();
    const type: Particle['type'] = typeRoll > 0.9 ? 'danger' : typeRoll > 0.75 ? 'bonus' : 'normal';
    const colorArray = colors[type];
    
    const particle: Particle = {
      id: Date.now() + Math.random(),
      x: Math.random() * (rect.width - 40) + 20,
      y: -30,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random(),
      size: type === 'bonus' ? 35 : type === 'danger' ? 25 : 28,
      color: colorArray[Math.floor(Math.random() * colorArray.length)],
      points: type === 'bonus' ? 25 : type === 'danger' ? -15 : 10,
      type,
    };
    
    setParticles(prev => [...prev.slice(-settings.maxParticles), particle]);
  }, [settings.maxParticles]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(spawnParticle, settings.spawnRate);
    return () => clearInterval(interval);
  }, [isPlaying, spawnParticle, settings.spawnRate]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const updateParticles = () => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + settings.gravity,
          }))
          .filter(p => p.y < 420)
      );
    };

    const interval = setInterval(updateParticles, 16);
    return () => clearInterval(interval);
  }, [isPlaying, settings.gravity]);

  const handleCatch = (particle: Particle) => {
    const now = Date.now();
    const timeSinceLastCatch = now - lastCatchTime;
    
    let newCombo = combo;
    if (timeSinceLastCatch < 1000 && particle.type !== 'danger') {
      newCombo = Math.min(combo + 1, 10);
    } else if (particle.type === 'danger') {
      newCombo = 0;
    } else {
      newCombo = 1;
    }
    
    setCombo(newCombo);
    setLastCatchTime(now);
    
    const multiplier = 1 + (newCombo * 0.1);
    const points = Math.round(particle.points * multiplier);
    onScoreUpdate(points);
    
    setParticles(prev => prev.filter(p => p.id !== particle.id));
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Combo Display */}
      {combo > 1 && (
        <motion.div
          key={combo}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 text-neon-orange font-bold text-xl"
        >
          {combo}x COMBO!
        </motion.div>
      )}

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
          onClick={() => handleCatch(particle)}
          whileHover={{ scale: 1.3 }}
          animate={{
            rotate: particle.type === 'bonus' ? [0, 360] : 0,
          }}
          transition={{
            rotate: { repeat: Infinity, duration: 2 },
          }}
        >
          <div
            className={`w-full h-full flex items-center justify-center text-xs font-bold ${
              particle.type === 'danger' ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: particle.color,
              borderRadius: particle.type === 'danger' ? '4px' : '50%',
              boxShadow: `0 0 ${particle.type === 'bonus' ? 25 : 15}px ${particle.color}`,
              transform: particle.type === 'danger' ? 'rotate(45deg)' : 'none',
            }}
          >
            {particle.type === 'bonus' ? '★' : particle.type === 'danger' ? '✕' : `+${particle.points}`}
          </div>
        </motion.div>
      ))}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground font-mono-lab">
          Click particles to catch! ⭐ = Bonus | ✕ = Avoid | Chain catches for combos!
        </p>
      </div>
    </div>
  );
};
