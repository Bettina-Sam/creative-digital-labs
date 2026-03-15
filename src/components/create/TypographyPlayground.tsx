import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const fontFamilies = [
  'Georgia, serif', 'Courier New, monospace', 'Arial, sans-serif', 'Impact, sans-serif',
  'Palatino, serif', 'Lucida Console, monospace', 'Comic Sans MS, cursive', 'Trebuchet MS, sans-serif',
];

const effects = [
  { id: 'none', label: 'None' },
  { id: 'glow', label: 'Neon Glow' },
  { id: 'shadow', label: 'Drop Shadow' },
  { id: 'outline', label: 'Outline' },
  { id: 'gradient', label: 'Gradient' },
];

export const TypographyPlayground = ({ isOpen, onClose }: Props) => {
  const [text, setText] = useState('Creative Labs');
  const [font, setFont] = useState(fontFamilies[0]);
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(700);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [color, setColor] = useState('#00f0ff');
  const [effect, setEffect] = useState('none');

  if (!isOpen) return null;

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: font, fontSize: size, fontWeight: weight,
      letterSpacing: `${letterSpacing}px`, lineHeight: lineHeight,
      color, textAlign: 'center', wordBreak: 'break-word',
    };
    if (effect === 'glow') { base.textShadow = `0 0 20px ${color}, 0 0 40px ${color}80, 0 0 80px ${color}40`; }
    if (effect === 'shadow') { base.textShadow = '4px 4px 8px rgba(0,0,0,0.5)'; }
    if (effect === 'outline') { base.WebkitTextStroke = `2px ${color}`; base.color = 'transparent'; }
    if (effect === 'gradient') { base.background = `linear-gradient(135deg, ${color}, #ff00ff, #a0ff00)`; base.WebkitBackgroundClip = 'text'; base.WebkitTextFillColor = 'transparent'; }
    return base;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold gradient-text">Typography Playground</h2>
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg bg-muted">✕</button>
        </div>

        {/* Preview */}
        <div className="min-h-[200px] glass-panel rounded-xl p-8 mb-4 flex items-center justify-center">
          <div style={getStyle()}>{text}</div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="col-span-2 md:col-span-3">
            <input value={text} onChange={e => setText(e.target.value)} className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm" placeholder="Type your text..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Font</label>
            <select value={font} onChange={e => setFont(e.target.value)} className="w-full bg-muted/50 rounded-lg px-2 py-1.5 text-xs mt-1">
              {fontFamilies.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Size: {size}px</label>
            <input type="range" min="12" max="120" value={size} onChange={e => setSize(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Weight: {weight}</label>
            <input type="range" min="100" max="900" step="100" value={weight} onChange={e => setWeight(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Spacing: {letterSpacing}px</label>
            <input type="range" min="-5" max="20" value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Line Height: {lineHeight}</label>
            <input type="range" min="0.8" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 rounded cursor-pointer mt-1" />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Effect</label>
            <div className="flex gap-2">
              {effects.map(e => (
                <button key={e.id} onClick={() => setEffect(e.id)} className={`text-xs px-3 py-1.5 rounded-lg ${effect === e.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>{e.label}</button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
