import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, BarChart3 } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const GraphPlotter = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fn, setFn] = useState('Math.sin(x)');
  const [range, setRange] = useState(10);

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, c.width, c.height);
    const cx = c.width / 2, cy = c.height / 2;
    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(c.width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, c.height); ctx.stroke();
    // Grid
    const pxPerUnit = cx / range;
    for (let i = -range; i <= range; i++) {
      const x = cx + i * pxPerUnit;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
      if (i !== 0) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px monospace'; ctx.fillText(String(i), x - 3, cy + 14); }
    }
    // Plot
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < c.width; px++) {
      const x = (px - cx) / pxPerUnit;
      try {
        const y = new Function('x', `return ${fn}`)(x) as number;
        if (!isFinite(y)) { started = false; continue; }
        const py = cy - y * pxPerUnit;
        started ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), started = true);
      } catch { break; }
    }
    ctx.stroke();
  }, [isOpen, fn, range]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-neon-lime" /><h2 className="font-bold">Graph Plotter</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 p-3 border-b border-border flex-wrap items-center">
              <span className="text-sm text-muted-foreground">f(x) =</span>
              <input value={fn} onChange={e => setFn(e.target.value)} className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg font-mono text-sm" />
              <label className="text-xs text-muted-foreground">Range: ±{range}</label>
              <input type="range" min="1" max="30" value={range} onChange={e => setRange(+e.target.value)} className="w-16" />
            </div>
            <canvas ref={canvasRef} className="w-full h-[380px]" />
            <div className="flex gap-2 p-3 flex-wrap">
              {['Math.sin(x)', 'x*x', 'Math.cos(x)*x', 'Math.tan(x)', '1/x', 'Math.exp(-x*x)'].map(f => (
                <button key={f} onClick={() => setFn(f)} className="px-2 py-1 rounded-lg glass-panel text-xs font-mono">{f}</button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
