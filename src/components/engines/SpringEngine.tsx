import { useRef, useEffect, useState } from 'react';

export const SpringEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [k, setK] = useState(0.05);
  const [damping, setDamping] = useState(0.995);
  const stateRef = useRef({ y: 0, vy: 0, dragging: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const restY = 0;
    let anim: number;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.y = (clientY - rect.top) - canvas.height / 2;
      stateRef.current.vy = 0;
      stateRef.current.dragging = true;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.y = (clientY - rect.top) - canvas.height / 2;
    };
    const onUp = () => { stateRef.current.dragging = false; };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onUp);

    const animate = () => {
      const s = stateRef.current;
      if (!s.dragging) {
        const force = -k * (s.y - restY);
        s.vy += force;
        s.vy *= damping;
        s.y += s.vy;
      }

      ctx.fillStyle = 'rgba(10,10,30,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const massY = cy + s.y;

      // Draw spring coils
      ctx.beginPath();
      ctx.moveTo(cx, 30);
      const coils = 12;
      const segH = (massY - 30) / (coils * 2);
      for (let i = 0; i < coils * 2; i++) {
        const sy = 30 + segH * (i + 1);
        const sx = cx + (i % 2 === 0 ? 25 : -25);
        ctx.lineTo(sx, sy);
      }
      ctx.lineTo(cx, massY);
      ctx.strokeStyle = 'hsl(185, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw mass
      ctx.beginPath();
      ctx.arc(cx, massY, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(25, 100%, 55%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(25, 100%, 75%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw ceiling
      ctx.fillStyle = 'hsl(0, 0%, 40%)';
      ctx.fillRect(cx - 60, 20, 120, 10);

      // F = -kx label
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '14px monospace';
      ctx.fillText(`F = -kx = ${(-k * s.y).toFixed(2)}`, 20, canvas.height - 20);
      ctx.fillText(`x = ${s.y.toFixed(1)}`, 20, canvas.height - 40);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
    };
  }, [k, damping]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full cursor-grab" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Spring constant k: {k.toFixed(3)}</span>
          <input type="range" min="0.01" max="0.15" step="0.005" value={k} onChange={e => setK(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Damping: {damping.toFixed(3)}</span>
          <input type="range" min="0.95" max="1" step="0.001" value={damping} onChange={e => setDamping(+e.target.value)} className="w-24" />
        </label>
        <p className="text-xs text-muted-foreground">Drag the mass to stretch the spring!</p>
      </div>
    </div>
  );
};
