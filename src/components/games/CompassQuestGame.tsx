import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
const arrows: Record<string, string> = { N: '↑', NE: '↗', E: '→', SE: '↘', S: '↓', SW: '↙', W: '←', NW: '↖' };
export const CompassQuestGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [target, setTarget] = useState('N');
  const [feedback, setFeedback] = useState('');
  const newTarget = () => { setTarget(directions[Math.floor(Math.random() * directions.length)]); setFeedback(''); };
  useEffect(() => { if (isPlaying) newTarget(); }, [isPlaying]);
  const guess = (dir: string) => {
    if (dir === target) { onScoreUpdate(10); setFeedback('✅ Correct!'); setTimeout(newTarget, 500); }
    else { onScoreUpdate(-3); setFeedback('❌ Try again'); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
      <p className="text-sm text-muted-foreground">Tap the direction:</p>
      <p className="text-4xl font-bold gradient-text">{target}</p>
      {feedback && <p className="text-lg">{feedback}</p>}
      <div className="grid grid-cols-3 gap-2 w-48">
        {['NW', 'N', 'NE', 'W', '', 'E', 'SW', 'S', 'SE'].map((d, i) => d ? (
          <motion.button key={d} onClick={() => guess(d)} whileTap={{ scale: 0.8 }}
            className="w-14 h-14 rounded-xl glass-panel text-2xl font-bold hover:bg-primary/20 transition-colors">{arrows[d]}</motion.button>
        ) : <div key={i} className="w-14 h-14 rounded-xl bg-muted/10 flex items-center justify-center">🧭</div>)}
      </div>
    </div>
  );
};
