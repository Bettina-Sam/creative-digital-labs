import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SoundMatcherProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (points: number) => void;
  isPlaying: boolean;
}

const notes = [
  { name: 'C', freq: 261.63 }, { name: 'D', freq: 293.66 }, { name: 'E', freq: 329.63 },
  { name: 'F', freq: 349.23 }, { name: 'G', freq: 392.00 }, { name: 'A', freq: 440.00 },
  { name: 'B', freq: 493.88 }, { name: 'C5', freq: 523.25 },
];

export const SoundMatcherGame = ({ difficulty, onScoreUpdate, isPlaying }: SoundMatcherProps) => {
  const [targetNote, setTargetNote] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNote = useCallback((freq: number, duration = 0.5) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const newRound = useCallback(() => {
    const count = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 8;
    const idx = Math.floor(Math.random() * count);
    setTargetNote(idx);
    setRevealed(false);
    setTimeout(() => playNote(notes[idx].freq), 300);
  }, [difficulty, playNote]);

  useEffect(() => {
    if (isPlaying) newRound();
  }, [isPlaying, newRound]);

  const handleGuess = (idx: number) => {
    playNote(notes[idx].freq);
    if (idx === targetNote) {
      onScoreUpdate(difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 20 : 30);
      setTimeout(newRound, 600);
    } else {
      onScoreUpdate(-5);
      setRevealed(true);
    }
  };

  if (!isPlaying) return null;
  const count = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 8;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-sm text-muted-foreground">Listen and find the matching note!</p>
      
      <motion.button onClick={() => playNote(notes[targetNote].freq)} className="px-6 py-3 rounded-xl bg-primary/20 text-primary font-bold" whileTap={{ scale: 0.9 }}>
        🔊 Play Again
      </motion.button>

      <div className="flex gap-2 flex-wrap justify-center">
        {notes.slice(0, count).map((note, i) => (
          <motion.button key={note.name} onClick={() => handleGuess(i)} className={`w-16 h-20 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${
            revealed && i === targetNote ? 'bg-neon-lime/20 border-neon-lime text-neon-lime' : 'bg-muted/10 border-border hover:border-primary/50 text-foreground'
          }`} whileHover={{ y: -4 }} whileTap={{ scale: 0.9 }}>
            <span className="text-lg">{note.name}</span>
            <span className="text-[9px] text-muted-foreground">{note.freq}Hz</span>
          </motion.button>
        ))}
      </div>

      {revealed && <p className="text-xs text-neon-orange">The note was {notes[targetNote].name} ({notes[targetNote].freq}Hz)</p>}
    </div>
  );
};
