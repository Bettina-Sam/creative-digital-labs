import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_COLORS = ['#00f0ff', '#ff00ff', '#a0ff00', '#ff6600', '#aa44ff', '#ff4444', '#44aaff', '#ffaa00'];
const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

const noteFreqs: Record<string, number> = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
};

export const MusicSequencer = ({ isOpen, onClose }: Props) => {
  const [grid, setGrid] = useState<boolean[][]>(() => Array(8).fill(null).map(() => Array(16).fill(false)));
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNote = useCallback((note: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = noteFreqs[note];
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const toggleCell = (row: number, col: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = !next[row][col];
      if (!next[row][col]) return next;
      playNote(NOTES[row]);
      return next;
    });
  };

  const togglePlay = useCallback(() => {
    if (isPlayingSeq) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlayingSeq(false);
      setCurrentStep(-1);
      return;
    }
    setIsPlayingSeq(true);
    let step = 0;
    const ms = (60 / bpm) * 1000 / 4;
    intervalRef.current = setInterval(() => {
      setCurrentStep(step);
      for (let row = 0; row < 8; row++) {
        if (grid[row][step % 16]) playNote(NOTES[row]);
      }
      step = (step + 1) % 16;
    }, ms);
  }, [isPlayingSeq, bpm, grid, playNote]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold gradient-text">Music Sequencer</h2>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">BPM: {bpm}</span>
            <input type="range" min="60" max="200" value={bpm} onChange={e => setBpm(+e.target.value)} className="w-20 accent-primary" />
            <button onClick={togglePlay} className={`text-xs px-3 py-1.5 rounded-lg ${isPlayingSeq ? 'bg-neon-magenta/20 text-neon-magenta' : 'bg-primary/20 text-primary'}`}>
              {isPlayingSeq ? '⏹ Stop' : '▶ Play'}
            </button>
            <button onClick={() => setGrid(Array(8).fill(null).map(() => Array(16).fill(false)))} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">Clear</button>
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg bg-muted">✕</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `60px repeat(16, 1fr)` }}>
            {NOTES.map((note, row) => (
              <>
                <div key={`label-${row}`} className="flex items-center justify-end pr-2 text-xs font-mono" style={{ color: NOTE_COLORS[row] }}>{note}</div>
                {Array(16).fill(0).map((_, col) => (
                  <motion.button key={`${row}-${col}`} onClick={() => toggleCell(row, col)}
                    className={`w-8 h-8 rounded-md border transition-all ${currentStep === col ? 'border-foreground' : 'border-border/30'}`}
                    style={{ backgroundColor: grid[row][col] ? NOTE_COLORS[row] + '60' : currentStep === col ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                    whileTap={{ scale: 0.8 }} />
                ))}
              </>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">🎵 Click cells to place notes. Hit Play to hear your composition. Each row is a different musical note.</p>
      </motion.div>
    </motion.div>
  );
};
