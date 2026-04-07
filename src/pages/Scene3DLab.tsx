import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, Info, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';

interface PlanetData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
  funFact: string;
  texture?: string;
  rotationSpeed: number;
  hasRings?: boolean;
  ringColor?: string;
}

const planets: PlanetData[] = [
  {
    name: 'Mercury',
    color: '#8C7853',
    size: 0.2,
    distance: 2.5,
    speed: 4.15,
    rotationSpeed: 0.005,
    description: 'Smallest planet, closest to the Sun. A rocky world with extreme temperatures.',
    funFact: 'A day on Mercury (sunrise to sunrise) lasts 176 Earth days!'
  },
  {
    name: 'Venus',
    color: '#E6C87A',
    size: 0.4,
    distance: 3.5,
    speed: 1.62,
    rotationSpeed: -0.002,
    description: 'Hottest planet with thick toxic atmosphere. It spins backwards!',
    funFact: 'Venus is hotter than Mercury (465°C) despite being farther from the Sun!'
  },
  {
    name: 'Earth',
    color: '#4A90D9',
    size: 0.42,
    distance: 4.5,
    speed: 1,
    rotationSpeed: 0.01,
    description: 'Our home! The only known planet with life and liquid water on surface.',
    funFact: 'Earth is the only planet not named after a Greek or Roman god!'
  },
  {
    name: 'Mars',
    color: '#C1440E',
    size: 0.28,
    distance: 5.8,
    speed: 0.53,
    rotationSpeed: 0.009,
    description: 'The Red Planet with the largest volcano and canyon in our solar system.',
    funFact: 'Olympus Mons on Mars is 3x taller than Mount Everest!'
  },
  {
    name: 'Jupiter',
    color: '#D4A574',
    size: 1.0,
    distance: 7.8,
    speed: 0.084,
    rotationSpeed: 0.02,
    description: 'Largest planet, a gas giant with the famous Great Red Spot storm.',
    funFact: 'Jupiter\'s Great Red Spot is a storm bigger than Earth that has raged for 400+ years!'
  },
  {
    name: 'Saturn',
    color: '#E4BE80',
    size: 0.9,
    distance: 10,
    speed: 0.034,
    rotationSpeed: 0.018,
    description: 'Famous for its stunning ring system made of ice and rock.',
    funFact: 'Saturn is so light it would float in water (if you found a big enough bathtub)!',
    hasRings: true,
    ringColor: '#C9B896'
  },
  {
    name: 'Uranus',
    color: '#73C2C6',
    size: 0.55,
    distance: 12,
    speed: 0.012,
    rotationSpeed: 0.015,
    description: 'An ice giant that rotates on its side like a rolling ball.',
    funFact: 'Uranus rotates on its side at a 98° angle - it basically rolls around the Sun!',
    hasRings: true,
    ringColor: '#4A9A9F'
  },
  {
    name: 'Neptune',
    color: '#3953A4',
    size: 0.52,
    distance: 14,
    speed: 0.006,
    rotationSpeed: 0.014,
    description: 'The windiest planet with supersonic storms up to 2,100 km/h.',
    funFact: 'Neptune has the strongest winds in the solar system - over 2,000 km/h!'
  },
];

interface PlanetProps {
  planet: PlanetData;
  isSelected: boolean;
  onSelect: () => void;
  timeScale: number;
  isZoomed: boolean;
}

