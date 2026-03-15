import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
const constellations = [
  { name: 'Orion', stars: 7 }, { name: 'Ursa Major', stars: 7 }, { name: 'Cassiopeia', stars: 5 },
  { name: 'Leo', stars: 6 }, { name: 'Scorpius', stars: 8 }, { name: 'Cygnus', stars: 5 },
];
export const StarChartGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [current, setCurrent] = useState(constellations[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState<{ x: number; y: number }[]>([]);
  const next = () => {
    const c = constellations[Math.floor(Math.random() * constellations.length)];
    setCurrent(c);
    const s = Array.from({ length: c.stars }, () => ({ x: 20 + Math.random() * 60, y: 10 + Math.random() * 80 }));
    setStars(s);
    const wrong = constellations.filter(x => x.name !== c.name).sort(() => Math.random() - 0.5).slice(0, 3);
    setOptions([c.name, ...wrong.map(w => w.name)].sort(() => Math.random() - 0.5));
    setFeedback('');
  };
  useEffect(() => { if (isPlaying) next(); }, [isPlaying]);
  const guess = (name: string) => {
    if (name === current.name) { onScoreUpdate(15); setFeedback('✅ Correct!'); setTimeout(next, 800); }
    else { onScoreUpdate(-5); setFeedback('❌ Try again'); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-8 p-6">
      <div className="relative w-60 h-60 rounded-xl bg-background/80 border border-border overflow-hidden">
        {stars.map((s, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            className="absolute w-2 h-2 rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
        ))}
        {stars.length > 1 && (
          <svg className="absolute inset-0 w-full h-full">
            {stars.slice(1).map((s, i) => (
              <line key={i} x1={`${stars[i].x}%`} y1={`${stars[i].y}%`} x2={`${s.x}%`} y2={`${s.y}%`} stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
            ))}
          </svg>
        )}
      </div>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Identify the constellation:</p>
        {feedback && <p className="font-bold">{feedback}</p>}
        {options.map(o => (
          <motion.button key={o} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => guess(o)}
            className="block w-full px-6 py-3 rounded-xl glass-panel text-left font-medium hover:border-primary transition-all">{o}</motion.button>
        ))}
      </div>
    </div>
  );
};
