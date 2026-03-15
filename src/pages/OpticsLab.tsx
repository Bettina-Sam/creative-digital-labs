import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

const OpticsLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prismAngle, setPrismAngle] = useState(60);
  const [beamY, setBeamY] = useState(200);
  const [showInfo, setShowInfo] = useState(true);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (isEnabled) speak(t('voice.opticsLabWelcome'));
  }, [isEnabled]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    // Prism
    const cx = W / 2, cy = H / 2;
    const size = Math.min(W, H) * 0.2;
    const angle = (prismAngle * Math.PI) / 180;
    const p1 = { x: cx, y: cy - size };
    const p2 = { x: cx - size * Math.cos(angle / 2), y: cy + size * Math.sin(angle / 2) };
    const p3 = { x: cx + size * Math.cos(angle / 2), y: cy + size * Math.sin(angle / 2) };

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(150,200,255,0.6)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(150,200,255,0.08)';
    ctx.fill();
    ctx.stroke();

    // Incoming white beam
    const entryX = p2.x + (p1.x - p2.x) * 0.4;
    const entryY = p2.y + (p1.y - p2.y) * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, beamY);
    ctx.lineTo(entryX, entryY);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rainbow dispersion
    const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0088ff', '#4400ff', '#8b00ff'];
    const exitX = p3.x + (p1.x - p3.x) * 0.4;
    const exitY = p3.y + (p1.y - p3.y) * 0.4;

    colors.forEach((color, i) => {
      const spread = (i - 3) * 0.08;
      const endX = W;
      const endY = exitY + (i - 3) * (H * 0.06);
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Snell's law label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px monospace';
    ctx.fillText('n₁ sin θ₁ = n₂ sin θ₂', 20, H - 20);

    animRef.current = requestAnimationFrame(draw);
  }, [prismAngle, beamY]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleCanvasInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setBeamY(clientY - rect.top);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-6 left-6 z-20">
        <Link to="/experiments">
          <motion.button className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.05 }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <motion.button onClick={() => setShowInfo(!showInfo)} className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.05 }}>
          <Info className="w-5 h-5" />
        </motion.button>
      </div>

      {showInfo && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-20 right-6 z-20 glass-panel p-4 rounded-xl max-w-xs">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Eye className="w-4 h-4 text-primary" />{t('optics.title')}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t('optics.info')}</p>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t('optics.prismAngle')}: {prismAngle}°</label>
            <input type="range" min={30} max={90} value={prismAngle} onChange={e => setPrismAngle(+e.target.value)} className="w-full" />
          </div>
          <div className="mt-3 p-2 rounded bg-background/50 text-xs font-mono text-primary">
            n₁ sin(θ₁) = n₂ sin(θ₂)
          </div>
        </motion.div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-screen cursor-crosshair touch-none"
        onMouseMove={handleCanvasInteraction}
        onTouchMove={handleCanvasInteraction}
      />
    </div>
  );
};

export default OpticsLab;
