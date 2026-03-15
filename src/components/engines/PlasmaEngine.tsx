import { useRef, useEffect, useState } from 'react';

export const PlasmaEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState(5000);
  const [fieldStrength, setFieldStrength] = useState(0);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; charge: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    particles.current = Array.from({ length: 300 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0, vy: 0,
      charge: Math.random() > 0.5 ? 1 : -1,
    }));

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(5,0,15,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const speed = temperature / 2000;
      particles.current.forEach(p => {
        p.vx += (Math.random() - 0.5) * speed;
        p.vy += (Math.random() - 0.5) * speed;
        p.vx += p.charge * fieldStrength * 0.01;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }

        const hue = p.charge > 0 ? 185 : 320;
        const spd = Math.hypot(p.vx, p.vy);
        const glow = Math.min(1, spd / 5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, ${50 + glow * 30}%, ${0.5 + glow * 0.5})`;
        ctx.fill();

        if (glow > 0.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${glow * 0.2})`;
          ctx.fill();
        }
      });

      ctx.fillStyle = 'hsl(280, 80%, 70%)';
      ctx.font = '13px monospace';
      ctx.fillText(`T = ${temperature}K | Debye λ ∝ √(T/n)`, 15, 25);
      ctx.fillText(`${particles.current.length} particles (+ ions, − electrons)`, 15, 45);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [temperature, fieldStrength]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Temp: {temperature}K</span>
          <input type="range" min="1000" max="50000" step="500" value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-28" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">E-field: {fieldStrength}</span>
          <input type="range" min="-50" max="50" value={fieldStrength} onChange={e => setFieldStrength(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
