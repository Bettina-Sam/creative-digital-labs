import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Palette,
  Minus,
  Plus,
  Square,
  Circle,
  Type,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface WhiteboardModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

interface DrawPoint {
  x: number;
  y: number;
}

type Tool = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'text';

const lessons = [
  {
    title: 'Particle Physics Basics',
    content: [
      'Particles follow Newton\'s laws of motion',
      'F = ma (Force = mass × acceleration)',
      'Velocity changes with applied forces',
      'Gravity pulls particles downward (vy += 0.1)',
    ],
  },
  {
    title: 'Coordinate Systems',
    content: [
      'X-axis: horizontal position',
      'Y-axis: vertical position',
      'Origin (0,0) is top-left in canvas',
      'Positive Y goes downward!',
    ],
  },
  {
    title: 'Vectors in Motion',
    content: [
      'Velocity = (vx, vy) direction & speed',
      'Position += Velocity each frame',
      'Normalize to get unit vectors',
      'Scale vectors for force magnitude',
    ],
  },
  {
    title: 'Trigonometry for Graphics',
    content: [
      'sin(θ) for vertical oscillation',
      'cos(θ) for horizontal oscillation',
      'atan2(y, x) for angle between points',
      'Radians: π = 180 degrees',
    ],
  },
];

const colors = ['#ffffff', '#00FFD1', '#FF00FF', '#CCFF00', '#FF6600', '#FF0000'];

export const WhiteboardModule = ({ isOpen, onClose, onSpeak }: WhiteboardModuleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#00FFD1');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<DrawPoint | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [isOpen]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = brushSize * 5;
      ctx.lineCap = 'round';

      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    setLastPoint({ x, y });
  }, [isDrawing, lastPoint, tool, color, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setLastPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const speakLesson = () => {
    if (onSpeak) {
      const lesson = lessons[currentLesson];
      onSpeak(`${lesson.title}. ${lesson.content.join('. ')}`);
    }
  };

  const nextLesson = () => {
    setCurrentLesson(prev => (prev + 1) % lessons.length);
  };

  const prevLesson = () => {
    setCurrentLesson(prev => (prev - 1 + lessons.length) % lessons.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Pencil className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-xl font-bold">Interactive Whiteboard</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Tools Sidebar */}
              <div className="w-16 border-r border-border p-2 flex flex-col gap-2">
                {/* Tool Buttons */}
                {[
                  { id: 'pencil', icon: Pencil },
                  { id: 'eraser', icon: Eraser },
                ].map(({ id, icon: Icon }) => (
                  <motion.button
                    key={id}
                    onClick={() => setTool(id as Tool)}
                    className={`p-3 rounded-lg ${tool === id ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                ))}

                <div className="border-t border-border my-2" />

                {/* Brush Size */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setBrushSize(prev => Math.min(20, prev + 1))}
                    className="p-2 hover:bg-muted rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono">{brushSize}</span>
                  <button
                    onClick={() => setBrushSize(prev => Math.max(1, prev - 1))}
                    className="p-2 hover:bg-muted rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="border-t border-border my-2" />

                {/* Colors */}
                <div className="flex flex-col gap-1">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full mx-auto ${color === c ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex-1" />

                {/* Actions */}
                <motion.button
                  onClick={clearCanvas}
                  className="p-3 rounded-lg hover:bg-destructive/20 text-destructive"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={downloadCanvas}
                  className="p-3 rounded-lg hover:bg-muted"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Canvas Area */}
              <div className="flex-1 relative">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              {/* Lessons Sidebar */}
              <div className="w-80 border-l border-border p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Lesson Content</h3>
                  <div className="flex gap-1">
                    <button onClick={prevLesson} className="p-1 hover:bg-muted rounded">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextLesson} className="p-1 hover:bg-muted rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <motion.div
                    key={currentLesson}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-bold text-neon-cyan">
                      {lessons[currentLesson].title}
                    </h4>
                    <ul className="space-y-3">
                      {lessons[currentLesson].content.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-neon-lime">•</span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                <motion.button
                  onClick={speakLesson}
                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🔊 Read Lesson Aloud
                </motion.button>

                <div className="mt-4 text-center text-xs text-muted-foreground">
                  Lesson {currentLesson + 1} of {lessons.length}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
