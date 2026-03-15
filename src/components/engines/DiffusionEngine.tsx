import { useRef, useEffect, useState } from 'react';

export const DiffusionEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temp, setTemp] = useState(1);
  const [released, setReleased] = useState(false);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; type: 'a' | 'b' }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particles.current = [];
    for (let i = 0; i < 200; i++) {
      particles.current.push({
        x: Math.random() * canvas.width * 0.3 + 20,
        y: Math.random() * canvas.height,
        vx: 0, vy: 0, type: 'a',
      });
      particles.current.push({
        x: canvas.width * 0.7 + Math.random() * canvas.width * 0.3 - 20,
        y: Math.random() * canvas.height,
        vx: 0, vy: 0, type: 'b',
      });
    }

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(10,10,30,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!released) {
        ctx.strokeStyle = 'hsla(0,0%,50%,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      particles.current.forEach(p => {
        p.vx += (Math.random() - 0.5) * temp * 2;
        p.vy += (Math.random() - 0.5) * temp * 2;
        p.vx *= 0.95;
        p.vy *= 0.95;

        if (!released) {
          if (p.type === 'a' && p.x + p.vx > canvas.width / 2) p.vx = -Math.abs(p.vx);
          if (p.type === 'b' && p.x + p.vx < canvas.width / 2) p.vx = -Math.abs(p.vx);
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 2) { p.x = 2; p.vx *= -1; }
        if (p.x > canvas.width - 2) { p.x = canvas.width - 2; p.vx *= -1; }
        if (p.y < 2) { p.y = 2; p.vy *= -1; }
        if (p.y > canvas.height - 2) { p.y = canvas.height - 2; p.vy *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'a' ? 'hsl(185, 100%, 55%)' : 'hsl(320, 100%, 60%)';
        ctx.fill();
      });

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [temp, released]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Temperature: {temp.toFixed(1)}</span>
          <input type="range" min="0.1" max="5" step="0.1" value={temp} onChange={e => setTemp(+e.target.value)} className="w-24" />
        </label>
        <button onClick={() => setReleased(r => !r)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          {released ? 'Reset Barrier' : 'Remove Barrier'}
        </button>
      </div>
    </div>
  );
};
