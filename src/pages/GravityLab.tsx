import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, BookOpen, Trash2, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';

interface GravityObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  trail: { x: number; y: number }[];
}

const G = 0.5; // Gravitational constant (scaled for simulation)

const massPresets = [
  { label: 'Small', mass: 50, radius: 8, color: 'hsl(185, 100%, 60%)' },
  { label: 'Medium', mass: 200, radius: 14, color: 'hsl(85, 100%, 55%)' },
  { label: 'Large', mass: 800, radius: 22, color: 'hsl(320, 100%, 60%)' },
  { label: 'Star', mass: 5000, radius: 30, color: 'hsl(25, 100%, 55%)' },
];

const lessons = [
  {
    title: "Newton's Law of Gravitation",
    formula: 'F = G × m₁ × m₂ / r²',
    description: 'Every object attracts every other object with a force proportional to their masses and inversely proportional to the square of the distance between them.',
  },
  {
    title: 'Orbital Mechanics',
    formula: 'v = √(GM/r)',
    description: 'For a stable circular orbit, the orbital velocity must balance gravitational pull. Too fast = escape, too slow = collision.',
  },
  {
    title: 'Conservation of Energy',
    formula: 'E = ½mv² - GMm/r',
    description: 'Total energy (kinetic + potential) is conserved. Objects speed up as they fall closer and slow down as they move away.',
  },
];

const GravityLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectsRef = useRef<GravityObject[]>([]);
  const animationRef = useRef<number>();
  const nextIdRef = useRef(1);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [showLesson, setShowLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [placingMode, setPlacingMode] = useState(false);
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const clearAll = useCallback(() => {
    objectsRef.current = [];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;
      const dx = e.clientX - mouseDownRef.current.x;
      const dy = e.clientY - mouseDownRef.current.y;
      const preset = massPresets[selectedPreset];

      objectsRef.current.push({
        id: nextIdRef.current++,
        x: mouseDownRef.current.x,
        y: mouseDownRef.current.y,
        vx: dx * 0.05,
        vy: dy * 0.05,
        mass: preset.mass,
        radius: preset.radius,
        color: preset.color,
        trail: [],
      });
      mouseDownRef.current = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseDownRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!mouseDownRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - mouseDownRef.current.x;
      const dy = touch.clientY - mouseDownRef.current.y;
      const preset = massPresets[selectedPreset];
      objectsRef.current.push({
        id: nextIdRef.current++,
        x: mouseDownRef.current.x,
        y: mouseDownRef.current.y,
        vx: dx * 0.05,
        vy: dy * 0.05,
        mass: preset.mass,
        radius: preset.radius,
        color: preset.color,
        trail: [],
      });
      mouseDownRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const objects = objectsRef.current;

      // Gravity simulation
      for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
          const dx = objects[j].x - objects[i].x;
          const dy = objects[j].y - objects[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 5) continue;

          const force = (G * objects[i].mass * objects[j].mass) / (dist * dist);
          const fx = (force * dx) / dist;
          const fy = (force * dy) / dist;

          objects[i].vx += fx / objects[i].mass;
          objects[i].vy += fy / objects[i].mass;
          objects[j].vx -= fx / objects[j].mass;
          objects[j].vy -= fy / objects[j].mass;
        }
      }

      // Update positions and draw
      for (const obj of objects) {
        obj.x += obj.vx;
        obj.y += obj.vy;

        // Store trail
        obj.trail.push({ x: obj.x, y: obj.y });
        if (obj.trail.length > 80) obj.trail.shift();

        // Draw trail
        if (obj.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(obj.trail[0].x, obj.trail[0].y);
          for (let i = 1; i < obj.trail.length; i++) {
            ctx.lineTo(obj.trail[i].x, obj.trail[i].y);
          }
          ctx.strokeStyle = obj.color.replace(')', ', 0.3)').replace('hsl(', 'hsla(');
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw object
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glow ring
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = obj.color.replace(')', ', 0.3)').replace('hsl(', 'hsla(');
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw drag line
      if (mouseDownRef.current) {
        // We can't access current mouse pos here easily, so skip drag preview
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [selectedPreset]);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0" style={{ touchAction: 'none' }} />

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
            <Globe className="w-5 h-5 text-neon-orange" />
            <span className="font-bold neon-text-cyan">Gravity Simulator</span>
          </div>
        </motion.div>

        {/* Mass Selector */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="fixed top-32 left-4 z-50">
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <label className="text-xs text-muted-foreground">Select Mass</label>
            <div className="space-y-2">
              {massPresets.map((preset, i) => (
                <motion.button
                  key={preset.label}
                  onClick={() => setSelectedPreset(i)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3 transition-all ${
                    selectedPreset === i ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-background/50 hover:bg-background/80'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.color }} />
                  <span>{preset.label}</span>
                  <span className="text-muted-foreground ml-auto">m={preset.mass}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="fixed top-4 right-4 z-50 flex gap-2">
          <motion.button onClick={() => setShowLesson(!showLesson)} className={`glass-panel p-3 rounded-xl ${showLesson ? 'bg-neon-lime/20' : ''}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <BookOpen className="w-5 h-5 text-neon-lime" />
          </motion.button>
          <motion.button onClick={clearAll} className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Trash2 className="w-5 h-5 text-destructive" />
          </motion.button>
        </motion.div>

        {/* Lesson Panel */}
        <AnimatePresence>
          {showLesson && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="fixed top-20 right-4 z-50 w-80">
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-neon-lime">🎓 Gravity Physics</h3>
                  <button onClick={() => setShowLesson(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <motion.div key={currentLesson} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <h4 className="font-bold text-sm">{lessons[currentLesson].title}</h4>
                  <div className="text-center font-mono text-lg text-neon-cyan">{lessons[currentLesson].formula}</div>
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
              Click & drag to launch objects • Drag direction = initial velocity • Click 📚 for physics lessons
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default GravityLab;
