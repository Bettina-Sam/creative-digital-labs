import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Box } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const ThreeDModeler = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotX, setRotX] = useState(0.5);
  const [rotY, setRotY] = useState(0.5);
  const [shape, setShape] = useState<'cube' | 'pyramid' | 'octahedron'>('cube');

  useEffect(() => {
    if (!isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    const cx = c.width / 2, cy = c.height / 2;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, c.width, c.height);

    const project = (x: number, y: number, z: number): [number, number] => {
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
      const x1 = x * cosY + z1 * sinY;
      const scale = 200 / (400 + z1);
      return [cx + x1 * scale * 200, cy + y1 * scale * 200];
    };

    const drawEdge = (a: [number, number], b: [number, number]) => {
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b);
      ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; ctx.stroke();
    };

    let verts: number[][] = [];
    let edges: number[][] = [];
    if (shape === 'cube') {
      verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
      edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    } else if (shape === 'pyramid') {
      verts = [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,1,0]];
      edges = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
    } else {
      verts = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
      edges = [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
    }

    const projected = verts.map(v => project(v[0], v[1], v[2]));
    edges.forEach(([a, b]) => drawEdge(projected[a], projected[b]));
    projected.forEach(p => {
      ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6ec7'; ctx.fill();
    });
  }, [isOpen, rotX, rotY, shape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Box className="w-5 h-5 text-neon-magenta" /><h2 className="font-bold">3D Modeler</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 p-3 border-b border-border flex-wrap items-center">
              {(['cube', 'pyramid', 'octahedron'] as const).map(s => (
                <button key={s} onClick={() => setShape(s)} className={`px-3 py-1 rounded-lg text-sm capitalize ${shape === s ? 'bg-primary text-primary-foreground' : 'glass-panel'}`}>{s}</button>
              ))}
              <label className="text-xs text-muted-foreground ml-2">X</label><input type="range" min="0" max="6.28" step="0.05" value={rotX} onChange={e => setRotX(+e.target.value)} className="w-20" />
              <label className="text-xs text-muted-foreground">Y</label><input type="range" min="0" max="6.28" step="0.05" value={rotY} onChange={e => setRotY(+e.target.value)} className="w-20" />
            </div>
            <canvas ref={canvasRef} className="w-full h-[400px]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
