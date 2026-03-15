import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

interface Projectile {
  x: number; y: number; vx: number; vy: number; active: boolean;
}

interface Target {
  x: number; y: number; radius: number; hit: boolean; points: number;
}

export const PhysicsLauncherGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const projRef = useRef<Projectile | null>(null);
  const targetsRef = useRef<Target[]>([]);
  const [shots, setShots] = useState(0);

  const gravity = difficulty === 'Easy' ? 0.15 : difficulty === 'Medium' ? 0.2 : 0.25;

  const generateTargets = useCallback(() => {
    const count = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 4 : 5;
    targetsRef.current = Array.from({ length: count }, (_, i) => ({
      x: 300 + i * 120 + Math.random() * 60,
      y: 200 + Math.random() * 200,
      radius: difficulty === 'Easy' ? 25 : difficulty === 'Medium' ? 20 : 15,
      hit: false,
      points: (i + 1) * 10,
    }));
  }, [difficulty]);

  useEffect(() => {
    if (isPlaying) {
      generateTargets();
      setShots(0);
    }
  }, [isPlaying, generateTargets]);

  const launch = useCallback(() => {
    if (!isPlaying) return;
    const rad = (angle * Math.PI) / 180;
    const speed = power * 0.15;
    projRef.current = { x: 60, y: 400, vx: Math.cos(rad) * speed, vy: -Math.sin(rad) * speed, active: true };
    setShots(s => s + 1);
  }, [angle, power, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(10,10,20,0.3)';
      ctx.fillRect(0, 0, width, height);

      // Ground
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, height - 20, width, 20);

      // Launcher
      const launchX = 60, launchY = height - 40;
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(launchX, launchY);
      ctx.lineTo(launchX + Math.cos(rad) * 40, launchY - Math.sin(rad) * 40);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(launchX, launchY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();

      // Targets
      for (const t of targetsRef.current) {
        if (t.hit) continue;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff660030';
        ctx.fill();
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ff6600';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${t.points}`, t.x, t.y + 4);
      }

      // Projectile
      const proj = projRef.current;
      if (proj && proj.active) {
        proj.vy += gravity;
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Hit detection
        for (const t of targetsRef.current) {
          if (!t.hit && Math.hypot(proj.x - t.x, proj.y - t.y) < t.radius + 5) {
            t.hit = true;
            onScoreUpdate(t.points);
            proj.active = false;
          }
        }

        // Out of bounds
        if (proj.x > width || proj.y > height) proj.active = false;

        if (proj.active) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#a0ff00';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#a0ff00';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Check if all hit
      if (targetsRef.current.length > 0 && targetsRef.current.every(t => t.hit)) {
        onScoreUpdate(30); // Bonus
        generateTargets();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, gravity, onScoreUpdate, generateTargets]);

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 glass-panel p-2 rounded-xl">
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground">Angle: {angle}°</label>
          <input type="range" min="10" max="80" value={angle} onChange={e => setAngle(+e.target.value)} className="w-full accent-primary h-1" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground">Power: {power}%</label>
          <input type="range" min="20" max="100" value={power} onChange={e => setPower(+e.target.value)} className="w-full accent-neon-orange h-1" />
        </div>
        <motion.button onClick={launch} className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs font-bold" whileTap={{ scale: 0.9 }}>
          🚀 Launch
        </motion.button>
        <span className="text-[10px] text-muted-foreground">Shots: {shots}</span>
      </div>
    </div>
  );
};
