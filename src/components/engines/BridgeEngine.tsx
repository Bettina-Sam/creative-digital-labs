import { useRef, useEffect, useState } from 'react';

interface TrussNode { x: number; y: number; fixed: boolean }
interface TrussMember { a: number; b: number; stress: number }

export const BridgeEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [load, setLoad] = useState(100);
  const [trussType, setTrussType] = useState<'warren' | 'pratt' | 'howe'>('warren');

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

      const cx = canvas.width / 2;
      const bridgeY = canvas.height * 0.45;
      const span = Math.min(canvas.width - 100, 600);
      const panels = 6;
      const panelW = span / panels;
      const trussH = 60;

      const nodes: TrussNode[] = [];
      const members: TrussMember[] = [];

      // Bottom chord nodes
      for (let i = 0; i <= panels; i++) {
        nodes.push({ x: cx - span / 2 + i * panelW, y: bridgeY, fixed: i === 0 || i === panels });
      }
      // Top chord nodes
      for (let i = 0; i <= panels; i++) {
        nodes.push({ x: cx - span / 2 + i * panelW, y: bridgeY - trussH, fixed: false });
      }

      // Bottom chord
      for (let i = 0; i < panels; i++) members.push({ a: i, b: i + 1, stress: 0 });
      // Top chord
      for (let i = 0; i < panels; i++) members.push({ a: panels + 1 + i, b: panels + 2 + i, stress: 0 });
      // Verticals
      for (let i = 0; i <= panels; i++) members.push({ a: i, b: panels + 1 + i, stress: 0 });
      // Diagonals
      for (let i = 0; i < panels; i++) {
        if (trussType === 'warren') {
          members.push({ a: i, b: panels + 2 + i, stress: 0 });
          members.push({ a: i + 1, b: panels + 1 + i, stress: 0 });
        } else if (trussType === 'pratt') {
          members.push({ a: i, b: panels + 2 + i, stress: 0 });
        } else {
          members.push({ a: i + 1, b: panels + 1 + i, stress: 0 });
        }
      }

      // Simple stress estimation
      members.forEach(m => {
        const midX = (nodes[m.a].x + nodes[m.b].x) / 2;
        const distFromCenter = Math.abs(midX - cx) / (span / 2);
        m.stress = load * (1 - distFromCenter) * 0.01;
        const isVertical = Math.abs(nodes[m.a].x - nodes[m.b].x) < 2;
        if (isVertical) m.stress *= 0.5;
      });

      // Draw deformed structure
      members.forEach(m => {
        const na = nodes[m.a];
        const nb = nodes[m.b];
        const deformA = na.fixed ? 0 : m.stress * 0.3;
        const deformB = nb.fixed ? 0 : m.stress * 0.3;

        ctx.beginPath();
        ctx.moveTo(na.x, na.y + deformA);
        ctx.lineTo(nb.x, nb.y + deformB);

        const stressRatio = Math.min(1, m.stress / (load * 0.015));
        const hue = 120 - stressRatio * 120;
        ctx.strokeStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.fixed ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = n.fixed ? 'hsl(25, 100%, 55%)' : 'hsl(185, 100%, 55%)';
        ctx.fill();
      });

      // Supports
      nodes.filter(n => n.fixed).forEach(n => {
        ctx.beginPath();
        ctx.moveTo(n.x - 12, n.y + 15);
        ctx.lineTo(n.x + 12, n.y + 15);
        ctx.lineTo(n.x, n.y);
        ctx.closePath();
        ctx.fillStyle = 'hsl(0,0%,35%)';
        ctx.fill();
      });

      // Load arrow at center
      ctx.beginPath();
      ctx.moveTo(cx, bridgeY - 5);
      ctx.lineTo(cx, bridgeY - 40);
      ctx.moveTo(cx - 6, bridgeY - 15);
      ctx.lineTo(cx, bridgeY - 5);
      ctx.lineTo(cx + 6, bridgeY - 15);
      ctx.strokeStyle = 'hsl(0, 80%, 55%)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'hsl(0, 80%, 55%)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${load}N`, cx, bridgeY - 45);

      // Ground
      ctx.fillStyle = 'hsl(30, 30%, 20%)';
      ctx.fillRect(0, bridgeY + 20, canvas.width, canvas.height - bridgeY - 20);

      // Legend
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${trussType.charAt(0).toUpperCase() + trussType.slice(1)} Truss | Load: ${load}N | Members: ${members.length}`, 15, 25);
      ctx.fillText('Green = low stress | Red = high stress', 15, 45);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [load, trussType]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Load: {load}N</span>
          <input type="range" min="10" max="500" value={load} onChange={e => setLoad(+e.target.value)} className="w-24" />
        </label>
        {(['warren', 'pratt', 'howe'] as const).map(t => (
          <button key={t} onClick={() => setTrussType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${trussType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
