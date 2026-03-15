import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Waves, Trash2, BookOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { ControlPanel } from '@/components/ControlPanel';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

const physicsLessons = [
  {
    title: 'Velocity',
    formula: 'v = Δx / Δt',
    description: 'Each particle moves by adding its velocity (vx, vy) to its position each frame.',
    code: 'particle.x += particle.vx * speed;',
  },
  {
    title: 'Gravity',
    formula: 'a = g (9.8 m/s²)',
    description: 'Gravity constantly adds downward velocity, simulating falling objects.',
    code: 'particle.vy += 0.02;',
  },
  {
    title: 'Friction/Decay',
    formula: 'v\' = v × damping',
    description: 'Velocity is multiplied by a value less than 1 each frame, simulating friction.',
    code: 'particle.vx *= 0.99;',
  },
  {
    title: 'Momentum',
    formula: 'p = m × v',
    description: 'Particles inherit velocity from your mouse movement when created.',
    code: 'vx: mouseVx * 0.5',
  },
];

const FluidLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isDown: false });
  const animationRef = useRef<number>();
  const [speed, setSpeed] = useState(1);
  const [showEffects, setShowEffects] = useState(true);
  const [showLesson, setShowLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);

  const colors = [
    'hsla(185, 100%, 60%, 0.8)',
    'hsla(320, 100%, 70%, 0.8)',
    'hsla(85, 100%, 65%, 0.8)',
    'hsla(270, 100%, 70%, 0.8)',
    'hsla(25, 100%, 65%, 0.8)',
  ];

  const createParticle = useCallback((x: number, y: number, vx: number, vy: number) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x,
      y,
      vx: vx * 0.5 + (Math.random() - 0.5) * 2,
      vy: vy * 0.5 + (Math.random() - 0.5) * 2,
      color,
      life: 1,
      size: Math.random() * 20 + 10,
    };
  }, []);

  const clearCanvas = useCallback(() => {
    particlesRef.current = [];
  }, []);

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (mouseRef.current.isDown) {
        const vx = mouseRef.current.x - mouseRef.current.prevX;
        const vy = mouseRef.current.y - mouseRef.current.prevY;
        
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(
            createParticle(mouseRef.current.x, mouseRef.current.y, vx, vy)
          );
        }
      }
    };

    const handleMouseDown = () => {
      mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = touch.clientX;
      mouseRef.current.y = touch.clientY;

      const vx = mouseRef.current.x - mouseRef.current.prevX;
      const vy = mouseRef.current.y - mouseRef.current.prevY;
      
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push(
          createParticle(mouseRef.current.x, mouseRef.current.y, vx, vy)
        );
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    const animate = () => {
      ctx.fillStyle = showEffects ? 'rgba(10, 10, 15, 0.05)' : 'rgba(10, 10, 15, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      for (const particle of particlesRef.current) {
        // Physics simulation
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        particle.vx *= 0.99; // Friction
        particle.vy *= 0.99;
        particle.vy += 0.02; // Gravity
        particle.life -= 0.003;
        particle.size *= 0.998;

        // Draw
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace('0.8', String(particle.life * 0.8));
        ctx.fill();

        if (showEffects) {
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 20;
        }
      }

      if (showEffects) {
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createParticle, speed, showEffects]);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

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
            <Waves className="w-5 h-5 text-neon-magenta" />
            <span className="font-bold neon-text-magenta">Fluid Dynamics</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed top-4 right-4 z-50 flex gap-2"
        >
          <motion.button
            onClick={() => setShowLesson(!showLesson)}
            className={`glass-panel p-3 rounded-xl ${showLesson ? 'bg-neon-lime/20' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            data-cursor-hover
          >
            <BookOpen className="w-5 h-5 text-neon-lime" />
          </motion.button>
          <motion.button
            onClick={clearCanvas}
            className="glass-panel p-3 rounded-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            data-cursor-hover
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </motion.button>
        </motion.div>

        {/* Physics Lesson Panel */}
        <AnimatePresence>
          {showLesson && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed top-20 right-4 z-50 w-80"
            >
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-neon-lime">🎓 Physics Lessons</h3>
                  <button onClick={() => setShowLesson(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Lesson tabs */}
                <div className="flex gap-1 mb-4 overflow-x-auto">
                  {physicsLessons.map((lesson, i) => (
                    <button
                      key={lesson.title}
                      onClick={() => setCurrentLesson(i)}
                      className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                        currentLesson === i
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'bg-background/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lesson.title}
                    </button>
                  ))}
                </div>

                {/* Current lesson */}
                <motion.div
                  key={currentLesson}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <div className="font-mono text-lg text-neon-cyan">
                      {physicsLessons[currentLesson].formula}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {physicsLessons[currentLesson].description}
                  </p>

                  <div className="bg-background/50 rounded-lg p-3">
                    <code className="text-xs font-mono text-neon-magenta">
                      {physicsLessons[currentLesson].code}
                    </code>
                  </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex justify-between mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => setCurrentLesson(prev => Math.max(0, prev - 1))}
                    disabled={currentLesson === 0}
                    className="text-xs text-muted-foreground disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {currentLesson + 1} / {physicsLessons.length}
                  </span>
                  <button
                    onClick={() => setCurrentLesson(prev => Math.min(physicsLessons.length - 1, prev + 1))}
                    disabled={currentLesson === physicsLessons.length - 1}
                    className="text-xs text-muted-foreground disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-24 left-4 z-50"
        >
          <div className="glass-panel px-4 py-3 rounded-xl">
            <p className="text-sm text-muted-foreground font-mono-lab">
              Click and drag to paint • Touch supported • Click 📚 for physics lessons
            </p>
          </div>
        </motion.div>

        {/* Control Panel */}
        <ControlPanel
          controls={{
            speed,
            onSpeedChange: setSpeed,
            showEffects,
            onToggleEffects: setShowEffects,
          }}
        />
      </div>
    </PageTransition>
  );
};

export default FluidLab;
