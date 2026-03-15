import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

const EcosystemLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prey, setPrey] = useState(100);
  const [predators, setPredators] = useState(20);
  const [showInfo, setShowInfo] = useState(true);
  const historyRef = useRef<{ prey: number[]; pred: number[] }>({ prey: [], pred: [] });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.ecosystemLabWelcome'));
  }, [isEnabled]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#0a0f0a';
    ctx.fillRect(0, 0, W, H);

    // Lotka-Volterra step
    timeRef.current += 0.02;
    const alpha = 0.1, beta = 0.005, gamma = 0.1, delta = 0.002;
    const dPrey = (alpha * prey - beta * prey * predators) * 0.1;
    const dPred = (-gamma * predators + delta * prey * predators) * 0.1;
    const newPrey = Math.max(1, Math.min(500, prey + dPrey));
    const newPred = Math.max(1, Math.min(200, predators + dPred));

    historyRef.current.prey.push(newPrey);
    historyRef.current.pred.push(newPred);
    if (historyRef.current.prey.length > 300) {
      historyRef.current.prey.shift();
      historyRef.current.pred.shift();
    }

    // Draw population graph
    const graphY = H * 0.5, graphH = H * 0.4, graphX = 40, graphW = W - 80;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Prey line (green)
    const preyH = historyRef.current.prey;
    const predH = historyRef.current.pred;
    ctx.beginPath();
    preyH.forEach((v, i) => {
      const x = graphX + (i / 300) * graphW;
      const y = graphY + graphH - (v / 500) * graphH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Predator line (red)
    ctx.beginPath();
    predH.forEach((v, i) => {
      const x = graphX + (i / 300) * graphW;
      const y = graphY + graphH - (v / 200) * graphH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw creatures
    for (let i = 0; i < Math.min(newPrey, 80); i++) {
      const x = 50 + Math.random() * (W - 100);
      const y = 50 + Math.random() * (H * 0.4);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(x, y, 4, 4);
    }
    for (let i = 0; i < Math.min(newPred, 30); i++) {
      const x = 50 + Math.random() * (W - 100);
      const y = 50 + Math.random() * (H * 0.4);
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px monospace';
    ctx.fillText(`🟢 ${t('ecosystem.prey')}: ${Math.round(newPrey)}`, graphX, graphY - 10);
    ctx.fillStyle = '#ff4444';
    ctx.fillText(`🔴 ${t('ecosystem.predators')}: ${Math.round(newPred)}`, graphX + 200, graphY - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Lotka-Volterra: dx/dt = αx - βxy, dy/dt = δxy - γy', 20, H - 15);

    setPrey(newPrey);
    setPredators(newPred);
    animRef.current = requestAnimationFrame(draw);
  }, [prey, predators, t]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><TreePine className="w-4 h-4 text-neon-lime" />{t('ecosystem.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('ecosystem.info')}</p>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="w-full h-screen touch-none" />
    </div>
  );
};

export default EcosystemLab;
