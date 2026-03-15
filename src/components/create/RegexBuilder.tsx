import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Terminal } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const RegexBuilder = ({ isOpen, onClose }: Props) => {
  const [pattern, setPattern] = useState('\\d{3}-\\d{4}');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Call 555-1234 or 800-5678 for info.');
  const [error, setError] = useState('');

  let matches: { index: number; match: string }[] = [];
  try {
    const re = new RegExp(pattern, flags);
    let m;
    if (flags.includes('g')) {
      while ((m = re.exec(testText)) !== null) {
        matches.push({ index: m.index, match: m[0] });
        if (!m[0]) break;
      }
    } else {
      m = re.exec(testText);
      if (m) matches.push({ index: m.index, match: m[0] });
    }
    if (error) setError('');
  } catch (e: any) { if (!error) setError(e.message); }

  const highlight = () => {
    if (!matches.length) return <span>{testText}</span>;
    const parts: JSX.Element[] = [];
    let last = 0;
    matches.forEach((m, i) => {
      if (m.index > last) parts.push(<span key={`t${i}`}>{testText.slice(last, m.index)}</span>);
      parts.push(<span key={`m${i}`} className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5">{m.match}</span>);
      last = m.index + m.match.length;
    });
    if (last < testText.length) parts.push(<span key="end">{testText.slice(last)}</span>);
    return parts;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Terminal className="w-5 h-5 text-neon-magenta" /><h2 className="font-bold">Regex Builder</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Pattern</label>
                  <input value={pattern} onChange={e => setPattern(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm" />
                </div>
                <div className="w-20">
                  <label className="text-xs text-muted-foreground">Flags</label>
                  <input value={flags} onChange={e => setFlags(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm" />
                </div>
              </div>
              {error && <p className="text-destructive text-xs">{error}</p>}
              <div>
                <label className="text-xs text-muted-foreground">Test String</label>
                <textarea value={testText} onChange={e => setTestText(e.target.value)} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div className="glass-panel p-4 rounded-xl text-sm leading-relaxed font-mono">{highlight()}</div>
              <p className="text-xs text-muted-foreground">{matches.length} match{matches.length !== 1 ? 'es' : ''} found</p>
              <div className="flex gap-2 flex-wrap">
                {[{ label: 'Email', p: '[\\w.-]+@[\\w.-]+\\.\\w+', t: 'Contact us at info@example.com or admin@test.org' },
                  { label: 'Phone', p: '\\d{3}-\\d{4}', t: 'Call 555-1234 or 800-5678 for info.' },
                  { label: 'URL', p: 'https?://[\\w./]+', t: 'Visit https://example.com or http://test.org/page' },
                ].map(ex => (
                  <button key={ex.label} onClick={() => { setPattern(ex.p); setTestText(ex.t); }} className="px-3 py-1 rounded-lg glass-panel text-xs">{ex.label}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
