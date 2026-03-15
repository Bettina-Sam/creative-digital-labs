import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface EcosystemBalanceProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

export const EcosystemBalanceGame = ({ difficulty, onScoreUpdate, isPlaying }: EcosystemBalanceProps) => {
  const [prey, setPrey] = useState(50);
  const [predators, setPredators] = useState(20);
  const [plants, setPlants] = useState(100);
  const [turn, setTurn] = useState(0);
  const [message, setMessage] = useState('');
  const timerRef = useRef<number>();

  const targetPrey = 40;
  const targetPred = 15;

  useEffect(() => {
    if (!isPlaying) return;
    setPrey(50);
    setPredators(20);
    setPlants(100);
    setTurn(0);
    setMessage('');
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || turn === 0) return;
    
    // Simple ecology
    const preyGrowth = Math.floor(plants * 0.05) - Math.floor(predators * 0.8);
    const predGrowth = Math.floor(prey * 0.05) - Math.floor(predators * 0.3);
    const plantGrowth = 10 - Math.floor(prey * 0.08);

    const newPrey = Math.max(0, Math.min(200, prey + preyGrowth));
    const newPred = Math.max(0, Math.min(100, predators + predGrowth));
    const newPlants = Math.max(0, Math.min(200, plants + plantGrowth));

    setPrey(newPrey);
    setPredators(newPred);
    setPlants(newPlants);

    if (newPrey === 0 || newPred === 0) {
      setMessage('Ecosystem collapsed! 💀');
      onScoreUpdate(-10);
    } else {
      const balance = Math.abs(newPrey - targetPrey) + Math.abs(newPred - targetPred);
      if (balance < 15) {
        onScoreUpdate(difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 15 : 25);
        setMessage('Great balance! 🌿');
      }
    }
  }, [turn]);

  const adjustPopulation = (type: 'prey' | 'predator' | 'plants', delta: number) => {
    if (type === 'prey') setPrey(p => Math.max(0, Math.min(200, p + delta)));
    if (type === 'predator') setPredators(p => Math.max(0, Math.min(100, p + delta)));
    if (type === 'plants') setPlants(p => Math.max(0, Math.min(200, p + delta)));
  };

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-xs text-muted-foreground">Balance the ecosystem! Keep populations stable.</p>
      
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {/* Plants */}
        <div className="glass-panel p-3 rounded-xl text-center">
          <div className="text-2xl mb-1">🌿</div>
          <div className="font-bold text-neon-lime">{plants}</div>
          <div className="text-[10px] text-muted-foreground">Plants</div>
          <div className="flex gap-1 mt-2 justify-center">
            <button onClick={() => adjustPopulation('plants', -10)} className="px-2 py-1 rounded bg-muted/30 text-xs">-10</button>
            <button onClick={() => adjustPopulation('plants', 10)} className="px-2 py-1 rounded bg-muted/30 text-xs">+10</button>
          </div>
        </div>

        {/* Prey */}
        <div className="glass-panel p-3 rounded-xl text-center">
          <div className="text-2xl mb-1">🐰</div>
          <div className="font-bold text-neon-cyan">{prey}</div>
          <div className="text-[10px] text-muted-foreground">Prey</div>
          <div className="flex gap-1 mt-2 justify-center">
            <button onClick={() => adjustPopulation('prey', -10)} className="px-2 py-1 rounded bg-muted/30 text-xs">-10</button>
            <button onClick={() => adjustPopulation('prey', 10)} className="px-2 py-1 rounded bg-muted/30 text-xs">+10</button>
          </div>
        </div>

        {/* Predators */}
        <div className="glass-panel p-3 rounded-xl text-center">
          <div className="text-2xl mb-1">🐺</div>
          <div className="font-bold text-neon-magenta">{predators}</div>
          <div className="text-[10px] text-muted-foreground">Predators</div>
          <div className="flex gap-1 mt-2 justify-center">
            <button onClick={() => adjustPopulation('predator', -5)} className="px-2 py-1 rounded bg-muted/30 text-xs">-5</button>
            <button onClick={() => adjustPopulation('predator', 5)} className="px-2 py-1 rounded bg-muted/30 text-xs">+5</button>
          </div>
        </div>
      </div>

      <motion.button onClick={() => setTurn(t => t + 1)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold" whileTap={{ scale: 0.9 }}>
        Next Season →
      </motion.button>

      {message && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm font-bold">{message}</motion.p>}
      <p className="text-xs text-muted-foreground">Season {turn} | Target: ~{targetPrey} prey, ~{targetPred} predators</p>
    </div>
  );
};
