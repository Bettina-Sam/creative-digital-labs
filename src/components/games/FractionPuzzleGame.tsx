import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FractionPuzzleProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

export const FractionPuzzleGame = ({ difficulty, onScoreUpdate, isPlaying }: FractionPuzzleProps) => {
  const [fraction, setFraction] = useState({ num: 1, den: 2 });
  const [options, setOptions] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);

  const newRound = useCallback(() => {
    const maxDen = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 8 : 12;
    const den = 2 + Math.floor(Math.random() * (maxDen - 1));
    const num = 1 + Math.floor(Math.random() * (den - 1));
    setFraction({ num, den });
    const correct = Math.round((num / den) * 100) / 100;
    const opts = [correct];
    while (opts.length < 4) {
      const fake = Math.round((Math.random()) * 100) / 100;
      if (!opts.includes(fake) && fake > 0 && fake < 1) opts.push(fake);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    setResult(null);
  }, [difficulty]);

  useEffect(() => { if (isPlaying) newRound(); }, [isPlaying, newRound]);

  const handleAnswer = (val: number) => {
    const correct = Math.round((fraction.num / fraction.den) * 100) / 100;
    if (val === correct) {
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
      <p className="text-sm text-muted-foreground">What decimal equals this fraction?</p>
      <div className="text-center">
        <div className="text-5xl font-bold">
          <span className="text-primary">{fraction.num}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-primary">{fraction.den}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <motion.button key={i} onClick={() => handleAnswer(opt)} className={`px-8 py-4 rounded-xl font-mono text-lg font-bold border-2 transition-all ${
            result === true && opt === Math.round((fraction.num / fraction.den) * 100) / 100 ? 'border-neon-lime bg-neon-lime/20 text-neon-lime' :
            result === false ? 'border-border' : 'border-border hover:border-primary/50'
          }`} whileTap={{ scale: 0.9 }}>
            {opt}
          </motion.button>
        ))}
      </div>
      {result === true && <p className="text-neon-lime font-bold">Correct! 🎉</p>}
      {result === false && <p className="text-neon-magenta font-bold">Try again!</p>}
    </div>
  );
};
