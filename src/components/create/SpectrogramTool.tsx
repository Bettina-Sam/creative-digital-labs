import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Music } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const Spectrogram = ({ isOpen, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [listening, setListening] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
    } catch {}
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setListening(false);
  };

  useEffect(() => {
    if (!listening || !isOpen) return;
    const c = canvasRef.current!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    const analyser = analyserRef.current!;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    let x = 0;
    let anim: number;

    const draw = () => {
      analyser.getByteFrequencyData(data);
      // Draw column
      const colWidth = 2;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i];
        const h = (1 - v / 255) * 270;
        ctx.fillStyle = `hsl(${h}, 100%, ${v / 2.55}%)`;
        ctx.fillRect(x, c.height - (i / bufLen) * c.height, colWidth, c.height / bufLen + 1);
      }
      x += colWidth;
      if (x >= c.width) {
        x = 0;
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, c.width, c.height);
      }
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [listening, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Music className="w-5 h-5 text-neon-orange" /><h2 className="font-bold">Spectrogram</h2></div>
              <div className="flex items-center gap-2">
                <button onClick={listening ? stop : start} className={`px-4 py-1.5 rounded-lg text-sm ${listening ? 'bg-red-500/20 text-red-400' : 'bg-primary text-primary-foreground'}`}>
                  {listening ? 'Stop' : 'Start Mic'}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full h-[400px] bg-background" />
            <div className="p-3 text-center text-xs text-muted-foreground">
              {listening ? 'Listening... speak or play music to see the spectrogram' : 'Click Start Mic to begin audio analysis'}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