const Planet = ({ planet, isSelected, onSelect, timeScale, isZoomed }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !orbitRef.current) return;
    const time = state.clock.getElapsedTime() * timeScale;

    // Orbit around sun (skip if zoomed on this planet)
    if (!isZoomed || !isSelected) {
      orbitRef.current.rotation.y = time * planet.speed * 0.15;
    }

    // Self rotation
    meshRef.current.rotation.y += planet.rotationSpeed * timeScale;

    if (ringsRef.current) {
      ringsRef.current.rotation.z = 0.5;
    }
  });

  return (
    <group ref={orbitRef}>
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 128]} />
        <meshBasicMaterial
          color={isSelected ? '#00FFD1' : '#ffffff'}
          opacity={isSelected ? 0.4 : 0.08}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Planet */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[planet.distance, 0, 0]}>
          <mesh
            ref={meshRef}
            onClick={onSelect}
          >
            <sphereGeometry args={[planet.size, 64, 64]} />
            <meshStandardMaterial
              color={planet.color}
              roughness={0.6}
              metalness={0.2}
              emissive={planet.color}
              emissiveIntensity={isSelected ? 0.4 : 0.08}
            />
          </mesh>

          {/* Rings for Saturn and Uranus */}
          {planet.hasRings && (
            <mesh ref={ringsRef} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.size * 1.3, planet.size * 2.2, 64]} />
              <meshBasicMaterial
                color={planet.ringColor}
                opacity={0.7}
                transparent
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Selection glow */}
          {isSelected && (
            <mesh>
              <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
              <meshBasicMaterial
                color="#00FFD1"
                opacity={0.15}
                transparent
              />
            </mesh>
          )}
        </group>
      </Float>

      {/* Planet label */}
      <Html position={[planet.distance, planet.size + 0.5, 0]} center>
        <motion.div
          className={`px-2 py-1 rounded text-xs font-mono-lab whitespace-nowrap transition-all cursor-pointer ${isSelected ? 'bg-neon-cyan/40 text-neon-cyan scale-110' : 'bg-black/60 text-white/80 hover:bg-black/80'
            }`}
          onClick={onSelect}
          whileHover={{ scale: 1.1 }}
        >
          {planet.name}
        </motion.div>
      </Html>
    </group>
  );
};

const Sun = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#FFA500" opacity={0.3} transparent />
      </mesh>
      <pointLight intensity={3} distance={60} color="#FDB813" />
      <pointLight intensity={1.5} distance={80} color="#FF8C00" />
    </group>
  );
};

interface CameraControllerProps {
  selectedPlanet: number | null;
  isZoomed: boolean;
}

