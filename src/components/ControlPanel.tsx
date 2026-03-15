import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Palette, Gauge, Sparkles, Circle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ControlPanelProps {
  controls: {
    particleCount?: number;
    onParticleCountChange?: (value: number) => void;
    speed?: number;
    onSpeedChange?: (value: number) => void;
    particleSize?: number;
    onParticleSizeChange?: (value: number) => void;
    showEffects?: boolean;
    onToggleEffects?: (value: boolean) => void;
    audioEnabled?: boolean;
    onToggleAudio?: (value: boolean) => void;
  };
}

export const ControlPanel = ({ controls }: ControlPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 glass-panel p-4 rounded-full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        data-cursor-hover
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6 text-primary" />}
        </motion.div>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 glass-panel p-6 rounded-2xl w-72"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Lab Controls
            </h3>

            <div className="space-y-6">
              {controls.particleCount !== undefined && controls.onParticleCountChange && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-neon-cyan" />
                      Particles
                    </Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {controls.particleCount}
                    </span>
                  </div>
                  <Slider
                    value={[controls.particleCount]}
                    onValueChange={([value]) => controls.onParticleCountChange!(value)}
                    min={500}
                    max={5000}
                    step={100}
                    className="py-2"
                  />
                </div>
              )}

              {controls.speed !== undefined && controls.onSpeedChange && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-neon-magenta" />
                      Speed
                    </Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {controls.speed.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[controls.speed]}
                    onValueChange={([value]) => controls.onSpeedChange!(value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="py-2"
                  />
                </div>
              )}

              {controls.particleSize !== undefined && controls.onParticleSizeChange && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-neon-orange" />
                      Particle Size
                    </Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {(controls.particleSize * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[controls.particleSize]}
                    onValueChange={([value]) => controls.onParticleSizeChange!(value)}
                    min={0.01}
                    max={0.1}
                    step={0.01}
                    className="py-2"
                  />
                </div>
              )}

              {controls.showEffects !== undefined && controls.onToggleEffects && (
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-lime" />
                    Visual Effects
                  </Label>
                  <Switch
                    checked={controls.showEffects}
                    onCheckedChange={controls.onToggleEffects}
                  />
                </div>
              )}

              {controls.audioEnabled !== undefined && controls.onToggleAudio && (
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {controls.audioEnabled ? (
                      <Volume2 className="w-4 h-4 text-neon-orange" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    )}
                    Audio Reactivity
                  </Label>
                  <Switch
                    checked={controls.audioEnabled}
                    onCheckedChange={controls.onToggleAudio}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono-lab">
                Adjust settings to customize the experience
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
