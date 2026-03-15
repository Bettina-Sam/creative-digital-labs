import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingObj { x: number; y: number; vy: number; density: number; size: number; color: string; label: string }

export const BuoyancyEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fluidDensity, setFluidDensity] = useState(1.0);
  const objects = useRef<FloatingObj[]>([]);

  const addObject = (density: number, label: string, color: string) => {
    objects.current.push({
      x: 80 + Math.random() * 300, y: 40, vy: 0,
      density, size: 30, color, label,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(10,10,30,0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const waterTop = canvas.height * 0.35;
      // Water
      ctx.fillStyle = 'hsla(200, 80%, 40%, 0.4)';
      ctx.fillRect(0, waterTop, canvas.width, canvas.height - waterTop);

      // Waves
      ctx.beginPath();
      ctx.moveTo(0, waterTop);
      for (let x = 0; x < canvas.width; x += 5) {
        ctx.lineTo(x, waterTop + Math.sin(x * 0.02 + Date.now() * 0.002) * 4);
      }
      ctx.lineTo(canvas.width, waterTop + 20);
      ctx.lineTo(0, waterTop + 20);
      ctx.fillStyle = 'hsla(200, 80%, 50%, 0.3)';
      ctx.fill();

      objects.current.forEach(obj => {
        const submergedRatio = Math.max(0, Math.min(1, (obj.y + obj.size - waterTop) / (obj.size * 2)));
        const buoyancyForce = submergedRatio * fluidDensity * 0.3;
        const gravityForce = obj.density * 0.15;

        if (obj.y + obj.size > waterTop) {
          obj.vy += gravityForce - buoyancyForce;
          obj.vy *= 0.97; // water drag
        } else {
          obj.vy += gravityForce;
        }

        obj.y += obj.vy;
        if (obj.y > canvas.height - obj.size) { obj.y = canvas.height - obj.size; obj.vy = 0; }

        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.label, obj.x, obj.y + 3);
        ctx.fillText(`ρ=${obj.density}`, obj.x, obj.y + 15);
      });

      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Fluid density: ${fluidDensity.toFixed(1)} g/cm³`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [fluidDensity]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-4 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Fluid density: {fluidDensity.toFixed(1)}</span>
          <input type="range" min="0.3" max="3" step="0.1" value={fluidDensity} onChange={e => setFluidDensity(+e.target.value)} className="w-24" />
        </label>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => addObject(0.5, 'Wood', 'hsl(35,60%,45%)')} className="px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold">+ Wood (0.5)</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => addObject(1.0, 'Rubber', 'hsl(0,60%,50%)')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">+ Rubber (1.0)</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => addObject(2.7, 'Aluminium', 'hsl(200,10%,60%)')} className="px-3 py-1.5 rounded-lg bg-gray-500 text-white text-xs font-bold">+ Aluminium (2.7)</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => addObject(7.8, 'Iron', 'hsl(0,0%,35%)')} className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-bold">+ Iron (7.8)</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { objects.current = []; }} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold">Clear</motion.button>
      </div>
    </div>
  );
};
