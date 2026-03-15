import { useRef, useEffect, useState } from 'react';

export const AerodynamicsEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angleOfAttack, setAngleOfAttack] = useState(5);
  const [airSpeed, setAirSpeed] = useState(50);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    let t = 0;
    const streamlines: { x: number; y: number; startY: number }[] = [];

    const animate = () => {
      t += 0.016;
      ctx.fillStyle = 'hsla(210, 40%, 8%, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const aoa = angleOfAttack * Math.PI / 180;

      // Airfoil
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-aoa);
      ctx.beginPath();
      ctx.moveTo(-80, 0);
      ctx.quadraticCurveTo(-20, -25, 80, -3);
      ctx.quadraticCurveTo(-20, 8, -80, 0);
      ctx.fillStyle = 'hsl(0, 0%, 40%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(0, 0%, 60%)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Streamlines
      if (t % 0.05 < 0.02) {
        for (let sy = 50; sy < canvas.height - 50; sy += 25) {
          streamlines.push({ x: 0, y: sy, startY: sy });
        }
      }

      const lift = 0.5 * 1.225 * (airSpeed * airSpeed) * 0.1 * Math.sin(aoa * 2);
      const drag = 0.5 * 1.225 * (airSpeed * airSpeed) * 0.01 * (1 + Math.abs(Math.sin(aoa)));

      for (let i = streamlines.length - 1; i >= 0; i--) {
        const s = streamlines[i];
        s.x += airSpeed * 0.08;

        // Deflect near airfoil
        const dx = s.x - cx;
        const dy = s.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 20) {
          const deflect = (120 - dist) / 120;
          if (s.startY < cy) {
            s.y -= deflect * angleOfAttack * 0.1;
          } else {
            s.y += deflect * angleOfAttack * 0.05;
          }
        }

        if (s.x > canvas.width) { streamlines.splice(i, 1); continue; }

        const speed = airSpeed * 0.08;
        const hue = s.startY < cy ? 185 : 200;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.6)`;
        ctx.fillRect(s.x, s.y, 3, 1);
      }
      if (streamlines.length > 5000) streamlines.splice(0, 500);

      // Force arrows
      // Lift (up)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - lift * 2);
      ctx.strokeStyle = 'hsl(85, 100%, 55%)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'hsl(85, 100%, 55%)';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - lift * 2 + 10);
      ctx.lineTo(cx, cy - lift * 2);
      ctx.lineTo(cx + 6, cy - lift * 2 + 10);
      ctx.fill();

      // Drag (right, opposite to motion)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + drag * 5, cy);
      ctx.strokeStyle = 'hsl(0, 80%, 55%)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`AoA: ${angleOfAttack}° | Speed: ${airSpeed} m/s`, 15, 25);
      ctx.fillText(`Lift: ${lift.toFixed(1)}N | Drag: ${drag.toFixed(1)}N | L/D: ${(lift / Math.max(drag, 0.1)).toFixed(1)}`, 15, 45);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [angleOfAttack, airSpeed]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Angle of Attack: {angleOfAttack}°</span>
          <input type="range" min="-10" max="25" value={angleOfAttack} onChange={e => setAngleOfAttack(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Air Speed: {airSpeed} m/s</span>
          <input type="range" min="10" max="200" value={airSpeed} onChange={e => setAirSpeed(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
