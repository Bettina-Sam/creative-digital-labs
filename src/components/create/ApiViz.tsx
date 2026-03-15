import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Globe } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const ApiViz = ({ isOpen, onClose }: Props) => {
  const [json, setJson] = useState('{\n  "name": "Digital Labs",\n  "version": "2.0",\n  "features": [\n    {"id": 1, "title": "Labs", "count": 30},\n    {"id": 2, "title": "Games", "count": 30},\n    {"id": 3, "title": "Tools", "count": 30}\n  ],\n  "active": true\n}');
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState('');

  const parse = () => {
    try { setParsed(JSON.parse(json)); setError(''); } catch (e: any) { setError(e.message); setParsed(null); }
  };

  const renderValue = (val: any, depth = 0): JSX.Element => {
    if (val === null) return <span className="text-muted-foreground">null</span>;
    if (typeof val === 'boolean') return <span className="text-neon-orange">{val.toString()}</span>;
    if (typeof val === 'number') return <span className="text-neon-cyan">{val}</span>;
    if (typeof val === 'string') return <span className="text-neon-lime">"{val}"</span>;
    if (Array.isArray(val)) return (
      <div className="ml-4 border-l border-border pl-3">
        {val.map((item, i) => <div key={i} className="my-1">[{i}]: {renderValue(item, depth + 1)}</div>)}
      </div>
    );
    if (typeof val === 'object') return (
      <div className="ml-4 border-l border-border pl-3">
        {Object.entries(val).map(([k, v]) => <div key={k} className="my-1"><span className="text-neon-magenta">{k}</span>: {renderValue(v, depth + 1)}</div>)}
      </div>
    );
    return <span>{String(val)}</span>;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-neon-lime" /><h2 className="font-bold">JSON / API Visualizer</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-0 divide-x divide-border h-[450px]">
              <div className="p-4 flex flex-col">
                <textarea value={json} onChange={e => setJson(e.target.value)} className="flex-1 w-full bg-background border border-border rounded-lg p-3 text-sm font-mono resize-none" />
                <div className="flex gap-2 mt-2">
                  <button onClick={parse} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Parse</button>
                  <button onClick={() => { try { setJson(JSON.stringify(JSON.parse(json), null, 2)); } catch {} }} className="px-4 py-2 rounded-lg glass-panel text-sm">Format</button>
                </div>
              </div>
              <div className="p-4 overflow-auto text-sm">
                {error && <p className="text-destructive text-sm">{error}</p>}
                {parsed && renderValue(parsed)}
                {!parsed && !error && <p className="text-muted-foreground">Click Parse to visualize</p>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
