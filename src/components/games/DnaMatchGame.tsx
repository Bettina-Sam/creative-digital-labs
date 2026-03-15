import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
const pairs = ['A-T', 'T-A', 'G-C', 'C-G'];
export const DnaMatchGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const len = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 8 : 12;
    const bases = ['A', 'T', 'G', 'C'];
    const seq = Array.from({ length: len }, () => bases[Math.floor(Math.random() * 4)]);
    setSequence(seq); setAnswers(Array(len).fill(null)); setCurrent(0);
  }, [isPlaying, difficulty]);
  const complement: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const guess = (base: string) => {
    if (current >= sequence.length) return;
    const correct = complement[sequence[current]];
    if (base === correct) {
      setAnswers(a => a.map((v, i) => i === current ? base : v));
      setCurrent(c => c + 1);
      onScoreUpdate(10);
    } else { onScoreUpdate(-3); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
      <p className="text-sm text-muted-foreground">Match the complementary DNA base pair</p>
      <div className="flex gap-2">
        {sequence.map((base, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${base === 'A' ? 'bg-red-500' : base === 'T' ? 'bg-blue-500' : base === 'G' ? 'bg-green-500' : 'bg-yellow-500'}`}>{base}</div>
            <div className="w-0.5 h-4 bg-border" />
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${answers[i] ? 'text-white' : 'text-muted-foreground border border-dashed border-border'} ${i === current ? 'ring-2 ring-primary' : ''} ${answers[i] === 'A' ? 'bg-red-500' : answers[i] === 'T' ? 'bg-blue-500' : answers[i] === 'G' ? 'bg-green-500' : answers[i] === 'C' ? 'bg-yellow-500' : ''}`}>
              {answers[i] || '?'}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {['A', 'T', 'G', 'C'].map(b => (
          <motion.button key={b} whileTap={{ scale: 0.8 }} onClick={() => guess(b)}
            className={`w-14 h-14 rounded-xl font-bold text-xl text-white ${b === 'A' ? 'bg-red-500' : b === 'T' ? 'bg-blue-500' : b === 'G' ? 'bg-green-500' : 'bg-yellow-500'}`}>{b}</motion.button>
        ))}
      </div>
      {current >= sequence.length && <p className="text-neon-lime font-bold text-xl">🧬 Complete!</p>}
    </div>
  );
};
