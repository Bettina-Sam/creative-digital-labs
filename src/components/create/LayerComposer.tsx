import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Plus, Trash2, Eye, EyeOff, Move, Download, ChevronUp, ChevronDown } from 'lucide-react';

interface LayerComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Layer {
  id: string;
  name: string;
  type: 'particles' | 'gradient' | 'noise' | 'shape';
  visible: boolean;
  opacity: number;
  settings: Record<string, unknown>;
}

const layerTypes = [
  { type: 'particles', name: 'Particles', color: '#00FFD1' },
  { type: 'gradient', name: 'Gradient', color: '#FF00FF' },
  { type: 'noise', name: 'Noise', color: '#CCFF00' },
  { type: 'shape', name: 'Shape', color: '#FF6600' },
] as const;

export const LayerComposer = ({ isOpen, onClose }: LayerComposerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      name: 'Background Gradient',
      type: 'gradient',
      visible: true,
      opacity: 1,
      settings: { color1: '#0a0a0f', color2: '#1a1a2f', angle: 45 },
    },
    {
      id: '2',
      name: 'Particle Field',
      type: 'particles',
      visible: true,
      opacity: 0.8,
      settings: { count: 100, color: '#00FFD1', speed: 1 },
    },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const animationRef = useRef<number>();

  const addLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.length + 1}`,
      type,
      visible: true,
      opacity: 1,
      settings: getDefaultSettings(type),
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const getDefaultSettings = (type: Layer['type']): Record<string, unknown> => {
    switch (type) {
      case 'particles': return { count: 50, color: '#00FFD1', speed: 1, size: 3 };
      case 'gradient': return { color1: '#00FFD1', color2: '#FF00FF', angle: 0 };
      case 'noise': return { scale: 50, intensity: 0.5 };
      case 'shape': return { shapeType: 'circle', x: 0.5, y: 0.5, size: 100, color: '#CCFF00' };
    }
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayer === id) setSelectedLayer(null);
  };

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === layers.length - 1)) return;
    
    const newLayers = [...layers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const updateLayerOpacity = (id: string, opacity: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, opacity } : l));
  };

  // Render layers to canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let particles: { x: number; y: number; vx: number; vy: number }[] = [];
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      layers.forEach(layer => {
        if (!layer.visible) return;
        ctx.globalAlpha = layer.opacity;

        switch (layer.type) {
          case 'gradient': {
            const settings = layer.settings as { color1: string; color2: string; angle: number };
            const angle = (settings.angle * Math.PI) / 180;
            const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width;
            const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height;
            const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width;
            const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height;
            
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, settings.color1);
            gradient.addColorStop(1, settings.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
          }
          case 'particles': {
            const settings = layer.settings as { count: number; color: string; speed: number; size: number };
            
            // Initialize particles if needed
            while (particles.length < settings.count) {
              particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * settings.speed,
                vy: (Math.random() - 0.5) * settings.speed,
              });
            }
            particles = particles.slice(0, settings.count);

            ctx.fillStyle = settings.color;
            particles.forEach(p => {
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
              if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
              
              ctx.beginPath();
              ctx.arc(p.x, p.y, settings.size, 0, Math.PI * 2);
              ctx.fill();
            });
            break;
          }
          case 'noise': {
            const settings = layer.settings as { scale: number; intensity: number };
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
              const noise = (Math.random() - 0.5) * 255 * settings.intensity;
              imageData.data[i] += noise;
              imageData.data[i + 1] += noise;
              imageData.data[i + 2] += noise;
            }
            ctx.putImageData(imageData, 0, 0);
            break;
          }
          case 'shape': {
            const settings = layer.settings as { shapeType: string; x: number; y: number; size: number; color: string };
            ctx.fillStyle = settings.color;
            const x = settings.x * canvas.width;
            const y = settings.y * canvas.height;
            
            if (settings.shapeType === 'circle') {
              ctx.beginPath();
              ctx.arc(x, y, settings.size, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(x - settings.size / 2, y - settings.size / 2, settings.size, settings.size);
            }
            break;
          }
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, layers]);

  const downloadComposition = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `composition-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
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
            className="glass-panel rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-neon-orange" />
                <h2 className="text-xl font-bold">Layer Composer</h2>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={downloadComposition}
                  className="p-2 hover:bg-muted rounded-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Canvas Preview */}
              <div className="flex-1 relative bg-background">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Layer Panel */}
              <div className="w-72 border-l border-border flex flex-col">
                {/* Add Layer */}
                <div className="p-3 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-2">Add Layer</p>
                  <div className="grid grid-cols-2 gap-2">
                    {layerTypes.map(lt => (
                      <motion.button
                        key={lt.type}
                        onClick={() => addLayer(lt.type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 text-xs hover:bg-background/80"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lt.color }} />
                        {lt.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Layer List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {[...layers].reverse().map((layer, i) => (
                    <motion.div
                      key={layer.id}
                      className={`mb-2 p-3 rounded-lg border ${
                        selectedLayer === layer.id ? 'border-primary bg-primary/10' : 'border-border bg-background/50'
                      }`}
                      onClick={() => setSelectedLayer(layer.id)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: layerTypes.find(lt => lt.type === layer.type)?.color }}
                          />
                          <span className="text-sm font-medium truncate max-w-[100px]">{layer.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveLayer(layer.id, 'up')} className="p-1 hover:bg-muted rounded">
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button onClick={() => moveLayer(layer.id, 'down')} className="p-1 hover:bg-muted rounded">
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button onClick={() => toggleVisibility(layer.id)} className="p-1 hover:bg-muted rounded">
                            {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          <button onClick={() => removeLayer(layer.id)} className="p-1 hover:bg-destructive/20 text-destructive rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Opacity */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Opacity</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.opacity}
                          onChange={e => updateLayerOpacity(layer.id, Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs font-mono w-8">{Math.round(layer.opacity * 100)}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
