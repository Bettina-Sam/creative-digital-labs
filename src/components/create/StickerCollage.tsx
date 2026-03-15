import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw } from 'lucide-react';

interface StickerCollageProps { isOpen: boolean; onClose: () => void; }

const stickers = ['⭐','🌈','🎨','🦋','🌸','🎵','💎','🔥','🌊','🌙','🍎','🐱','🎯','🚀','🎪','🎭'];

interface Sticker { id: number; emoji: string; x: number; y: number; scale: number; rotation: number; }

export const StickerCollage = ({ isOpen, onClose }: StickerCollageProps) => {
  const [placed, setPlaced] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState('⭐');
  const [nextId, setNextId] = useState(0);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPlaced(prev => [...prev, {
      id: nextId,
      emoji: selectedSticker,
      x, y,
      scale: 0.8 + Math.random() * 0.8,
      rotation: Math.random() * 40 - 20,
    }]);
    setNextId(n => n + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Sticker Collage</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setPlaced([])} className="p-2 rounded-lg hover:bg-muted"><RotateCw className="w-4 h-4" /></button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex gap-2 px-4 py-2 flex-wrap justify-center">
            {stickers.map(s => (
              <motion.button key={s} onClick={() => setSelectedSticker(s)} className={`text-2xl p-1 rounded-lg ${selectedSticker === s ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted/30'}`} whileTap={{ scale: 0.9 }}>
                {s}
              </motion.button>
            ))}
          </div>
          <div className="flex-1 relative m-4 rounded-2xl border-2 border-dashed border-border/50 overflow-hidden cursor-crosshair" onClick={handleCanvasClick}>
            {placed.map(s => (
              <motion.div key={s.id} initial={{ scale: 0 }} animate={{ scale: s.scale }} className="absolute text-4xl select-none" style={{ left: s.x - 20, top: s.y - 20, transform: `rotate(${s.rotation}deg)` }}>
                {s.emoji}
              </motion.div>
            ))}
            {placed.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Click to place stickers!</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
