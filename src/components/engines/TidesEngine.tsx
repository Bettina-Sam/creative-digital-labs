import { useRef, useEffect, useState } from 'react';

export const TidesEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [moonAngle, setMoonAngle] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let angle = moonAngle * Math.PI / 180;
    let anim: number;

    const animate = () => {
      angle += 0.005 * speed;
      ctx.fillStyle = 'hsl(220, 40%, 8%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Earth
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(200, 60%, 35%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(120, 40%, 40%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tidal bulge (ocean)
      const bulgeX = Math.cos(angle) * 20;
      const bulgeY = Math.sin(angle) * 20;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70 + Math.abs(Math.cos(angle)) * 15, 70 + Math.abs(Math.sin(angle)) * 15, angle, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(200, 80%, 50%, 0.3)';
      ctx.fill();

      // Moon orbit
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsla(0,0%,50%,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moon
      const moonX = cx + Math.cos(angle) * 150;
      const moonY = cy + Math.sin(angle) * 150;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(45, 10%, 75%)';
      ctx.fill();

      // Gravitational arrows
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 75, cy + Math.sin(angle) * 75);
      ctx.lineTo(cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 120);
      ctx.strokeStyle = 'hsla(185, 100%, 50%, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Earth', cx, cy + 4);
      ctx.fillText('Moon', moonX, moonY + 4);

      const tideType = Math.abs(Math.cos(angle)) > 0.7 ? 'Spring Tide (High)' : Math.abs(Math.sin(angle)) > 0.7 ? 'Neap Tide (Low)' : 'Transitional';
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(tideType, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [speed]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Speed: {speed}x</span>
          <input type="range" min="0.1" max="5" step="0.1" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
