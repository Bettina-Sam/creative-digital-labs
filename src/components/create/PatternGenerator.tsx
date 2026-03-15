import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PATTERNS = [
  { id: 'circles', label: 'Concentric Circles' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'grid', label: 'Grid Dots' },
  { id: 'waves', label: 'Wave Pattern' },
  { id: 'mandala', label: 'Mandala' },
];

export const PatternGenerator = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState('circles');
  const [density, setDensity] = useState(20);
  const [hue, setHue] = useState(180);
  const [animate, setAnimate] = useState(true);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 500; canvas.height = 500;
    let time = 0;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2;
      const t = animate ? time : 0;

      if (pattern === 'circles') {
        for (let i = 0; i < density; i++) {
          const r = (i / density) * Math.min(cx, cy);
          ctx.beginPath();
          ctx.arc(cx, cy, r + Math.sin(t + i * 0.3) * 5, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${hue + i * (360 / density)}, 80%, 60%, 0.6)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (pattern === 'spiral') {
        ctx.beginPath();
        for (let a = 0; a < density * 20; a += 0.1) {
          const r = a * 3 + Math.sin(t + a * 0.1) * 5;
          const x = cx + Math.cos(a + t * 0.5) * r;
          const y = cy + Math.sin(a + t * 0.5) * r;
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (pattern === 'grid') {
        const step = Math.max(500 / density, 10);
        for (let x = step; x < width; x += step) {
          for (let y = step; y < height; y += step) {
            const dist = Math.hypot(x - cx, y - cy);
            const size = 3 + Math.sin(t + dist * 0.02) * 2;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(size, 1), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue + dist * 0.5}, 80%, 60%, 0.7)`;
            ctx.fill();
          }
        }
      } else if (pattern === 'waves') {
        for (let i = 0; i < density; i++) {
          ctx.beginPath();
          const yBase = (i / density) * height;
          for (let x = 0; x < width; x++) {
            const y = yBase + Math.sin(x * 0.02 + t + i * 0.5) * 15;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `hsla(${hue + i * 15}, 80%, 60%, 0.5)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (pattern === 'mandala') {
        const petals = density;
        for (let i = 0; i < petals; i++) {
          const angle = (i / petals) * Math.PI * 2 + t * 0.3;
          for (let r = 20; r < Math.min(cx, cy); r += 20) {
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const size = 3 + Math.sin(t + r * 0.05) * 2;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(size, 1), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue + r}, 80%, 60%, 0.6)`;
            ctx.fill();
          }
        }
      }

      time += 0.02;
      if (animate) animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [isOpen, pattern, density, hue, animate]);

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel rounded-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold gradient-text">Pattern Generator</h2>
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg bg-muted">✕</button>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-xl border border-border mb-4" style={{ aspectRatio: '1' }} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Pattern</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {PATTERNS.map(p => (
                <button key={p.id} onClick={() => setPattern(p.id)} className={`text-[10px] px-2 py-1 rounded ${pattern === p.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>{p.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Density: {density}</label>
            <input type="range" min="5" max="40" value={density} onChange={e => setDensity(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Hue: {hue}°</label>
            <input type="range" min="0" max="360" value={hue} onChange={e => setHue(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setAnimate(!animate)} className={`text-xs px-3 py-1.5 rounded-lg ${animate ? 'bg-neon-lime/20 text-neon-lime' : 'text-muted-foreground'}`}>
              {animate ? '⏸ Pause' : '▶ Animate'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
