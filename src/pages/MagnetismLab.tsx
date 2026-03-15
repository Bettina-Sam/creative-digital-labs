import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

interface Magnet {
  x: number; y: number; strength: number; polarity: 1 | -1;
}

const MagnetismLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [magnets, setMagnets] = useState<Magnet[]>([
    { x: 300, y: 300, strength: 500, polarity: 1 },
    { x: 600, y: 300, strength: 500, polarity: -1 },
  ]);
  const [fieldLines, setFieldLines] = useState(20);
  const [dragging, setDragging] = useState<number | null>(null);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.magnetismLabWelcome'));
  }, [isEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);

      // Draw field lines
      for (const mag of magnets) {
        if (mag.polarity !== 1) continue;
        for (let i = 0; i < fieldLines; i++) {
          const angle = (i / fieldLines) * Math.PI * 2;
          let px = mag.x + Math.cos(angle) * 15;
          let py = mag.y + Math.sin(angle) * 15;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.strokeStyle = `hsla(${180 + i * (360 / fieldLines)}, 80%, 60%, 0.5)`;
          ctx.lineWidth = 1;

          for (let step = 0; step < 200; step++) {
            let fx = 0, fy = 0;
            for (const m of magnets) {
              const dx = px - m.x, dy = py - m.y;
              const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 10);
              const force = m.strength * m.polarity / (dist * dist);
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
            const len = Math.sqrt(fx * fx + fy * fy) || 1;
            px += (fx / len) * 3;
            py += (fy / len) * 3;
            if (px < 0 || px > width || py < 0 || py > height) break;
            ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }

      // Draw magnets
      for (const mag of magnets) {
        const grad = ctx.createRadialGradient(mag.x, mag.y, 0, mag.x, mag.y, 25);
        if (mag.polarity === 1) {
          grad.addColorStop(0, '#ff4444');
          grad.addColorStop(1, '#ff000040');
        } else {
          grad.addColorStop(0, '#4444ff');
          grad.addColorStop(1, '#0000ff40');
        }
        ctx.beginPath();
        ctx.arc(mag.x, mag.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = mag.polarity === 1 ? '#ff6666' : '#6666ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mag.polarity === 1 ? 'N' : 'S', mag.x, mag.y);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [magnets, fieldLines]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const idx = magnets.findIndex(m => Math.hypot(m.x - mx, m.y - my) < 25);
    if (idx >= 0) setDragging(idx);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setMagnets(prev => prev.map((m, i) => i === dragging ? { ...m, x: e.clientX - rect.left, y: e.clientY - rect.top } : m));
  };

  const addMagnet = (polarity: 1 | -1) => {
    setMagnets(prev => [...prev, { x: 200 + Math.random() * 400, y: 200 + Math.random() * 200, strength: 500, polarity }]);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-20">
        <Link to="/experiments" className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} />

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="glass-panel p-4 rounded-2xl max-w-2xl mx-auto space-y-3">
          <h2 className="text-lg font-bold gradient-text">Magnetism Lab</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={() => addMagnet(1)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400">+ North Pole</button>
            <button onClick={() => addMagnet(-1)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">+ South Pole</button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Lines: {fieldLines}</span>
              <input type="range" min="8" max="40" value={fieldLines} onChange={e => setFieldLines(+e.target.value)} className="w-24 accent-primary" />
            </div>
            <button onClick={() => setMagnets(magnets.slice(0, 2))} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">Reset</button>
          </div>
          <p className="text-xs text-muted-foreground">🧲 Drag magnets to see how field lines change. Opposite poles attract, like poles repel. Field lines flow from North (red) to South (blue).</p>
        </div>
      </div>
    </div>
  );
};

export default MagnetismLab;
