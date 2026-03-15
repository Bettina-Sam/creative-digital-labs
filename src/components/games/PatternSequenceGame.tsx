import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PatternSequenceProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

const shapes = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];

export const PatternSequenceGame = ({ difficulty, onScoreUpdate, isPlaying }: PatternSequenceProps) => {
  const [pattern, setPattern] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  const newRound = useCallback(() => {
    const len = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 5 : 6;
    const numShapes = difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 3 : 4;
    const used = shapes.slice(0, numShapes);

    // Create repeating pattern
    const base = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => used[Math.floor(Math.random() * numShapes)]);
    const full: string[] = [];
    while (full.length < len + 1) full.push(...base);
    const sequence = full.slice(0, len + 1);

    setPattern(sequence.slice(0, len)); // show pattern without last
    setAnswer(sequence[len]); // correct next
    setOptions(used.sort(() => Math.random() - 0.5));
    setResult(null);
  }, [difficulty]);

  useEffect(() => { if (isPlaying) newRound(); }, [isPlaying, newRound]);

  const handleGuess = (shape: string) => {
    if (shape === answer) {
      setResult(true);
      onScoreUpdate(difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30);
      setTimeout(newRound, 600);
    } else {
      setResult(false);
      onScoreUpdate(-5);
    }
  };

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-sm text-muted-foreground">What comes next in the pattern?</p>
      <div className="flex gap-2 items-center">
        {pattern.map((s, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="text-3xl">
            {s}
          </motion.div>
        ))}
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 rounded-xl border-2 border-dashed border-primary/50 flex items-center justify-center text-xl text-muted-foreground">
          ?
        </motion.div>
      </div>
      <div className="flex gap-3">
        {options.map((s, i) => (
          <motion.button key={i} onClick={() => handleGuess(s)} className="text-3xl p-2 rounded-xl hover:bg-muted/30 transition-colors" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            {s}
          </motion.button>
        ))}
      </div>
      {result === true && <p className="text-neon-lime font-bold">Correct! 🎉</p>}
      {result === false && <p className="text-neon-magenta font-bold">Not quite! The answer was {answer}</p>}
    </div>
  );
};
