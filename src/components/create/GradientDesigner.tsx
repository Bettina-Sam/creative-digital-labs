import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Palette, RotateCcw } from 'lucide-react';

interface GradientDesignerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GradientStop {
  color: string;
  position: number;
}

const presets = [
  { name: 'Neon Glow', stops: [{ color: '#00e5ff', position: 0 }, { color: '#ff00aa', position: 100 }], angle: 135 },
  { name: 'Sunset', stops: [{ color: '#ff6b35', position: 0 }, { color: '#f7c948', position: 50 }, { color: '#ff3366', position: 100 }], angle: 135 },
  { name: 'Ocean', stops: [{ color: '#0077b6', position: 0 }, { color: '#00b4d8', position: 50 }, { color: '#90e0ef', position: 100 }], angle: 180 },
  { name: 'Aurora', stops: [{ color: '#00ff87', position: 0 }, { color: '#7b2ff7', position: 50 }, { color: '#00e5ff', position: 100 }], angle: 45 },
  { name: 'Fire', stops: [{ color: '#ff0000', position: 0 }, { color: '#ff6600', position: 50 }, { color: '#ffcc00', position: 100 }], angle: 0 },
  { name: 'Lavender', stops: [{ color: '#e0aaff', position: 0 }, { color: '#9d4edd', position: 50 }, { color: '#5a189a', position: 100 }], angle: 135 },
];

export const GradientDesigner = ({ isOpen, onClose }: GradientDesignerProps) => {
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#00e5ff', position: 0 },
    { color: '#ff00aa', position: 100 },
  ]);
  const [angle, setAngle] = useState(135);
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [copied, setCopied] = useState(false);

  const getGradientCSS = useCallback(() => {
    const stopsStr = stops
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');

    if (gradientType === 'radial') {
      return `radial-gradient(circle, ${stopsStr})`;
    }
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }, [stops, angle, gradientType]);

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(`background: ${getGradientCSS()};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getGradientCSS]);

  const addStop = useCallback(() => {
    if (stops.length >= 5) return;
    setStops(prev => [...prev, { color: '#ffffff', position: 50 }]);
  }, [stops.length]);

  const removeStop = useCallback((index: number) => {
    if (stops.length <= 2) return;
    setStops(prev => prev.filter((_, i) => i !== index));
  }, [stops.length]);

  const applyPreset = useCallback((preset: typeof presets[0]) => {
    setStops(preset.stops);
    setAngle(preset.angle);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Gradient Designer
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* Preview */}
            <div
              className="w-full h-48 rounded-2xl border border-border"
              style={{ background: getGradientCSS() }}
            />

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Stops */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Color Stops</label>
                {stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={e => setStops(prev => prev.map((s, j) => j === i ? { ...s, color: e.target.value } : s))}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={e => setStops(prev => prev.map((s, j) => j === i ? { ...s, position: Number(e.target.value) } : s))}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-8">{stop.position}%</span>
                    {stops.length > 2 && (
                      <button onClick={() => removeStop(i)} className="text-xs text-destructive hover:text-destructive/80">✕</button>
                    )}
                  </div>
                ))}
                {stops.length < 5 && (
                  <button onClick={addStop} className="text-xs text-primary hover:underline">+ Add Stop</button>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex gap-2 mt-2">
                    {(['linear', 'radial'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setGradientType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${gradientType === type ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground'}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {gradientType === 'linear' && (
                  <div>
                    <label className="text-sm font-medium flex justify-between">
                      <span>Angle</span>
                      <span className="font-mono text-muted-foreground">{angle}°</span>
                    </label>
                    <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full mt-2" />
                  </div>
                )}

                {/* CSS Output */}
                <div>
                  <label className="text-sm font-medium">CSS Code</label>
                  <div className="mt-2 bg-background/50 rounded-lg p-3 font-mono text-xs text-neon-cyan break-all">
                    background: {getGradientCSS()};
                  </div>
                </div>

                <motion.button
                  onClick={copyCSS}
                  className="w-full py-2.5 rounded-xl bg-primary/20 text-primary font-medium flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy CSS'}
                </motion.button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-sm font-medium mb-3 block">Presets</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {presets.map(preset => (
                  <motion.button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="space-y-1"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="w-full h-12 rounded-lg border border-border"
                      style={{
                        background: `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{preset.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
