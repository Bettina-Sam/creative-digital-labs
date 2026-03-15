import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Shapes } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const ShapeBuilder = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shape, setShape] = useState<'circle' | 'square' | 'triangle' | 'star'>('circle');
  const [color, setColor] = useState('#00e5ff');
  const [size, setSize] = useState(60);
  const shapesRef = useRef<{ x: number; y: number; type: string; color: string; size: number }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redraw(ctx, canvas);
  }, [isOpen]);

  const redraw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    shapesRef.current.forEach(s => drawShape(ctx, s));
  };

  const drawShape = (ctx: CanvasRenderingContext2D, s: { x: number; y: number; type: string; color: string; size: number }) => {
    ctx.fillStyle = s.color;
    ctx.beginPath();
    if (s.type === 'circle') { ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2); }
    else if (s.type === 'square') { ctx.rect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size); }
    else if (s.type === 'triangle') {
      ctx.moveTo(s.x, s.y - s.size / 2);
      ctx.lineTo(s.x - s.size / 2, s.y + s.size / 2);
      ctx.lineTo(s.x + s.size / 2, s.y + s.size / 2);
      ctx.closePath();
    } else if (s.type === 'star') {
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        const b = ((i * 72) + 36 - 90) * Math.PI / 180;
        ctx.lineTo(s.x + Math.cos(a) * s.size / 2, s.y + Math.sin(a) * s.size / 2);
        ctx.lineTo(s.x + Math.cos(b) * s.size / 4, s.y + Math.sin(b) * s.size / 4);
      }
      ctx.closePath();
    }
    ctx.fill();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    shapesRef.current.push({ x, y, type: shape, color, size });
    const ctx = canvas.getContext('2d')!;
    redraw(ctx, canvas);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Shapes className="w-5 h-5 text-neon-magenta" /><h2 className="font-bold">Shape Builder</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-3 p-3 border-b border-border flex-wrap">
              {(['circle', 'square', 'triangle', 'star'] as const).map(s => (
                <button key={s} onClick={() => setShape(s)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${shape === s ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{s}</button>
              ))}
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="range" min="20" max="120" value={size} onChange={e => setSize(+e.target.value)} className="w-24" />
              <button onClick={() => { shapesRef.current = []; const c = canvasRef.current!; const ctx = c.getContext('2d')!; redraw(ctx, c); }} className="px-3 py-1.5 rounded-lg glass-panel text-sm">Clear</button>
            </div>
            <canvas ref={canvasRef} onClick={handleClick} className="w-full h-[400px] cursor-crosshair" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
