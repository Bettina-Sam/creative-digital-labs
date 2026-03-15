import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

interface CodeArtGeneratorProps { isOpen: boolean; onClose: () => void; }

const presets = [
  { name: 'Spiral', code: 'for (let i = 0; i < 500; i++) {\n  const a = i * 0.1;\n  const r = a * 3;\n  const x = W/2 + Math.cos(a) * r;\n  const y = H/2 + Math.sin(a) * r;\n  ctx.fillStyle = `hsl(${i}, 80%, 60%)`;\n  ctx.fillRect(x, y, 3, 3);\n}' },
  { name: 'Circles', code: 'for (let i = 0; i < 50; i++) {\n  ctx.beginPath();\n  ctx.arc(W/2, H/2, i * 6, 0, Math.PI * 2);\n  ctx.strokeStyle = `hsl(${i*7}, 80%, 60%)`;\n  ctx.stroke();\n}' },
  { name: 'Stars', code: 'for (let i = 0; i < 200; i++) {\n  const x = Math.random() * W;\n  const y = Math.random() * H;\n  const s = Math.random() * 4;\n  ctx.fillStyle = `rgba(255,255,${Math.random()*255},${Math.random()})`;\n  ctx.fillRect(x, y, s, s);\n}' },
];

export const CodeArtGenerator = ({ isOpen, onClose }: CodeArtGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState(presets[0].code);
  const [error, setError] = useState('');

  const runCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1;
    setError('');

    try {
      const fn = new Function('ctx', 'W', 'H', code);
      fn(ctx, W, H);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { if (isOpen) runCode(); }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Code Art Generator</h2>
            <div className="flex gap-2">
              {presets.map(p => (
                <button key={p.name} onClick={() => { setCode(p.code); setTimeout(runCode, 50); }} className="px-3 py-1 rounded-lg text-xs bg-muted/30 hover:bg-muted/50">{p.name}</button>
              ))}
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
            <div className="flex-1 flex flex-col gap-2">
              <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-1 bg-background/80 rounded-xl p-4 font-mono text-sm text-neon-cyan border border-border resize-none" spellCheck={false} />
              {error && <p className="text-xs text-neon-magenta">{error}</p>}
              <motion.button onClick={runCode} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 justify-center" whileTap={{ scale: 0.95 }}>
                <Play className="w-4 h-4" /> Run
              </motion.button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <canvas ref={canvasRef} width={400} height={400} className="rounded-xl border border-border bg-[#0a0a0f] max-w-full max-h-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
