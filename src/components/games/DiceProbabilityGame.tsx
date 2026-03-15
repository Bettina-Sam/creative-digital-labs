import { useState, useEffect } from 'react';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
export const DiceProbabilityGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [dice, setDice] = useState([1, 1]);
  const [guess, setGuess] = useState<'low' | 'high' | null>(null);
  const [result, setResult] = useState('');
  const roll = (prediction: 'low' | 'high') => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    const total = d1 + d2;
    const isHigh = total >= 7;
    if ((prediction === 'high' && isHigh) || (prediction === 'low' && !isHigh)) {
      onScoreUpdate(10); setResult(`✅ ${total} is ${isHigh ? 'high' : 'low'}!`);
    } else {
      onScoreUpdate(-5); setResult(`❌ ${total} is ${isHigh ? 'high' : 'low'}`);
    }
  };
  if (!isPlaying) return null;
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
      <p className="text-sm text-muted-foreground">Will the sum of two dice be LOW (2-6) or HIGH (7-12)?</p>
      <div className="flex gap-4 text-6xl">{dice.map((d, i) => <span key={i}>{faces[d - 1]}</span>)}</div>
      {result && <p className="text-lg font-bold">{result}</p>}
      <div className="flex gap-4">
        <button onClick={() => roll('low')} className="px-8 py-4 rounded-xl glass-panel font-bold text-neon-cyan text-xl hover:scale-105 transition-transform">LOW (2-6)</button>
        <button onClick={() => roll('high')} className="px-8 py-4 rounded-xl glass-panel font-bold text-neon-magenta text-xl hover:scale-105 transition-transform">HIGH (7-12)</button>
      </div>
      <p className="text-xs text-muted-foreground">Probability: Low 41.7% | High 58.3%</p>
    </div>
  );
};
