import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

interface Charge {
  x: number; y: number; q: number; id: number;
}

const ElectricityLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [charges, setCharges] = useState<Charge[]>([
    { x: 350, y: 300, q: 1, id: 0 },
    { x: 550, y: 300, q: -1, id: 1 },
  ]);
  const [showField, setShowField] = useState(true);
  const [showPotential, setShowPotential] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const nextId = useRef(2);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.electricityLabWelcome'));
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

      // Electric potential heatmap
      if (showPotential) {
        const step = 8;
        for (let x = 0; x < width; x += step) {
          for (let y = 0; y < height; y += step) {
            let potential = 0;
            for (const c of charges) {
              const dist = Math.max(Math.hypot(x - c.x, y - c.y), 5);
              potential += c.q * 1000 / dist;
            }
            const norm = Math.tanh(potential / 50);
            const r = norm > 0 ? Math.floor(norm * 200) : 0;
            const b = norm < 0 ? Math.floor(-norm * 200) : 0;
            ctx.fillStyle = `rgba(${r},${Math.floor(Math.abs(norm) * 30)},${b},0.4)`;
            ctx.fillRect(x, y, step, step);
          }
        }
      }

      // Field vectors
      if (showField) {
        const step = 30;
        for (let x = step; x < width; x += step) {
          for (let y = step; y < height; y += step) {
            let fx = 0, fy = 0;
            for (const c of charges) {
              const dx = x - c.x, dy = y - c.y;
              const dist = Math.max(Math.hypot(dx, dy), 10);
              const force = c.q * 5000 / (dist * dist);
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
            const mag = Math.sqrt(fx * fx + fy * fy);
            if (mag < 0.1) continue;
            const len = Math.min(mag * 2, 12);
            const nx = fx / mag, ny = fy / mag;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + nx * len, y + ny * len);
            const hue = Math.min(mag * 20, 200);
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw charges
      for (const c of charges) {
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 20);
        if (c.q > 0) {
          grad.addColorStop(0, '#ff4444');
          grad.addColorStop(1, '#ff000020');
        } else {
          grad.addColorStop(0, '#4488ff');
          grad.addColorStop(1, '#0044ff20');
        }
        ctx.beginPath();
        ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = c.q > 0 ? '#ff6666' : '#6688ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [charges, showField, showPotential]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const idx = charges.findIndex(c => Math.hypot(c.x - mx, c.y - my) < 20);
    if (idx >= 0) setDragging(idx);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setCharges(prev => prev.map((c, i) => i === dragging ? { ...c, x: e.clientX - rect.left, y: e.clientY - rect.top } : c));
  };

  const addCharge = (q: number) => {
    setCharges(prev => [...prev, { x: 200 + Math.random() * 400, y: 200 + Math.random() * 200, q, id: nextId.current++ }]);
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
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-orange" />
            <h2 className="text-lg font-bold gradient-text">Electricity Lab</h2>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={() => addCharge(1)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400">+ Positive</button>
            <button onClick={() => addCharge(-1)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">+ Negative</button>
            <button onClick={() => setShowField(!showField)} className={`text-xs px-3 py-1.5 rounded-lg ${showField ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>Field Vectors</button>
            <button onClick={() => setShowPotential(!showPotential)} className={`text-xs px-3 py-1.5 rounded-lg ${showPotential ? 'bg-neon-magenta/20 text-neon-magenta' : 'text-muted-foreground'}`}>Potential Map</button>
            <button onClick={() => setCharges(charges.slice(0, 2))} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">Reset</button>
          </div>
          <p className="text-xs text-muted-foreground">⚡ Coulomb's Law: F = kq₁q₂/r². Opposite charges attract, like charges repel. The arrows show electric field direction and strength.</p>
        </div>
      </div>
    </div>
  );
};

export default ElectricityLab;
