import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sun, BookOpen, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';

interface LightSource {
  id: number;
  x: number;
  y: number;
  color: [number, number, number]; // RGB
  intensity: number;
  label: string;
}

const defaultLights: LightSource[] = [
  { id: 1, x: 300, y: 250, color: [255, 0, 0], intensity: 1, label: 'Red' },
  { id: 2, x: 500, y: 250, color: [0, 255, 0], intensity: 1, label: 'Green' },
  { id: 3, x: 400, y: 400, color: [0, 0, 255], intensity: 1, label: 'Blue' },
];

const lessons = [
  {
    title: 'Additive Color Mixing',
    description: 'When light beams overlap, their colors ADD together. Red + Green = Yellow, Red + Blue = Magenta, Green + Blue = Cyan, All three = White!',
  },
  {
    title: 'RGB Color Model',
    description: 'Screens use Red, Green, and Blue light to create all visible colors. Each channel ranges from 0-255, giving 16.7 million possible colors.',
  },
  {
    title: 'Light Intensity',
    description: 'Brightness follows the inverse square law: doubling distance quarters the intensity. Closer lights appear much brighter.',
  },
];

const LightLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lights, setLights] = useState<LightSource[]>(defaultLights);
  const [dragging, setDragging] = useState<number | null>(null);
  const [showLesson, setShowLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);

  const resetLights = () => setLights(defaultLights);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create image data for pixel-level light mixing
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        let r = 0, g = 0, b = 0;

        for (const light of lights) {
          const dx = x - light.x;
          const dy = y - light.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const falloff = Math.max(0, 1 - dist / 300) * light.intensity;
          const smoothFalloff = falloff * falloff;

          r += light.color[0] * smoothFalloff;
          g += light.color[1] * smoothFalloff;
          b += light.color[2] * smoothFalloff;
        }

        const idx = (y * canvas.width + x) * 4;
        data[idx] = Math.min(255, r);
        data[idx + 1] = Math.min(255, g);
        data[idx + 2] = Math.min(255, b);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw light source indicators
    for (const light of lights) {
      ctx.beginPath();
      ctx.arc(light.x, light.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${light.color[0]}, ${light.color[1]}, ${light.color[2]}, 0.9)`;
      ctx.shadowColor = `rgb(${light.color[0]}, ${light.color[1]}, ${light.color[2]})`;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = 'white';
      ctx.font = '12px "Space Grotesk"';
      ctx.textAlign = 'center';
      ctx.fillText(light.label, light.x, light.y - 20);
    }
  }, [lights]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const light of lights) {
      const dx = x - light.x;
      const dy = y - light.y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        setDragging(light.id);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    setLights(prev =>
      prev.map(l =>
        l.id === dragging
          ? { ...l, x: e.clientX - rect.left, y: e.clientY - rect.top }
          : l
      )
    );
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 left-4 z-50">
          <Link to="/experiments">
            <motion.div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-3">
            <Sun className="w-5 h-5 text-neon-orange" />
            <span className="font-bold neon-text-cyan">Light & Color Lab</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="fixed top-32 left-4 z-50">
          <div className="glass-panel p-4 rounded-xl w-56 space-y-3">
            <label className="text-xs text-muted-foreground">Light Intensity</label>
            {lights.map(light => (
              <div key={light.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `rgb(${light.color.join(',')})` }} />
                <span className="text-xs w-12">{light.label}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={light.intensity}
                  onChange={e => setLights(prev => prev.map(l => l.id === light.id ? { ...l, intensity: Number(e.target.value) } : l))}
                  className="flex-1"
                />
              </div>
            ))}
            <motion.button onClick={resetLights} className="w-full glass-panel py-2 rounded-lg flex items-center justify-center gap-2 text-xs" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <RotateCcw className="w-3 h-3" />
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Lesson */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="fixed top-4 right-4 z-50 flex gap-2">
          <motion.button onClick={() => setShowLesson(!showLesson)} className={`glass-panel p-3 rounded-xl ${showLesson ? 'bg-neon-lime/20' : ''}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <BookOpen className="w-5 h-5 text-neon-lime" />
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showLesson && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="fixed top-20 right-4 z-50 w-80">
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-neon-lime">🎓 Light Physics</h3>
                  <button onClick={() => setShowLesson(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <motion.div key={currentLesson} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <h4 className="font-bold text-sm">{lessons[currentLesson].title}</h4>
                  <p className="text-sm text-muted-foreground">{lessons[currentLesson].description}</p>
                </motion.div>
                <div className="flex justify-between mt-4 pt-4 border-t border-border">
                  <button onClick={() => setCurrentLesson(prev => Math.max(0, prev - 1))} disabled={currentLesson === 0} className="text-xs text-muted-foreground disabled:opacity-30">← Previous</button>
                  <span className="text-xs text-muted-foreground">{currentLesson + 1} / {lessons.length}</span>
                  <button onClick={() => setCurrentLesson(prev => Math.min(lessons.length - 1, prev + 1))} disabled={currentLesson === lessons.length - 1} className="text-xs text-muted-foreground disabled:opacity-30">Next →</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="fixed bottom-6 left-4 z-50">
          <div className="glass-panel px-4 py-3 rounded-xl">
            <p className="text-sm text-muted-foreground font-mono-lab">
              Drag colored lights to mix them • Watch additive color mixing in action • Red + Green = Yellow!
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LightLab;
