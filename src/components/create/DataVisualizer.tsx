import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3 } from 'lucide-react';

interface DataVisualizerProps { isOpen: boolean; onClose: () => void; }

const sampleDatasets = [
  { name: 'Planets', data: [{ label: 'Mercury', value: 0.39 }, { label: 'Venus', value: 0.72 }, { label: 'Earth', value: 1 }, { label: 'Mars', value: 1.52 }, { label: 'Jupiter', value: 5.2 }, { label: 'Saturn', value: 9.5 }] },
  { name: 'Elements', data: [{ label: 'H', value: 1 }, { label: 'He', value: 4 }, { label: 'Li', value: 7 }, { label: 'C', value: 12 }, { label: 'N', value: 14 }, { label: 'O', value: 16 }, { label: 'Fe', value: 56 }] },
  { name: 'Frequencies', data: [{ label: 'C', value: 262 }, { label: 'D', value: 294 }, { label: 'E', value: 330 }, { label: 'F', value: 349 }, { label: 'G', value: 392 }, { label: 'A', value: 440 }, { label: 'B', value: 494 }] },
];

type ChartType = 'bar' | 'pie' | 'line';

export const DataVisualizer = ({ isOpen, onClose }: DataVisualizerProps) => {
  const [datasetIdx, setDatasetIdx] = useState(0);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const dataset = sampleDatasets[datasetIdx];
  const maxVal = Math.max(...dataset.data.map(d => d.value));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Data Visualizer</h2>
            <div className="flex gap-2 items-center">
              {sampleDatasets.map((ds, i) => (
                <button key={ds.name} onClick={() => setDatasetIdx(i)} className={`px-3 py-1 rounded-lg text-xs ${datasetIdx === i ? 'bg-primary/20 text-primary' : 'bg-muted/30'}`}>{ds.name}</button>
              ))}
              {(['bar', 'pie', 'line'] as ChartType[]).map(ct => (
                <button key={ct} onClick={() => setChartType(ct)} className={`px-3 py-1 rounded-lg text-xs capitalize ${chartType === ct ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-muted/30'}`}>{ct}</button>
              ))}
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            {chartType === 'bar' && (
              <div className="flex items-end gap-4 h-64">
                {dataset.data.map((d, i) => (
                  <div key={d.label} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{d.value}</span>
                    <motion.div initial={{ height: 0 }} animate={{ height: (d.value / maxVal) * 200 }} transition={{ delay: i * 0.05, type: 'spring' }} className="w-10 rounded-t-lg" style={{ backgroundColor: `hsl(${(i / dataset.data.length) * 300}, 80%, 60%)` }} />
                    <span className="text-xs font-mono font-bold">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
            {chartType === 'pie' && (
              <svg width={250} height={250} viewBox="0 0 250 250">
                {(() => {
                  const total = dataset.data.reduce((s, d) => s + d.value, 0);
                  let acc = 0;
                  return dataset.data.map((d, i) => {
                    const start = acc / total * Math.PI * 2 - Math.PI / 2;
                    acc += d.value;
                    const end = acc / total * Math.PI * 2 - Math.PI / 2;
                    const large = end - start > Math.PI ? 1 : 0;
                    const x1 = 125 + 100 * Math.cos(start), y1 = 125 + 100 * Math.sin(start);
                    const x2 = 125 + 100 * Math.cos(end), y2 = 125 + 100 * Math.sin(end);
                    return <path key={d.label} d={`M125,125 L${x1},${y1} A100,100 0 ${large},1 ${x2},${y2} Z`} fill={`hsl(${(i / dataset.data.length) * 300}, 80%, 60%)`} stroke="#0a0a0f" strokeWidth="2" />;
                  });
                })()}
              </svg>
            )}
            {chartType === 'line' && (
              <svg width={400} height={250} viewBox="0 0 400 250">
                <polyline fill="none" stroke="hsl(185, 100%, 50%)" strokeWidth="3" points={dataset.data.map((d, i) => `${40 + (i / (dataset.data.length - 1)) * 340},${220 - (d.value / maxVal) * 190}`).join(' ')} />
                {dataset.data.map((d, i) => (
                  <g key={d.label}>
                    <circle cx={40 + (i / (dataset.data.length - 1)) * 340} cy={220 - (d.value / maxVal) * 190} r={5} fill="hsl(185, 100%, 50%)" />
                    <text x={40 + (i / (dataset.data.length - 1)) * 340} y={240} textAnchor="middle" fill="hsl(0,0%,60%)" fontSize="10">{d.label}</text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
