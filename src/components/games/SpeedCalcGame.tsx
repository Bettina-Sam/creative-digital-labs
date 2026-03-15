import { useState, useEffect, useCallback } from 'react';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
export const SpeedCalcGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [expr, setExpr] = useState('');
  const [answer, setAnswer] = useState(0);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const gen = useCallback(() => {
    const max = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 25 : 50;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const ops = difficulty === 'Easy' ? ['+', '-'] : ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    setExpr(`${a} ${op} ${b}`);
    setAnswer(op === '+' ? a + b : op === '-' ? a - b : a * b);
    setInput('');
  }, [difficulty]);
  useEffect(() => { if (isPlaying) gen(); }, [isPlaying, gen]);
  const check = () => {
    if (parseInt(input) === answer) { const pts = 10 + streak * 2; onScoreUpdate(pts); setStreak(s => s + 1); gen(); }
    else { onScoreUpdate(-5); setStreak(0); setInput(''); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
      {streak > 2 && <p className="text-neon-orange text-sm font-bold">🔥 Streak: {streak}</p>}
      <p className="text-5xl font-bold gradient-text">{expr}</p>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          className="w-28 px-4 py-3 text-center text-2xl bg-background border border-border rounded-xl font-mono" autoFocus />
        <button onClick={check} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">✓</button>
      </div>
    </div>
  );
};
