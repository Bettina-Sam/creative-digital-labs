import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface WaveRiderGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'diamond';
  collected: boolean;
}

export const WaveRiderGame = ({ difficulty, onScoreUpdate, isPlaying }: WaveRiderGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerY, setPlayerY] = useState(200);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [perfectRides, setPerfectRides] = useState(0);
  const timeRef = useRef(0);
  const isOnWaveRef = useRef(false);

  const difficultySettings = {
    Easy: { amplitude: 60, frequency: 0.02, speed: 1.5 },
    Medium: { amplitude: 80, frequency: 0.025, speed: 2 },
    Hard: { amplitude: 100, frequency: 0.03, speed: 2.5 },
  };

  const settings = difficultySettings[difficulty];

  const getWaveY = useCallback((x: number, time: number) => {
    return 200 + Math.sin((x * settings.frequency) + time) * settings.amplitude;
  }, [settings]);

  // Spawn collectibles
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const newCollectible: Collectible = {
        id: Date.now(),
        x: 520,
        y: getWaveY(520, timeRef.current) - 20,
        type: Math.random() > 0.7 ? 'diamond' : 'star',
        collected: false,
      };
      setCollectibles(prev => [...prev.slice(-10), newCollectible]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, getWaveY]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 400;

    const playerX = 100;
    let animationId: number;

    const render = () => {
      timeRef.current += settings.speed * 0.05;

      // Clear
      ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw wave
      ctx.strokeStyle = 'hsl(185, 100%, 50%)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'hsl(185, 100%, 50%)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = getWaveY(x, timeRef.current);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Wave Y at player position
      const waveYAtPlayer = getWaveY(playerX, timeRef.current);

      // Check if player is riding the wave
      const distanceFromWave = Math.abs(playerY - waveYAtPlayer);
      isOnWaveRef.current = distanceFromWave < 15;

      if (isOnWaveRef.current) {
        onScoreUpdate(1); // Continuous points for riding
      }

      // Draw player
      ctx.fillStyle = isOnWaveRef.current ? 'hsl(85, 100%, 55%)' : 'hsl(320, 100%, 60%)';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(playerX, playerY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.strokeStyle = isOnWaveRef.current ? 'hsla(85, 100%, 55%, 0.5)' : 'hsla(320, 100%, 60%, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerX, playerY);
      ctx.lineTo(playerX - 40, playerY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Update and draw collectibles
      setCollectibles(prev => {
        return prev.map(c => {
          const newX = c.x - settings.speed;
          
          // Check collection
          if (!c.collected && Math.abs(c.x - playerX) < 20 && Math.abs(c.y - playerY) < 25) {
            const points = c.type === 'diamond' ? 25 : 10;
            onScoreUpdate(points);
            return { ...c, x: newX, collected: true };
          }
          
          return { ...c, x: newX };
        }).filter(c => c.x > -20);
      });

      // Draw collectibles
      collectibles.forEach(c => {
        if (c.collected) return;
        ctx.fillStyle = c.type === 'diamond' ? 'hsl(270, 100%, 65%)' : 'hsl(45, 100%, 60%)';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.font = '20px Arial';
        ctx.fillText(c.type === 'diamond' ? '💎' : '⭐', c.x - 10, c.y + 5);
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, playerY, settings, getWaveY, onScoreUpdate, collectibles]);

  // Player controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      setPlayerY(Math.max(50, Math.min(350, y)));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Status */}
      <motion.div
        className={`mb-4 px-4 py-2 rounded-full text-sm font-bold ${
          isOnWaveRef.current ? 'bg-neon-lime/20 text-neon-lime' : 'bg-neon-magenta/20 text-neon-magenta'
        }`}
        animate={{ scale: isOnWaveRef.current ? [1, 1.05, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {isOnWaveRef.current ? '🌊 Riding the Wave!' : '↕ Move to the wave!'}
      </motion.div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-border bg-background/50"
      />

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground font-mono-lab">
          Move your mouse up/down to ride the sine wave • Collect stars and diamonds!
        </p>
        <p className="text-xs text-neon-cyan mt-1">
          y = A × sin(ωx + t) — You're learning trigonometry!
        </p>
      </div>
    </div>
  );
};
