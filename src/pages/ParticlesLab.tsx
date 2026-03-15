import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ArrowLeft, Atom, Type, Sparkles, Shapes, Circle, Square, Triangle, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { ControlPanel } from '@/components/ControlPanel';

type ShapeType = 'text' | 'circle' | 'square' | 'triangle' | 'heart' | 'star';

interface TextParticlesProps {
  text: string;
  count: number;
  speed: number;
  isForming: boolean;
  shape: ShapeType;
  particleSize: number;
}

const generateShapePositions = (shape: ShapeType, text: string): [number, number, number][] => {
  const positions: [number, number, number][] = [];
  
  if (shape === 'text') {
    // Generate text positions using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x += 3) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i] > 128) {
          const px = (x - canvas.width / 2) / 40;
          const py = -(y - canvas.height / 2) / 40;
          positions.push([px, py, (Math.random() - 0.5) * 0.5]);
        }
      }
    }
  } else if (shape === 'circle') {
    // 3D sphere (surface points)
    const radius = 2.2;
    for (let i = 0; i < 900; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const r = radius + (Math.random() - 0.5) * 0.08;
      positions.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    }
  } else if (shape === 'square') {
    // 3D cube (surface points)
    const s = 2.0;
    for (let i = 0; i < 900; i++) {
      const face = Math.floor(Math.random() * 6);
      const a = (Math.random() * 2 - 1) * s;
      const b = (Math.random() * 2 - 1) * s;
      const jitter = (Math.random() - 0.5) * 0.05;
      switch (face) {
        case 0: positions.push([s + jitter, a, b]); break;
        case 1: positions.push([-s + jitter, a, b]); break;
        case 2: positions.push([a, s + jitter, b]); break;
        case 3: positions.push([a, -s + jitter, b]); break;
        case 4: positions.push([a, b, s + jitter]); break;
        case 5: positions.push([a, b, -s + jitter]); break;
      }
    }
  } else if (shape === 'triangle') {
    // 3D pyramid (square base + 4 triangular faces)
    const base = 2.0;
    const height = 2.6;
    const apex: [number, number, number] = [0, height, 0];
    const v = [
      [-base, -height / 3, -base],
      [base, -height / 3, -base],
      [base, -height / 3, base],
      [-base, -height / 3, base],
    ] as [number, number, number][];

    const sampleTriangle = (a: [number, number, number], b: [number, number, number], c: [number, number, number]) => {
      let r1 = Math.random();
      let r2 = Math.random();
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      return [
        a[0] + r1 * (b[0] - a[0]) + r2 * (c[0] - a[0]),
        a[1] + r1 * (b[1] - a[1]) + r2 * (c[1] - a[1]),
        a[2] + r1 * (b[2] - a[2]) + r2 * (c[2] - a[2]),
      ] as [number, number, number];
    };

    for (let i = 0; i < 900; i++) {
      const face = Math.floor(Math.random() * 5);
      if (face === 4) {
        // base (two triangles)
        const tri = Math.random() < 0.5 ? [v[0], v[1], v[2]] : [v[2], v[3], v[0]];
        positions.push(sampleTriangle(tri[0], tri[1], tri[2]));
      } else {
        const a = v[face];
        const b = v[(face + 1) % 4];
        positions.push(sampleTriangle(a, b, apex));
      }
    }
  } else if (shape === 'heart') {
    // 3D heart: sample the classic heart curve and add depth (extrusion)
    for (let i = 0; i < 1200; i++) {
      const t = Math.random() * Math.PI * 2;
      const x2d = 16 * Math.pow(Math.sin(t), 3) * 0.14;
      const y2d = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.14;

      // thickness varies to create a more “solid” feel
      const thickness = 0.7 - 0.35 * Math.abs(Math.sin(t));
      const z = (Math.random() * 2 - 1) * thickness;
      positions.push([x2d, y2d, z]);
    }
  } else if (shape === 'star') {
    // 3D star: 2D star outline with depth
    const points = 5;
    const outerRadius = 2.4;
    const innerRadius = 1.05;
    for (let i = 0; i < 1200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const pointIndex = Math.floor((angle / (Math.PI * 2)) * points * 2);
      const isOuter = pointIndex % 2 === 0;
      const radius = (isOuter ? outerRadius : innerRadius) + (Math.random() - 0.5) * 0.06;
      const x = Math.cos(angle - Math.PI / 2) * radius;
      const y = Math.sin(angle - Math.PI / 2) * radius;
      const z = (Math.random() * 2 - 1) * 0.7;
      positions.push([x, y, z]);
    }
  }
  
  return positions;
};

