import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2 } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

const SoundLab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInterference, setShowInterference] = useState(false);
  const [freq2, setFreq2] = useState(550);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.soundLabWelcome'));
  }, [isEnabled]);

  const toggleSound = useCallback(() => {
    if (isPlaying) {
      oscRef.current?.stop();
      oscRef.current = null;
      setIsPlaying(false);
    } else {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      osc.type = waveType;
      osc.frequency.value = frequency;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setIsPlaying(true);
    }
  }, [isPlaying, waveType, frequency]);

  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.value = frequency;
      oscRef.current.type = waveType;
    }
  }, [frequency, waveType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let time = 0;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(10, 10, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const drawWave = (freq: number, amp: number, color: string, yOffset: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        for (let x = 0; x < width; x++) {
          const t2 = (x / width) * Math.PI * 2 * (freq / 100) + time;
          let y = 0;
          if (waveType === 'sine') y = Math.sin(t2);
          else if (waveType === 'square') y = Math.sign(Math.sin(t2));
          else if (waveType === 'triangle') y = (2 / Math.PI) * Math.asin(Math.sin(t2));
          else y = 2 * ((t2 / (2 * Math.PI)) % 1) - 1;
          const py = yOffset + y * amp;
          x === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      drawWave(frequency, amplitude, '#00f0ff', height / 2);

      if (showInterference) {
        drawWave(freq2, amplitude * 0.7, '#ff00ff', height / 2);
        // Combined wave
        ctx.beginPath();
        ctx.strokeStyle = '#a0ff00';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#a0ff00';
        for (let x = 0; x < width; x++) {
          const t2 = (x / width) * Math.PI * 2;
          const y1 = Math.sin(t2 * (frequency / 100) + time) * amplitude;
          const y2 = Math.sin(t2 * (freq2 / 100) + time) * amplitude * 0.7;
          const py = height / 2 + y1 + y2;
          x === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      time += 0.05;
      animRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [frequency, amplitude, waveType, showInterference, freq2]);

  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Link to="/experiments" className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="glass-panel p-4 rounded-2xl max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold gradient-text">Sound Waves Lab</h2>
            <motion.button onClick={toggleSound} className="p-2 rounded-lg bg-primary/20 text-primary" whileTap={{ scale: 0.9 }}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Frequency: {frequency}Hz</label>
              <input type="range" min="100" max="2000" value={frequency} onChange={e => setFrequency(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amplitude: {amplitude}</label>
              <input type="range" min="10" max="150" value={amplitude} onChange={e => setAmplitude(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Wave Type</label>
              <div className="flex gap-1 mt-1">
                {(['sine', 'square', 'triangle', 'sawtooth'] as const).map(w => (
                  <button key={w} onClick={() => setWaveType(w)} className={`text-xs px-2 py-1 rounded ${waveType === w ? 'bg-primary/30 text-primary' : 'text-muted-foreground'}`}>
                    {w[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Interference</label>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => setShowInterference(!showInterference)} className={`text-xs px-3 py-1 rounded ${showInterference ? 'bg-neon-magenta/20 text-neon-magenta' : 'text-muted-foreground'}`}>
                  {showInterference ? 'ON' : 'OFF'}
                </button>
                {showInterference && (
                  <input type="range" min="100" max="2000" value={freq2} onChange={e => setFreq2(+e.target.value)} className="w-20 accent-neon-magenta" />
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            💡 Sound travels as pressure waves. Higher frequency = higher pitch. When two waves meet, they create interference patterns — constructive (louder) or destructive (quieter).
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundLab;
