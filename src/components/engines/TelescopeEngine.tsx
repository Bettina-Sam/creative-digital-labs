import { useRef, useEffect, useState } from 'react';

export const TelescopeEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objectiveFocal, setObjectiveFocal] = useState(200);
  const [eyepieceFocal, setEyepieceFocal] = useState(25);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cy = canvas.height / 2;
      const mag = objectiveFocal / eyepieceFocal;
      const objX = canvas.width * 0.25;
      const eyeX = canvas.width * 0.7;

      // Optical axis
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.strokeStyle = 'hsla(0,0%,50%,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Objective lens
      ctx.beginPath();
      ctx.ellipse(objX, cy, 6, 100, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(185, 80%, 50%, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(185, 80%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Objective f=${objectiveFocal}mm`, objX, cy + 120);

      // Eyepiece lens
      ctx.beginPath();
      ctx.ellipse(eyeX, cy, 4, 50, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(25, 80%, 50%, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(25, 80%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'hsl(25, 100%, 70%)';
      ctx.fillText(`Eyepiece f=${eyepieceFocal}mm`, eyeX, cy + 70);

      // Light rays
      const rayColors = ['hsla(45, 100%, 60%, 0.4)', 'hsla(45, 100%, 60%, 0.3)', 'hsla(45, 100%, 60%, 0.2)'];
      [-30, 0, 30].forEach((offset, i) => {
        ctx.beginPath();
        ctx.moveTo(0, cy + offset);
        ctx.lineTo(objX, cy + offset);
        ctx.lineTo(eyeX, cy - offset * mag * 0.3);
        ctx.lineTo(canvas.width, cy - offset * mag * 0.5);
        ctx.strokeStyle = rayColors[i];
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Eye
      ctx.beginPath();
      ctx.arc(canvas.width - 30, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(0,0%,80%)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width - 30, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(200, 60%, 40%)';
      ctx.fill();

      // Stars in "sky" view
      ctx.fillStyle = 'hsl(0,0%,50%)';
      ctx.font = '10px sans-serif';
      ctx.fillText('Distant stars', 30, 30);
      for (let i = 0; i < 8; i++) {
        const sx = 10 + Math.random() * 60;
        const sy = 40 + Math.random() * (cy - 80);
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(0, 0%, ${60 + Math.random() * 40}%, 0.7)`;
        ctx.fill();
      }

      ctx.fillStyle = 'hsl(85, 100%, 70%)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Magnification = f_obj / f_eye = ${objectiveFocal}/${eyepieceFocal} = ${mag.toFixed(1)}×`, 15, canvas.height - 15);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [objectiveFocal, eyepieceFocal]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Objective focal: {objectiveFocal}mm</span>
          <input type="range" min="50" max="500" value={objectiveFocal} onChange={e => setObjectiveFocal(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Eyepiece focal: {eyepieceFocal}mm</span>
          <input type="range" min="5" max="100" value={eyepieceFocal} onChange={e => setEyepieceFocal(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
