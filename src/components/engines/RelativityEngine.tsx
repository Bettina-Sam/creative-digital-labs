import { useRef, useEffect, useState } from 'react';

export const RelativityEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [velocityPct, setVelocityPct] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    let t = 0;
    const animate = () => {
      t += 0.016;
      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const v = velocityPct / 100; // fraction of c
      const gamma = 1 / Math.sqrt(Math.max(0.001, 1 - v * v));
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Stationary reference clock
      const clockR = 60;
      const stationaryAngle = t * 2;
      ctx.beginPath();
      ctx.arc(cx - 180, cy - 60, clockR, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsl(185, 80%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy - 60);
      ctx.lineTo(cx - 180 + Math.cos(stationaryAngle) * clockR * 0.8, cy - 60 + Math.sin(stationaryAngle) * clockR * 0.8);
      ctx.strokeStyle = 'hsl(185, 100%, 60%)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Stationary Clock', cx - 180, cy + 20);

      // Moving reference clock (time dilation)
      const movingAngle = t * 2 / gamma;
      ctx.beginPath();
      ctx.arc(cx + 180, cy - 60, clockR, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsl(25, 80%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 180, cy - 60);
      ctx.lineTo(cx + 180 + Math.cos(movingAngle) * clockR * 0.8, cy - 60 + Math.sin(movingAngle) * clockR * 0.8);
      ctx.strokeStyle = 'hsl(25, 100%, 60%)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'hsl(25, 100%, 70%)';
      ctx.fillText('Moving Clock', cx + 180, cy + 20);

      // Length contraction visual
      const restLen = 120;
      const contractedLen = restLen / gamma;
      ctx.fillStyle = 'hsl(185, 60%, 40%)';
      ctx.fillRect(cx - 180 - restLen / 2, cy + 80, restLen, 30);
      ctx.fillStyle = 'hsl(25, 60%, 40%)';
      ctx.fillRect(cx + 180 - contractedLen / 2, cy + 80, contractedLen, 30);

      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.fillText('Rest Length', cx - 180, cy + 130);
      ctx.fillText('Contracted', cx + 180, cy + 130);

      // Formulas
      ctx.fillStyle = 'hsl(85, 100%, 70%)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${(v * 100).toFixed(1)}% c`, 15, 25);
      ctx.fillText(`γ = ${gamma.toFixed(4)}`, 15, 45);
      ctx.fillText(`Time dilation: t' = t × γ = ${gamma.toFixed(3)}`, 15, 65);
      ctx.fillText(`Length contraction: L' = L/γ = ${(1 / gamma).toFixed(3)}L`, 15, 85);
      ctx.fillText(`E = γmc²`, 15, 105);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [velocityPct]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Velocity: {velocityPct}% speed of light</span>
          <input type="range" min="0" max="99" value={velocityPct} onChange={e => setVelocityPct(+e.target.value)} className="w-40" />
        </label>
      </div>
    </div>
  );
};
