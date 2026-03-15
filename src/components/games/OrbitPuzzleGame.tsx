import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Planet {
  id: string;
  name: string;
  color: string;
  correctPosition: number;
  currentPosition: number | null;
  funFact: string;
}

interface OrbitPuzzleGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
}

const allPlanets: Omit<Planet, 'currentPosition'>[] = [
  { id: 'mercury', name: 'Mercury', color: '#A0522D', correctPosition: 0, funFact: 'Closest to the Sun!' },
  { id: 'venus', name: 'Venus', color: '#DEB887', correctPosition: 1, funFact: 'Hottest planet!' },
  { id: 'earth', name: 'Earth', color: '#4169E1', correctPosition: 2, funFact: 'Our home!' },
  { id: 'mars', name: 'Mars', color: '#CD5C5C', correctPosition: 3, funFact: 'The Red Planet!' },
  { id: 'jupiter', name: 'Jupiter', color: '#DAA520', correctPosition: 4, funFact: 'Largest planet!' },
  { id: 'saturn', name: 'Saturn', color: '#F4A460', correctPosition: 5, funFact: 'Famous rings!' },
  { id: 'uranus', name: 'Uranus', color: '#40E0D0', correctPosition: 6, funFact: 'Rotates on its side!' },
  { id: 'neptune', name: 'Neptune', color: '#4169E1', correctPosition: 7, funFact: 'Windiest planet!' },
];

export const OrbitPuzzleGame = ({ difficulty, onScoreUpdate, isPlaying }: OrbitPuzzleGameProps) => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [orbits, setOrbits] = useState<(string | null)[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const difficultySettings = {
    Easy: { planetCount: 4, hintsAllowed: true },
    Medium: { planetCount: 6, hintsAllowed: true },
    Hard: { planetCount: 8, hintsAllowed: false },
  };

  const settings = difficultySettings[difficulty];

  useEffect(() => {
    if (!isPlaying) return;
    
    const gamePlanets = allPlanets.slice(0, settings.planetCount).map(p => ({
      ...p,
      currentPosition: null,
    }));
    
    // Shuffle for display
    const shuffled = [...gamePlanets].sort(() => Math.random() - 0.5);
    setPlanets(shuffled);
    setOrbits(Array(settings.planetCount).fill(null));
    setSolved(false);
    setAttempts(0);
  }, [isPlaying, settings.planetCount]);

  const handleOrbitClick = (orbitIndex: number) => {
    if (!selectedPlanet || solved) return;

    const planet = planets.find(p => p.id === selectedPlanet);
    if (!planet) return;

    // Remove from previous position
    const newOrbits = orbits.map(o => o === selectedPlanet ? null : o);
    
    // Place in new position (swap if occupied)
    const occupant = newOrbits[orbitIndex];
    newOrbits[orbitIndex] = selectedPlanet;

    setOrbits(newOrbits);
    setPlanets(prev => prev.map(p => {
      if (p.id === selectedPlanet) return { ...p, currentPosition: orbitIndex };
      if (p.id === occupant) return { ...p, currentPosition: null };
      return p;
    }));
    setSelectedPlanet(null);
    setAttempts(a => a + 1);

    // Check if solved
    const allPlaced = newOrbits.every(o => o !== null);
    if (allPlaced) {
      const allCorrect = planets.every(p => {
        const pos = newOrbits.indexOf(p.id);
        return pos === p.correctPosition;
      });

      if (allCorrect) {
        setSolved(true);
        const basePoints = 100;
        const attemptPenalty = Math.max(0, (attempts - settings.planetCount) * 5);
        const points = Math.max(20, basePoints - attemptPenalty);
        onScoreUpdate(points);
      }
    }
  };

  const handlePlanetClick = (planetId: string) => {
    if (solved) return;
    setSelectedPlanet(selectedPlanet === planetId ? null : planetId);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* Sun and Orbits */}
      <div className="relative w-80 h-80 mb-4">
        {/* Sun */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-400"
          animate={{ 
            boxShadow: ['0 0 20px #FDB813', '0 0 40px #FDB813', '0 0 20px #FDB813'],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Orbit Rings */}
        {orbits.map((planetId, i) => {
          const radius = 40 + i * 28;
          const planet = planets.find(p => p.id === planetId);
          const isCorrect = planet && i === planet.correctPosition;
          
          return (
            <g key={i}>
              {/* Orbit path */}
              <motion.div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                  solved && isCorrect ? 'border-neon-lime/50' : 'border-border'
                }`}
                style={{ width: radius * 2, height: radius * 2 }}
                onClick={() => handleOrbitClick(i)}
                whileHover={!solved ? { borderColor: 'hsl(185, 100%, 50%)' } : {}}
              />
              
              {/* Planet on orbit */}
              {planet && (
                <motion.div
                  className="absolute"
                  style={{
                    left: `calc(50% + ${radius}px - 12px)`,
                    top: 'calc(50% - 12px)',
                  }}
                  animate={solved && isCorrect ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${isCorrect && solved ? 'ring-2 ring-neon-lime' : ''}`}
                    style={{ backgroundColor: planet.color }}
                  />
                </motion.div>
              )}
              
              {/* Position hint */}
              {showHint && !planetId && settings.hintsAllowed && (
                <div
                  className="absolute text-[10px] text-muted-foreground"
                  style={{
                    left: `calc(50% + ${radius}px + 8px)`,
                    top: 'calc(50% - 6px)',
                  }}
                >
                  {i + 1}
                </div>
              )}
            </g>
          );
        })}
      </div>

      {/* Planet Bank */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {planets
          .filter(p => p.currentPosition === null)
          .map(planet => (
            <motion.button
              key={planet.id}
              onClick={() => handlePlanetClick(planet.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg glass-panel ${
                selectedPlanet === planet.id ? 'ring-2 ring-neon-cyan' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              <span className="text-sm">{planet.name}</span>
            </motion.button>
          ))}
      </div>

      {/* Status */}
      {solved ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-neon-lime">🎉 Perfect Orbit!</p>
          <p className="text-sm text-muted-foreground">Completed in {attempts} moves</p>
        </motion.div>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Moves: {attempts} | Click a planet, then click an orbit
          </p>
          {settings.hintsAllowed && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-neon-cyan hover:underline"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground font-mono-lab">
          Arrange planets in correct orbital order from the Sun! 🌞
        </p>
      </div>
    </div>
  );
};
