import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Wand2 } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

type Pattern = 'spiral' | 'rose' | 'lissajous' | 'fibonacci';

export const MathArt = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState<Pattern>('spiral');
  const [param, setParam] = useState(5);
  const [hue, setHue] = useState(180);

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, c.width, c.height);
    const cx = c.width / 2, cy = c.height / 2;
    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    if (pattern === 'spiral') {
      for (let t = 0; t < 20 * Math.PI; t += 0.02) {
        const r = t * param;
        ctx.lineTo(cx + r * Math.cos(t), cy + r * Math.sin(t));
        ctx.strokeStyle = `hsl(${hue + t * 5}, 100%, 60%)`;
        ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + r * Math.cos(t), cy + r * Math.sin(t));
      }
    } else if (pattern === 'rose') {
      for (let t = 0; t < 2 * Math.PI; t += 0.005) {
        const r = 120 * Math.cos(param * t);
        ctx.lineTo(cx + r * Math.cos(t), cy + r * Math.sin(t));
      }
      ctx.closePath(); ctx.stroke();
    } else if (pattern === 'lissajous') {
      for (let t = 0; t < 2 * Math.PI; t += 0.005) {
        ctx.lineTo(cx + 120 * Math.sin(param * t + Math.PI / 4), cy + 120 * Math.sin((param + 1) * t));
      }
      ctx.stroke();
    } else {
      let a = 0, b = 1;
      for (let i = 0; i < param * 20; i++) {
        const angle = i * 2.4; const r = Math.sqrt(i) * 8;
        ctx.beginPath();
        ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue + i * 3}, 80%, 60%)`;
        ctx.fill();
        [a, b] = [b, a + b];
      }
    }
  }, [isOpen, pattern, param, hue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-neon-purple" /><h2 className="font-bold">Math Art</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 p-3 border-b border-border flex-wrap">
              {(['spiral', 'rose', 'lissajous', 'fibonacci'] as Pattern[]).map(p => (
                <button key={p} onClick={() => setPattern(p)} className={`px-3 py-1 rounded-lg text-sm capitalize ${pattern === p ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{p}</button>
              ))}
              <input type="range" min="1" max="12" value={param} onChange={e => setParam(+e.target.value)} className="w-20" />
              <input type="range" min="0" max="360" value={hue} onChange={e => setHue(+e.target.value)} className="w-20" />
            </div>
            <canvas ref={canvasRef} className="w-full h-[400px]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
