import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Type } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

const symbols: Record<string, string> = {
  'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'theta': 'θ',
  'pi': 'π', 'sigma': 'Σ', 'integral': '∫', 'sqrt': '√', 'infinity': '∞',
  'partial': '∂', 'nabla': '∇', 'pm': '±', 'leq': '≤', 'geq': '≥',
  'neq': '≠', 'approx': '≈', 'times': '×', 'div': '÷', 'arrow': '→',
};

export const LatexRender = ({ isOpen, onClose }: Props) => {
  const [input, setInput] = useState('E = mc²');
  const [fontSize, setFontSize] = useState(32);

  const renderFormula = (text: string) => {
    let result = text;
    Object.entries(symbols).forEach(([key, val]) => {
      result = result.replace(new RegExp(`\\\\${key}`, 'g'), val);
    });
    // Superscript: ^{...} or ^x
    result = result.replace(/\^{([^}]+)}/g, (_, s) => s.split('').map((c: string) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] || c).join(''));
    result = result.replace(/\^(\w)/g, (_, c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] || c);
    // Subscript: _{...}
    result = result.replace(/_{([^}]+)}/g, (_, s) => s.split('').map((c: string) => '₀₁₂₃₄₅₆₇₈₉'[+c] || c).join(''));
    result = result.replace(/_(\w)/g, (_, c) => '₀₁₂₃₄₅₆₇₈₉'[+c] || c);
    return result;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Type className="w-5 h-5 text-neon-magenta" /><h2 className="font-bold">Math Formula Display</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="w-full h-32 rounded-xl bg-background/50 border border-border flex items-center justify-center">
                <span style={{ fontSize }} className="text-neon-cyan font-serif">{renderFormula(input)}</span>
              </div>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm" placeholder="Type formula..." />
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Size: {fontSize}px</label>
                <input type="range" min="16" max="64" value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-24" />
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(symbols).map(([key, val]) => (
                  <button key={key} onClick={() => setInput(i => i + `\\${key}`)} className="px-2 py-1 rounded glass-panel text-sm" title={`\\${key}`}>{val}</button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {['E = mc^2', 'F = G\\times m_1 m_2 / r^2', '\\integral f(x) dx', '\\nabla \\times E = -\\partial B/\\partial t'].map(f => (
                  <button key={f} onClick={() => setInput(f)} className="px-2 py-1 rounded-lg glass-panel text-xs font-mono">{f.slice(0, 20)}...</button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
