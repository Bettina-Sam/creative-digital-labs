import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Wand2 } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const ShaderLab = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [preset, setPreset] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    let anim: number;
    let t = 0;
    const draw = () => {
      t += 0.02;
      const ctx = c.getContext('2d')!;
      const img = ctx.createImageData(c.width, c.height);
      for (let y = 0; y < c.height; y += 2) {
        for (let x = 0; x < c.width; x += 2) {
          const u = x / c.width, v = y / c.height;
          let r = 0, g = 0, b = 0;
          if (preset === 0) {
            r = Math.sin(u * 10 + t) * 127 + 128;
            g = Math.sin(v * 10 + t * 1.3) * 127 + 128;
            b = Math.sin((u + v) * 10 + t * 0.7) * 127 + 128;
          } else if (preset === 1) {
            const d = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2);
            r = Math.sin(d * 20 - t * 3) * 200;
            g = Math.sin(d * 20 - t * 3 + 2) * 200;
            b = Math.sin(d * 20 - t * 3 + 4) * 200;
          } else {
            r = Math.sin(u * Math.cos(t) * 20) * 200;
            g = Math.cos(v * Math.sin(t) * 20) * 200;
            b = Math.sin((u * v) * 40 + t) * 200;
          }
          for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
            const i = ((y + dy) * c.width + (x + dx)) * 4;
            img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [isOpen, preset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-neon-purple" /><h2 className="font-bold">Shader Lab</h2></div>
              <div className="flex items-center gap-2">
                {['Plasma', 'Ripple', 'Matrix'].map((p, i) => (
                  <button key={p} onClick={() => setPreset(i)} className={`px-3 py-1 rounded-lg text-sm ${preset === i ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{p}</button>
                ))}
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
