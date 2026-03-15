import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export const ProjectileEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(50);
  const [gravity, setGravity] = useState(9.8);
  const projectiles = useRef<{ x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[]; active: boolean }[]>([]);
  const animRef = useRef<number>(0);

  const launch = useCallback(() => {
    const rad = (angle * Math.PI) / 180;
    projectiles.current.push({
      x: 60, y: 0,
      vx: velocity * Math.cos(rad) * 0.5,
      vy: velocity * Math.sin(rad) * 0.5,
      trail: [], active: true,
    });
  }, [angle, velocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const dt = 0.15;
    const animate = () => {
      ctx.fillStyle = 'rgba(10,10,30,0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      const groundY = canvas.height - 40;
      ctx.fillStyle = 'hsl(120, 40%, 25%)';
      ctx.fillRect(0, groundY, canvas.width, 40);

      projectiles.current.forEach(p => {
        if (!p.active) return;
        p.vy -= gravity * dt * 0.3;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const screenX = p.x;
        const screenY = groundY - p.y;

        p.trail.push({ x: screenX, y: screenY });
        if (p.trail.length > 200) p.trail.shift();

        // Draw trail
        ctx.beginPath();
        p.trail.forEach((pt, i) => {
          ctx.strokeStyle = `hsla(185, 100%, 60%, ${i / p.trail.length})`;
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw ball
        ctx.beginPath();
        ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(25, 100%, 55%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(25, 100%, 75%)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (screenY >= groundY || screenX > canvas.width) p.active = false;
      });

      // Launcher
      const rad = (angle * Math.PI) / 180;
      ctx.save();
      ctx.translate(60, groundY);
      ctx.rotate(-rad);
      ctx.fillStyle = 'hsl(185, 100%, 50%)';
      ctx.fillRect(0, -3, 40, 6);
      ctx.restore();

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [angle, gravity]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Angle: {angle}°</span>
          <input type="range" min="5" max="85" value={angle} onChange={e => setAngle(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Velocity: {velocity}</span>
          <input type="range" min="10" max="100" value={velocity} onChange={e => setVelocity(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Gravity: {gravity.toFixed(1)}</span>
          <input type="range" min="1" max="20" step="0.1" value={gravity} onChange={e => setGravity(+e.target.value)} className="w-24" />
        </label>
        <motion.button onClick={launch} whileTap={{ scale: 0.9 }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          Launch 🚀
        </motion.button>
      </div>
    </div>
  );
};
