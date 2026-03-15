import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BinaryDecoderProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

export const BinaryDecoderGame = ({ difficulty, onScoreUpdate, isPlaying }: BinaryDecoderProps) => {
  const [binary, setBinary] = useState('');
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState<boolean | null>(null);

  const generateBinary = useCallback(() => {
    const max = difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 63 : 255;
    const bits = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 8;
    const num = Math.floor(Math.random() * (max + 1));
    setBinary(num.toString(2).padStart(bits, '0'));
    setAnswer('');
    setCorrect(null);
  }, [difficulty]);

  useEffect(() => {
    if (isPlaying) generateBinary();
  }, [isPlaying, generateBinary]);

  const checkAnswer = () => {
    const decimal = parseInt(binary, 2);
    if (parseInt(answer) === decimal) {
      setCorrect(true);
      onScoreUpdate(difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30);
      setTimeout(generateBinary, 800);
    } else {
      setCorrect(false);
      onScoreUpdate(-5);
    }
  };

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-xs text-muted-foreground">Convert binary to decimal:</p>
      
      <div className="flex gap-2">
        {binary.split('').map((bit, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xl ${bit === '1' ? 'bg-neon-lime/20 text-neon-lime border-2 border-neon-lime/40' : 'bg-muted/20 text-muted-foreground border-2 border-border'}`}>
            {bit}
            <span className="text-[8px] text-muted-foreground mt-1">{Math.pow(2, binary.length - 1 - i)}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} className={`w-24 p-3 rounded-xl bg-background/50 border-2 text-center font-mono text-xl ${correct === true ? 'border-neon-lime' : correct === false ? 'border-neon-magenta' : 'border-border'}`} placeholder="?" autoFocus />
        <motion.button onClick={checkAnswer} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold" whileTap={{ scale: 0.9 }}>
          ✓
        </motion.button>
      </div>

      {correct === true && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-neon-lime font-bold">Correct! 🎉</motion.p>}
      {correct === false && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-neon-magenta font-bold">Try again! Answer: {parseInt(binary, 2)}</motion.p>}
    </div>
  );
};
