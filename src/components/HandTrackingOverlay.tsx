import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Camera, Hand, Sparkles, X } from 'lucide-react';
import { useHandTracking } from '@/hooks/useHandTracking';

interface HandTrackingOverlayProps {
  onPalmMove?: (x: number, y: number) => void;
  onGesture?: (gesture: string) => void;
  isVisible?: boolean;
  onClose?: () => void;
}

const gestureEmoji: Record<string, string> = {
  open: '✋',
  fist: '✊',
  pinch: '🤏',
  point: '👆',
  peace: '✌️',
};

const gestureLabels: Record<string, string> = {
  open: 'Open Hand',
  fist: 'Closed Fist',
  pinch: 'Pinch',
  point: 'Pointing',
  peace: 'Peace Sign',
};

export const HandTrackingOverlay = ({
  onPalmMove,
  onGesture,
  isVisible = true,
  onClose,
}: HandTrackingOverlayProps) => {
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (webcamRef.current?.video) {
      videoRef.current = webcamRef.current.video;
    }
  });

  const { gesture, palmCenter, isTracking, confidence } = useHandTracking(
    videoRef as React.RefObject<HTMLVideoElement>,
    {
      enabled: hasPermission && isVisible,
      onGesture,
      onPalmMove,
    }
  );

  const handleUserMedia = () => {
    setHasPermission(true);
    setTimeout(() => setShowInstructions(false), 5000);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="relative">
        {/* Camera Feed */}
        <motion.div
          className="glass-panel overflow-hidden rounded-2xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <div className="relative w-64 h-48">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              onUserMedia={handleUserMedia}
              onUserMediaError={() => setHasPermission(false)}
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 320,
                height: 240,
                facingMode: 'user',
              }}
            />

            {/* Tracking Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  isTracking ? 'bg-neon-lime' : 'bg-muted'
                }`}
                animate={isTracking ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-xs font-mono-lab text-white/80">
                {isTracking ? 'Tracking' : 'No Hand'}
              </span>
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Gesture Display */}
            <AnimatePresence>
              {gesture && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-2 left-2 right-2 flex items-center justify-between glass-panel px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{gestureEmoji[gesture]}</span>
                    <span className="text-sm font-medium">{gestureLabels[gesture]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono-lab">
                    {Math.round(confidence * 100)}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Palm Cursor */}
            {palmCenter && (
              <motion.div
                className="absolute w-6 h-6 pointer-events-none"
                style={{
                  left: `${palmCenter.x * 100}%`,
                  top: `${palmCenter.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-full h-full rounded-full bg-neon-cyan/50 border-2 border-neon-cyan animate-pulse" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Instructions */}
        <AnimatePresence>
          {showInstructions && hasPermission && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute bottom-0 right-full mr-4 w-64 glass-panel p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Hand className="w-5 h-5 text-neon-cyan" />
                <h4 className="font-bold text-sm">Gesture Controls</h4>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>✋</span> Open hand to control elements
                </li>
                <li className="flex items-center gap-2">
                  <span>🤏</span> Pinch to interact
                </li>
                <li className="flex items-center gap-2">
                  <span>👆</span> Point to focus
                </li>
                <li className="flex items-center gap-2">
                  <span>✌️</span> Peace sign to toggle effects
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Permission State */}
        {!hasPermission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-card/90 rounded-2xl"
          >
            <div className="text-center p-4">
              <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Enable camera for<br />hand tracking
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
