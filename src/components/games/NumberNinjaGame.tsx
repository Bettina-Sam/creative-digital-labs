import { useState, useEffect } from 'react';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
export const NumberNinjaGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [target, setTarget] = useState(0);
  const [input, setInput] = useState('');
  const [op, setOp] = useState('');
  const gen = () => {
    const max = difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 50 : 100;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const ops = ['+', '-', '×'];
    const o = ops[Math.floor(Math.random() * ops.length)];
    setOp(`${a} ${o} ${b}`);
    setTarget(o === '+' ? a + b : o === '-' ? a - b : a * b);
    setInput('');
  };
  useEffect(() => { if (isPlaying) gen(); }, [isPlaying]);
  const check = () => {
    if (parseInt(input) === target) { onScoreUpdate(10); gen(); }
    else { onScoreUpdate(-3); setInput(''); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
      <p className="text-4xl font-bold gradient-text">{op} = ?</p>
      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} className="w-32 px-4 py-3 text-center text-2xl bg-background border border-border rounded-xl font-mono" placeholder="?" autoFocus />
        <button onClick={check} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Go</button>
      </div>
      <p className="text-sm text-muted-foreground">Type your answer and press Enter</p>
    </div>
  );
};
