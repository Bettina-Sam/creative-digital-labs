import { useRef, useEffect, useState } from 'react';

const layers = [
  { name: 'Topsoil', color: 'hsl(30, 50%, 35%)', h: 0.08 },
  { name: 'Sandstone', color: 'hsl(40, 55%, 55%)', h: 0.12 },
  { name: 'Limestone', color: 'hsl(45, 30%, 65%)', h: 0.12 },
  { name: 'Shale', color: 'hsl(200, 15%, 40%)', h: 0.1 },
  { name: 'Granite', color: 'hsl(0, 10%, 45%)', h: 0.15 },
  { name: 'Basalt', color: 'hsl(0, 5%, 30%)', h: 0.15 },
  { name: 'Magma', color: 'hsl(15, 90%, 40%)', h: 0.28 },
];

export const GeologyEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pressure, setPressure] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    const animate = () => {
      ctx.fillStyle = 'hsl(210, 60%, 15%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const startY = 30;
      const totalH = canvas.height - 60;
      let y = startY;

      layers.forEach((layer, i) => {
        const h = layer.h * totalH;
        const compressed = h * (1 - pressure * 0.003 * (i + 1));
        const waveAmp = pressure * 0.5 * (i > 3 ? 2 : 0.5);

        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvas.width; x += 5) {
          const wave = Math.sin(x * 0.01 + i + Date.now() * 0.0005 * (i === layers.length - 1 ? 1 : 0)) * waveAmp;
          ctx.lineTo(x, y + wave);
        }
        ctx.lineTo(canvas.width, y + compressed);
        ctx.lineTo(0, y + compressed);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();

        if (showLabels) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(layer.name, 15, y + compressed / 2 + 4);
          ctx.fillStyle = 'hsla(0,0%,100%,0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(`${(compressed / totalH * 100).toFixed(0)}%`, canvas.width - 50, y + compressed / 2 + 4);
        }

        y += compressed;
      });

      // Tectonic arrows if pressure > 0
      if (pressure > 30) {
        ctx.strokeStyle = 'hsla(25, 100%, 55%, 0.8)';
        ctx.lineWidth = 3;
        const my = canvas.height / 2;
        // Left arrow
        ctx.beginPath();
        ctx.moveTo(10, my); ctx.lineTo(50, my);
        ctx.moveTo(40, my - 8); ctx.lineTo(50, my); ctx.lineTo(40, my + 8);
        ctx.stroke();
        // Right arrow
        ctx.beginPath();
        ctx.moveTo(canvas.width - 10, my); ctx.lineTo(canvas.width - 50, my);
        ctx.moveTo(canvas.width - 40, my - 8); ctx.lineTo(canvas.width - 50, my); ctx.lineTo(canvas.width - 40, my + 8);
        ctx.stroke();
      }

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [pressure, showLabels]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Tectonic Pressure: {pressure}%</span>
          <input type="range" min="0" max="100" value={pressure} onChange={e => setPressure(+e.target.value)} className="w-28" />
        </label>
        <button onClick={() => setShowLabels(v => !v)} className="px-3 py-1.5 rounded-lg bg-muted text-sm">
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
      </div>
    </div>
  );
};
