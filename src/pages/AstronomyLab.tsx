import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

const stars = [
  { name: 'Protostar', temp: 2000, color: '#ff4400', size: 15, info: 'A collapsing cloud of gas and dust, not yet fusing hydrogen.' },
  { name: 'Main Sequence', temp: 5500, color: '#ffee00', size: 25, info: 'Stable hydrogen fusion. Our Sun is here! Lasts billions of years.' },
  { name: 'Red Giant', temp: 3500, color: '#ff3300', size: 50, info: 'Core contracts, outer layers expand. 100x the original size.' },
  { name: 'White Dwarf', temp: 15000, color: '#aaccff', size: 8, info: 'Dense remnant of a low-mass star. Earth-sized but Sun-mass.' },
  { name: 'Supernova', temp: 50000, color: '#ffffff', size: 60, info: 'Massive explosion! Creates elements heavier than iron.' },
  { name: 'Neutron Star', temp: 600000, color: '#8888ff', size: 5, info: 'Incredibly dense. A teaspoon weighs a billion tons!' },
];

const AstronomyLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedStar, setSelectedStar] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.astronomyLabWelcome'));
  }, [isEnabled]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    timeRef.current += 0.01;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    // Background stars
    for (let i = 0; i < 200; i++) {
      const x = (Math.sin(i * 1234.5) * 0.5 + 0.5) * W;
      const y = (Math.cos(i * 5678.9) * 0.5 + 0.5) * H;
      const brightness = 0.3 + 0.7 * Math.sin(timeRef.current + i);
      ctx.fillStyle = `rgba(255,255,255,${brightness * 0.5})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Main star
    const star = stars[selectedStar];
    const cx = W / 2, cy = H / 2;
    const pulse = 1 + Math.sin(timeRef.current * 2) * 0.05;
    const r = star.size * pulse * (Math.min(W, H) / 300);

    // Glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
    grad.addColorStop(0, star.color);
    grad.addColorStop(0.5, star.color + '44');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);

    // Star body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = star.color;
    ctx.fill();

    // Stage label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(star.name, cx, cy + r + 30);
    ctx.fillText(`T ≈ ${star.temp.toLocaleString()}K`, cx, cy + r + 50);
    ctx.textAlign = 'left';

    // HR diagram hint
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px monospace';
    ctx.fillText('Hertzsprung-Russell Diagram: Luminosity vs Temperature', 20, H - 15);

    animRef.current = requestAnimationFrame(draw);
  }, [selectedStar]);

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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-neon-orange" />{t('astronomy.title')}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t('astronomy.info')}</p>
          <div className="space-y-1">
            {stars.map((s, i) => (
              <button key={s.name} onClick={() => setSelectedStar(i)} className={`w-full text-left text-xs p-2 rounded-lg transition-all ${selectedStar === i ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50 text-muted-foreground'}`}>
                {s.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">{stars[selectedStar].info}</p>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="w-full h-screen touch-none" />
    </div>
  );
};

export default AstronomyLab;
