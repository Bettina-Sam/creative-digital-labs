import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WordScrambleProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

const scienceWords = [
  { word: 'ATOM', hint: 'Smallest unit of matter' },
  { word: 'CELL', hint: 'Basic unit of life' },
  { word: 'WAVE', hint: 'Oscillation that transfers energy' },
  { word: 'FORCE', hint: 'Push or pull on an object' },
  { word: 'PHOTON', hint: 'Particle of light' },
  { word: 'GENOME', hint: 'Complete set of DNA' },
  { word: 'NEURON', hint: 'Brain cell that transmits signals' },
  { word: 'QUARK', hint: 'Subatomic particle inside protons' },
  { word: 'ENTROPY', hint: 'Measure of disorder' },
  { word: 'CATALYST', hint: 'Speeds up chemical reactions' },
  { word: 'ELECTRON', hint: 'Negatively charged particle' },
  { word: 'MOLECULE', hint: 'Group of bonded atoms' },
];

export const WordScrambleGame = ({ difficulty, onScoreUpdate, isPlaying }: WordScrambleProps) => {
  const [wordIdx, setWordIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  const newRound = useCallback(() => {
    const maxLen = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 7 : 99;
    const filtered = scienceWords.filter(w => w.word.length <= maxLen);
    const idx = Math.floor(Math.random() * filtered.length);
    const realIdx = scienceWords.indexOf(filtered[idx]);
    setWordIdx(realIdx);
    setScrambled(filtered[idx].word.split('').sort(() => Math.random() - 0.5).join(''));
    setGuess('');
    setResult(null);
  }, [difficulty]);

  useEffect(() => { if (isPlaying) newRound(); }, [isPlaying, newRound]);

  const check = () => {
    if (guess.toUpperCase() === scienceWords[wordIdx].word) {
      setResult(true);
      onScoreUpdate(difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30);
      setTimeout(newRound, 700);
    } else {
      setResult(false);
      onScoreUpdate(-5);
    }
  };

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-sm text-muted-foreground">Unscramble the science word!</p>
      <div className="flex gap-2">
        {scrambled.split('').map((c, i) => (
          <motion.div key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.05 }} className="w-11 h-13 rounded-xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center font-bold text-xl text-primary">
            {c}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic">💡 {scienceWords[wordIdx].hint}</p>
      <div className="flex items-center gap-3">
        <input type="text" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} className={`w-40 p-3 rounded-xl bg-background/50 border-2 text-center font-mono text-lg uppercase ${
          result === true ? 'border-neon-lime' : result === false ? 'border-neon-magenta' : 'border-border'
        }`} placeholder="Type answer" autoFocus />
        <motion.button onClick={check} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold" whileTap={{ scale: 0.9 }}>✓</motion.button>
      </div>
      {result === true && <p className="text-neon-lime font-bold">Correct! 🎉</p>}
      {result === false && <p className="text-neon-magenta font-bold">Try again! Answer: {scienceWords[wordIdx].word}</p>}
    </div>
  );
};
