import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Trash2 } from 'lucide-react';

interface AnimationStudioProps { isOpen: boolean; onClose: () => void; }

export const AnimationStudio = ({ isOpen, onClose }: AnimationStudioProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [color, setColor] = useState('#00ffcc');
  const isDrawing = useRef(false);
  const intervalRef = useRef<number>();

  const captureFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setFrames(prev => [...prev, data]);
    setCurrentFrame(frames.length);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const playAnimation = () => {
    if (frames.length < 2) return;
    setIsPlaying(true);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(frames[i % frames.length], 0, 0);
      i++;
      if (i >= frames.length * 3) { clearInterval(intervalRef.current); setIsPlaying(false); }
    }, 200);
  };

  const handlePointerDown = () => { isDrawing.current = true; };
  const handlePointerUp = () => { isDrawing.current = false; };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Animation Studio</h2>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <button onClick={captureFrame} className="px-3 py-1.5 rounded-lg bg-neon-lime/20 text-neon-lime text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" />Add Frame</button>
              <button onClick={playAnimation} disabled={isPlaying || frames.length < 2} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-bold flex items-center gap-1 disabled:opacity-50"><Play className="w-3 h-3" />Play</button>
              <button onClick={() => setFrames([])} className="p-2 rounded-lg hover:bg-muted"><Trash2 className="w-4 h-4" /></button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            <canvas ref={canvasRef} width={400} height={300} className="rounded-xl border border-border bg-[#0a0a0f] touch-none max-w-full" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} />
            <div className="flex gap-2 overflow-x-auto max-w-full px-2">
              {frames.map((_, i) => (
                <div key={i} className={`w-12 h-9 rounded border-2 flex items-center justify-center text-xs font-mono ${i === currentFrame ? 'border-primary' : 'border-border'}`}>
                  F{i + 1}
                </div>
              ))}
              {frames.length === 0 && <p className="text-xs text-muted-foreground">Draw on canvas, then click "Add Frame" to create animation frames!</p>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
