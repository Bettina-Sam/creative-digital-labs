import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Ruler } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const RulerDraw = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'line' | 'rect' | 'circle'>('line');
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const linesRef = useRef<{ type: string; x1: number; y1: number; x2: number; y2: number }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    redraw();
  }, [isOpen]);

  const redraw = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, c.width, c.height);
    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < c.width; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }
    linesRef.current.forEach(l => {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (l.type === 'line') { ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); }
      else if (l.type === 'rect') { ctx.rect(l.x1, l.y1, l.x2 - l.x1, l.y2 - l.y1); }
      else { const r = Math.hypot(l.x2 - l.x1, l.y2 - l.y1); ctx.arc(l.x1, l.y1, r, 0, Math.PI * 2); }
      ctx.stroke();
      // measurement
      const dist = Math.round(Math.hypot(l.x2 - l.x1, l.y2 - l.y1));
      ctx.fillStyle = '#ff6ec7';
      ctx.font = '11px monospace';
      ctx.fillText(`${dist}px`, (l.x1 + l.x2) / 2 + 5, (l.y1 + l.y2) / 2 - 5);
    });
  };

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const handleDown = (e: React.MouseEvent) => setStart(getPos(e));
  const handleUp = (e: React.MouseEvent) => {
    if (!start) return;
    const end = getPos(e);
    linesRef.current.push({ type: tool, x1: start.x, y1: start.y, x2: end.x, y2: end.y });
    setStart(null);
    redraw();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Ruler className="w-5 h-5 text-neon-purple" /><h2 className="font-bold">Ruler Draw</h2></div>
              <div className="flex items-center gap-2">
                {(['line', 'rect', 'circle'] as const).map(t => (
                  <button key={t} onClick={() => setTool(t)} className={`px-3 py-1 rounded-lg text-sm capitalize ${tool === t ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{t}</button>
                ))}
                <button onClick={() => { linesRef.current = []; redraw(); }} className="px-3 py-1 rounded-lg glass-panel text-sm">Clear</button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full h-[420px] cursor-crosshair" onMouseDown={handleDown} onMouseUp={handleUp} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
