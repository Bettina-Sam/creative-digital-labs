import { useRef, useEffect, useState } from 'react';

export const QuantumEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slitWidth, setSlitWidth] = useState(20);
  const [slitSep, setSlitSep] = useState(60);
  const [showWave, setShowWave] = useState(true);
  const detections = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    detections.current = [];
    let anim: number;
    let tick = 0;

    const animate = () => {
      tick++;
      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const barrierX = canvas.width * 0.35;
      const screenX = canvas.width * 0.85;

      // Barrier
      ctx.fillStyle = 'hsl(0,0%,25%)';
      ctx.fillRect(barrierX - 3, 0, 6, cy - slitSep / 2 - slitWidth / 2);
      ctx.fillRect(barrierX - 3, cy - slitSep / 2 + slitWidth / 2, 6, slitSep - slitWidth);
      ctx.fillRect(barrierX - 3, cy + slitSep / 2 + slitWidth / 2, 6, canvas.height - cy - slitSep / 2 - slitWidth / 2);

      // Emitter
      ctx.beginPath();
      ctx.arc(40, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(185, 100%, 50%)';
      ctx.fill();

      // Incoming wave
      if (showWave) {
        for (let x = 50; x < barrierX - 5; x += 3) {
          const amp = Math.sin(x * 0.05 - tick * 0.05) * 20;
          ctx.fillStyle = `hsla(185, 100%, 60%, ${0.3 + Math.abs(amp) / 40})`;
          ctx.fillRect(x, cy + amp - 1, 2, 2);
        }
      }

      // Double slit interference pattern on screen
      if (showWave) {
        const lambda = 8;
        for (let y = 0; y < canvas.height; y += 2) {
          const d1 = Math.hypot(screenX - barrierX, y - (cy - slitSep / 2));
          const d2 = Math.hypot(screenX - barrierX, y - (cy + slitSep / 2));
          const phase = ((d1 - d2) / lambda) * Math.PI * 2;
          const intensity = Math.cos(phase / 2) ** 2;
          ctx.fillStyle = `hsla(185, 100%, 60%, ${intensity * 0.8})`;
          ctx.fillRect(screenX, y, 15, 2);
        }
      }

      // Fire photons
      if (tick % 3 === 0) {
        const slit = Math.random() > 0.5 ? cy - slitSep / 2 : cy + slitSep / 2;
        const lambda = 8;
        const d1 = Math.hypot(screenX - barrierX, 0);
        // Probabilistic landing based on interference
        const attempts = 5;
        for (let a = 0; a < attempts; a++) {
          const fy = Math.random() * canvas.height;
          const pd1 = Math.hypot(screenX - barrierX, fy - (cy - slitSep / 2));
          const pd2 = Math.hypot(screenX - barrierX, fy - (cy + slitSep / 2));
          const prob = Math.cos(((pd1 - pd2) / lambda) * Math.PI) ** 2;
          if (Math.random() < prob) {
            detections.current.push({ x: screenX + 20 + Math.random() * 10, y: fy });
            break;
          }
        }
        if (detections.current.length > 3000) detections.current.splice(0, 100);
      }

      // Draw detections
      detections.current.forEach(d => {
        ctx.fillStyle = 'hsla(85, 100%, 60%, 0.6)';
        ctx.fillRect(d.x, d.y, 2, 2);
      });

      // Screen
      ctx.strokeStyle = 'hsl(0,0%,30%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();

      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.fillText(`Double-Slit Experiment | Detections: ${detections.current.length}`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [slitWidth, slitSep, showWave]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Slit width: {slitWidth}</span>
          <input type="range" min="5" max="40" value={slitWidth} onChange={e => setSlitWidth(+e.target.value)} className="w-20" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Separation: {slitSep}</span>
          <input type="range" min="20" max="120" value={slitSep} onChange={e => setSlitSep(+e.target.value)} className="w-20" />
        </label>
        <button onClick={() => setShowWave(v => !v)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          {showWave ? 'Wave View' : 'Particle View'}
        </button>
        <button onClick={() => { detections.current = []; }} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold">
          Clear
        </button>
      </div>
    </div>
  );
};
