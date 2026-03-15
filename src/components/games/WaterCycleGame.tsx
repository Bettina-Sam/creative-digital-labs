import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
const stages = ['Evaporation', 'Condensation', 'Precipitation', 'Collection', 'Infiltration', 'Runoff', 'Transpiration'];
export const WaterCycleGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const count = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 5 : 7;
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  useEffect(() => {
    if (!isPlaying) return;
    const subset = stages.slice(0, count);
    setShuffled([...subset].sort(() => Math.random() - 0.5));
    setPlaced([]);
  }, [isPlaying, count]);
  const place = (stage: string) => {
    const correct = stages[placed.length];
    if (stage === correct) {
      setPlaced(p => [...p, stage]);
      setShuffled(s => s.filter(x => x !== stage));
      onScoreUpdate(10);
    } else { onScoreUpdate(-3); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
      <p className="text-sm text-muted-foreground">Put the water cycle stages in order</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {placed.map((s, i) => (
          <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan font-medium text-sm">
            {i + 1}. {s}
          </motion.div>
        ))}
        {placed.length < count && <div className="px-4 py-2 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm">{placed.length + 1}. ?</div>}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {shuffled.map(s => (
          <motion.button key={s} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => place(s)}
            className="px-4 py-2 rounded-xl glass-panel text-sm font-medium hover:border-primary transition-all">{s}</motion.button>
        ))}
      </div>
      {placed.length === count && <p className="text-neon-lime font-bold text-xl">💧 Water cycle complete!</p>}
    </div>
  );
};
