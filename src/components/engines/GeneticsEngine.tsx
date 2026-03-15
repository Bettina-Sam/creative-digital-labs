import { useRef, useEffect, useState } from 'react';

type Allele = 'A' | 'a';
type Genotype = [Allele, Allele];

export const GeneticsEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [parent1, setParent1] = useState<Genotype>(['A', 'a']);
  const [parent2, setParent2] = useState<Genotype>(['A', 'a']);
  const [generations, setGenerations] = useState(0);

  const getPunnett = (): Genotype[] => {
    const results: Genotype[] = [];
    parent1.forEach(a1 => parent2.forEach(a2 => results.push([a1, a2].sort() as Genotype)));
    return results;
  };

  const phenotype = (g: Genotype) => g.includes('A') ? 'Dominant' : 'Recessive';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const offspring = getPunnett();

    ctx.fillStyle = 'hsl(220, 30%, 6%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const startY = 50;

    // Title
    ctx.fillStyle = 'hsl(185, 100%, 70%)';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Punnett Square', cx, startY);

    // Punnett square
    const sqSize = 70;
    const sqX = cx - sqSize * 1.5;
    const sqY = startY + 40;

    // Headers
    ctx.fillStyle = 'hsl(85, 100%, 55%)';
    ctx.font = 'bold 18px monospace';
    parent1.forEach((a, i) => {
      ctx.fillText(a, sqX + sqSize * (i + 1) + sqSize / 2, sqY + sqSize / 2);
    });
    parent2.forEach((a, i) => {
      ctx.fillText(a, sqX + sqSize / 2, sqY + sqSize * (i + 1) + sqSize / 2);
    });

    // Grid
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const gx = sqX + sqSize * (c + 1);
        const gy = sqY + sqSize * (r + 1);
        const genotype: Genotype = [parent2[r], parent1[c]].sort() as Genotype;
        const isDom = genotype.includes('A');

        ctx.fillStyle = isDom ? 'hsla(185, 60%, 30%, 0.5)' : 'hsla(320, 60%, 30%, 0.5)';
        ctx.fillRect(gx, gy, sqSize, sqSize);
        ctx.strokeStyle = 'hsl(0,0%,30%)';
        ctx.lineWidth = 1;
        ctx.strokeRect(gx, gy, sqSize, sqSize);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(genotype.join(''), gx + sqSize / 2, gy + sqSize / 2 + 7);
      }
    }

    // Stats
    const domCount = offspring.filter(o => o.includes('A')).length;
    const recCount = offspring.length - domCount;
    const homoD = offspring.filter(o => o[0] === 'A' && o[1] === 'A').length;
    const hetero = offspring.filter(o => (o[0] === 'A' && o[1] === 'a') || (o[0] === 'a' && o[1] === 'A')).length;
    const homoR = offspring.filter(o => o[0] === 'a' && o[1] === 'a').length;

    const statY = sqY + sqSize * 3 + 30;
    ctx.fillStyle = 'hsl(185, 100%, 70%)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Genotype ratio: AA:Aa:aa = ${homoD}:${hetero}:${homoR}`, 30, statY);
    ctx.fillText(`Phenotype ratio: Dominant:Recessive = ${domCount}:${recCount}`, 30, statY + 25);
    ctx.fillText(`Parent 1: ${parent1.join('')} | Parent 2: ${parent2.join('')}`, 30, statY + 50);

    return () => { window.removeEventListener('resize', resize); };
  }, [parent1, parent2, generations]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<Genotype>>, idx: number) => {
    setter(prev => {
      const next = [...prev] as Genotype;
      next[idx] = next[idx] === 'A' ? 'a' : 'A';
      return next;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <canvas ref={canvasRef} className="flex-1 w-full" />
      <div className="glass-panel p-4 flex flex-wrap items-center gap-6 justify-center">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Parent 1:</span>
          {parent1.map((a, i) => (
            <button key={i} onClick={() => toggle(setParent1, i)} className={`w-8 h-8 rounded font-bold ${a === 'A' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{a}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Parent 2:</span>
          {parent2.map((a, i) => (
            <button key={i} onClick={() => toggle(setParent2, i)} className={`w-8 h-8 rounded font-bold ${a === 'A' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