const CameraController = ({ selectedPlanet, isZoomed }: CameraControllerProps) => {
  const { camera } = useThree();

  useFrame(() => {
    if (isZoomed && selectedPlanet !== null) {
      const planet = planets[selectedPlanet];
      const targetPos = new THREE.Vector3(planet.distance + planet.size * 3, planet.size * 2, planet.size * 3);
      camera.position.lerp(targetPos, 0.02);

      const lookAt = new THREE.Vector3(planet.distance, 0, 0);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      camera.lookAt(lookAt);
    } else {
      const targetPos = new THREE.Vector3(0, 12, 18);
      camera.position.lerp(targetPos, 0.02);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

const Scene3DLab = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [timeScale, setTimeScale] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentPlanet = selectedPlanet !== null ? planets[selectedPlanet] : null;

  const handlePrevPlanet = () => {
    setSelectedPlanet(prev => prev === null || prev === 0 ? planets.length - 1 : prev - 1);
    setIsZoomed(false);
  };

  const handleNextPlanet = () => {
    setSelectedPlanet(prev => prev === null ? 0 : (prev + 1) % planets.length);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    if (selectedPlanet !== null) {
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 12, 18], fov: 50 }}>
            <CameraController selectedPlanet={selectedPlanet} isZoomed={isZoomed} />
            <ambientLight intensity={0.15} />

            <Sun />

            {planets.map((planet, index) => (
              <Planet
                key={planet.name}
                planet={planet}
                isSelected={selectedPlanet === index}
                onSelect={() => {
                  setSelectedPlanet(index);
                  setShowInfo(true);
                }}
                timeScale={timeScale}
                isZoomed={isZoomed && selectedPlanet === index}
              />
            ))}

            <Stars radius={150} depth={60} count={8000} factor={5} fade speed={0.5} />

            {isZoomed && selectedPlanet !== null && (
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={2}
                maxDistance={10}
              />
            )}
          </Canvas>
        </div>

        {/* Header - Fixed positioning to avoid navbar overlap */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-4 z-40"
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

        {/* Title - Positioned below navbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-3">
            <Globe className="w-5 h-5 text-neon-lime" />
            <span className="font-bold neon-text-lime">Solar System Explorer</span>
          </div>
        </motion.div>

        {/* Zoom Controls */}
        {selectedPlanet !== null && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-36 right-4 z-40 flex flex-col gap-2"
          >
            <motion.button
              onClick={toggleZoom}
              className={`glass-panel p-3 rounded-xl ${isZoomed ? 'bg-neon-cyan/20' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5 text-neon-cyan" /> : <ZoomIn className="w-5 h-5" />}
            </motion.button>
            {isZoomed && (
              <motion.button
                onClick={() => setIsZoomed(false)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-3 rounded-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Planet Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-4">
            <motion.button
              onClick={handlePrevPlanet}
              className="p-2 rounded-lg hover:bg-accent"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex gap-2">
              {planets.map((planet, index) => (
                <motion.button
                  key={planet.name}
                  onClick={() => {
                    setSelectedPlanet(index);
                    setShowInfo(true);
                    setIsZoomed(false);
                  }}
                  className={`w-4 h-4 rounded-full transition-all ${selectedPlanet === index ? 'ring-2 ring-neon-cyan ring-offset-2 ring-offset-background scale-125' : 'hover:scale-110'
                    }`}
                  style={{ backgroundColor: planet.color }}
                  whileHover={{ scale: 1.3 }}
                  title={planet.name}
                />
              ))}
            </div>

            <motion.button
              onClick={handleNextPlanet}
              className="p-2 rounded-lg hover:bg-accent"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Planet Info Panel */}
        <AnimatePresence>
          {currentPlanet && showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed top-36 right-4 z-40 w-80"
            >
              <div className="glass-panel p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: currentPlanet.color,
                        boxShadow: `0 0 20px ${currentPlanet.color}`
                      }}
                    />
                    <h3 className="font-bold text-xl" style={{ color: currentPlanet.color }}>
                      {currentPlanet.name}
                    </h3>
                  </div>
                  <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-muted rounded">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {currentPlanet.description}
                </p>

                <motion.div
                  className="bg-neon-lime/10 border border-neon-lime/30 rounded-lg p-4"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <p className="text-xs font-bold text-neon-lime mb-2 flex items-center gap-2">
                    🎓 Fun Fact
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentPlanet.funFact}
                  </p>
                </motion.div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-muted-foreground mb-1">Relative Size</div>
                    <div className="font-mono-lab font-bold text-foreground">
                      {(currentPlanet.size * 10).toFixed(1)} units
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-muted-foreground mb-1">Orbit Speed</div>
                    <div className="font-mono-lab font-bold text-foreground">
                      {currentPlanet.speed.toFixed(3)}x
                    </div>
                  </div>
                </div>

                {/* Zoom instruction */}
                <motion.p
                  className="text-xs text-center text-neon-cyan mt-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Click 🔍 to zoom in and rotate the planet!
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed top-36 left-4 z-40"
        >
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs text-muted-foreground mb-2">Time Speed</div>
            <div className="flex gap-2">
              {[0.25, 0.5, 1, 2, 4].map((scale) => (
                <motion.button
                  key={scale}
                  onClick={() => setTimeScale(scale)}
                  className={`px-2 py-1 rounded text-xs font-mono-lab transition-all ${timeScale === scale
                      ? 'bg-neon-lime/20 text-neon-lime border border-neon-lime/50'
                      : 'bg-background/50 hover:bg-background/80 text-muted-foreground'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {scale}x
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-4 left-4 z-40"
        >
          <div className="glass-panel px-4 py-3 rounded-xl">
            <p className="text-sm text-muted-foreground font-mono-lab">
              Click planets to learn • Use navigation to explore • Zoom in to rotate
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="fixed bottom-4 right-4 z-40">
          <div className="glass-panel px-4 py-2 rounded-xl">
            <p className="text-xs text-neon-cyan font-medium">
              Created by FAITH TECH
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Scene3DLab;
