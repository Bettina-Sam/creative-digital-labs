import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

const codeBlocks: Record<string, { blocks: string[]; correct: number[]; hint: string }[]> = {
  Easy: [
    { blocks: ['let x = 5;', 'let y = 10;', 'console.log(x + y);'], correct: [0, 1, 2], hint: 'Declare variables then use them' },
    { blocks: ['function greet() {', '  return "Hello!";', '}'], correct: [0, 1, 2], hint: 'Function declaration syntax' },
    { blocks: ['const arr = [1,2,3];', 'arr.push(4);', 'console.log(arr);'], correct: [0, 1, 2], hint: 'Array operations in order' },
  ],
  Medium: [
    { blocks: ['for (let i = 0;', 'i < 10;', 'i++) {', '  sum += i;', '}'], correct: [0, 1, 2, 3, 4], hint: 'For loop structure' },
    { blocks: ['const data = fetch(url);', 'const json = data.json();', 'console.log(json);', 'return json;'], correct: [0, 1, 2, 3], hint: 'Fetch data flow' },
  ],
  Hard: [
    { blocks: ['class Animal {', '  constructor(name) {', '    this.name = name;', '  }', '  speak() {', '    return this.name;', '  }', '}'], correct: [0, 1, 2, 3, 4, 5, 6, 7], hint: 'Class syntax with constructor and method' },
  ],
};

export const CodeBreakerGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  const puzzles = codeBlocks[difficulty];
  const puzzle = puzzles[puzzleIdx % puzzles.length];

  useEffect(() => {
    if (!isPlaying) return;
    setPlaced([]);
    setShowHint(false);
    setShuffled([...puzzle.blocks].sort(() => Math.random() - 0.5));
  }, [isPlaying, puzzleIdx]);

  const handleBlockClick = useCallback((block: string) => {
    if (!isPlaying) return;
    const nextPlaced = [...placed, block];
    setPlaced(nextPlaced);
    setShuffled(prev => prev.filter((_, i) => prev.indexOf(block) !== i || i !== prev.indexOf(block)));

    // Check if correct so far
    const isCorrect = nextPlaced.every((b, i) => b === puzzle.blocks[puzzle.correct[i]]);
    
    if (nextPlaced.length === puzzle.blocks.length) {
      if (isCorrect) {
        onScoreUpdate(difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 35 : 50);
        setTimeout(() => setPuzzleIdx(prev => prev + 1), 800);
      } else {
        onScoreUpdate(-5);
        // Reset
        setTimeout(() => {
          setPlaced([]);
          setShuffled([...puzzle.blocks].sort(() => Math.random() - 0.5));
        }, 500);
      }
    }
  }, [isPlaying, placed, puzzle, difficulty, onScoreUpdate]);

  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4">
      <div className="text-sm text-muted-foreground mb-2">Arrange the code blocks in the correct order!</div>
      
      {/* Placed blocks */}
      <div className="w-full max-w-md space-y-1 min-h-[120px] glass-panel p-3 rounded-xl">
        <AnimatePresence>
          {placed.map((block, i) => {
            const isCorrect = block === puzzle.blocks[puzzle.correct[i]];
            return (
              <motion.div key={`placed-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs ${isCorrect ? 'bg-neon-lime/10 text-neon-lime border border-neon-lime/30' : 'bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/30'}`}>
                {block}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {placed.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Click blocks below to place them here</div>}
      </div>

      {/* Available blocks */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {shuffled.map((block, i) => (
          <motion.button key={`avail-${i}`} onClick={() => handleBlockClick(block)}
            className="px-3 py-1.5 rounded-lg font-mono text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {block}
          </motion.button>
        ))}
      </div>

      <button onClick={() => setShowHint(!showHint)} className="text-xs text-muted-foreground hover:text-foreground">
        {showHint ? `💡 ${puzzle.hint}` : '💡 Show Hint'}
      </button>
    </div>
  );
};
