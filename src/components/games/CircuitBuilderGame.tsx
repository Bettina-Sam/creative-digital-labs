import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CircuitBuilderProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

interface Wire { from: number; to: number; connected: boolean }

export const CircuitBuilderGame = ({ difficulty, onScoreUpdate, isPlaying }: CircuitBuilderProps) => {
  const [components, setComponents] = useState<string[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [bulbOn, setBulbOn] = useState(false);

  const setupCircuit = useCallback(() => {
    const parts = difficulty === 'Easy'
      ? ['Battery', 'Wire', 'Bulb']
      : difficulty === 'Medium'
      ? ['Battery', 'Switch', 'Wire', 'Bulb']
      : ['Battery', 'Resistor', 'Switch', 'Wire', 'Bulb'];
    
    const shuffled = [...parts].sort(() => Math.random() - 0.5);
    setComponents(shuffled);
    setWires([]);
    setBulbOn(false);
    setSelectedNode(null);
  }, [difficulty]);

  useEffect(() => {
    if (isPlaying) setupCircuit();
  }, [isPlaying, setupCircuit]);

  const handleNodeClick = (idx: number) => {
    if (selectedNode === null) {
      setSelectedNode(idx);
    } else if (selectedNode !== idx) {
      const newWire = { from: selectedNode, to: idx, connected: true };
      const newWires = [...wires, newWire];
      setWires(newWires);
      setSelectedNode(null);

      // Check if circuit is complete
      if (newWires.length >= components.length - 1) {
        const order = ['Battery', 'Switch', 'Resistor', 'Wire', 'Bulb'];
        const correctOrder = components.map(c => order.indexOf(c) === -1 ? 99 : order.indexOf(c));
        const isCircuit = newWires.length >= components.length - 1;
        if (isCircuit) {
          setBulbOn(true);
          onScoreUpdate(difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 25 : 40);
          setTimeout(setupCircuit, 1500);
        }
      }
    } else {
      setSelectedNode(null);
    }
  };

  if (!isPlaying) return null;

  const componentEmojis: Record<string, string> = {
    Battery: '🔋', Switch: '🔘', Resistor: '⚡', Wire: '〰️', Bulb: '💡',
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-sm text-muted-foreground">Connect components to complete the circuit!</p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        {components.map((comp, i) => (
          <motion.button key={i} onClick={() => handleNodeClick(i)} className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
            selectedNode === i ? 'border-primary bg-primary/20' : 'border-border bg-muted/10 hover:border-primary/50'
          } ${bulbOn && comp === 'Bulb' ? 'bg-neon-orange/30 border-neon-orange shadow-[0_0_20px_rgba(255,170,0,0.4)]' : ''}`} whileTap={{ scale: 0.9 }}>
            <span className="text-2xl">{componentEmojis[comp]}</span>
            <span className="text-[10px] text-muted-foreground">{comp}</span>
          </motion.button>
        ))}
      </div>

      {/* Wires visualization */}
      <div className="text-xs text-muted-foreground space-y-1">
        {wires.map((w, i) => (
          <div key={i}>🔗 {components[w.from]} → {components[w.to]}</div>
        ))}
      </div>

      {bulbOn && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-bold text-neon-orange">
          💡 Circuit Complete!
        </motion.div>
      )}
    </div>
  );
};
