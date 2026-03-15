import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
const elements = [
  { symbol: 'H', name: 'Hydrogen', protons: 1 }, { symbol: 'He', name: 'Helium', protons: 2 },
  { symbol: 'Li', name: 'Lithium', protons: 3 }, { symbol: 'C', name: 'Carbon', protons: 6 },
  { symbol: 'N', name: 'Nitrogen', protons: 7 }, { symbol: 'O', name: 'Oxygen', protons: 8 },
  { symbol: 'Na', name: 'Sodium', protons: 11 }, { symbol: 'Fe', name: 'Iron', protons: 26 },
];
export const AtomBuilderGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [current, setCurrent] = useState(elements[0]);
  const [protonCount, setProtonCount] = useState(0);
  const next = () => { setCurrent(elements[Math.floor(Math.random() * elements.length)]); setProtonCount(0); };
  useEffect(() => { if (isPlaying) next(); }, [isPlaying]);
  const addProton = () => {
    const n = protonCount + 1;
    setProtonCount(n);
    if (n === current.protons) { onScoreUpdate(15); setTimeout(next, 500); }
    else if (n > current.protons) { onScoreUpdate(-5); setProtonCount(0); }
  };
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">Build the atom by adding the right number of protons</p>
      <div className="text-center">
        <p className="text-5xl font-bold gradient-text">{current.symbol}</p>
        <p className="text-lg text-muted-foreground">{current.name}</p>
      </div>
      <div className="relative w-32 h-32 rounded-full border-2 border-border flex items-center justify-center">
        <div className="flex flex-wrap gap-1 justify-center max-w-[80px]">
          {Array.from({ length: protonCount }, (_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 rounded-full bg-neon-magenta" />
          ))}
        </div>
      </div>
      <p className="text-sm font-mono">{protonCount} protons</p>
      <motion.button onClick={addProton} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">+ Add Proton</motion.button>
    </div>
  );
};
