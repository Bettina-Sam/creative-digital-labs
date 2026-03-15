import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

interface AudioVisualizerProps {
  isEnabled: boolean;
  onToggle: () => void;
  variant?: 'bars' | 'wave' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  onAudioData?: (data: { bass: number; mid: number; treble: number; volume: number; beat: boolean }) => void;
}

export const AudioVisualizer = ({ 
  isEnabled, 
  onToggle, 
  variant = 'bars',
  size = 'md',
  onAudioData
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData, isListening, startListening, stopListening } = useAudioReactivity({
    enabled: isEnabled,
  });

  useEffect(() => {
    if (isEnabled && !isListening) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }
  }, [isEnabled, isListening, startListening, stopListening]);

  useEffect(() => {
    if (onAudioData && isListening) {
      onAudioData({
        bass: audioData.bass,
        mid: audioData.mid,
        treble: audioData.treble,
        volume: audioData.volume,
        beat: audioData.beat,
      });
    }
  }, [audioData, isListening, onAudioData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isListening) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (variant === 'bars') {
      const barCount = 32;
      const barWidth = (width / barCount) * 0.8;
      const gap = (width / barCount) * 0.2;

      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor((i / barCount) * audioData.frequencies.length);
        const value = audioData.frequencies[freqIndex] / 255;
        const barHeight = value * height * 0.8;

        const hue = (i / barCount) * 180 + 180; // Cyan to magenta
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.5 + value * 0.5})`;

        const x = i * (barWidth + gap);
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        // Reflection
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${value * 0.2})`;
        ctx.fillRect(x, height, barWidth, barHeight * 0.3);
      }
    } else if (variant === 'wave') {
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let i = 0; i < audioData.waveform.length; i++) {
        const x = (i / audioData.waveform.length) * width;
        const y = ((audioData.waveform[i] / 255) * height * 0.8) + height * 0.1;
        ctx.lineTo(x, y);
      }

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'hsl(185, 100%, 60%)');
      gradient.addColorStop(0.5, 'hsl(320, 100%, 60%)');
      gradient.addColorStop(1, 'hsl(85, 100%, 60%)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = 'hsl(185, 100%, 60%)';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (variant === 'circle') {
      const baseRadius = Math.min(width, height) * 0.3;
      const maxRadius = Math.min(width, height) * 0.45;
      const segments = 64;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const freqIndex = Math.floor((i / segments) * audioData.frequencies.length);
        const value = audioData.frequencies[freqIndex] / 255;
        const radius = baseRadius + value * (maxRadius - baseRadius);

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius, centerX, centerY, maxRadius);
      gradient.addColorStop(0, 'hsla(185, 100%, 60%, 0.8)');
      gradient.addColorStop(0.5, 'hsla(320, 100%, 60%, 0.6)');
      gradient.addColorStop(1, 'hsla(85, 100%, 60%, 0.4)');

      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = 'hsl(185, 100%, 70%)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [audioData, variant, isListening]);

  const sizes = {
    sm: { width: 120, height: 60 },
    md: { width: 200, height: 100 },
    lg: { width: 300, height: 150 },
  };

  return (
    <div className="glass-panel rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono-lab text-muted-foreground">Audio Reactive</span>
        </div>
        <motion.button
          onClick={onToggle}
          className={`p-2 rounded-lg transition-colors ${
            isEnabled ? 'bg-neon-lime/20 text-neon-lime' : 'bg-muted text-muted-foreground'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </motion.button>
      </div>

      <canvas
        ref={canvasRef}
        width={sizes[size].width}
        height={sizes[size].height}
        className="rounded-lg bg-background/50"
      />

      {/* Audio levels display */}
      {isListening && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-neon-magenta font-mono-lab">{Math.round(audioData.bass * 100)}%</div>
            <div className="text-muted-foreground">Bass</div>
          </div>
          <div className="text-center">
            <div className="text-neon-cyan font-mono-lab">{Math.round(audioData.mid * 100)}%</div>
            <div className="text-muted-foreground">Mid</div>
          </div>
          <div className="text-center">
            <div className="text-neon-lime font-mono-lab">{Math.round(audioData.treble * 100)}%</div>
            <div className="text-muted-foreground">Treble</div>
          </div>
        </div>
      )}

      {/* Beat indicator */}
      {audioData.beat && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-neon-orange"
        />
      )}
    </div>
  );
};
