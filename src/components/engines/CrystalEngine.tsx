import { useRef, useEffect, useState } from 'react';

export const CrystalEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [growthRate, setGrowthRate] = useState(1);
  const [latticeType, setLatticeType] = useState<'cubic' | 'hex' | 'diamond'>('cubic');
  const atoms = useRef<{ x: number; y: number; size: number; hue: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    atoms.current = [{ x: canvas.width / 2, y: canvas.height / 2, size: 6, hue: 280 }];
    let tick = 0;
    let anim: number;

    const animate = () => {
      tick++;
      ctx.fillStyle = 'rgba(10,10,30,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grow
      if (tick % Math.max(1, Math.round(10 / growthRate)) === 0 && atoms.current.length < 2000) {
        const parent = atoms.current[Math.floor(Math.random() * atoms.current.length)];
        const spacing = latticeType === 'hex' ? 14 : latticeType === 'diamond' ? 16 : 12;
        let angle: number;
        if (latticeType === 'cubic') {
          angle = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][Math.floor(Math.random() * 4)];
        } else if (latticeType === 'hex') {
          angle = (Math.floor(Math.random() * 6) / 6) * Math.PI * 2;
        } else {
          angle = (Math.floor(Math.random() * 4) / 4) * Math.PI * 2 + Math.PI / 4;
        }
        const nx = parent.x + Math.cos(angle) * spacing;
        const ny = parent.y + Math.sin(angle) * spacing;
        // Check overlap
        const tooClose = atoms.current.some(a => Math.hypot(a.x - nx, a.y - ny) < 8);
        if (!tooClose && nx > 10 && nx < canvas.width - 10 && ny > 10 && ny < canvas.height - 10) {
          atoms.current.push({ x: nx, y: ny, size: 5 + Math.random() * 2, hue: 270 + Math.random() * 40 });
        }
      }

      // Draw
      atoms.current.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${a.hue}, 60%, 55%, 0.8)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${a.hue}, 80%, 70%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Bonds
      ctx.strokeStyle = 'hsla(280, 50%, 50%, 0.15)';
      ctx.lineWidth = 1;
      atoms.current.forEach((a, i) => {
        for (let j = i + 1; j < atoms.current.length; j++) {
          const b = atoms.current[j];
          if (Math.hypot(a.x - b.x, a.y - b.y) < 18) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });

      ctx.fillStyle = 'hsl(280, 80%, 70%)';
      ctx.font = '13px monospace';
      ctx.fillText(`Atoms: ${atoms.current.length} | Lattice: ${latticeType}`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [growthRate, latticeType]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Growth: {growthRate}x</span>
          <input type="range" min="0.5" max="5" step="0.5" value={growthRate} onChange={e => setGrowthRate(+e.target.value)} className="w-24" />
        </label>
        {(['cubic', 'hex', 'diamond'] as const).map(t => (
          <button key={t} onClick={() => { setLatticeType(t); atoms.current = []; }} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${latticeType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};
