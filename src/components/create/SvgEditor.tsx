import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Shapes } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const SvgEditor = ({ isOpen, onClose }: Props) => {
  const [path, setPath] = useState('M 50 150 Q 150 50 250 150 T 450 150');
  const [stroke, setStroke] = useState('#00e5ff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fill, setFill] = useState('none');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Shapes className="w-5 h-5 text-neon-cyan" /><h2 className="font-bold">SVG Path Editor</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-xl border border-border p-4">
                <svg viewBox="0 0 500 300" className="w-full h-64">
                  <rect width="500" height="300" fill="#0a0a1a" />
                  <path d={path} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
                </svg>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">SVG Path Data</label>
                  <textarea value={path} onChange={e => setPath(e.target.value)} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono" />
                </div>
                <div className="flex gap-3">
                  <label className="text-xs text-muted-foreground">Stroke<input type="color" value={stroke} onChange={e => setStroke(e.target.value)} className="block w-8 h-8 rounded mt-1" /></label>
                  <label className="text-xs text-muted-foreground">Width<input type="range" min="1" max="10" value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)} className="block w-20 mt-2" /></label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['M 100 100 L 400 100 L 250 250 Z', 'M 250 50 C 350 50 400 200 250 250 C 100 200 150 50 250 50', 'M 50 150 Q 150 50 250 150 T 450 150'].map((p, i) => (
                    <button key={i} onClick={() => setPath(p)} className="px-3 py-1 rounded-lg glass-panel text-xs">Preset {i + 1}</button>
                  ))}
                </div>
                <div className="bg-background/50 p-2 rounded-lg"><code className="text-xs text-neon-lime break-all">{`<path d="${path}" />`}</code></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
