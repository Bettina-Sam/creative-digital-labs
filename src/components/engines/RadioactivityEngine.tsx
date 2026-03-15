import { useRef, useEffect, useState } from 'react';

export const RadioactivityEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [halfLife, setHalfLife] = useState(3);
  const [running, setRunning] = useState(false);
  const atoms = useRef<{ x: number; y: number; decayed: boolean; decayTime: number }[]>([]);
  const startTime = useRef(0);

  const reset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    atoms.current = Array.from({ length: 200 }, () => ({
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 300,
      decayed: false,
      decayTime: -Math.log(Math.random()) * halfLife,
    }));
    startTime.current = Date.now() / 1000;
    setRunning(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    if (atoms.current.length === 0) reset();

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const elapsed = running ? (Date.now() / 1000 - startTime.current) : 0;
      let remaining = 0;
      let decayed = 0;

      atoms.current.forEach(a => {
        if (!a.decayed && elapsed >= a.decayTime) {
          a.decayed = true;
        }
        if (a.decayed) {
          decayed++;
          ctx.beginPath();
          ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'hsla(0, 60%, 50%, 0.4)';
          ctx.fill();
        } else {
          remaining++;
          ctx.beginPath();
          ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'hsl(85, 100%, 55%)';
          ctx.fill();
          ctx.strokeStyle = 'hsl(85, 100%, 70%)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Decay curve
      const graphX = canvas.width - 280;
      const graphY = 30;
      const graphW = 260;
      const graphH = 150;
      ctx.strokeStyle = 'hsl(0,0%,30%)';
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      ctx.beginPath();
      const N0 = atoms.current.length;
      for (let px = 0; px <= graphW; px++) {
        const t = (px / graphW) * halfLife * 5;
        const N = N0 * Math.exp(-0.693 * t / halfLife);
        const py = graphY + graphH - (N / N0) * graphH;
        if (px === 0) ctx.moveTo(graphX + px, py);
        else ctx.lineTo(graphX + px, py);
      }
      ctx.strokeStyle = 'hsl(185, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Current marker
      const markerX = graphX + (elapsed / (halfLife * 5)) * graphW;
      if (markerX <= graphX + graphW) {
        ctx.beginPath();
        ctx.arc(markerX, graphY + graphH - (remaining / N0) * graphH, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(25, 100%, 55%)';
        ctx.fill();
      }

      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`N(t) = N₀ × e^(-λt) | t½ = ${halfLife}s`, 15, 25);
      ctx.fillText(`Time: ${elapsed.toFixed(1)}s | Remaining: ${remaining}/${N0}`, 15, 45);
      ctx.fillText(`Half-lives elapsed: ${(elapsed / halfLife).toFixed(2)}`, 15, 65);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [halfLife, running]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Half-life: {halfLife}s</span>
          <input type="range" min="1" max="10" step="0.5" value={halfLife} onChange={e => setHalfLife(+e.target.value)} className="w-24" />
        </label>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold">Reset & Start</button>
      </div>
    </div>
  );
};
