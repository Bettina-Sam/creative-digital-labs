import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Palette } from 'lucide-react';

interface SoundVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorSchemes = [
  { name: 'Neon', colors: ['hsl(185, 100%, 50%)', 'hsl(320, 100%, 60%)', 'hsl(85, 100%, 55%)'] },
  { name: 'Sunset', colors: ['hsl(0, 100%, 60%)', 'hsl(25, 100%, 55%)', 'hsl(45, 100%, 60%)'] },
  { name: 'Ocean', colors: ['hsl(200, 100%, 50%)', 'hsl(170, 100%, 45%)', 'hsl(240, 80%, 60%)'] },
  { name: 'Aurora', colors: ['hsl(120, 80%, 50%)', 'hsl(270, 100%, 65%)', 'hsl(185, 100%, 50%)'] },
];

export const SoundVisualizer = ({ isOpen, onClose }: SoundVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [colorScheme, setColorScheme] = useState(0);
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'circle'>('bars');

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsListening(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!analyserRef.current) {
        // Draw idle animation
        const time = Date.now() / 1000;
        const colors = colorSchemes[colorScheme].colors;
        for (let i = 0; i < 64; i++) {
          const x = (i / 64) * canvas.width;
          const height = (Math.sin(time * 2 + i * 0.3) * 0.5 + 0.5) * 30 + 5;
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(x, canvas.height / 2 - height / 2, canvas.width / 64 - 2, height);
        }
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const colors = colorSchemes[colorScheme].colors;

      if (visualMode === 'bars') {
        analyser.getByteFrequencyData(dataArray);
        const barWidth = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          const colorIdx = Math.floor((i / bufferLength) * colors.length);
          ctx.fillStyle = colors[colorIdx];
          ctx.shadowColor = colors[colorIdx];
          ctx.shadowBlur = 10;
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        }
      } else if (visualMode === 'wave') {
        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 3;
        ctx.strokeStyle = colors[0];
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = 15;
        ctx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * sliceWidth, y);
        }
        ctx.stroke();
      } else if (visualMode === 'circle') {
        analyser.getByteFrequencyData(dataArray);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const baseRadius = Math.min(cx, cy) * 0.3;

        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const radius = baseRadius + (dataArray[i] / 255) * baseRadius;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = colors[i % colors.length];
          ctx.shadowColor = colors[i % colors.length];
          ctx.shadowBlur = 8;
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, isListening, colorScheme, visualMode, stopListening]);

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
          className="glass-panel rounded-2xl w-full max-w-4xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold gradient-text">Sound Visualizer</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="relative h-[400px] bg-background/50">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="p-4 flex flex-wrap items-center gap-4">
            <motion.button
              onClick={isListening ? stopListening : startListening}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium ${isListening ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? 'Stop' : 'Start Mic'}
            </motion.button>

            <div className="flex gap-2">
              {(['bars', 'wave', 'circle'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setVisualMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${visualMode === mode ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground'}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto">
              {colorSchemes.map((scheme, i) => (
                <button
                  key={scheme.name}
                  onClick={() => setColorScheme(i)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${colorScheme === i ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground'}`}
                >
                  <div className="flex gap-0.5">
                    {scheme.colors.map((c, j) => (
                      <div key={j} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  {scheme.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
