import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const GlobePaint = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#00e5ff');

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, c.width, c.height);
    // Draw grid globe
    const cx = c.width / 2, cy = c.height / 2, r = Math.min(cx, cy) - 40;
    ctx.strokeStyle = 'rgba(0,229,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = cy + r * Math.sin(lat * Math.PI / 180);
      const rx = r * Math.cos(lat * Math.PI / 180);
      ctx.beginPath(); ctx.ellipse(cx, y, rx, 5, 0, 0, Math.PI * 2); ctx.stroke();
    }
    for (let lon = 0; lon < 180; lon += 30) {
      ctx.beginPath(); ctx.ellipse(cx, cy, r * Math.sin(lon * Math.PI / 180), r, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }, [isOpen]);

  const paint = (e: React.MouseEvent) => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const rect = c.getBoundingClientRect();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-neon-orange" /><h2 className="font-bold">Globe Paint</h2></div>
              <div className="flex items-center gap-3">
                {['#00e5ff', '#ff6ec7', '#a3ff12', '#ff9500', '#b388ff'].map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c }} />
                ))}
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <canvas ref={canvasRef} onClick={paint} className="w-full h-[420px] cursor-crosshair" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
