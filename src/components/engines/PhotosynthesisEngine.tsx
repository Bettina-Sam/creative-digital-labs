import { useRef, useEffect, useState } from 'react';

export const PhotosynthesisEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sunlight, setSunlight] = useState(70);
  const [co2, setCo2] = useState(50);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; type: 'co2' | 'o2' | 'photon'; life: number }[] = [];
    let anim: number;
    let tick = 0;

    const animate = () => {
      tick++;
      ctx.fillStyle = 'rgba(10,30,10,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const leafY = canvas.height * 0.5;

      // Sun
      const sunAlpha = sunlight / 100;
      ctx.beginPath();
      ctx.arc(cx, 40, 30, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(45, 100%, 60%, ${sunAlpha})`;
      ctx.fill();

      // Sun rays / photons
      if (tick % 8 === 0 && sunlight > 10) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 100, y: 80,
          vx: (Math.random() - 0.5) * 0.5, vy: 2 + Math.random(),
          type: 'photon', life: 200,
        });
      }

      // CO2 from left
      if (tick % 15 === 0 && co2 > 10) {
        particles.push({
          x: 10, y: leafY + (Math.random() - 0.5) * 40,
          vx: 1 + Math.random(), vy: (Math.random() - 0.5) * 0.3,
          type: 'co2', life: 300,
        });
      }

      // Leaf
      ctx.beginPath();
      ctx.ellipse(cx, leafY, 100, 35, 0, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(120, ${40 + sunlight * 0.3}%, ${25 + sunlight * 0.2}%)`;
      ctx.fill();
      ctx.strokeStyle = 'hsl(120, 50%, 40%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Leaf veins
      ctx.beginPath();
      ctx.moveTo(cx - 90, leafY);
      ctx.lineTo(cx + 90, leafY);
      ctx.moveTo(cx, leafY - 30);
      ctx.lineTo(cx, leafY + 30);
      ctx.strokeStyle = 'hsl(120, 40%, 35%)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Process particles
      const rate = (sunlight * co2) / 5000;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Check if hit leaf
        const dx = p.x - cx;
        const dy = p.y - leafY;
        const inLeaf = (dx * dx) / (100 * 100) + (dy * dy) / (35 * 35) < 1;

        if (inLeaf && (p.type === 'co2' || p.type === 'photon')) {
          // Convert to O2
          if (Math.random() < rate) {
            particles[i] = {
              x: cx + (Math.random() - 0.5) * 60, y: leafY - 40,
              vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random(),
              type: 'o2', life: 200,
            };
          } else {
            particles.splice(i, 1);
            continue;
          }
        }

        if (p.life <= 0 || p.x > canvas.width || p.y > canvas.height || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.type === 'photon' ? 2 : 4, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'photon' ? 'hsl(45, 100%, 70%)' : p.type === 'co2' ? 'hsl(0, 60%, 50%)' : 'hsl(185, 100%, 55%)';
        ctx.fill();

        if (p.type !== 'photon') {
          ctx.fillStyle = 'white';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.type === 'co2' ? 'CO₂' : 'O₂', p.x, p.y - 6);
        }
      }

      // Labels
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂`, 15, canvas.height - 15);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [sunlight, co2]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">☀️ Sunlight: {sunlight}%</span>
          <input type="range" min="0" max="100" value={sunlight} onChange={e => setSunlight(+e.target.value)} className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">CO₂: {co2}%</span>
          <input type="range" min="0" max="100" value={co2} onChange={e => setCo2(+e.target.value)} className="w-24" />
        </label>
      </div>
    </div>
  );
};
