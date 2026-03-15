import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';

interface ColorBlindnessSimulatorProps { isOpen: boolean; onClose: () => void; }

type VisionType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

const visionInfo: Record<VisionType, { label: string; desc: string }> = {
  normal: { label: 'Normal Vision', desc: 'Full color perception with all three cone types.' },
  protanopia: { label: 'Protanopia', desc: 'No red cones. Red appears dark. ~1% of males affected.' },
  deuteranopia: { label: 'Deuteranopia', desc: 'No green cones. Most common color blindness (~6% males).' },
  tritanopia: { label: 'Tritanopia', desc: 'No blue cones. Very rare. Blue-yellow confusion.' },
  achromatopsia: { label: 'Achromatopsia', desc: 'Complete color blindness. Only sees grayscale.' },
};

const applyFilter = (r: number, g: number, b: number, type: VisionType): [number, number, number] => {
  switch (type) {
    case 'protanopia': return [0.567 * r + 0.433 * g, 0.558 * r + 0.442 * g, 0.242 * g + 0.758 * b];
    case 'deuteranopia': return [0.625 * r + 0.375 * g, 0.7 * r + 0.3 * g, 0.3 * g + 0.7 * b];
    case 'tritanopia': return [0.95 * r + 0.05 * g, 0.433 * g + 0.567 * b, 0.475 * g + 0.525 * b];
    case 'achromatopsia': { const gray = 0.299 * r + 0.587 * g + 0.114 * b; return [gray, gray, gray]; }
    default: return [r, g, b];
  }
};

export const ColorBlindnessSimulator = ({ isOpen, onClose }: ColorBlindnessSimulatorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visionType, setVisionType] = useState<VisionType>('normal');
  const originalImageRef = useRef<ImageData | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Draw sample color palette
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#00ff88', '#ff0088'];
    const size = 60;
    colors.forEach((c, i) => {
      const x = (i % 5) * (size + 10) + 30;
      const y = Math.floor(i / 5) * (size + 10) + 30;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, size, size);
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size + 30, 20, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });

    // Rainbow gradient
    const grad = ctx.createLinearGradient(30, 220, canvas.width - 30, 220);
    ['red','orange','yellow','green','cyan','blue','purple'].forEach((c, i) => grad.addColorStop(i / 6, c));
    ctx.fillStyle = grad;
    ctx.fillRect(30, 200, canvas.width - 60, 40);

    originalImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  useEffect(() => {
    if (!originalImageRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const src = originalImageRef.current;
    const dst = ctx.createImageData(src.width, src.height);

    for (let i = 0; i < src.data.length; i += 4) {
      const [r, g, b] = applyFilter(src.data[i], src.data[i + 1], src.data[i + 2], visionType);
      dst.data[i] = Math.min(255, r);
      dst.data[i + 1] = Math.min(255, g);
      dst.data[i + 2] = Math.min(255, b);
      dst.data[i + 3] = src.data[i + 3];
    }
    ctx.putImageData(dst, 0, 0);
  }, [visionType]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Color Blindness Simulator</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            <div className="flex gap-2 flex-wrap justify-center">
              {(Object.keys(visionInfo) as VisionType[]).map(v => (
                <motion.button key={v} onClick={() => setVisionType(v)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${visionType === v ? 'bg-primary text-primary-foreground' : 'glass-panel hover:bg-muted/50'}`} whileTap={{ scale: 0.95 }}>
                  {visionInfo[v].label}
                </motion.button>
              ))}
            </div>
            <canvas ref={canvasRef} width={380} height={280} className="rounded-xl border border-border bg-[#0a0a0f] max-w-full" />
            <div className="glass-panel p-4 rounded-xl max-w-md text-center">
              <h3 className="font-bold text-sm mb-1">{visionInfo[visionType].label}</h3>
              <p className="text-xs text-muted-foreground">{visionInfo[visionType].desc}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
