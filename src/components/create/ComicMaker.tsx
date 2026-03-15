import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Frame } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

interface Panel { text: string; bgColor: string; emoji: string; }

export const ComicMaker = ({ isOpen, onClose }: Props) => {
  const [panels, setPanels] = useState<Panel[]>([
    { text: 'Hello!', bgColor: '#1a1a2e', emoji: '😀' },
    { text: 'What happened?', bgColor: '#16213e', emoji: '🤔' },
    { text: 'Science!', bgColor: '#0f3460', emoji: '🔬' },
    { text: 'Amazing!', bgColor: '#1a1a3e', emoji: '🎉' },
  ]);
  const [selected, setSelected] = useState(0);
  const emojis = ['😀', '🤔', '😱', '🎉', '🔬', '💡', '🚀', '⚡', '🌟', '🧪', '🔥', '🌈'];

  const update = (i: number, field: keyof Panel, val: string) => {
    setPanels(p => p.map((panel, idx) => idx === i ? { ...panel, [field]: val } : panel));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Frame className="w-5 h-5 text-neon-cyan" /><h2 className="font-bold">Comic Maker</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {panels.map((p, i) => (
                  <motion.div key={i} onClick={() => setSelected(i)} whileHover={{ scale: 1.02 }}
                    className={`relative rounded-xl p-6 flex flex-col items-center justify-center min-h-[140px] cursor-pointer border-2 transition-all ${selected === i ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: p.bgColor }}>
                    <span className="text-5xl mb-2">{p.emoji}</span>
                    <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium max-w-full truncate relative">
                      {p.text}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="glass-panel p-4 rounded-xl space-y-3">
                <p className="text-xs text-muted-foreground">Panel {selected + 1}</p>
                <input value={panels[selected].text} onChange={e => update(selected, 'text', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Speech bubble text" />
                <div className="flex gap-2 flex-wrap">
                  {emojis.map(e => (
                    <button key={e} onClick={() => update(selected, 'emoji', e)} className={`text-2xl p-1 rounded ${panels[selected].emoji === e ? 'bg-primary/20' : ''}`}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
