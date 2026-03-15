import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ASCII_CHARS = ' .:-=+*#%@';

export const AsciiArtGenerator = ({ isOpen, onClose }: Props) => {
  const [text, setText] = useState('HELLO');
  const [style, setStyle] = useState<'block' | 'banner' | 'shadow'>('block');

  const generateAscii = (input: string): string => {
    const blockFont: Record<string, string[]> = {
      'A': ['  █  ', ' █ █ ', '█████', '█   █', '█   █'],
      'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
      'C': [' ████', '█    ', '█    ', '█    ', ' ████'],
      'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
      'E': ['█████', '█    ', '███  ', '█    ', '█████'],
      'F': ['█████', '█    ', '███  ', '█    ', '█    '],
      'G': [' ████', '█    ', '█  ██', '█   █', ' ████'],
      'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
      'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
      'J': ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
      'K': ['█  █ ', '█ █  ', '██   ', '█ █  ', '█  █ '],
      'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
      'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
      'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
      'O': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
      'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
      'Q': [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
      'R': ['████ ', '█   █', '████ ', '█ █  ', '█  █ '],
      'S': [' ████', '█    ', ' ███ ', '    █', '████ '],
      'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
      'U': ['█   █', '█   █', '█   █', '█   █', ' ███ '],
      'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
      'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
      'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
      'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
      'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
      ' ': ['     ', '     ', '     ', '     ', '     '],
      '!': ['  █  ', '  █  ', '  █  ', '     ', '  █  '],
    };

    const chars = input.toUpperCase().split('');
    const lines: string[] = ['', '', '', '', ''];
    for (const ch of chars) {
      const glyph = blockFont[ch] || blockFont[' '];
      for (let row = 0; row < 5; row++) {
        lines[row] += (glyph?.[row] || '     ') + ' ';
      }
    }
    return lines.join('\n');
  };

  if (!isOpen) return null;

  const asciiOutput = generateAscii(text);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel rounded-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold gradient-text">ASCII Art Generator</h2>
          <div className="flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(asciiOutput)} className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary">Copy</button>
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg bg-muted">✕</button>
          </div>
        </div>

        <input value={text} onChange={e => setText(e.target.value.slice(0, 10))} className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm mb-4" placeholder="Type text (max 10 chars)..." maxLength={10} />

        <div className="bg-background/80 rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-xs md:text-sm font-mono text-neon-cyan whitespace-pre leading-tight">{asciiOutput}</pre>
        </div>

        <p className="text-xs text-muted-foreground">🔤 Type any text to see it rendered in ASCII block art. Letters A-Z and space are supported.</p>
      </motion.div>
    </motion.div>
  );
};
