import { useRef, useEffect, useState } from 'react';

export const WeatherEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temp, setTemp] = useState(20);
  const [humidity, setHumidity] = useState(50);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const drops: { x: number; y: number; speed: number; len: number }[] = [];
    const clouds: { x: number; y: number; w: number; speed: number }[] = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({ x: Math.random() * 800, y: 60 + Math.random() * 80, w: 80 + Math.random() * 60, speed: 0.2 + Math.random() * 0.3 });
    }

    let anim: number;
    const animate = () => {
      // Sky gradient based on temperature
      const skyHue = temp < 0 ? 220 : temp < 15 ? 210 : temp < 30 ? 200 : 30;
      const skyLight = Math.max(15, 50 - humidity * 0.3);
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, `hsl(${skyHue}, 60%, ${skyLight}%)`);
      grad.addColorStop(1, `hsl(${skyHue + 20}, 40%, ${skyLight - 10}%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sun
      if (humidity < 70) {
        const sunAlpha = 1 - humidity / 100;
        ctx.beginPath();
        ctx.arc(canvas.width - 80, 60, 35, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(45, 100%, 60%, ${sunAlpha})`;
        ctx.fill();
      }

      // Clouds
      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > canvas.width + 100) c.x = -150;
        const alpha = Math.min(1, humidity / 40);
        ctx.fillStyle = `hsla(0, 0%, 90%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.w * 0.3, 0, Math.PI * 2);
        ctx.arc(c.x + c.w * 0.3, c.y - 10, c.w * 0.35, 0, Math.PI * 2);
        ctx.arc(c.x + c.w * 0.6, c.y, c.w * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rain
      if (humidity > 60) {
        const rainRate = (humidity - 60) / 10;
        for (let i = 0; i < rainRate; i++) {
          drops.push({ x: Math.random() * canvas.width, y: 100 + Math.random() * 50, speed: 4 + Math.random() * 4, len: 8 + Math.random() * 12 });
        }
      }
      if (temp < 2 && humidity > 60) {
        // Snow instead
        drops.forEach(d => {
          d.y += d.speed * 0.3;
          d.x += Math.sin(d.y * 0.02) * 0.5;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
        });
      } else {
        drops.forEach(d => {
          d.y += d.speed;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x, d.y + d.len);
          ctx.strokeStyle = 'hsla(200, 80%, 70%, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
      // Remove off-screen drops
      for (let i = drops.length - 1; i >= 0; i--) {
        if (drops[i].y > canvas.height) drops.splice(i, 1);
      }

      // Ground
      ctx.fillStyle = temp < 2 ? 'hsl(0,0%,90%)' : 'hsl(120, 35%, 30%)';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '14px monospace';
      ctx.fillText(`${temp}°C | Humidity: ${humidity}%`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [temp, humidity]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Temp: {temp}°C</span>
          <input type="range" min="-10" max="45" value={temp} onChange={e => setTemp(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Humidity: {humidity}%</span>
          <input type="range" min="0" max="100" value={humidity} onChange={e => setHumidity(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
