import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Binary } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const BinaryArt = ({ isOpen, onClose }: Props) => {
  const [grid, setGrid] = useState(() => Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => Math.random() > 0.5 ? 1 : 0)));

  const toggle = (r: number, c: number) => {
    setGrid(g => g.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? (cell ? 0 : 1) : cell)));
  };

  const binary = grid.map(r => r.join('')).join('\n');
  const decimal = grid.map(r => parseInt(r.join(''), 2));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Binary className="w-5 h-5 text-neon-purple" /><h2 className="font-bold">Binary Art</h2></div>
              <div className="flex gap-2">
                <button onClick={() => setGrid(g => g.map(r => r.map(() => Math.random() > 0.5 ? 1 : 0)))} className="px-3 py-1 rounded-lg glass-panel text-xs">Random</button>
                <button onClick={() => setGrid(g => g.map(r => r.map(() => 0)))} className="px-3 py-1 rounded-lg glass-panel text-xs">Clear</button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-4 flex justify-center">
              <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(16, 1fr)` }}>
                {grid.map((row, ri) => row.map((cell, ci) => (
                  <motion.button key={`${ri}-${ci}`} whileTap={{ scale: 0.8 }} onClick={() => toggle(ri, ci)}
                    className={`w-5 h-5 rounded-sm text-[8px] font-mono transition-colors ${cell ? 'bg-neon-cyan text-background' : 'bg-muted/20 text-muted-foreground/50'}`}>
                    {cell}
                  </motion.button>
                )))}
              </div>
            </div>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Decimal values per row:</p>
              <div className="flex flex-wrap gap-1">
                {decimal.map((d, i) => <span key={i} className="text-xs font-mono bg-background/50 px-1.5 py-0.5 rounded">{d}</span>)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
