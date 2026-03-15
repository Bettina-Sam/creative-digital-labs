import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Waves, RefreshCw, Play, Pause, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';

type WaveMode = 'sine' | 'cosine' | 'combined' | 'interference';

const waveModes: { id: WaveMode; label: string; description: string }[] = [
  { id: 'sine', label: 'Sine Wave', description: 'y = A × sin(ωt + φ)' },
  { id: 'cosine', label: 'Cosine Wave', description: 'y = A × cos(ωt + φ)' },
  { id: 'combined', label: 'Combined', description: 'Sine + Cosine overlay' },
  { id: 'interference', label: 'Interference', description: 'Two waves interacting' },
];

const GenerativeLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<WaveMode>('sine');
  const [amplitude, setAmplitude] = useState(100);
  const [frequency, setFrequency] = useState(0.02);
  const [speed, setSpeed] = useState(0.03);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLesson, setShowLesson] = useState(false);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = {
      sine: 'hsl(185, 100%, 50%)',
      cosine: 'hsl(320, 100%, 60%)',
      combined: 'hsl(85, 100%, 55%)',
      interference: 'hsl(270, 100%, 60%)',
    };

    const animate = () => {
      // Calm dark background with subtle fade
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // Draw wave(s)
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      if (mode === 'sine' || mode === 'combined') {
        ctx.strokeStyle = colors.sine;
        ctx.shadowColor = colors.sine;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + Math.sin((x * frequency) + timeRef.current) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      if (mode === 'cosine' || mode === 'combined') {
        ctx.strokeStyle = colors.cosine;
        ctx.shadowColor = colors.cosine;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + Math.cos((x * frequency) + timeRef.current) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      if (mode === 'interference') {
        // First wave
        ctx.strokeStyle = colors.sine;
        ctx.shadowColor = colors.sine;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + Math.sin((x * frequency) + timeRef.current) * amplitude * 0.6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second wave (different frequency)
        ctx.strokeStyle = colors.cosine;
        ctx.shadowColor = colors.cosine;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + Math.sin((x * frequency * 1.5) + timeRef.current * 0.7) * amplitude * 0.6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Combined interference pattern
        ctx.strokeStyle = colors.interference;
        ctx.shadowColor = colors.interference;
        ctx.shadowBlur = 25;
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const wave1 = Math.sin((x * frequency) + timeRef.current) * amplitude * 0.5;
          const wave2 = Math.sin((x * frequency * 1.5) + timeRef.current * 0.7) * amplitude * 0.5;
          const y = centerY + wave1 + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      if (isPlaying) {
        timeRef.current += speed;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, amplitude, frequency, speed, isPlaying]);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 z-50"
        >
          <Link to="/" data-cursor-hover>
            <motion.div
              className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-3">
            <Waves className="w-5 h-5 text-neon-cyan" />
            <span className="font-bold neon-text-cyan">Wave Dynamics</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed top-32 left-4 z-50"
        >
          <div className="glass-panel p-4 rounded-xl w-64 space-y-4">
            {/* Wave Mode */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Wave Pattern</label>
              <div className="grid grid-cols-2 gap-2">
                {waveModes.map(m => (
                  <motion.button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      mode === m.id
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                        : 'bg-background/50 hover:bg-background/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {m.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Amplitude */}
            <div>
              <label className="text-xs text-muted-foreground flex justify-between">
                <span>Amplitude</span>
                <span className="font-mono">{amplitude}px</span>
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="text-xs text-muted-foreground flex justify-between">
                <span>Frequency</span>
                <span className="font-mono">{(frequency * 100).toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={frequency * 100}
                onChange={(e) => setFrequency(Number(e.target.value) / 100)}
                className="w-full mt-1"
              />
            </div>

            {/* Speed */}
            <div>
              <label className="text-xs text-muted-foreground flex justify-between">
                <span>Speed</span>
                <span className="font-mono">{(speed * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={speed * 100}
                onChange={(e) => setSpeed(Number(e.target.value) / 100)}
                className="w-full mt-1"
              />
            </div>

            {/* Play/Pause */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 glass-panel py-2 rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
              </motion.button>
              <motion.button
                onClick={() => { timeRef.current = 0; }}
                className="glass-panel px-3 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Educational Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed top-32 right-4 z-50"
        >
          <motion.button
            onClick={() => setShowLesson(!showLesson)}
            className="glass-panel p-3 rounded-xl mb-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="w-5 h-5 text-neon-lime" />
          </motion.button>

          {showLesson && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-4 rounded-xl w-72"
            >
              <h3 className="font-bold text-neon-lime mb-3">🎓 Wave Physics</h3>
              
              <div className="space-y-3 text-sm">
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="font-mono text-xs text-neon-cyan mb-1">
                    {waveModes.find(m => m.id === mode)?.description}
                  </p>
                </div>

                <div className="space-y-2 text-muted-foreground">
                  <p><span className="text-neon-cyan">Amplitude (A):</span> The height of the wave - how "tall" it is.</p>
                  <p><span className="text-neon-magenta">Frequency (ω):</span> How many waves fit in a space.</p>
                  <p><span className="text-neon-lime">Phase (φ):</span> Where the wave starts in its cycle.</p>
                </div>

                {mode === 'interference' && (
                  <div className="bg-neon-orange/10 border border-neon-orange/30 rounded-lg p-3">
                    <p className="text-xs">
                      <span className="font-bold text-neon-orange">Interference:</span> When two waves meet, 
                      they combine. Peaks meeting peaks = bigger wave. Peaks meeting troughs = cancellation!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-4 left-4 z-50"
        >
          <div className="glass-panel px-4 py-3 rounded-xl">
            <p className="text-sm text-muted-foreground font-mono-lab">
              Adjust controls to explore wave properties • A calming way to learn trigonometry
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default GenerativeLab;
