import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Flower2 } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const FourierDraw = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [harmonics, setHarmonics] = useState(5);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    let t = 0;
    const trail: { x: number; y: number }[] = [];
    let anim: number;

    const draw = () => {
      t += 0.02 * speed;
      ctx.fillStyle = 'rgba(10,10,26,0.1)';
      ctx.fillRect(0, 0, c.width, c.height);
      let x = c.width * 0.3, y = c.height / 2;
      for (let n = 0; n < harmonics; n++) {
        const k = 2 * n + 1;
        const r = 80 / k;
        const prevX = x, prevY = y;
        x += r * Math.cos(k * t);
        y += r * Math.sin(k * t);
        ctx.strokeStyle = `hsla(${180 + n * 30}, 100%, 60%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(prevX, prevY, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `hsla(${180 + n * 30}, 100%, 60%, 0.7)`;
        ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(x, y); ctx.stroke();
      }
      trail.unshift({ x: c.width * 0.7, y });
      if (trail.length > 500) trail.pop();
      // Connect to trail
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(trail[0].x, trail[0].y); ctx.stroke();
      // Draw trail
      ctx.beginPath();
      trail.forEach((p, i) => { const px = p.x + i * 0.5; i === 0 ? ctx.moveTo(px, p.y) : ctx.lineTo(px, p.y); });
      ctx.strokeStyle = '#ff6ec7';
      ctx.lineWidth = 2;
      ctx.stroke();
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [isOpen, harmonics, speed]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Flower2 className="w-5 h-5 text-neon-cyan" /><h2 className="font-bold">Fourier Series Drawing</h2></div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Harmonics: {harmonics}</label>
                <input type="range" min="1" max="20" value={harmonics} onChange={e => setHarmonics(+e.target.value)} className="w-20" />
                <label className="text-xs text-muted-foreground">Speed</label>
                <input type="range" min="0.1" max="3" step="0.1" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-16" />
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full h-[420px]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
