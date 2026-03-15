import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Cell {
  index: number;
  isHighlighted: boolean;
  isRevealed: boolean;
}

type GamePhase = 'showing' | 'input' | 'result';

interface MemoryMatrixGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
}

export const MemoryMatrixGame = ({ difficulty, onScoreUpdate, isPlaying }: MemoryMatrixGameProps) => {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [phase, setPhase] = useState<GamePhase>('showing');
  const [level, setLevel] = useState(1);
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [correctCells, setCorrectCells] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState('');

  const difficultySettings = {
    Easy: { gridSize: 3, startCells: 3, showTime: 2000 },
    Medium: { gridSize: 4, startCells: 4, showTime: 1500 },
    Hard: { gridSize: 5, startCells: 5, showTime: 1200 },
  };

  const settings = difficultySettings[difficulty];
  const totalCells = settings.gridSize * settings.gridSize;

  const initializeRound = useCallback(() => {
    const cellCount = settings.startCells + Math.floor(level / 2);
    const highlightedIndices = new Set<number>();
    
    while (highlightedIndices.size < Math.min(cellCount, totalCells - 1)) {
      highlightedIndices.add(Math.floor(Math.random() * totalCells));
    }

    const newGrid: Cell[] = Array.from({ length: totalCells }, (_, i) => ({
      index: i,
      isHighlighted: highlightedIndices.has(i),
      isRevealed: true,
    }));

    setGrid(newGrid);
    setCorrectCells(highlightedIndices);
    setSelectedCells(new Set());
    setPhase('showing');
    setMessage(`Remember ${highlightedIndices.size} cells!`);

    setTimeout(() => {
      setGrid(prev => prev.map(cell => ({ ...cell, isRevealed: false })));
      setPhase('input');
      setMessage('Click the highlighted cells!');
    }, settings.showTime);
  }, [level, settings, totalCells]);

  useEffect(() => {
    if (isPlaying) {
      initializeRound();
    }
  }, [isPlaying, level]);

  const handleCellClick = (index: number) => {
    if (phase !== 'input' || selectedCells.has(index)) return;

    const newSelected = new Set(selectedCells);
    newSelected.add(index);
    setSelectedCells(newSelected);

    // Check if all correct cells are selected
    if (newSelected.size === correctCells.size) {
      const allCorrect = [...correctCells].every(i => newSelected.has(i));
      
      setPhase('result');
      setGrid(prev => prev.map(cell => ({ ...cell, isRevealed: true })));

      if (allCorrect) {
        const points = 20 + level * 5;
        onScoreUpdate(points);
        setMessage(`✨ Perfect! +${points} points`);
        setTimeout(() => {
          setLevel(l => l + 1);
        }, 1500);
      } else {
        const correctCount = [...correctCells].filter(i => newSelected.has(i)).length;
        const points = correctCount * 5;
        onScoreUpdate(points);
        setMessage(`${correctCount}/${correctCells.size} correct. +${points} points`);
        setTimeout(() => {
          initializeRound();
        }, 2000);
      }
    }
  };

  const getCellColor = (cell: Cell) => {
    if (phase === 'showing' && cell.isHighlighted) return 'bg-neon-cyan';
    if (phase === 'result') {
      if (cell.isHighlighted && selectedCells.has(cell.index)) return 'bg-neon-lime';
      if (cell.isHighlighted) return 'bg-neon-cyan/50';
      if (selectedCells.has(cell.index)) return 'bg-neon-magenta';
    }
    if (selectedCells.has(cell.index)) return 'bg-primary/50';
    return 'bg-background/50 hover:bg-background/80';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* Level & Message */}
      <div className="mb-6 text-center">
        <div className="text-sm text-muted-foreground mb-2">Level {level}</div>
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold gradient-text"
        >
          {message}
        </motion.div>
      </div>

      {/* Grid */}
      <motion.div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
        }}
      >
        {grid.map(cell => (
          <motion.button
            key={cell.index}
            onClick={() => handleCellClick(cell.index)}
            className={`w-16 h-16 rounded-lg transition-all border border-border ${getCellColor(cell)}`}
            whileHover={phase === 'input' ? { scale: 1.05 } : {}}
            whileTap={phase === 'input' ? { scale: 0.95 } : {}}
            animate={
              phase === 'showing' && cell.isHighlighted
                ? { boxShadow: ['0 0 0px #00FFD1', '0 0 20px #00FFD1', '0 0 0px #00FFD1'] }
                : {}
            }
            transition={{ repeat: phase === 'showing' ? Infinity : 0, duration: 0.8 }}
          />
        ))}
      </motion.div>

      {/* Progress */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Selected:</span>
        <span className="font-mono-lab text-primary">
          {selectedCells.size} / {correctCells.size}
        </span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground font-mono-lab">
          Watch the pattern • Remember the cells • Click to recreate!
        </p>
      </div>
    </div>
  );
};
