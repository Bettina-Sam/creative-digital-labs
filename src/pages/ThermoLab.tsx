import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

interface Particle {
  x: number; y: number; vx: number; vy: number; r: number;
}

const ThermoLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState(300);
  const [showInfo, setShowInfo] = useState(true);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.thermoLabWelcome'));
  }, [isEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width * 0.6 + canvas.width * 0.2,
        y: Math.random() * canvas.height * 0.6 + canvas.height * 0.2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 4 + Math.random() * 4,
      }));
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const speed = temperature / 150;

    ctx.fillStyle = 'rgba(10,10,15,0.3)';
    ctx.fillRect(0, 0, W, H);

    // Container
    const cx = W * 0.2, cy = H * 0.15, cw = W * 0.6, ch = H * 0.7;
    ctx.strokeStyle = 'rgba(100,150,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    const particles = particlesRef.current;
    particles.forEach(p => {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x - p.r < cx) { p.x = cx + p.r; p.vx *= -1; }
      if (p.x + p.r > cx + cw) { p.x = cx + cw - p.r; p.vx *= -1; }
      if (p.y - p.r < cy) { p.y = cy + p.r; p.vy *= -1; }
      if (p.y + p.r > cy + ch) { p.y = cy + ch - p.r; p.vy *= -1; }

      const hue = Math.min(60, temperature / 10);
      const lightness = 40 + (temperature / 20);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      ctx.fill();
    });

    // Pressure & KE info
    const avgKE = 0.5 * speed * speed;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px monospace';
    ctx.fillText(`PV = nRT | T = ${temperature}K | KE ∝ T`, 20, H - 20);

    animRef.current = requestAnimationFrame(draw);
  }, [temperature]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-6 left-6 z-20">
        <Link to="/experiments"><motion.button className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.05 }}><ArrowLeft className="w-5 h-5" /></motion.button></Link>
      </div>
      <div className="absolute top-6 right-6 z-20">
        <motion.button onClick={() => setShowInfo(!showInfo)} className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.05 }}><Info className="w-5 h-5" /></motion.button>
      </div>

      {showInfo && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-20 right-6 z-20 glass-panel p-4 rounded-xl max-w-xs">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Thermometer className="w-4 h-4 text-neon-orange" />{t('thermo.title')}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t('thermo.info')}</p>
          <label className="text-xs text-muted-foreground">{t('thermo.temperature')}: {temperature}K</label>
          <input type="range" min={50} max={1000} value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full" />
          <div className="mt-2 p-2 rounded bg-background/50 text-xs font-mono text-primary">PV = nRT</div>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="w-full h-screen touch-none" />
    </div>
  );
};

export default ThermoLab;
