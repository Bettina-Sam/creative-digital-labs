import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

interface ColorTarget {
  id: number; color: string; x: number; y: number; matched: boolean;
}

const randomColor = () => {
  const colors = ['#00f0ff', '#ff00ff', '#a0ff00', '#ff6600', '#aa44ff', '#ff4444', '#44ff44', '#ffaa00'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const ColorMatchGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [targets, setTargets] = useState<ColorTarget[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const nextId = useRef(0);

  const gridSize = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 4 : 5;

  const generateTargets = useCallback(() => {
    const newTargets: ColorTarget[] = [];
    const total = gridSize * gridSize;
    const pairs = Math.floor(total / 2);
    const colors: string[] = [];
    for (let i = 0; i < pairs; i++) {
      const c = randomColor();
      colors.push(c, c);
    }
    if (total % 2) colors.push(randomColor());
    
    // Shuffle
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colors[i], colors[j]] = [colors[j], colors[i]];
    }

    for (let i = 0; i < total; i++) {
      newTargets.push({
        id: nextId.current++,
        color: colors[i],
        x: (i % gridSize),
        y: Math.floor(i / gridSize),
        matched: false,
      });
    }
    setTargets(newTargets);
    setSelectedColor(null);
  }, [gridSize]);

  useEffect(() => {
    if (isPlaying) generateTargets();
  }, [isPlaying, generateTargets]);

  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [secondPick, setSecondPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isPlaying) return;
    // Show all briefly at start
    const allIds = new Set(targets.map(t => t.id));
    setRevealed(allIds);
    const timer = setTimeout(() => setRevealed(new Set()), difficulty === 'Easy' ? 2000 : difficulty === 'Medium' ? 1500 : 1000);
    return () => clearTimeout(timer);
  }, [targets, isPlaying, difficulty]);

  const handleClick = (target: ColorTarget) => {
    if (!isPlaying || target.matched || revealed.has(target.id)) return;

    if (firstPick === null) {
      setFirstPick(target.id);
      setRevealed(prev => new Set([...prev, target.id]));
    } else if (secondPick === null && target.id !== firstPick) {
      setSecondPick(target.id);
      setRevealed(prev => new Set([...prev, target.id]));

      const first = targets.find(t => t.id === firstPick);
      if (first && first.color === target.color) {
        // Match!
        setStreak(s => s + 1);
        const bonus = streak > 2 ? 5 : 0;
        onScoreUpdate(10 + bonus);
        setTimeout(() => {
          setTargets(prev => prev.map(t => t.id === firstPick || t.id === target.id ? { ...t, matched: true } : t));
          setFirstPick(null);
          setSecondPick(null);
        }, 300);

        // Check if all matched
        const remaining = targets.filter(t => !t.matched && t.id !== firstPick && t.id !== target.id);
        if (remaining.length === 0) {
          onScoreUpdate(50); // Bonus for completing
          setTimeout(generateTargets, 1000);
        }
      } else {
        setStreak(0);
        onScoreUpdate(-2);
        setTimeout(() => {
          setRevealed(prev => {
            const next = new Set(prev);
            next.delete(firstPick!);
            next.delete(target.id);
            return next;
          });
          setFirstPick(null);
          setSecondPick(null);
        }, 600);
      }
    }
  };

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div className="text-xs text-muted-foreground mb-3">Match pairs of colors! Streak: {streak}🔥</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {targets.map(target => (
          <motion.button
            key={target.id}
            onClick={() => handleClick(target)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 transition-all ${target.matched ? 'opacity-30' : 'cursor-pointer hover:scale-105'}`}
            style={{
              backgroundColor: revealed.has(target.id) || target.matched ? target.color + '30' : 'rgba(255,255,255,0.05)',
              borderColor: revealed.has(target.id) || target.matched ? target.color : 'rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            {(revealed.has(target.id) || target.matched) && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: target.color }} />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
