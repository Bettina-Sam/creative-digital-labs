import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
export const MagnetMazeGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const size = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 7 : 9;
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [goal, setGoal] = useState({ r: 0, c: 0 });
  const [walls, setWalls] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isPlaying) return;
    const w = new Set<string>();
    for (let i = 0; i < size * 2; i++) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!(r === 0 && c === 0) && !(r === size - 1 && c === size - 1)) w.add(`${r},${c}`);
    }
    setWalls(w); setPos({ r: 0, c: 0 }); setGoal({ r: size - 1, c: size - 1 });
  }, [isPlaying, size]);
  const move = (dr: number, dc: number) => {
    const nr = pos.r + dr, nc = pos.c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return;
    if (walls.has(`${nr},${nc}`)) return;
    setPos({ r: nr, c: nc });
    if (nr === goal.r && nc === goal.c) onScoreUpdate(25);
    else onScoreUpdate(1);
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const r = Math.floor(i / size), c = i % size;
          const isPlayer = pos.r === r && pos.c === c;
          const isGoal = goal.r === r && goal.c === c;
          const isWall = walls.has(`${r},${c}`);
          return (
            <div key={i} className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs ${isWall ? 'bg-muted/50' : isPlayer ? 'bg-neon-cyan' : isGoal ? 'bg-neon-lime' : 'bg-muted/10 border border-border/30'}`}>
              {isPlayer ? '🧲' : isGoal ? '⭐' : isWall ? '🪨' : ''}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-1 w-28">
        <div /><motion.button whileTap={{ scale: 0.8 }} onClick={() => move(-1, 0)} className="w-8 h-8 rounded glass-panel text-center">↑</motion.button><div />
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => move(0, -1)} className="w-8 h-8 rounded glass-panel text-center">←</motion.button>
        <div />
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => move(0, 1)} className="w-8 h-8 rounded glass-panel text-center">→</motion.button>
        <div /><motion.button whileTap={{ scale: 0.8 }} onClick={() => move(1, 0)} className="w-8 h-8 rounded glass-panel text-center">↓</motion.button><div />
      </div>
    </div>
  );
};
