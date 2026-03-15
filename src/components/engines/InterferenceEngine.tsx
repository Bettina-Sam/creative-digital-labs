import { useRef, useEffect, useState } from 'react';

export const InterferenceEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [freq, setFreq] = useState(0.06);
  const [separation, setSeparation] = useState(100);

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
      t += 0.05;
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;

      const cy = canvas.height / 2;
      const s1x = canvas.width * 0.3, s1y = cy - separation / 2;
      const s2x = canvas.width * 0.3, s2y = cy + separation / 2;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const d1 = Math.hypot(x - s1x, y - s1y);
          const d2 = Math.hypot(x - s2x, y - s2y);
          const wave1 = Math.sin(d1 * freq - t);
          const wave2 = Math.sin(d2 * freq - t);
          const combined = (wave1 + wave2) / 2;

          const idx = (y * canvas.width + x) * 4;
          const brightness = (combined + 1) / 2;
          data[idx] = brightness * 50;
          data[idx + 1] = brightness * 200;
          data[idx + 2] = brightness * 255;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Source markers
      [{ x: s1x, y: s1y }, { x: s2x, y: s2y }].forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(25, 100%, 55%)';
        ctx.fill();
      });

      ctx.fillStyle = 'white';
      ctx.font = '13px monospace';
      ctx.fillText('Constructive (bright) | Destructive (dark)', 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [freq, separation]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Frequency: {freq.toFixed(3)}</span>
          <input type="range" min="0.02" max="0.15" step="0.005" value={freq} onChange={e => setFreq(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Separation: {separation}</span>
          <input type="range" min="20" max="200" value={separation} onChange={e => setSeparation(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
