import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

interface Element {
  symbol: string; name: string; number: number; color: string; category: string;
}

const elements: Element[] = [
  { symbol: 'H', name: 'Hydrogen', number: 1, color: '#00f0ff', category: 'Nonmetal' },
  { symbol: 'He', name: 'Helium', number: 2, color: '#ff00ff', category: 'Noble Gas' },
  { symbol: 'Li', name: 'Lithium', number: 3, color: '#ff6600', category: 'Alkali Metal' },
  { symbol: 'C', name: 'Carbon', number: 6, color: '#a0ff00', category: 'Nonmetal' },
  { symbol: 'N', name: 'Nitrogen', number: 7, color: '#00aaff', category: 'Nonmetal' },
  { symbol: 'O', name: 'Oxygen', number: 8, color: '#ff4444', category: 'Nonmetal' },
  { symbol: 'Na', name: 'Sodium', number: 11, color: '#ffaa00', category: 'Alkali Metal' },
  { symbol: 'Cl', name: 'Chlorine', number: 17, color: '#00ff88', category: 'Halogen' },
  { symbol: 'Fe', name: 'Iron', number: 26, color: '#cc8844', category: 'Transition Metal' },
  { symbol: 'Au', name: 'Gold', number: 79, color: '#ffd700', category: 'Transition Metal' },
];

const reactions: Record<string, { result: string; formula: string; description: string; color: string }> = {
  'H+O': { result: 'Water (H₂O)', formula: '2H₂ + O₂ → 2H₂O', description: 'Hydrogen burns in oxygen to form water!', color: '#00aaff' },
  'Na+Cl': { result: 'Table Salt (NaCl)', formula: 'Na + Cl → NaCl', description: 'Sodium reacts violently with chlorine to form common salt!', color: '#ffffff' },
  'C+O': { result: 'Carbon Dioxide (CO₂)', formula: 'C + O₂ → CO₂', description: 'Carbon combustion produces CO₂, a greenhouse gas.', color: '#888888' },
  'Fe+O': { result: 'Rust (Fe₂O₃)', formula: '4Fe + 3O₂ → 2Fe₂O₃', description: 'Iron oxidizes slowly to form rust.', color: '#cc4400' },
  'H+Cl': { result: 'Hydrochloric Acid (HCl)', formula: 'H₂ + Cl₂ → 2HCl', description: 'A strong acid used in industry and digestion.', color: '#88ff00' },
  'N+H': { result: 'Ammonia (NH₃)', formula: 'N₂ + 3H₂ → 2NH₃', description: 'Haber process — essential for fertilizers!', color: '#aaddff' },
};

const ChemistryLab = () => {
  const [selected, setSelected] = useState<Element[]>([]);
  const [reaction, setReaction] = useState<typeof reactions[string] | null>(null);
  const [showBubbles, setShowBubbles] = useState(false);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.chemistryLabWelcome'));
  }, [isEnabled]);

  const handleSelect = (el: Element) => {
    if (selected.length >= 2) return;
    const next = [...selected, el];
    setSelected(next);

    if (next.length === 2) {
      const key1 = `${next[0].symbol}+${next[1].symbol}`;
      const key2 = `${next[1].symbol}+${next[0].symbol}`;
      const result = reactions[key1] || reactions[key2];
      if (result) {
        setReaction(result);
        setShowBubbles(true);
        if (isEnabled) speak(result.description);
        setTimeout(() => setShowBubbles(false), 3000);
      } else {
        setReaction({ result: 'No reaction', formula: '—', description: 'These elements don\'t react in this simulation.', color: '#666' });
      }
      setTimeout(() => { setSelected([]); setReaction(null); }, 5000);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Link to="/experiments" className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Bubbles */}
      <AnimatePresence>
        {showBubbles && [...Array(20)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full" style={{ width: 8 + Math.random() * 20, height: 8 + Math.random() * 20, left: `${30 + Math.random() * 40}%`, background: reaction?.color || '#fff', opacity: 0.4 }}
            initial={{ bottom: '30%', scale: 0 }} animate={{ bottom: `${50 + Math.random() * 40}%`, scale: 1, opacity: [0.4, 0.8, 0] }} transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5 }} exit={{ opacity: 0 }} />
        ))}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-20">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-center mb-4">
          <span className="gradient-text">Chemistry Lab</span>
        </motion.h1>
        <p className="text-center text-muted-foreground mb-8">Select two elements to see if they react!</p>

        {/* Selected elements */}
        <div className="flex items-center justify-center gap-4 mb-8 h-24">
          {selected.map((el, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-xl flex flex-col items-center justify-center" style={{ border: `2px solid ${el.color}`, background: `${el.color}15` }}>
              <span className="text-2xl font-bold" style={{ color: el.color }}>{el.symbol}</span>
              <span className="text-xs text-muted-foreground">{el.name}</span>
            </motion.div>
          ))}
          {selected.length === 1 && <span className="text-2xl font-bold text-muted-foreground">+</span>}
          {selected.length === 1 && <div className="w-20 h-20 rounded-xl border-2 border-dashed border-muted flex items-center justify-center"><span className="text-muted-foreground">?</span></div>}
        </div>

        {/* Reaction result */}
        <AnimatePresence>
          {reaction && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel p-6 rounded-2xl max-w-lg mx-auto mb-8 text-center">
              <FlaskConical className="w-8 h-8 mx-auto mb-2" style={{ color: reaction.color }} />
              <h3 className="text-xl font-bold mb-1" style={{ color: reaction.color }}>{reaction.result}</h3>
              <p className="font-mono text-sm text-primary mb-2">{reaction.formula}</p>
              <p className="text-sm text-muted-foreground">{reaction.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Element grid */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-w-3xl mx-auto">
          {elements.map((el) => (
            <motion.button key={el.symbol} onClick={() => handleSelect(el)} disabled={selected.length >= 2}
              className="glass-panel p-2 rounded-xl text-center hover:scale-105 transition-transform disabled:opacity-50"
              whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
              style={{ borderColor: `${el.color}40` }}>
              <div className="text-xs text-muted-foreground">{el.number}</div>
              <div className="text-lg font-bold" style={{ color: el.color }}>{el.symbol}</div>
              <div className="text-[10px] text-muted-foreground truncate">{el.name}</div>
            </motion.button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">⚗️ Try: H+O (Water), Na+Cl (Salt), C+O (CO₂), Fe+O (Rust), N+H (Ammonia)</p>
      </div>
    </div>
  );
};

export default ChemistryLab;
