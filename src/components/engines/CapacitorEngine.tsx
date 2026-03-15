import { useRef, useEffect, useState } from 'react';

export const CapacitorEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capacitance, setCapacitance] = useState(100);
  const [resistance, setResistance] = useState(50);
  const [charging, setCharging] = useState(false);
  const chargeRef = useRef(0);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const rc = resistance * capacitance / 1000;
    let anim: number;

    const animate = () => {
      if (charging) {
        chargeRef.current += (1 - chargeRef.current) * (1 / (rc * 60));
      } else {
        chargeRef.current *= (1 - 1 / (rc * 60));
      }

      historyRef.current.push(chargeRef.current);
      if (historyRef.current.length > 300) historyRef.current.shift();

      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height * 0.35;

      // Capacitor plates
      const plateW = 6;
      const plateH = 80;
      const gap = 30 + (1 - chargeRef.current) * 20;
      const chargeColor = `hsl(${185 - chargeRef.current * 160}, 100%, 50%)`;

      ctx.fillStyle = chargeColor;
      ctx.fillRect(cx - gap / 2 - plateW, cy - plateH / 2, plateW, plateH);
      ctx.fillRect(cx + gap / 2, cy - plateH / 2, plateW, plateH);

      // + and - charges
      const numCharges = Math.floor(chargeRef.current * 8);
      for (let i = 0; i < numCharges; i++) {
        const yOff = (i / 8) * plateH - plateH / 2 + 10;
        ctx.fillStyle = 'hsl(0, 80%, 60%)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', cx - gap / 2 - plateW - 12, cy + yOff);
        ctx.fillStyle = 'hsl(200, 80%, 60%)';
        ctx.fillText('−', cx + gap / 2 + plateW + 12, cy + yOff);
      }

      // Circuit wires
      ctx.strokeStyle = 'hsl(0,0%,40%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - gap / 2 - plateW, cy);
      ctx.lineTo(cx - 120, cy);
      ctx.lineTo(cx - 120, cy + 60);
      ctx.lineTo(cx + 120, cy + 60);
      ctx.lineTo(cx + 120, cy);
      ctx.lineTo(cx + gap / 2 + plateW, cy);
      ctx.stroke();

      // Resistor symbol
      ctx.fillStyle = 'hsl(25, 100%, 55%)';
      ctx.fillRect(cx - 15, cy + 52, 30, 16);
      ctx.fillStyle = 'white';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${resistance}Ω`, cx, cy + 64);

      // Graph
      const graphX = 30;
      const graphY = canvas.height * 0.55;
      const graphW = canvas.width - 60;
      const graphH = canvas.height * 0.35;

      ctx.strokeStyle = 'hsl(0,0%,25%)';
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      ctx.beginPath();
      historyRef.current.forEach((v, i) => {
        const x = graphX + (i / 300) * graphW;
        const y = graphY + graphH - v * graphH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'hsl(185, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`V(t) = V₀(1-e^(-t/RC)) | RC = ${rc.toFixed(2)}s | Charge: ${(chargeRef.current * 100).toFixed(1)}%`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [capacitance, resistance, charging]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">C: {capacitance}μF</span>
          <input type="range" min="10" max="500" value={capacitance} onChange={e => setCapacitance(+e.target.value)} className="w-20" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">R: {resistance}Ω</span>
          <input type="range" min="10" max="200" value={resistance} onChange={e => setResistance(+e.target.value)} className="w-20" />
        </label>
        <button onClick={() => setCharging(v => !v)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          {charging ? '⚡ Discharge' : '🔋 Charge'}
        </button>
      </div>
    </div>
  );
};
