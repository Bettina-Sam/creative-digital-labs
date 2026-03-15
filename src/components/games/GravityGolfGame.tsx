import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GravityGolfProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

export const GravityGolfGame = ({ difficulty, onScoreUpdate, isPlaying }: GravityGolfProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef({ x: 60, y: 200, vx: 0, vy: 0, launched: false });
  const [aiming, setAiming] = useState(true);
  const [power, setPower] = useState(5);
  const [angle, setAngle] = useState(-30);
  const targetRef = useRef({ x: 500, y: 200 });
  const gravityWells = useRef<{ x: number; y: number; mass: number }[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) return;
    const wells = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;
    gravityWells.current = Array.from({ length: wells }, (_, i) => ({
      x: 150 + (i + 1) * 120,
      y: 100 + Math.random() * 250,
      mass: 500 + Math.random() * 500,
    }));
    targetRef.current = { x: 500 + Math.random() * 100, y: 80 + Math.random() * 300 };
    resetBall();
  }, [isPlaying, difficulty]);

  const resetBall = () => {
    ballRef.current = { x: 60, y: 200, vx: 0, vy: 0, launched: false };
    setAiming(true);
  };

  const launch = () => {
    const rad = (angle * Math.PI) / 180;
    ballRef.current.vx = Math.cos(rad) * power;
    ballRef.current.vy = Math.sin(rad) * power;
    ballRef.current.launched = true;
    setAiming(false);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;

      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, W, H);

      const ball = ballRef.current;
      const target = targetRef.current;

      // Gravity wells
      gravityWells.current.forEach(well => {
        const grad = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, 40);
        grad.addColorStop(0, 'rgba(100,50,255,0.4)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(well.x - 40, well.y - 40, 80, 80);
        ctx.beginPath();
        ctx.arc(well.x, well.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#8844ff';
        ctx.fill();
      });

      // Target
      ctx.beginPath();
      ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,255,100,0.3)';
      ctx.fill();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (ball.launched) {
        gravityWells.current.forEach(well => {
          const dx = well.x - ball.x;
          const dy = well.y - ball.y;
          const dist = Math.max(20, Math.sqrt(dx * dx + dy * dy));
          const force = well.mass / (dist * dist);
          ball.vx += (dx / dist) * force * 0.1;
          ball.vy += (dy / dist) * force * 0.1;
        });
        ball.x += ball.vx;
        ball.y += ball.vy;

        const dx = ball.x - target.x;
        const dy = ball.y - target.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          onScoreUpdate(difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 25 : 40);
          resetBall();
        }
        if (ball.x < -50 || ball.x > W + 50 || ball.y < -50 || ball.y > H + 50) {
          resetBall();
        }
      }

      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00ccff';
      ctx.fill();

      // Aim line
      if (aiming) {
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + Math.cos(rad) * power * 10, ball.y + Math.sin(rad) * power * 10);
        ctx.strokeStyle = 'rgba(0,200,255,0.5)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, aiming, angle, power, difficulty, onScoreUpdate]);

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
      {aiming && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 items-end">
          <div className="text-center">
            <label className="text-xs text-muted-foreground">Angle</label>
            <input type="range" min={-80} max={0} value={angle} onChange={e => setAngle(+e.target.value)} className="w-24" />
          </div>
          <div className="text-center">
            <label className="text-xs text-muted-foreground">Power</label>
            <input type="range" min={2} max={12} value={power} onChange={e => setPower(+e.target.value)} className="w-24" />
          </div>
          <motion.button onClick={launch} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm" whileTap={{ scale: 0.9 }}>
            Launch!
          </motion.button>
        </div>
      )}
    </div>
  );
};
