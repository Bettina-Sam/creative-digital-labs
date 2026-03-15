import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

interface Component { type: 'battery' | 'resistor' | 'led' | 'wire'; x: number; y: number; }

export const CircuitDraw = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'battery' | 'resistor' | 'led' | 'wire'>('wire');
  const componentsRef = useRef<Component[]>([]);

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
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x < c.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    componentsRef.current.forEach(comp => {
      ctx.save();
      ctx.translate(comp.x, comp.y);
      if (comp.type === 'battery') {
        ctx.strokeStyle = '#ff9500'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(-15, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-8, 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(7, -18); ctx.lineTo(7, 18); ctx.stroke();
      } else if (comp.type === 'resistor') {
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        for (let i = 0; i < 6; i++) { ctx.lineTo(-15 + i * 6, i % 2 === 0 ? -8 : 8); }
        ctx.lineTo(20, 0); ctx.stroke();
      } else if (comp.type === 'led') {
        ctx.fillStyle = '#a3ff12';
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-8, 10); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#a3ff12'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(12, -10); ctx.lineTo(12, 10); ctx.stroke();
      } else {
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / 30) * 30;
    const y = Math.round((e.clientY - rect.top) / 30) * 30;
    componentsRef.current.push({ type: tool, x, y });
    redraw();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-neon-purple" /><h2 className="font-bold">Circuit Diagram Editor</h2></div>
              <div className="flex items-center gap-2">
                {(['wire', 'battery', 'resistor', 'led'] as const).map(t => (
                  <button key={t} onClick={() => setTool(t)} className={`px-3 py-1 rounded-lg text-sm capitalize ${tool === t ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{t}</button>
                ))}
                <button onClick={() => { componentsRef.current = []; redraw(); }} className="px-3 py-1 rounded-lg glass-panel text-sm">Clear</button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <canvas ref={canvasRef} onClick={handleClick} className="w-full h-[400px] cursor-crosshair" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
