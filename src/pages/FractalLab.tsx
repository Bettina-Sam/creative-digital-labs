import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

const FractalLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fractalType, setFractalType] = useState<'mandelbrot' | 'julia' | 'sierpinski'>('mandelbrot');
  const [maxIter, setMaxIter] = useState(80);
  const [zoom, setZoom] = useState(1);
  const [centerX, setCenterX] = useState(-0.5);
  const [centerY, setCenterY] = useState(0);
  const [juliaC, setJuliaC] = useState({ r: -0.7, i: 0.27015 });
  const [colorScheme, setColorScheme] = useState(0);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.fractalLabWelcome'));
  }, [isEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.min(canvas.offsetWidth, 800);
    canvas.height = Math.min(canvas.offsetHeight, 600);
    const { width, height } = canvas;
    const imgData = ctx.createImageData(width, height);

    const getColor = (iter: number): [number, number, number] => {
      if (iter === maxIter) return [0, 0, 0];
      const t = iter / maxIter;
      if (colorScheme === 0) return [Math.floor(9 * (1 - t) * t * t * t * 255), Math.floor(15 * (1 - t) * (1 - t) * t * t * 255), Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255)];
      if (colorScheme === 1) return [Math.floor(t * 255), Math.floor(t * 100), Math.floor((1 - t) * 255)];
      return [Math.floor(Math.sin(t * 6.28) * 127 + 128), Math.floor(Math.sin(t * 6.28 + 2) * 127 + 128), Math.floor(Math.sin(t * 6.28 + 4) * 127 + 128)];
    };

    if (fractalType === 'sierpinski') {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);
      const drawTriangle = (x: number, y: number, size: number, depth: number) => {
        if (depth === 0 || size < 2) {
          ctx.fillStyle = `hsl(${depth * 40 + colorScheme * 120}, 80%, 60%)`;
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x - size * 0.866, y + size * 0.5);
          ctx.lineTo(x + size * 0.866, y + size * 0.5);
          ctx.fill();
          return;
        }
        const half = size / 2;
        drawTriangle(x, y - half, half, depth - 1);
        drawTriangle(x - half * 0.866, y + half * 0.5, half, depth - 1);
        drawTriangle(x + half * 0.866, y + half * 0.5, half, depth - 1);
      };
      drawTriangle(width / 2, height / 2, Math.min(width, height) * 0.4 * zoom, Math.min(Math.floor(maxIter / 10), 8));
      return;
    }

    for (let px = 0; px < width; px++) {
      for (let py = 0; py < height; py++) {
        const x0 = (px - width / 2) / (200 * zoom) + centerX;
        const y0 = (py - height / 2) / (200 * zoom) + centerY;

        let x = fractalType === 'julia' ? x0 : 0;
        let y = fractalType === 'julia' ? y0 : 0;
        const cr = fractalType === 'julia' ? juliaC.r : x0;
        const ci = fractalType === 'julia' ? juliaC.i : y0;

        let iter = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const tmp = x * x - y * y + cr;
          y = 2 * x * y + ci;
          x = tmp;
          iter++;
        }

        const idx = (py * width + px) * 4;
        const [r, g, b] = getColor(iter);
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [fractalType, maxIter, zoom, centerX, centerY, juliaC, colorScheme]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    setCenterX((px - canvas.width / 2) / (200 * zoom) + centerX);
    setCenterY((py - canvas.height / 2) / (200 * zoom) + centerY);
    setZoom(z => z * 2);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-20">
        <Link to="/experiments" className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 pt-16">
        <canvas ref={canvasRef} className="w-full max-w-[800px] h-[60vh] rounded-2xl cursor-crosshair border border-border" onClick={handleCanvasClick} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="glass-panel p-4 rounded-2xl max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold gradient-text">Fractal Explorer</h2>
            <button onClick={() => { setZoom(1); setCenterX(-0.5); setCenterY(0); }} className="text-xs px-3 py-1 rounded-lg bg-muted text-muted-foreground">Reset Zoom</button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {(['mandelbrot', 'julia', 'sierpinski'] as const).map(f => (
              <button key={f} onClick={() => setFractalType(f)} className={`text-xs px-3 py-1.5 rounded-lg capitalize ${fractalType === f ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>{f}</button>
            ))}
            <span className="text-xs text-muted-foreground">Detail: {maxIter}</span>
            <input type="range" min="20" max="200" value={maxIter} onChange={e => setMaxIter(+e.target.value)} className="w-24 accent-primary" />
            <span className="text-xs text-muted-foreground">Color:</span>
            {[0, 1, 2].map(c => (
              <button key={c} onClick={() => setColorScheme(c)} className={`w-6 h-6 rounded-full border-2 ${colorScheme === c ? 'border-primary' : 'border-transparent'}`} style={{ background: c === 0 ? 'linear-gradient(#0af,#f0f)' : c === 1 ? 'linear-gradient(#f00,#00f)' : 'linear-gradient(#0f0,#ff0,#f00)' }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">🔍 Click to zoom in. Fractals are infinitely complex patterns that repeat at every scale — a key concept in chaos theory and mathematics.</p>
        </div>
      </div>
    </div>
  );
};

export default FractalLab;
