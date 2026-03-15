import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const LightArt = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(180);
  const [glow, setGlow] = useState(20);
  const drawing = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
  }, [isOpen]);

  const paint = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const rect = c.getBoundingClientRect();
    const pt = 'touches' in e ? e.touches[0] : e;
    const x = pt.clientX - rect.left, y = pt.clientY - rect.top;
    ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
    ctx.shadowBlur = glow;
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-neon-lime" /><h2 className="font-bold">Light Art</h2></div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Hue</label>
                <input type="range" min="0" max="360" value={hue} onChange={e => setHue(+e.target.value)} className="w-20" />
                <label className="text-xs text-muted-foreground">Glow</label>
                <input type="range" min="5" max="60" value={glow} onChange={e => setGlow(+e.target.value)} className="w-20" />
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full h-[420px] cursor-crosshair touch-none bg-black"
              onMouseDown={() => { drawing.current = true; }} onMouseMove={paint} onMouseUp={() => { drawing.current = false; }} onMouseLeave={() => { drawing.current = false; }}
              onTouchStart={() => { drawing.current = true; }} onTouchMove={paint} onTouchEnd={() => { drawing.current = false; }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
