import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Copy, Check, RefreshCw, Eye, Accessibility } from 'lucide-react';

interface ColorLaboratoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ColorHarmony {
  name: string;
  colors: string[];
}

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const getContrastRatio = (hex1: string, hex2: string): number => {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;
    
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const ColorLaboratory = ({ isOpen, onClose }: ColorLaboratoryProps) => {
  const [baseHue, setBaseHue] = useState(185);
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(50);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const baseColor = useMemo(() => hslToHex(baseHue, saturation, lightness), [baseHue, saturation, lightness]);

  const harmonies: ColorHarmony[] = useMemo(() => [
    {
      name: 'Complementary',
      colors: [
        hslToHex(baseHue, saturation, lightness),
        hslToHex((baseHue + 180) % 360, saturation, lightness),
      ],
    },
    {
      name: 'Triadic',
      colors: [
        hslToHex(baseHue, saturation, lightness),
        hslToHex((baseHue + 120) % 360, saturation, lightness),
        hslToHex((baseHue + 240) % 360, saturation, lightness),
      ],
    },
    {
      name: 'Analogous',
      colors: [
        hslToHex((baseHue - 30 + 360) % 360, saturation, lightness),
        hslToHex(baseHue, saturation, lightness),
        hslToHex((baseHue + 30) % 360, saturation, lightness),
      ],
    },
    {
      name: 'Split-Complementary',
      colors: [
        hslToHex(baseHue, saturation, lightness),
        hslToHex((baseHue + 150) % 360, saturation, lightness),
        hslToHex((baseHue + 210) % 360, saturation, lightness),
      ],
    },
    {
      name: 'Tetradic',
      colors: [
        hslToHex(baseHue, saturation, lightness),
        hslToHex((baseHue + 90) % 360, saturation, lightness),
        hslToHex((baseHue + 180) % 360, saturation, lightness),
        hslToHex((baseHue + 270) % 360, saturation, lightness),
      ],
    },
  ], [baseHue, saturation, lightness]);

  const shades = useMemo(() => 
    [90, 75, 60, 50, 40, 25, 10].map(l => hslToHex(baseHue, saturation, l)),
  [baseHue, saturation]);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const contrastWithWhite = getContrastRatio(baseColor, '#ffffff');
  const contrastWithBlack = getContrastRatio(baseColor, '#000000');

  const randomize = () => {
    setBaseHue(Math.floor(Math.random() * 360));
    setSaturation(50 + Math.floor(Math.random() * 50));
    setLightness(30 + Math.floor(Math.random() * 40));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-neon-lime" />
                <h2 className="text-xl font-bold">Color Laboratory</h2>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={randomize}
                  className="p-2 hover:bg-muted rounded-lg"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Color Picker */}
                <div>
                  <h3 className="font-bold mb-4">Base Color</h3>
                  
                  {/* Preview */}
                  <motion.div
                    className="w-full h-32 rounded-xl mb-4 flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: baseColor }}
                    onClick={() => copyColor(baseColor)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="font-mono font-bold text-lg" style={{ 
                      color: contrastWithWhite > contrastWithBlack ? '#fff' : '#000' 
                    }}>
                      {copiedColor === baseColor ? <Check className="w-6 h-6" /> : baseColor}
                    </span>
                  </motion.div>

                  {/* Sliders */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground flex justify-between mb-1">
                        <span>Hue</span>
                        <span className="font-mono">{baseHue}°</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={baseHue}
                        onChange={e => setBaseHue(Number(e.target.value))}
                        className="w-full"
                        style={{
                          background: `linear-gradient(to right, 
                            hsl(0, ${saturation}%, ${lightness}%), 
                            hsl(60, ${saturation}%, ${lightness}%), 
                            hsl(120, ${saturation}%, ${lightness}%), 
                            hsl(180, ${saturation}%, ${lightness}%), 
                            hsl(240, ${saturation}%, ${lightness}%), 
                            hsl(300, ${saturation}%, ${lightness}%), 
                            hsl(360, ${saturation}%, ${lightness}%))`
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground flex justify-between mb-1">
                        <span>Saturation</span>
                        <span className="font-mono">{saturation}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={saturation}
                        onChange={e => setSaturation(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground flex justify-between mb-1">
                        <span>Lightness</span>
                        <span className="font-mono">{lightness}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={lightness}
                        onChange={e => setLightness(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Accessibility */}
                  <div className="mt-6 p-4 bg-background/50 rounded-xl">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Accessibility className="w-4 h-4" /> Contrast Check
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: baseColor, color: '#fff' }}>
                        <p className="text-xs mb-1">vs White</p>
                        <p className="font-bold">{contrastWithWhite.toFixed(1)}:1</p>
                        <p className="text-xs">{contrastWithWhite >= 4.5 ? '✓ AA' : contrastWithWhite >= 3 ? '✓ Large' : '✗ Fail'}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: baseColor, color: '#000' }}>
                        <p className="text-xs mb-1">vs Black</p>
                        <p className="font-bold">{contrastWithBlack.toFixed(1)}:1</p>
                        <p className="text-xs">{contrastWithBlack >= 4.5 ? '✓ AA' : contrastWithBlack >= 3 ? '✓ Large' : '✗ Fail'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Harmonies */}
                <div>
                  <h3 className="font-bold mb-4">Color Harmonies</h3>
                  <div className="space-y-4">
                    {harmonies.map(harmony => (
                      <div key={harmony.name}>
                        <p className="text-xs text-muted-foreground mb-2">{harmony.name}</p>
                        <div className="flex gap-2">
                          {harmony.colors.map((color, i) => (
                            <motion.button
                              key={i}
                              className="flex-1 h-12 rounded-lg relative overflow-hidden"
                              style={{ backgroundColor: color }}
                              onClick={() => copyColor(color)}
                              whileHover={{ scale: 1.05 }}
                            >
                              {copiedColor === color && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shades */}
                  <div className="mt-6">
                    <h4 className="text-sm font-bold mb-3">Shades</h4>
                    <div className="flex gap-1 rounded-xl overflow-hidden">
                      {shades.map((shade, i) => (
                        <motion.button
                          key={i}
                          className="flex-1 h-10"
                          style={{ backgroundColor: shade }}
                          onClick={() => copyColor(shade)}
                          whileHover={{ scale: 1.1, zIndex: 10 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
