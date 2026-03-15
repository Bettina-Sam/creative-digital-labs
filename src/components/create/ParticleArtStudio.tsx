import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Play, Pause, Download, RefreshCw, Sliders } from 'lucide-react';

interface ParticleArtStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ArtParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const presets = [
  { name: 'Galaxy', gravity: 0, curl: 0.8, colorMode: 'rainbow' },
  { name: 'Waterfall', gravity: 0.1, curl: 0, colorMode: 'blue' },
  { name: 'Fire', gravity: -0.05, curl: 0.2, colorMode: 'warm' },
  { name: 'Snow', gravity: 0.02, curl: 0.1, colorMode: 'white' },
];

export const ParticleArtStudio = ({ isOpen, onClose }: ParticleArtStudioProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ArtParticle[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gravity, setGravity] = useState(0);
  const [curl, setCurl] = useState(0.3);
  const [colorMode, setColorMode] = useState<'rainbow' | 'blue' | 'warm' | 'white'>('rainbow');
  const [spawnRate, setSpawnRate] = useState(5);
  const animationRef = useRef<number>();

  const getColor = useCallback((t: number) => {
    switch (colorMode) {
      case 'rainbow':
        return `hsl(${(t * 360) % 360}, 80%, 60%)`;
      case 'blue':
        return `hsl(${200 + Math.random() * 40}, 80%, ${50 + Math.random() * 30}%)`;
      case 'warm':
        return `hsl(${Math.random() * 60}, 90%, ${50 + Math.random() * 30}%)`;
      case 'white':
        return `hsl(200, 20%, ${80 + Math.random() * 20}%)`;
    }
  }, [colorMode]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        time += 0.01;

        // Spawn new particles
        for (let i = 0; i < spawnRate; i++) {
          const angle = time * 2 + Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          particlesRef.current.push({
            x: centerX + Math.cos(angle) * 50,
            y: centerY + Math.sin(angle) * 50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: getColor(time),
            size: 2 + Math.random() * 4,
          });
        }

        // Update particles
        particlesRef.current = particlesRef.current.filter(p => {
          p.life -= 0.005;
          if (p.life <= 0) return false;

          // Apply curl noise
          const curlAngle = Math.sin(p.x * 0.01) * Math.cos(p.y * 0.01) * curl * 0.5;
          p.vx += Math.cos(curlAngle) * curl * 0.1;
          p.vy += Math.sin(curlAngle) * curl * 0.1;

          // Apply gravity
          p.vy += gravity;

          // Damping
          p.vx *= 0.99;
          p.vy *= 0.99;

          p.x += p.vx;
          p.y += p.vy;

          return true;
        });

        // Draw particles
        particlesRef.current.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('hsl', 'hsla');
          ctx.fill();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, isPlaying, gravity, curl, colorMode, spawnRate, getColor]);

  const clearCanvas = () => {
    particlesRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `particle-art-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setGravity(preset.gravity);
    setCurl(preset.curl);
    setColorMode(preset.colorMode as typeof colorMode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-neon-magenta" />
                <h2 className="text-xl font-bold">Particle Art Studio</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Canvas */}
              <div className="flex-1 relative bg-background">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Controls */}
              <div className="w-72 border-l border-border p-4 overflow-y-auto">
                {/* Presets */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Presets
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map(preset => (
                      <motion.button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2 rounded-lg bg-background/50 text-sm hover:bg-background/80 border border-border"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {preset.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Gravity */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground flex justify-between mb-1">
                    <span>Gravity</span>
                    <span className="font-mono">{gravity.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="-0.2"
                    max="0.2"
                    step="0.01"
                    value={gravity}
                    onChange={e => setGravity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Curl */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground flex justify-between mb-1">
                    <span>Curl/Swirl</span>
                    <span className="font-mono">{curl.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={curl}
                    onChange={e => setCurl(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Spawn Rate */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground flex justify-between mb-1">
                    <span>Spawn Rate</span>
                    <span className="font-mono">{spawnRate}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={spawnRate}
                    onChange={e => setSpawnRate(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Color Mode */}
                <div className="mb-6">
                  <label className="text-xs text-muted-foreground mb-2 block">Color Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['rainbow', 'blue', 'warm', 'white'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setColorMode(mode)}
                        className={`px-3 py-2 rounded-lg text-xs capitalize ${
                          colorMode === mode
                            ? 'bg-primary/20 text-primary border border-primary/50'
                            : 'bg-background/50 border border-border'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </motion.button>
                  
                  <div className="flex gap-2">
                    <motion.button
                      onClick={clearCanvas}
                      className="flex-1 py-2 rounded-lg glass-panel flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                    >
                      <RefreshCw className="w-4 h-4" /> Clear
                    </motion.button>
                    <motion.button
                      onClick={downloadArt}
                      className="flex-1 py-2 rounded-lg glass-panel flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Download className="w-4 h-4" /> Save
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
