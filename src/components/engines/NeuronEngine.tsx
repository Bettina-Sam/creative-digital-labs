import { useRef, useEffect, useState } from 'react';

interface Node { x: number; y: number; value: number; bias: number }

export const NeuronEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input1, setInput1] = useState(0.5);
  const [input2, setInput2] = useState(0.3);
  const [learningRate, setLearningRate] = useState(0.1);

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let anim: number;
    let pulse = 0;

    // Simple 2-2-1 network weights
    const weights = {
      h1: [0.5, 0.3, 0.1], // w1, w2, bias
      h2: [0.4, 0.6, -0.2],
      o: [0.7, 0.5, 0.1],
    };

    const animate = () => {
      pulse += 0.03;
      ctx.fillStyle = 'hsl(220, 30%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Forward pass
      const h1 = sigmoid(input1 * weights.h1[0] + input2 * weights.h1[1] + weights.h1[2]);
      const h2 = sigmoid(input1 * weights.h2[0] + input2 * weights.h2[1] + weights.h2[2]);
      const output = sigmoid(h1 * weights.o[0] + h2 * weights.o[1] + weights.o[2]);

      const layers = [
        [{ x: cx - 200, y: cy - 60, value: input1, bias: 0 }, { x: cx - 200, y: cy + 60, value: input2, bias: 0 }],
        [{ x: cx, y: cy - 60, value: h1, bias: weights.h1[2] }, { x: cx, y: cy + 60, value: h2, bias: weights.h2[2] }],
        [{ x: cx + 200, y: cy, value: output, bias: weights.o[2] }],
      ];

      // Draw connections
      for (let l = 0; l < layers.length - 1; l++) {
        layers[l].forEach(from => {
          layers[l + 1].forEach(to => {
            const signal = from.value * to.value;
            const p = Math.sin(pulse) * 0.5 + 0.5;

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = `hsla(185, 100%, 50%, ${0.1 + signal * 0.5})`;
            ctx.lineWidth = 1 + signal * 3;
            ctx.stroke();

            // Signal pulse
            const px = from.x + (to.x - from.x) * ((pulse * 0.3) % 1);
            const py = from.y + (to.y - from.y) * ((pulse * 0.3) % 1);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(85, 100%, 60%, ${signal})`;
            ctx.fill();
          });
        });
      }

      // Draw nodes
      layers.forEach((layer, l) => {
        layer.forEach(node => {
          const glow = node.value;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${l === 0 ? 185 : l === 1 ? 280 : 25}, 70%, ${20 + glow * 40}%, 0.8)`;
          ctx.fill();
          ctx.strokeStyle = `hsla(${l === 0 ? 185 : l === 1 ? 280 : 25}, 100%, 60%, 0.8)`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = 'white';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.value.toFixed(2), node.x, node.y + 4);
        });
      });

      // Labels
      ctx.fillStyle = 'hsl(0,0%,60%)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Input', cx - 200, cy + 110);
      ctx.fillText('Hidden', cx, cy + 110);
      ctx.fillText('Output', cx + 200, cy + 50);

      ctx.fillStyle = 'hsl(185, 100%, 70%)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`σ(x) = 1/(1+e⁻ˣ) | Output: ${output.toFixed(4)}`, 15, 25);

      anim = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [input1, input2, learningRate]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Input 1: {input1.toFixed(2)}</span>
          <input type="range" min="0" max="1" step="0.05" value={input1} onChange={e => setInput1(+e.target.value)} className="w-20" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Input 2: {input2.toFixed(2)}</span>
          <input type="range" min="0" max="1" step="0.05" value={input2} onChange={e => setInput2(+e.target.value)} className="w-20" />
        </label>
      </div>
    </div>
  );
};
