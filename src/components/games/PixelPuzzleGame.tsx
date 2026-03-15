import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
export const PixelPuzzleGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const size = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 5 : 6;
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [target, setTarget] = useState<boolean[][]>([]);
  const [solved, setSolved] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random() > 0.5));
    setTarget(t);
    setGrid(Array.from({ length: size }, () => Array(size).fill(false)));
    setSolved(false);
  }, [isPlaying, size]);
  const toggle = (r: number, c: number) => {
    const next = grid.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? !cell : cell));
    setGrid(next);
    if (next.every((row, ri) => row.every((cell, ci) => cell === target[ri]?.[ci]))) {
      onScoreUpdate(20); setSolved(true);
    }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Target</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {target.map((row, ri) => row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className={`w-8 h-8 rounded-sm ${cell ? 'bg-neon-cyan' : 'bg-muted/20'}`} />
          )))}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">{solved ? '🎉 Matched!' : 'Your Grid'}</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {grid.map((row, ri) => row.map((cell, ci) => (
            <motion.button key={`${ri}-${ci}`} whileTap={{ scale: 0.8 }} onClick={() => toggle(ri, ci)}
              className={`w-8 h-8 rounded-sm cursor-pointer transition-colors ${cell ? 'bg-neon-magenta' : 'bg-muted/20'}`} />
          )))}
        </div>
      </div>
    </div>
  );
};
