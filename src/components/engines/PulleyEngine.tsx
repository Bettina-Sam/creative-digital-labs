import { useRef, useEffect, useState } from 'react';

export const PulleyEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPulleys, setNumPulleys] = useState(1);
  const [load, setLoad] = useState(100);
  const [pullPos, setPullPos] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'hsl(220, 30%, 8%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const topY = 60;
      const ma = numPulleys; // mechanical advantage
      const effort = load / ma;
      const ropeUp = pullPos;

      // Ceiling
      ctx.fillStyle = 'hsl(0, 0%, 40%)';
      ctx.fillRect(cx - 80, topY - 10, 160, 10);

      // Draw pulleys
      for (let i = 0; i < numPulleys; i++) {
        const py = topY + 30 + i * 80;
        const px = cx + (i % 2 === 0 ? 0 : 40);
        
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'hsl(185, 100%, 50%)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(185, 100%, 50%)';
        ctx.fill();

        // Rope
        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(px + 20, py);
          ctx.lineTo(px + 20, topY);
          ctx.strokeStyle = 'hsl(40, 60%, 50%)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Load
      const loadY = topY + 30 + numPulleys * 80 + 30 - ropeUp / ma;
      ctx.fillStyle = 'hsl(25, 100%, 55%)';
      ctx.fillRect(cx - 25, loadY, 50, 40);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${load}N`, cx, loadY + 25);

      // Rope from load to top
      ctx.beginPath();
      ctx.moveTo(cx, loadY);
      ctx.lineTo(cx, topY + 30);
      ctx.strokeStyle = 'hsl(40, 60%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Effort side
      ctx.fillStyle = 'hsl(85, 100%, 55%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Load: ${load}N`, 15, canvas.height - 60);
      ctx.fillText(`Pulleys: ${numPulleys} → MA = ${ma}`, 15, canvas.height - 40);
      ctx.fillText(`Effort needed: ${effort.toFixed(1)}N`, 15, canvas.height - 20);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [numPulleys, load, pullPos]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Pulleys: {numPulleys}</span>
          <input type="range" min="1" max="6" value={numPulleys} onChange={e => setNumPulleys(+e.target.value)} className="w-20" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Load: {load}N</span>
          <input type="range" min="10" max="500" value={load} onChange={e => setLoad(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Pull rope</span>
          <input type="range" min="0" max="200" value={pullPos} onChange={e => setPullPos(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
