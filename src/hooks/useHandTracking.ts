import { useEffect, useRef, useState, useCallback } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandTrackingResult {
  landmarks: HandLandmark[] | null;
  gesture: 'open' | 'fist' | 'pinch' | 'point' | 'peace' | null;
  palmCenter: { x: number; y: number } | null;
  isTracking: boolean;
  confidence: number;
}

interface UseHandTrackingOptions {
  enabled?: boolean;
  onGesture?: (gesture: string) => void;
  onPalmMove?: (x: number, y: number) => void;
}

// Landmark indices
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;
const INDEX_BASE = 5;
const MIDDLE_BASE = 9;
const RING_BASE = 13;
const PINKY_BASE = 17;
const WRIST = 0;

const detectGesture = (landmarks: HandLandmark[]): 'open' | 'fist' | 'pinch' | 'point' | 'peace' | null => {
  if (!landmarks || landmarks.length < 21) return null;

  const thumbTip = landmarks[THUMB_TIP];
  const indexTip = landmarks[INDEX_TIP];
  const middleTip = landmarks[MIDDLE_TIP];
  const ringTip = landmarks[RING_TIP];
  const pinkyTip = landmarks[PINKY_TIP];
  
  const indexBase = landmarks[INDEX_BASE];
  const middleBase = landmarks[MIDDLE_BASE];
  const ringBase = landmarks[RING_BASE];
  const pinkyBase = landmarks[PINKY_BASE];

  // Calculate distances
  const pinchDistance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) + 
    Math.pow(thumbTip.y - indexTip.y, 2)
  );

  // Check finger extensions (finger tip should be above base for extended)
  const indexExtended = indexTip.y < indexBase.y;
  const middleExtended = middleTip.y < middleBase.y;
  const ringExtended = ringTip.y < ringBase.y;
  const pinkyExtended = pinkyTip.y < pinkyBase.y;

  // Pinch gesture
  if (pinchDistance < 0.05) {
    return 'pinch';
  }

  // Peace sign
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 'peace';
  }

  // Point gesture
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'point';
  }

  // Open hand
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 'open';
  }

  // Fist
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'fist';
  }

  return null;
};

const calculatePalmCenter = (landmarks: HandLandmark[]): { x: number; y: number } | null => {
  if (!landmarks || landmarks.length < 21) return null;
  
  // Use wrist and middle finger base for palm center approximation
  const wrist = landmarks[WRIST];
  const middleBase = landmarks[MIDDLE_BASE];
  
  return {
    x: (wrist.x + middleBase.x) / 2,
    y: (wrist.y + middleBase.y) / 2,
  };
};

export const useHandTracking = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseHandTrackingOptions = {}
): HandTrackingResult => {
  const { enabled = true, onGesture, onPalmMove } = options;
  
  const [result, setResult] = useState<HandTrackingResult>({
    landmarks: null,
    gesture: null,
    palmCenter: null,
    isTracking: false,
    confidence: 0,
  });
  
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const lastGestureRef = useRef<string | null>(null);

  const detectHands = useCallback(async () => {
    if (!videoRef.current || !handLandmarkerRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    if (videoRef.current.readyState >= 2) {
      try {
        const detections = handLandmarkerRef.current.detectForVideo(
          videoRef.current,
          performance.now()
        );

        if (detections.landmarks && detections.landmarks.length > 0) {
          const landmarks = detections.landmarks[0];
          const gesture = detectGesture(landmarks);
          const palmCenter = calculatePalmCenter(landmarks);
          const confidence = detections.handednesses?.[0]?.[0]?.score || 0;

          // Mirror X coordinate for natural interaction
          const mirroredPalmCenter = palmCenter ? {
            x: 1 - palmCenter.x,
            y: palmCenter.y,
          } : null;

          setResult({
            landmarks,
            gesture,
            palmCenter: mirroredPalmCenter,
            isTracking: true,
            confidence,
          });

          // Callbacks
          if (gesture && gesture !== lastGestureRef.current) {
            onGesture?.(gesture);
            lastGestureRef.current = gesture;
          }

          if (mirroredPalmCenter) {
            onPalmMove?.(mirroredPalmCenter.x, mirroredPalmCenter.y);
          }
        } else {
          setResult(prev => ({
            ...prev,
            landmarks: null,
            gesture: null,
            palmCenter: null,
            isTracking: false,
            confidence: 0,
          }));
          lastGestureRef.current = null;
        }
      } catch (error) {
        console.error('Hand detection error:', error);
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  }, [videoRef, onGesture, onPalmMove]);

  useEffect(() => {
    if (!enabled) return;

    const initializeHandDetection = async () => {
      try {
        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          numHands: 2,
          runningMode: 'VIDEO',
        });

        detectHands();
      } catch (error) {
        console.error('Error initializing hand detection:', error);
      }
    };

    initializeHandDetection();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, [enabled, detectHands]);

  return result;
};
