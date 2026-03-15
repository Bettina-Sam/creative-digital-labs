import { useRef, useEffect, useState } from 'react';

export const LensEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focalLength, setFocalLength] = useState(150);
  const [objectDist, setObjectDist] = useState(300);
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');

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

      const cy = canvas.height / 2;
      const lensX = canvas.width / 2;
      const f = lensType === 'convex' ? focalLength : -focalLength;

      // Optical axis
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
      ctx.strokeStyle = 'hsla(0,0%,50%,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lens
      ctx.beginPath();
      if (lensType === 'convex') {
        ctx.ellipse(lensX, cy, 8, 120, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(lensX - 5, cy - 120);
        ctx.quadraticCurveTo(lensX + 10, cy, lensX - 5, cy + 120);
        ctx.quadraticCurveTo(lensX - 20, cy, lensX - 5, cy - 120);
      }
      ctx.fillStyle = 'hsla(185, 80%, 50%, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(185, 80%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Focal points
      [f, -f].forEach(fd => {
        ctx.beginPath();
        ctx.arc(lensX + fd * 0.5, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(25, 100%, 55%)';
        ctx.fill();
        ctx.fillStyle = 'hsl(25, 100%, 70%)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('F', lensX + fd * 0.5, cy + 18);
      });

      // Object (arrow)
      const objX = lensX - objectDist * 0.5;
      const objH = 60;
      ctx.beginPath();
      ctx.moveTo(objX, cy); ctx.lineTo(objX, cy - objH);
      ctx.moveTo(objX - 5, cy - objH + 10); ctx.lineTo(objX, cy - objH); ctx.lineTo(objX + 5, cy - objH + 10);
      ctx.strokeStyle = 'hsl(85, 100%, 55%)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Image calculation: 1/v = 1/f - 1/u
      const u = objectDist * 0.5;
      const v = 1 / (1 / (f * 0.5) - 1 / u);
      const magnification = -v / u;
      const imgH = objH * magnification;
      const imgX = lensX + v;

      if (isFinite(v) && isFinite(imgH)) {
        // Image arrow
        ctx.beginPath();
        ctx.moveTo(imgX, cy); ctx.lineTo(imgX, cy - imgH);
        ctx.moveTo(imgX - 5, cy - imgH + (imgH > 0 ? 10 : -10)); ctx.lineTo(imgX, cy - imgH); ctx.lineTo(imgX + 5, cy - imgH + (imgH > 0 ? 10 : -10));
        ctx.strokeStyle = 'hsl(320, 100%, 60%)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Rays
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'hsla(45, 100%, 60%, 0.5)';
        ctx.lineWidth = 1;
        // Parallel ray
        ctx.beginPath();
        ctx.moveTo(objX, cy - objH); ctx.lineTo(lensX, cy - objH); ctx.lineTo(imgX, cy - imgH);
        ctx.stroke();
        // Central ray
        ctx.beginPath();
        ctx.moveTo(objX, cy - objH); ctx.lineTo(imgX, cy - imgH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Info
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`1/v = 1/f − 1/u | f=${(f*0.5).toFixed(0)} u=${u.toFixed(0)} v=${v.toFixed(0)} M=${magnification.toFixed(2)}`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [focalLength, objectDist, lensType]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <button onClick={() => setLensType(l => l === 'convex' ? 'concave' : 'convex')} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          {lensType === 'convex' ? 'Convex' : 'Concave'}
        </button>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Focal: {focalLength}</span>
          <input type="range" min="50" max="300" value={focalLength} onChange={e => setFocalLength(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Object dist: {objectDist}</span>
          <input type="range" min="50" max="500" value={objectDist} onChange={e => setObjectDist(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
