import { useRef, useEffect, useState } from 'react';

export const GearEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(2);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let angle = 0;
    let anim: number;

    const drawGear = (x: number, y: number, r: number, teeth: number, rot: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2;
        const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
        const a4 = ((i + 0.8) / teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
        ctx.lineTo(Math.cos(a2) * (r + 12), Math.sin(a2) * (r + 12));
        ctx.lineTo(Math.cos(a3) * (r + 12), Math.sin(a3) * (r + 12));
        ctx.lineTo(Math.cos(a4) * r, Math.sin(a4) * r);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'hsla(0,0%,100%,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Hub
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(0,0%,30%)';
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      angle += 0.02 * speed;
      ctx.fillStyle = 'hsl(220, 30%, 8%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const r1 = 50;
      const teeth1 = 12;
      const r2 = r1 * ratio;
      const teeth2 = Math.round(teeth1 * ratio);

      drawGear(cx - r1 - 5, cy, r1, teeth1, angle, 'hsl(185, 60%, 35%)');
      drawGear(cx + r2 + 5, cy, r2, teeth2, -angle / ratio, 'hsl(25, 70%, 40%)');

      // Info
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Gear ratio: 1:${ratio}`, 15, 25);
      ctx.fillText(`Driver: ${teeth1} teeth → Driven: ${teeth2} teeth`, 15, 45);
      ctx.fillText(`Speed: driver ${speed.toFixed(1)}x → driven ${(speed / ratio).toFixed(2)}x`, 15, 65);
      ctx.fillText(`Torque: multiplied by ${ratio}x`, 15, 85);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [ratio, speed]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ratio: 1:{ratio}</span>
          <input type="range" min="1" max="5" step="0.5" value={ratio} onChange={e => setRatio(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Speed: {speed.toFixed(1)}</span>
          <input type="range" min="0.1" max="5" step="0.1" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