const TextParticles = ({ text, count, speed, isForming, shape, particleSize }: TextParticlesProps) => {
  const mesh = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  
  const targetPositions = useMemo(() => {
    return generateShapePositions(shape, text);
  }, [shape, text]);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color('hsl(185, 100%, 60%)'),
      new THREE.Color('hsl(320, 100%, 70%)'),
      new THREE.Color('hsl(85, 100%, 65%)'),
      new THREE.Color('hsl(270, 100%, 70%)'),
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 3 + Math.random() * 2;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      if (targetPositions.length > 0) {
        const targetPos = targetPositions[i % targetPositions.length];
        targets[i * 3] = targetPos[0];
        targets[i * 3 + 1] = targetPos[1];
        targets[i * 3 + 2] = targetPos[2];
      }

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors, originalPositions, targets };
  }, [count, targetPositions]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime() * speed;

    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      let targetX, targetY, targetZ;
      
      if (isForming && targetPositions.length > 0) {
        targetX = particles.targets[i3];
        targetY = particles.targets[i3 + 1];
        targetZ = particles.targets[i3 + 2];
      } else {
        const ox = particles.originalPositions[i3];
        const oy = particles.originalPositions[i3 + 1];
        const oz = particles.originalPositions[i3 + 2];
        
        targetX = ox + Math.sin(time + i * 0.005) * 0.3;
        targetY = oy + Math.sin(time + i * 0.01) * 0.2;
        targetZ = oz + Math.cos(time + i * 0.005) * 0.3;
      }

      positions[i3] += (targetX - positions[i3]) * 0.02;
      positions[i3 + 1] += (targetY - positions[i3 + 1]) * 0.02;
      positions[i3 + 2] += (targetZ - positions[i3 + 2]) * 0.02;

      const dx = positions[i3] - mouseX;
      const dy = positions[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 1 - dist / 3) * 0.3;

      positions[i3] += (dx / (dist + 0.1)) * force;
      positions[i3 + 1] += (dy / (dist + 0.1)) * force;
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    if (!isForming) {
      mesh.current.rotation.y = time * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const shapes: { id: ShapeType; icon: typeof Circle; label: string }[] = [
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'circle', icon: Circle, label: 'Sphere' },
  { id: 'square', icon: Square, label: 'Cube' },
  { id: 'triangle', icon: Triangle, label: 'Pyramid' },
  { id: 'heart', icon: Heart, label: '3D Heart' },
  { id: 'star', icon: Star, label: '3D Star' },
];

const ParticlesLab = () => {
  const [particleCount, setParticleCount] = useState(3000);
  const [speed, setSpeed] = useState(1);
  const [particleSize, setParticleSize] = useState(0.04);
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('HELLO');
  const [isForming, setIsForming] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentShape, setCurrentShape] = useState<ShapeType>('text');

  const handleFormText = () => {
    if (currentShape === 'text') {
      const v = inputText.trim().toLowerCase();
      const keywordToShape: Record<string, ShapeType> = {
        circle: 'circle',
        sphere: 'circle',
        square: 'square',
        cube: 'square',
        triangle: 'triangle',
        pyramid: 'triangle',
        heart: 'heart',
        star: 'star',
      };
      if (keywordToShape[v]) {
        setCurrentShape(keywordToShape[v]);
      } else if (inputText.trim()) {
        setDisplayText(inputText.trim().substring(0, 10));
      }
    }
    setIsForming(true);
  };

  const handleReset = () => {
    setIsForming(false);
    setInputText('');
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <TextParticles 
              text={displayText} 
              count={particleCount} 
              speed={speed} 
              isForming={isForming}
              shape={currentShape}
              particleSize={particleSize}
            />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              maxDistance={20}
              minDistance={5}
            />
          </Canvas>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 z-50"
        >
          <Link to="/" data-cursor-hover>
            <motion.div
              className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-3">
            <Atom className="w-5 h-5 text-neon-cyan" />
            <span className="font-bold neon-text-cyan">Particle Universe</span>
          </div>
        </motion.div>

        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed top-32 left-4 z-50"
        >
          <div className="glass-panel p-4 rounded-xl w-64 space-y-4">
            {/* Shape Selector */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shapes className="w-4 h-4 text-neon-magenta" />
                <span className="font-bold text-sm">Shape</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {shapes.map(s => {
                  const Icon = s.icon;
                  return (
                    <motion.button
                      key={s.id}
                      onClick={() => setCurrentShape(s.id)}
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs transition-all ${
                        currentShape === s.id
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                          : 'bg-background/50 text-muted-foreground hover:bg-background/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{s.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Text Input (only for text mode) */}
            {currentShape === 'text' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-neon-cyan" />
                  <span className="font-bold text-sm">Text</span>
                </div>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a word (max 10)"
                  maxLength={10}
                  className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleFormText}
                className="flex-1 bg-gradient-to-r from-primary to-secondary px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Form
              </motion.button>
              
              <motion.button
                onClick={handleReset}
                className="flex-1 glass-panel px-3 py-2 rounded-lg text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset
              </motion.button>
            </div>
            
            {isForming && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-neon-lime text-center"
              >
                ✨ Forming: {currentShape === 'text' ? `"${displayText}"` : currentShape}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Educational Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-24 left-4 z-50 max-w-sm"
        >
          <div className="glass-panel px-4 py-3 rounded-xl">
            <p className="text-sm font-bold mb-1 text-neon-cyan">🎓 Learn: Particle Physics</p>
            <p className="text-xs text-muted-foreground">
              Particles interpolate between positions using vector math. 
              Each frame, they move 2% closer to their target position!
            </p>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-4 left-4 z-50"
        >
          <div className="glass-panel px-4 py-3 rounded-xl">
            <p className="text-sm text-muted-foreground font-mono-lab">
              Drag to rotate • Scroll to zoom • Select shape or type text • Move mouse to interact
            </p>
          </div>
        </motion.div>

        {/* Control Panel */}
        <ControlPanel
          controls={{
            particleCount,
            onParticleCountChange: setParticleCount,
            speed,
            onSpeedChange: setSpeed,
            particleSize,
            onParticleSizeChange: setParticleSize,
            audioEnabled,
            onToggleAudio: setAudioEnabled,
          }}
        />
      </div>
    </PageTransition>
  );
};

export default ParticlesLab;
