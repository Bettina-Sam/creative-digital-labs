import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MathProblem {
  id: number;
  expression: string;
  answer: number;
  options: number[];
  x: number;
  speed: number;
}

interface MathFlowGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
}

export const MathFlowGame = ({ difficulty, onScoreUpdate, isPlaying }: MathFlowGameProps) => {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<MathProblem | null>(null);
  const [streak, setStreak] = useState(0);

  const difficultySettings = {
    Easy: { maxNum: 10, operations: ['+', '-'], speed: 0.3, spawnRate: 3000 },
    Medium: { maxNum: 20, operations: ['+', '-', '×'], speed: 0.5, spawnRate: 2500 },
    Hard: { maxNum: 50, operations: ['+', '-', '×', '÷'], speed: 0.7, spawnRate: 2000 },
  };

  const settings = difficultySettings[difficulty];

  const generateProblem = useCallback((): MathProblem => {
    const op = settings.operations[Math.floor(Math.random() * settings.operations.length)];
    let a = Math.floor(Math.random() * settings.maxNum) + 1;
    let b = Math.floor(Math.random() * settings.maxNum) + 1;
    let answer: number;

    switch (op) {
      case '+':
        answer = a + b;
        break;
      case '-':
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      case '÷':
        answer = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        a = answer * b;
        break;
      default:
        answer = a + b;
    }

    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < 3) {
      const wrong = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== answer && wrong >= 0) wrongAnswers.add(wrong);
    }

    const options = [...wrongAnswers, answer].sort(() => Math.random() - 0.5);

    return {
      id: Date.now() + Math.random(),
      expression: `${a} ${op} ${b}`,
      answer,
      options,
      x: -200,
      speed: settings.speed + Math.random() * 0.2,
    };
  }, [settings]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProblems(prev => [...prev.slice(-4), generateProblem()]);
    }, settings.spawnRate);
    return () => clearInterval(interval);
  }, [isPlaying, generateProblem, settings.spawnRate]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProblems(prev => 
        prev
          .map(p => ({ ...p, x: p.x + p.speed * 2 }))
          .filter(p => p.x < 600)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleAnswer = (problem: MathProblem, answer: number) => {
    if (answer === problem.answer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = 15 + Math.floor(newStreak / 3) * 5;
      onScoreUpdate(points);
    } else {
      setStreak(0);
      onScoreUpdate(-5);
    }
    setProblems(prev => prev.filter(p => p.id !== problem.id));
    setSelectedProblem(null);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-background/50 to-transparent">
      {/* Streak Display */}
      {streak > 0 && (
        <motion.div
          key={streak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 text-neon-lime font-bold"
        >
          🔥 {streak} Streak
        </motion.div>
      )}

      {/* Flowing Problems */}
      <AnimatePresence>
        {problems.map(problem => (
          <motion.div
            key={problem.id}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: problem.x }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <motion.button
              onClick={() => setSelectedProblem(problem)}
              className="glass-panel px-6 py-4 rounded-xl border-2 border-neon-cyan/30 hover:border-neon-cyan"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-2xl font-bold font-mono-lab gradient-text">
                {problem.expression} = ?
              </span>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Answer Modal */}
      <AnimatePresence>
        {selectedProblem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 flex items-center justify-center"
            onClick={() => setSelectedProblem(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="glass-panel p-6 rounded-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-center mb-4 gradient-text">
                {selectedProblem.expression} = ?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedProblem.options.map((option, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(selectedProblem, option)}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-border hover:border-primary text-xl font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground font-mono-lab">
          Click equations as they flow by • Answer quickly to build streaks!
        </p>
      </div>
    </div>
  );
};
