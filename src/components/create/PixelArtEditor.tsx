import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PixelArtEditor = ({ isOpen, onClose }: Props) => {
  const [gridSize, setGridSize] = useState(16);
  const [pixels, setPixels] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('#00f0ff');
  const [isDrawing, setIsDrawing] = useState(false);

  const palette = ['#00f0ff', '#ff00ff', '#a0ff00', '#ff6600', '#aa44ff', '#ff4444', '#ffffff', '#000000', '#ffaa00', '#44aaff', '#ff88aa', '#88ff88'];

  useEffect(() => {
    setPixels(Array(gridSize * gridSize).fill('transparent'));
  }, [gridSize]);

  const handlePixel = (idx: number) => {
    setPixels(prev => { const n = [...prev]; n[idx] = currentColor; return n; });
  };

  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    const scale = 16;
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    const ctx = canvas.getContext('2d')!;
    pixels.forEach((color, i) => {
      if (color !== 'transparent') {
        ctx.fillStyle = color;
        ctx.fillRect((i % gridSize) * scale, Math.floor(i / gridSize) * scale, scale, scale);
      }
    });
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold gradient-text">Pixel Art Editor</h2>
          <div className="flex gap-2">
            <button onClick={exportPNG} className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary">Export PNG</button>
            <button onClick={() => setPixels(Array(gridSize * gridSize).fill('transparent'))} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">Clear</button>
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg bg-muted">✕</button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          {palette.map(c => (
            <button key={c} onClick={() => setCurrentColor(c)}
              className={`w-7 h-7 rounded-lg border-2 ${currentColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
          <input type="color" value={currentColor} onChange={e => setCurrentColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer" />
        </div>

        <div className="flex gap-2 mb-3">
          {[8, 16, 32].map(s => (
            <button key={s} onClick={() => setGridSize(s)} className={`text-xs px-3 py-1 rounded ${gridSize === s ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>{s}×{s}</button>
          ))}
        </div>

        <div className="inline-grid gap-0 border border-border rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          onMouseDown={() => setIsDrawing(true)} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}>
          {pixels.map((color, i) => (
            <div key={i} className="w-4 h-4 md:w-5 md:h-5 border border-border/20 cursor-crosshair hover:opacity-80"
              style={{ backgroundColor: color === 'transparent' ? undefined : color }}
              onMouseDown={() => handlePixel(i)} onMouseEnter={() => isDrawing && handlePixel(i)} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
