import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Cpu } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

type Algo = 'bubble' | 'selection' | 'insertion' | 'merge';

export const AlgorithmViz = ({ isOpen, onClose }: Props) => {
  const [arr, setArr] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [sorting, setSorting] = useState(false);
  const [algo, setAlgo] = useState<Algo>('bubble');

  const reset = () => {
    setArr(Array.from({ length: 30 }, () => Math.random() * 200 + 20 | 0));
    setHighlights(new Set());
  };

  useEffect(() => { if (isOpen) reset(); }, [isOpen]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const sort = async () => {
    setSorting(true);
    const a = [...arr];
    if (algo === 'bubble') {
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          setHighlights(new Set([j, j + 1]));
          if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setArr([...a]);
          await sleep(30);
        }
      }
    } else if (algo === 'selection') {
      for (let i = 0; i < a.length; i++) {
        let min = i;
        for (let j = i + 1; j < a.length; j++) {
          setHighlights(new Set([min, j]));
          if (a[j] < a[min]) min = j;
          setArr([...a]); await sleep(30);
        }
        [a[i], a[min]] = [a[min], a[i]];
        setArr([...a]);
      }
    } else {
      for (let i = 1; i < a.length; i++) {
        let j = i;
        while (j > 0 && a[j - 1] > a[j]) {
          setHighlights(new Set([j - 1, j]));
          [a[j - 1], a[j]] = [a[j], a[j - 1]];
          setArr([...a]); await sleep(30);
          j--;
        }
      }
    }
    setHighlights(new Set());
    setSorting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Cpu className="w-5 h-5 text-neon-orange" /><h2 className="font-bold">Algorithm Visualizer</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 p-3 border-b border-border flex-wrap">
              {(['bubble', 'selection', 'insertion'] as Algo[]).map(a => (
                <button key={a} onClick={() => setAlgo(a)} disabled={sorting} className={`px-3 py-1 rounded-lg text-sm capitalize ${algo === a ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{a} sort</button>
              ))}
              <button onClick={sort} disabled={sorting} className="px-4 py-1 rounded-lg bg-neon-cyan/20 text-neon-cyan text-sm ml-auto">Sort</button>
              <button onClick={reset} disabled={sorting} className="px-4 py-1 rounded-lg glass-panel text-sm">Reset</button>
            </div>
            <div className="p-4 h-[300px] flex items-end gap-[2px]">
              {arr.map((v, i) => (
                <motion.div key={i} layout className="flex-1 rounded-t-sm" style={{ height: `${v}px`, backgroundColor: highlights.has(i) ? '#ff6ec7' : '#00e5ff' }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
