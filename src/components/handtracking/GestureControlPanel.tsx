import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Camera, X, Settings, Info, CheckCircle } from 'lucide-react';
import { HandTrackingOverlay } from '@/components/HandTrackingOverlay';

interface GestureBinding {
  gesture: string;
  action: string;
  emoji: string;
  enabled: boolean;
}

interface GestureControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGestureDetected?: (gesture: string) => void;
  bindings?: GestureBinding[];
  onBindingChange?: (gesture: string, enabled: boolean) => void;
}

const defaultBindings: GestureBinding[] = [
  { gesture: 'open', action: 'Show cursor / Navigate', emoji: '✋', enabled: true },
  { gesture: 'fist', action: 'Pause / Stop', emoji: '✊', enabled: true },
  { gesture: 'pinch', action: 'Select / Interact', emoji: '🤏', enabled: true },
  { gesture: 'point', action: 'Focus / Highlight', emoji: '👆', enabled: true },
  { gesture: 'peace', action: 'Toggle effects', emoji: '✌️', enabled: true },
  { gesture: 'thumbs_up', action: 'Confirm / Like', emoji: '👍', enabled: false },
  { gesture: 'rock', action: 'Special action', emoji: '🤘', enabled: false },
];

export const GestureControlPanel = ({
  isOpen,
  onClose,
  onGestureDetected,
  bindings = defaultBindings,
  onBindingChange,
}: GestureControlPanelProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  const handleGesture = (gesture: string) => {
    setLastGesture(gesture);
    onGestureDetected?.(gesture);
    setTimeout(() => setLastGesture(null), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 left-4 z-50 glass-panel rounded-2xl p-4 w-80"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hand className="w-5 h-5 text-neon-lime" />
                <h3 className="font-bold">Gesture Controls</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Toggle */}
            <button
              onClick={() => setShowCamera(!showCamera)}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-4 transition-all ${
                showCamera ? 'bg-neon-lime/20 border border-neon-lime/50' : 'glass-panel'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className={`w-4 h-4 ${showCamera ? 'text-neon-lime' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">
                  {showCamera ? 'Camera Active' : 'Enable Camera'}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${showCamera ? 'bg-neon-lime animate-pulse' : 'bg-muted'}`} />
            </button>

            {/* Last Gesture Detected */}
            <AnimatePresence>
              {lastGesture && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm">
                      Detected: <span className="font-bold capitalize">{lastGesture}</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gesture Bindings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Gesture Mappings</span>
              </div>
              
              {bindings.map((binding) => (
                <div
                  key={binding.gesture}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                    binding.enabled ? 'bg-accent/50' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{binding.emoji}</span>
                    <div>
                      <div className="text-sm font-medium capitalize">{binding.gesture}</div>
                      <div className="text-xs text-muted-foreground">{binding.action}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onBindingChange?.(binding.gesture, !binding.enabled)}
                    className={`w-8 h-5 rounded-full transition-colors ${
                      binding.enabled ? 'bg-neon-lime' : 'bg-muted'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ x: binding.enabled ? 14 : 2 }}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 rounded-xl bg-neon-orange/10 border border-neon-orange/30">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-neon-orange flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Tips for best tracking:</p>
                  <ul className="space-y-1">
                    <li>• Good lighting on your hand</li>
                    <li>• Plain background works best</li>
                    <li>• Keep hand within camera view</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Camera Overlay */}
          {showCamera && (
            <HandTrackingOverlay
              isVisible={showCamera}
              onClose={() => setShowCamera(false)}
              onGesture={handleGesture}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};
