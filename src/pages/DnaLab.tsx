import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Dna } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

const basePairs: Record<string, { pair: string; color: string; pairColor: string }> = {
  A: { pair: 'T', color: '#ff4444', pairColor: '#4488ff' },
  T: { pair: 'A', color: '#4488ff', pairColor: '#ff4444' },
  G: { pair: 'C', color: '#44ff44', pairColor: '#ffaa00' },
  C: { pair: 'G', color: '#ffaa00', pairColor: '#44ff44' },
};

const DnaLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sequence, setSequence] = useState('ATGCGATCGA');
  const [showInfo, setShowInfo] = useState(true);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.dnaLabWelcome'));
  }, [isEnabled]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    timeRef.current += 0.02;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const strandLen = sequence.length;
    const spacing = H / (strandLen + 2);

    for (let i = 0; i < strandLen; i++) {
      const base = sequence[i];
      const bp = basePairs[base];
      if (!bp) continue;

      const y = spacing * (i + 1);
      const twist = Math.sin(timeRef.current + i * 0.6) * (W * 0.15);

      const x1 = cx - twist;
      const x2 = cx + twist;

      // Left strand backbone
      ctx.beginPath();
      ctx.arc(x1, y, 12, 0, Math.PI * 2);
      ctx.fillStyle = bp.color;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(base, x1, y + 4);

      // Right strand backbone
      ctx.beginPath();
      ctx.arc(x2, y, 12, 0, Math.PI * 2);
      ctx.fillStyle = bp.pairColor;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(bp.pair, x2, y + 4);

      // Hydrogen bond
      ctx.beginPath();
      ctx.moveTo(x1 + 12, y);
      ctx.lineTo(x2 - 12, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Backbone connections
      if (i > 0) {
        const prevTwist = Math.sin(timeRef.current + (i - 1) * 0.6) * (W * 0.15);
        ctx.beginPath();
        ctx.moveTo(cx - prevTwist, spacing * i);
        ctx.lineTo(x1, y);
        ctx.strokeStyle = 'rgba(255,100,100,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + prevTwist, spacing * i);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(100,100,255,0.3)';
        ctx.stroke();
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('A-T: 2 hydrogen bonds | G-C: 3 hydrogen bonds', 20, H - 15);

    animRef.current = requestAnimationFrame(draw);
  }, [sequence]);

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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Dna className="w-4 h-4 text-neon-magenta" />{t('dna.title')}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t('dna.info')}</p>
          <label className="text-xs text-muted-foreground">{t('dna.sequence')}:</label>
          <input type="text" value={sequence} onChange={e => setSequence(e.target.value.toUpperCase().replace(/[^ATGC]/g, '').slice(0, 15))} className="w-full mt-1 p-2 rounded-lg bg-background/50 border border-border text-sm font-mono" placeholder="ATGCGA" />
          <div className="mt-2 flex gap-1">
            {['A', 'T', 'G', 'C'].map(b => (
              <button key={b} onClick={() => setSequence(s => (s + b).slice(0, 15))} className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: basePairs[b].color + '33', color: basePairs[b].color }}>{b}</button>
            ))}
          </div>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="w-full h-screen touch-none" />
    </div>
  );
};

export default DnaLab;
