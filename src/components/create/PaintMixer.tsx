import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Paintbrush } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const PaintMixer = ({ isOpen, onClose }: Props) => {
  const [r, setR] = useState(128);
  const [g, setG] = useState(64);
  const [b, setB] = useState(200);
  const [palette, setPalette] = useState<string[]>([]);
  const mixed = `rgb(${r},${g},${b})`;
  const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Paintbrush className="w-5 h-5 text-neon-purple" /><h2 className="font-bold">Paint Mixer</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-full h-32 rounded-2xl border-2 border-border transition-colors" style={{ backgroundColor: mixed }} />
              <p className="text-center font-mono text-sm text-muted-foreground">{hex} | rgb({r},{g},{b})</p>
              {[{ label: 'Red', val: r, set: setR, col: '#ef4444' }, { label: 'Green', val: g, set: setG, col: '#22c55e' }, { label: 'Blue', val: b, set: setB, col: '#3b82f6' }].map(c => (
                <label key={c.label} className="flex items-center gap-3">
                  <span className="w-12 text-sm" style={{ color: c.col }}>{c.label}</span>
                  <input type="range" min="0" max="255" value={c.val} onChange={e => c.set(+e.target.value)} className="flex-1" />
                  <span className="w-8 text-xs text-muted-foreground text-right">{c.val}</span>
                </label>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setPalette(p => [...p, mixed])} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Save to Palette</button>
                <button onClick={() => { setR(Math.random() * 255 | 0); setG(Math.random() * 255 | 0); setB(Math.random() * 255 | 0); }} className="px-4 py-2 rounded-lg glass-panel text-sm">Random</button>
              </div>
              {palette.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {palette.map((c, i) => <div key={i} className="w-10 h-10 rounded-lg border border-border cursor-pointer" style={{ backgroundColor: c }} title={c} />)}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
