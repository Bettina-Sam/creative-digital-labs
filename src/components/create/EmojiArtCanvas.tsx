import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw } from 'lucide-react';

interface EmojiArtCanvasProps { isOpen: boolean; onClose: () => void; }

const emojiSets = ['😀','😎','🎨','🌟','❤️','🔥','🌊','🌈','🎵','🌸','⭐','🦋','🍎','🐱','🌙','💎'];

export const EmojiArtCanvas = ({ isOpen, onClose }: EmojiArtCanvasProps) => {
  const size = 12;
  const [grid, setGrid] = useState<string[][]>(() => Array(size).fill(null).map(() => Array(size).fill('')));
  const [selectedEmoji, setSelectedEmoji] = useState('😀');
  const [isErasing, setIsErasing] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = isErasing ? '' : selectedEmoji;
      return next;
    });
  };

  const clear = () => setGrid(Array(size).fill(null).map(() => Array(size).fill('')));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Emoji Art Canvas</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsErasing(!isErasing)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isErasing ? 'bg-neon-magenta/20 text-neon-magenta' : 'bg-muted/30'}`}>
                {isErasing ? '🧹 Erasing' : '✏️ Drawing'}
              </button>
              <button onClick={clear} className="p-2 rounded-lg hover:bg-muted"><RotateCw className="w-4 h-4" /></button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
            <div className="flex gap-2 flex-wrap justify-center">
              {emojiSets.map(e => (
                <motion.button key={e} onClick={() => { setSelectedEmoji(e); setIsErasing(false); }} className={`text-2xl p-1 rounded-lg ${selectedEmoji === e && !isErasing ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted/30'}`} whileTap={{ scale: 0.9 }}>
                  {e}
                </motion.button>
              ))}
            </div>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
              {grid.map((row, r) => row.map((cell, c) => (
                <motion.button key={`${r}-${c}`} onClick={() => handleCellClick(r, c)} className="w-8 h-8 md:w-10 md:h-10 rounded border border-border/30 flex items-center justify-center text-lg hover:bg-muted/20 transition-colors" whileTap={{ scale: 0.8 }}>
                  {cell}
                </motion.button>
              )))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
