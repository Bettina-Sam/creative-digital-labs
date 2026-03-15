import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, Music } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

const STEPS = 16;
const TRACKS = ['Kick', 'Snare', 'HiHat', 'Clap'];

export const BeatMaker = ({ isOpen, onClose }: Props) => {
  const [grid, setGrid] = useState(() => TRACKS.map(() => Array(STEPS).fill(false)));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const audioCtx = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const playSound = (track: number) => {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const freqs = [80, 200, 800, 400];
    const types: OscillatorType[] = ['sine', 'triangle', 'square', 'sawtooth'];
    osc.frequency.value = freqs[track];
    osc.type = types[track];
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  };

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    const ms = 60000 / bpm / 4;
    intervalRef.current = setInterval(() => {
      setStep(s => {
        const next = (s + 1) % STEPS;
        grid.forEach((track, ti) => { if (track[next]) playSound(ti); });
        return next;
      });
    }, ms);
    return () => clearInterval(intervalRef.current);
  }, [playing, bpm, grid]);

  const toggle = (t: number, s: number) => {
    setGrid(g => g.map((track, ti) => ti === t ? track.map((v, si) => si === s ? !v : v) : track));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Music className="w-5 h-5 text-neon-magenta" /><h2 className="font-bold">Beat Maker</h2></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying(!playing)} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${playing ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'}`}>{playing ? 'Stop' : 'Play'}</button>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">{bpm} BPM <input type="range" min="60" max="200" value={bpm} onChange={e => setBpm(+e.target.value)} className="w-16" /></label>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              {TRACKS.map((name, ti) => (
                <div key={name} className="flex items-center gap-1 mb-1">
                  <span className="w-12 text-xs text-muted-foreground shrink-0">{name}</span>
                  {grid[ti].map((on, si) => (
                    <motion.button key={si} onClick={() => toggle(ti, si)} whileTap={{ scale: 0.8 }}
                      className={`w-7 h-7 rounded-md transition-all shrink-0 ${on ? 'bg-neon-cyan' : 'bg-muted/30'} ${step === si && playing ? 'ring-2 ring-primary' : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
