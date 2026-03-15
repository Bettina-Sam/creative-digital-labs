import { useRef, useEffect, useState } from 'react';

export const DopplerEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceSpeed, setSourceSpeed] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const waves: { cx: number; cy: number; r: number; born: number }[] = [];
    let sourceX = 80;
    let anim: number;
    let tick = 0;

    const animate = () => {
      tick++;
      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cy = canvas.height / 2;
      sourceX += sourceSpeed;
      if (sourceX > canvas.width - 40) sourceX = 80;

      // Emit waves
      if (tick % 12 === 0) {
        waves.push({ cx: sourceX, cy, r: 0, born: tick });
      }

      // Draw waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.r += 3; // wave speed
        if (w.r > canvas.width) { waves.splice(i, 1); continue; }

        const alpha = Math.max(0, 1 - w.r / (canvas.width * 0.5));
        ctx.beginPath();
        ctx.arc(w.cx, w.cy, w.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(185, 100%, 50%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Source
      ctx.beginPath();
      ctx.arc(sourceX, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(25, 100%, 55%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(25, 100%, 75%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Observers
      const obs1X = 50;
      const obs2X = canvas.width - 50;
      [obs1X, obs2X].forEach(ox => {
        ctx.beginPath();
        ctx.arc(ox, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(85, 100%, 55%)';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👂', ox, cy + 3);
      });

      // Frequency labels
      const vWave = 3; // wave propagation speed per tick
      const fApproaching = vWave / (vWave - sourceSpeed);
      const fReceding = vWave / (vWave + sourceSpeed);

      ctx.fillStyle = 'hsl(0, 80%, 60%)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`f = ${fApproaching.toFixed(2)}f₀ (higher)`, canvas.width - 50, cy - 30);
      ctx.fillStyle = 'hsl(200, 80%, 60%)';
      ctx.fillText(`f = ${fReceding.toFixed(2)}f₀ (lower)`, 50, cy - 30);

      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`f' = f₀ × v/(v ± vₛ) | Source speed: ${sourceSpeed.toFixed(1)}`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [sourceSpeed]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Source speed: {sourceSpeed.toFixed(1)}</span>
          <input type="range" min="0" max="5" step="0.1" value={sourceSpeed} onChange={e => setSourceSpeed(+e.target.value)} className="w-32" />
        </label>
      </div>
    </div>
  );
};
