import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

interface Pendulum {
  angle: number; angVel: number; length: number; mass: number; color: string; trail: { x: number; y: number }[];
}

const PendulumLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [gravity, setGravity] = useState(9.81);
  const [damping, setDamping] = useState(0.999);
  const [pendulumCount, setPendulumCount] = useState(3);
  const [showTrails, setShowTrails] = useState(true);
  const pendRef = useRef<Pendulum[]>([]);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.pendulumLabWelcome'));
  }, [isEnabled]);

  useEffect(() => {
    const colors = ['#00f0ff', '#ff00ff', '#a0ff00', '#ff6600', '#aa44ff'];
    pendRef.current = Array.from({ length: pendulumCount }, (_, i) => ({
      angle: Math.PI / 4 + i * 0.15,
      angVel: 0,
      length: 120 + i * 30,
      mass: 10 + i * 5,
      color: colors[i % colors.length],
      trail: [],
    }));
  }, [pendulumCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = showTrails ? 'rgba(10,10,20,0.05)' : 'rgba(10,10,20,1)';
      ctx.fillRect(0, 0, width, height);

      const pivotX = width / 2, pivotY = height * 0.2;

      // Draw pivot
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#666';
      ctx.fill();

      for (const p of pendRef.current) {
        // Physics
        const angAcc = (-gravity / p.length) * Math.sin(p.angle);
        p.angVel += angAcc * 0.16;
        p.angVel *= damping;
        p.angle += p.angVel * 0.16;

        const bobX = pivotX + Math.sin(p.angle) * p.length * 1.5;
        const bobY = pivotY + Math.cos(p.angle) * p.length * 1.5;

        // Trail
        if (showTrails) {
          p.trail.push({ x: bobX, y: bobY });
          if (p.trail.length > 200) p.trail.shift();
          if (p.trail.length > 2) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (const pt of p.trail) ctx.lineTo(pt.x, pt.y);
            ctx.strokeStyle = p.color + '40';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Rod
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = p.color + '80';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bob
        const grad = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, p.mass);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, p.color + '00');
        ctx.beginPath();
        ctx.arc(bobX, bobY, p.mass, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [gravity, damping, showTrails]);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-20">
        <Link to="/experiments" className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="glass-panel p-4 rounded-2xl max-w-2xl mx-auto space-y-3">
          <h2 className="text-lg font-bold gradient-text">Pendulum Lab</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Gravity: {gravity.toFixed(1)}</label>
              <input type="range" min="1" max="30" step="0.1" value={gravity} onChange={e => setGravity(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Damping: {damping.toFixed(3)}</label>
              <input type="range" min="0.98" max="1" step="0.001" value={damping} onChange={e => setDamping(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Pendulums: {pendulumCount}</label>
              <input type="range" min="1" max="5" value={pendulumCount} onChange={e => setPendulumCount(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="flex items-end">
              <button onClick={() => setShowTrails(!showTrails)} className={`text-xs px-3 py-1.5 rounded-lg ${showTrails ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                Trails {showTrails ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">🔄 Period T = 2π√(L/g). Longer pendulums swing slower. With similar lengths, pendulums gradually go in and out of phase — creating mesmerizing patterns!</p>
        </div>
      </div>
    </div>
  );
};

export default PendulumLab;
