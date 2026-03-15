import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Puzzle } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

const GRID = 4;

export const JigsawMaker = ({ isOpen, onClose }: Props) => {
  const [pieces, setPieces] = useState(() => {
    const arr = Array.from({ length: GRID * GRID }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  });
  const [selected, setSelected] = useState<number | null>(null);
  const solved = pieces.every((p, i) => p === i);

  const handleClick = (idx: number) => {
    if (selected === null) { setSelected(idx); return; }
    const next = [...pieces];
    [next[selected], next[idx]] = [next[idx], next[selected]];
    setPieces(next);
    setSelected(null);
  };

  const colors = ['#00e5ff', '#ff6ec7', '#a3ff12', '#ff9500', '#b388ff', '#00bfa5', '#ff5252', '#ffd740',
    '#448aff', '#69f0ae', '#ff80ab', '#e040fb', '#8c9eff', '#84ffff', '#ccff90', '#ffe57f'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Puzzle className="w-5 h-5 text-neon-cyan" /><h2 className="font-bold">Jigsaw Puzzle</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              {solved && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-neon-lime font-bold text-xl mb-3">🎉 Solved!</motion.p>}
              <div className="grid grid-cols-4 gap-1.5 max-w-sm mx-auto">
                {pieces.map((piece, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleClick(idx)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-lg font-bold text-white transition-all ${selected === idx ? 'ring-2 ring-primary scale-105' : ''}`}
                    style={{ backgroundColor: colors[piece] }}>
                    {piece + 1}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => {
                const arr = Array.from({ length: GRID * GRID }, (_, i) => i);
                for (let i = arr.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
                setPieces(arr); setSelected(null);
              }} className="mt-4 w-full py-2 rounded-lg glass-panel text-sm">Shuffle</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
