import { useState, useEffect, useRef } from 'react';
interface Props { difficulty: 'Easy' | 'Medium' | 'Hard'; onScoreUpdate: (p: number) => void; isPlaying: boolean; }
export const LightPathGame = ({ difficulty, onScoreUpdate, isPlaying }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mirrorsRef = useRef<{ x: number; y: number; angle: number }[]>([]);
  const [score, setScore] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const count = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 5 : 7;
    mirrorsRef.current = Array.from({ length: count }, () => ({
      x: 100 + Math.random() * (c.width - 200), y: 50 + Math.random() * (c.height - 100), angle: Math.random() * Math.PI
    }));
    draw();
  }, [isPlaying, difficulty]);
  const draw = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, c.width, c.height);
    // Source
    ctx.fillStyle = '#ff9500'; ctx.beginPath(); ctx.arc(30, c.height / 2, 10, 0, Math.PI * 2); ctx.fill();
    // Target
    ctx.fillStyle = '#a3ff12'; ctx.beginPath(); ctx.arc(c.width - 30, c.height / 2, 10, 0, Math.PI * 2); ctx.fill();
    // Mirrors
    mirrorsRef.current.forEach(m => {
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.angle);
      ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-25, 0); ctx.lineTo(25, 0); ctx.stroke();
      ctx.restore();
    });
    // Simple ray
    ctx.strokeStyle = '#ff6ec7'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(30, c.height / 2);
    let rx = 30, ry = c.height / 2, rdx = 1, rdy = 0;
    for (let i = 0; i < 500; i++) {
      rx += rdx * 2; ry += rdy * 2;
      if (rx > c.width || rx < 0 || ry > c.height || ry < 0) break;
      mirrorsRef.current.forEach(m => {
        if (Math.abs(rx - m.x) < 25 && Math.abs(ry - m.y) < 5) {
          rdy = -rdy + Math.sin(m.angle) * 0.5;
          rdx = Math.cos(m.angle);
        }
      });
      ctx.lineTo(rx, ry);
    }
    ctx.stroke(); ctx.setLineDash([]);
  };
  const handleClick = (e: React.MouseEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    // Find nearest mirror and rotate it
    let nearest = -1, minDist = Infinity;
    mirrorsRef.current.forEach((m, i) => {
      const d = Math.hypot(m.x - x, m.y - y);
      if (d < minDist) { minDist = d; nearest = i; }
    });
    if (nearest >= 0 && minDist < 40) {
      mirrorsRef.current[nearest].angle += Math.PI / 8;
      onScoreUpdate(2);
      draw();
    }
  };
  if (!isPlaying) return null;
  return <canvas ref={canvasRef} onClick={handleClick} className="absolute inset-0 w-full h-full cursor-pointer" />;
};
