import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ElementBuilderProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

const molecules = [
  { name: 'H₂O', atoms: ['H', 'H', 'O'], hint: 'Water' },
  { name: 'CO₂', atoms: ['C', 'O', 'O'], hint: 'Carbon Dioxide' },
  { name: 'NaCl', atoms: ['Na', 'Cl'], hint: 'Table Salt' },
  { name: 'CH₄', atoms: ['C', 'H', 'H', 'H', 'H'], hint: 'Methane' },
  { name: 'O₂', atoms: ['O', 'O'], hint: 'Oxygen Gas' },
  { name: 'NH₃', atoms: ['N', 'H', 'H', 'H'], hint: 'Ammonia' },
];

const atomColors: Record<string, string> = {
  H: '#ffffff', O: '#ff4444', C: '#444444', N: '#4444ff', Na: '#ffaa00', Cl: '#44ff44',
};

export const ElementBuilderGame = ({ difficulty, onScoreUpdate, isPlaying }: ElementBuilderProps) => {
  const [targetIdx, setTargetIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);

  const setupRound = useCallback(() => {
    const idx = Math.floor(Math.random() * molecules.length);
    setTargetIdx(idx);
    setSelected([]);
    const target = molecules[idx];
    const extra = ['H', 'O', 'C', 'N', 'Na', 'Cl'].filter(a => !target.atoms.includes(a)).slice(0, difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3);
    const all = [...target.atoms, ...extra].sort(() => Math.random() - 0.5);
    setAvailable(all);
  }, [difficulty]);

  useEffect(() => {
    if (isPlaying) setupRound();
  }, [isPlaying, setupRound]);

  const handleAtomClick = (atom: string, idx: number) => {
    const newSelected = [...selected, atom];
    setSelected(newSelected);
    setAvailable(prev => prev.filter((_, i) => i !== idx));

    const target = molecules[targetIdx];
    if (newSelected.length === target.atoms.length) {
      const sorted1 = [...newSelected].sort().join('');
      const sorted2 = [...target.atoms].sort().join('');
      if (sorted1 === sorted2) {
        onScoreUpdate(difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30);
        setTimeout(setupRound, 500);
      } else {
        onScoreUpdate(-5);
        setTimeout(setupRound, 500);
      }
    }
  };

  if (!isPlaying) return null;
  const target = molecules[targetIdx];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Build this molecule:</p>
        <h3 className="text-3xl font-bold gradient-text">{target.name}</h3>
        <p className="text-sm text-muted-foreground">{target.hint}</p>
      </div>

      {/* Selected atoms */}
      <div className="flex gap-2 min-h-[60px] items-center">
        {selected.map((a, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2" style={{ backgroundColor: atomColors[a] + '33', borderColor: atomColors[a], color: atomColors[a] }}>
            {a}
          </motion.div>
        ))}
      </div>

      {/* Available atoms */}
      <div className="flex gap-3 flex-wrap justify-center">
        {available.map((a, i) => (
          <motion.button key={i} onClick={() => handleAtomClick(a, i)} className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm border-2 hover:scale-110 transition-transform" style={{ backgroundColor: atomColors[a] + '22', borderColor: atomColors[a] + '88', color: atomColors[a] }} whileTap={{ scale: 0.9 }}>
            {a}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
