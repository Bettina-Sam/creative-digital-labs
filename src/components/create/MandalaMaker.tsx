import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Download } from 'lucide-react';

interface MandalaMakerProps { isOpen: boolean; onClose: () => void; }

export const MandalaMaker = ({ isOpen, onClose }: MandalaMakerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [symmetry, setSymmetry] = useState(8);
  const [color, setColor] = useState('#00ffcc');
  const [brushSize, setBrushSize] = useState(3);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const draw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const dx = x - cx, dy = y - cy;
    const angle = (2 * Math.PI) / symmetry;

    for (let i = 0; i < symmetry; i++) {
      const cos = Math.cos(angle * i), sin = Math.sin(angle * i);
      const rx = cx + dx * cos - dy * sin;
      const ry = cy + dx * sin + dy * cos;

      ctx.beginPath();
      ctx.arc(rx, ry, brushSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Mirror
      const mx = cx + dx * cos + dy * sin;
      const my = cy + dx * sin - dy * cos;
      ctx.beginPath();
      ctx.arc(mx, my, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [symmetry, color, brushSize]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    draw(x, y);
    lastPos.current = { x, y };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'mandala.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Mandala Maker</h2>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <label className="text-xs text-muted-foreground">Symmetry: {symmetry}</label>
              <input type="range" min={3} max={16} value={symmetry} onChange={e => setSymmetry(+e.target.value)} className="w-20" />
              <label className="text-xs text-muted-foreground">Size: {brushSize}</label>
              <input type="range" min={1} max={10} value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-20" />
              <button onClick={clearCanvas} className="p-2 rounded-lg hover:bg-muted"><RotateCw className="w-4 h-4" /></button>
              <button onClick={exportImage} className="p-2 rounded-lg hover:bg-muted"><Download className="w-4 h-4" /></button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <canvas ref={canvasRef} width={600} height={600} className="rounded-2xl border border-border bg-[#0a0a0f] touch-none max-w-full max-h-full" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => isDrawing.current = false} onPointerLeave={() => isDrawing.current = false} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
