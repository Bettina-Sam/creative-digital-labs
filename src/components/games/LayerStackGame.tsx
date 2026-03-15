import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
const layers = [
  { name: 'Topsoil', color: '#8B4513', depth: 1 },
  { name: 'Clay', color: '#CD853F', depth: 2 },
  { name: 'Sand', color: '#F4A460', depth: 3 },
  { name: 'Gravel', color: '#A0522D', depth: 4 },
  { name: 'Limestone', color: '#D2B48C', depth: 5 },
  { name: 'Sandstone', color: '#DEB887', depth: 6 },
  { name: 'Shale', color: '#696969', depth: 7 },
  { name: 'Bedrock', color: '#2F4F4F', depth: 8 },
];
export const LayerStackGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const count = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 8;
  const [shuffled, setShuffled] = useState<typeof layers>([]);
  const [placed, setPlaced] = useState<typeof layers>([]);
  useEffect(() => {
    if (!isPlaying) return;
    const subset = layers.slice(0, count);
    const s = [...subset].sort(() => Math.random() - 0.5);
    setShuffled(s); setPlaced([]);
  }, [isPlaying, count]);
  const place = (layer: typeof layers[0]) => {
    const nextDepth = placed.length + 1;
    const correct = layers.slice(0, count);
    if (layer.depth === correct[placed.length]?.depth) {
      setPlaced(p => [...p, layer]);
      setShuffled(s => s.filter(l => l.name !== layer.name));
      onScoreUpdate(10);
    } else { onScoreUpdate(-5); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex gap-6 p-6 items-center justify-center">
      <div className="space-y-1 w-40">
        <p className="text-xs text-muted-foreground mb-2">Layers (deepest last)</p>
        {placed.map((l, i) => (
          <motion.div key={l.name} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="px-3 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: l.color }}>{l.name}</motion.div>
        ))}
        {placed.length === count && <p className="text-neon-lime font-bold mt-2">🎉 Complete!</p>}
      </div>
      <div className="space-y-1 w-40">
        <p className="text-xs text-muted-foreground mb-2">Available</p>
        {shuffled.map(l => (
          <motion.button key={l.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => place(l)}
            className="w-full px-3 py-2 rounded-lg text-white text-sm font-medium text-left" style={{ backgroundColor: l.color }}>{l.name}</motion.button>
        ))}
      </div>
    </div>
  );
};
