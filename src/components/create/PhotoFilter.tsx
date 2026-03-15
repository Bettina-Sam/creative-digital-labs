import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Image } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const PhotoFilter = ({ isOpen, onClose }: Props) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);

  const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%)`;
  const cssCode = `filter: ${filter};`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Image className="w-5 h-5 text-neon-magenta" /><h2 className="font-bold">Photo Filter Lab</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-border">
                <div className="w-full h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center" style={{ filter }}>
                  <div className="text-center text-white">
                    <div className="text-6xl mb-2">🌸</div>
                    <p className="text-lg font-bold">Sample Image</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Brightness', val: brightness, set: setBrightness, min: 0, max: 200 },
                  { label: 'Contrast', val: contrast, set: setContrast, min: 0, max: 200 },
                  { label: 'Saturation', val: saturate, set: setSaturate, min: 0, max: 200 },
                  { label: 'Hue Rotate', val: hue, set: setHue, min: 0, max: 360 },
                  { label: 'Blur', val: blur, set: setBlur, min: 0, max: 10 },
                  { label: 'Sepia', val: sepia, set: setSepia, min: 0, max: 100 },
                ].map(s => (
                  <label key={s.label} className="flex items-center gap-2 text-sm">
                    <span className="w-20 text-muted-foreground">{s.label}</span>
                    <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} className="flex-1" />
                    <span className="w-8 text-right text-xs text-muted-foreground">{s.val}</span>
                  </label>
                ))}
                <button onClick={() => { setBrightness(100); setContrast(100); setSaturate(100); setHue(0); setBlur(0); setSepia(0); }} className="w-full py-2 rounded-lg glass-panel text-sm">Reset All</button>
                <div className="bg-background/50 p-2 rounded-lg"><code className="text-xs text-neon-cyan break-all">{cssCode}</code></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
