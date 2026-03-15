import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

export type GestureType = 'open' | 'fist' | 'pinch' | 'point' | 'peace' | 'thumbs_up' | 'rock' | null;

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
  palmCenter: { x: number; y: number } | null;
  landmarks: HandLandmark[] | null;
  handedness: 'Left' | 'Right' | null;
}

interface GestureDetectorProps {
  enabled: boolean;
  onGesture?: (result: GestureResult) => void;
  onPalmMove?: (x: number, y: number) => void;
  showVideo?: boolean;
  videoSize?: { width: number; height: number };
}

const gestureEmojis: Record<GestureType & string, string> = {
  open: '✋',
  fist: '✊',
  pinch: '🤏',
  point: '👆',
  peace: '✌️',
  thumbs_up: '👍',
  rock: '🤘',
};

const gestureLabels: Record<GestureType & string, string> = {
  open: 'Open Hand',
  fist: 'Closed Fist',
  pinch: 'Pinch',
  point: 'Pointing',
  peace: 'Peace Sign',
  thumbs_up: 'Thumbs Up',
  rock: 'Rock On',
};

export const GestureDetector = ({
  enabled,
  onGesture,
  onPalmMove,
  showVideo = true,
  videoSize = { width: 256, height: 192 },
}: GestureDetectorProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureResult>({
    gesture: null,
    confidence: 0,
    palmCenter: null,
    landmarks: null,
    handedness: null,
  });
  const [isTracking, setIsTracking] = useState(false);

  const detectGesture = useCallback((landmarks: HandLandmark[]): { gesture: GestureType; confidence: number } => {
    if (!landmarks || landmarks.length < 21) {
      return { gesture: null, confidence: 0 };
    }

    // Landmark indices
    const THUMB_TIP = 4, THUMB_IP = 3, THUMB_MCP = 2;
    const INDEX_TIP = 8, INDEX_DIP = 7, INDEX_PIP = 6, INDEX_MCP = 5;
    const MIDDLE_TIP = 12, MIDDLE_DIP = 11, MIDDLE_PIP = 10, MIDDLE_MCP = 9;
    const RING_TIP = 16, RING_DIP = 15, RING_PIP = 14, RING_MCP = 13;
    const PINKY_TIP = 20, PINKY_DIP = 19, PINKY_PIP = 18, PINKY_MCP = 17;
    const WRIST = 0;

    const isFingerExtended = (tip: number, pip: number, mcp: number): boolean => {
      return landmarks[tip].y < landmarks[pip].y && landmarks[pip].y < landmarks[mcp].y;
    };

    const isThumbExtended = (): boolean => {
      return Math.abs(landmarks[THUMB_TIP].x - landmarks[WRIST].x) > 0.1;
    };

    const distance = (a: HandLandmark, b: HandLandmark): number => {
      return Math.sqrt(
        Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
      );
    };

    const indexExtended = isFingerExtended(INDEX_TIP, INDEX_PIP, INDEX_MCP);
    const middleExtended = isFingerExtended(MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
    const ringExtended = isFingerExtended(RING_TIP, RING_PIP, RING_MCP);
    const pinkyExtended = isFingerExtended(PINKY_TIP, PINKY_PIP, PINKY_MCP);
    const thumbExtended = isThumbExtended();

    const thumbIndexDist = distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);

    // Gesture classification
    if (thumbIndexDist < 0.05 && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'pinch', confidence: 0.9 };
    }

    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'peace', confidence: 0.85 };
    }

    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'point', confidence: 0.85 };
    }

    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'thumbs_up', confidence: 0.8 };
    }

    if (indexExtended && pinkyExtended && !middleExtended && !ringExtended) {
      return { gesture: 'rock', confidence: 0.8 };
    }

    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
      return { gesture: 'fist', confidence: 0.9 };
    }

    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      return { gesture: 'open', confidence: 0.9 };
    }

    return { gesture: null, confidence: 0 };
  }, []);

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
    setIsTracking(true);
  }, []);

  useEffect(() => {
    if (!enabled || !hasPermission || !webcamRef.current?.video) return;

    // Simulated tracking (real MediaPipe integration would go here)
    const interval = setInterval(() => {
      // This is a placeholder - real implementation would use MediaPipe
      // The actual useHandTracking hook handles the real MediaPipe integration
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, hasPermission, onGesture, onPalmMove, detectGesture]);

  if (!enabled) return null;

  return (
    <div className="relative">
      {showVideo && (
        <div className="glass-panel rounded-xl overflow-hidden" style={{ width: videoSize.width, height: videoSize.height }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            onUserMedia={handleUserMedia}
            onUserMediaError={() => setHasPermission(false)}
            className="w-full h-full object-cover"
            videoConstraints={{
              width: videoSize.width,
              height: videoSize.height,
              facingMode: 'user',
            }}
          />

          {/* Tracking status */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-neon-lime animate-pulse' : 'bg-muted'}`} />
            <span className="text-xs font-mono-lab text-white/80">
              {isTracking ? 'Tracking' : 'Initializing'}
            </span>
          </div>

          {/* Gesture display */}
          {currentGesture.gesture && (
            <div className="absolute bottom-2 left-2 right-2 glass-panel px-3 py-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{gestureEmojis[currentGesture.gesture]}</span>
                  <span className="text-sm font-medium">{gestureLabels[currentGesture.gesture]}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(currentGesture.confidence * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Palm cursor */}
          {currentGesture.palmCenter && (
            <div
              className="absolute w-4 h-4 pointer-events-none"
              style={{
                left: `${currentGesture.palmCenter.x * 100}%`,
                top: `${currentGesture.palmCenter.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-full h-full rounded-full bg-neon-cyan/50 border-2 border-neon-cyan animate-pulse" />
            </div>
          )}
        </div>
      )}

      {!hasPermission && (
        <div className="glass-panel rounded-xl p-4 text-center" style={{ width: videoSize.width }}>
          <p className="text-sm text-muted-foreground">Enable camera for gesture control</p>
        </div>
      )}
    </div>
  );
};
