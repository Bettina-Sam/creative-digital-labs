import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { X, Mic, Square, Play, Trash2 } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const VoiceRecorder = ({ isOpen, onClose }: Props) => {
  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ url: string; duration: number }[]>([]);
  const [time, setTime] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordings(r => [...r, { url, duration: time }]);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
      setTime(0);
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } catch { /* mic denied */ }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Mic className="w-5 h-5 text-neon-orange" /><h2 className="font-bold">Voice Recorder</h2></div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex flex-col items-center gap-6">
              <motion.div animate={recording ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center ${recording ? 'bg-red-500/20 border-2 border-red-500' : 'glass-panel'}`}>
                <span className="text-2xl font-mono">{Math.floor(time / 60).toString().padStart(2, '0')}:{(time % 60).toString().padStart(2, '0')}</span>
              </motion.div>
              <div className="flex gap-4">
                {!recording ? (
                  <motion.button onClick={start} whileHover={{ scale: 1.1 }} className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium flex items-center gap-2"><Mic className="w-4 h-4" />Record</motion.button>
                ) : (
                  <motion.button onClick={stop} whileHover={{ scale: 1.1 }} className="px-6 py-3 rounded-xl bg-muted font-medium flex items-center gap-2"><Square className="w-4 h-4" />Stop</motion.button>
                )}
              </div>
              <div className="w-full space-y-2">
                {recordings.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 glass-panel p-3 rounded-xl">
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    <audio controls src={rec.url} className="flex-1 h-8" />
                    <button onClick={() => setRecordings(r => r.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
