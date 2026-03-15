import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Brain, 
  Palette, 
  Accessibility, 
  Code,
  ChevronRight,
  ChevronLeft,
  Check,
  Play,
  GraduationCap
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  keyPoints: string[];
  codeExample?: string;
  activity?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: 'computational-thinking',
    title: 'Computational Thinking',
    description: 'Learn to solve problems like a computer scientist',
    icon: <Brain className="w-6 h-6" />,
    color: 'neon-cyan',
    lessons: [
      {
        id: 'ct-1',
        title: 'What is Computational Thinking?',
        duration: '5 min',
        content: 'Computational thinking is a problem-solving approach that involves breaking down complex problems into smaller, manageable parts. It\'s not just for programmers—it\'s a fundamental skill for everyone!',
        keyPoints: [
          'Decomposition: Breaking problems into smaller parts',
          'Pattern Recognition: Finding similarities',
          'Abstraction: Focusing on important information',
          'Algorithms: Creating step-by-step solutions',
        ],
        activity: 'Try the Particle Lab and observe how thousands of simple particles create complex patterns!',
      },
      {
        id: 'ct-2',
        title: 'Algorithms in Action',
        duration: '7 min',
        content: 'An algorithm is a set of step-by-step instructions to solve a problem. Every program, from video games to social media, runs on algorithms.',
        keyPoints: [
          'Algorithms are like recipes for computers',
          'They must be precise and unambiguous',
          'Small changes can create big differences',
          'Efficiency matters—faster is usually better',
        ],
        codeExample: `// Simple particle movement algorithm
function moveParticle(particle) {
  // Step 1: Apply velocity to position
  particle.x += particle.velocity.x;
  particle.y += particle.velocity.y;
  
  // Step 2: Apply forces (like gravity)
  particle.velocity.y += gravity;
  
  // Step 3: Check boundaries
  if (particle.y > groundLevel) {
    particle.y = groundLevel;
    particle.velocity.y *= -0.8; // Bounce!
  }
}`,
        activity: 'Go to the Physics Playground and change the speed—watch how the algorithm affects particle behavior!',
      },
      {
        id: 'ct-3',
        title: 'Loops and Repetition',
        duration: '6 min',
        content: 'Computers are amazing at doing the same thing millions of times. Loops let us repeat actions efficiently.',
        keyPoints: [
          'Loops repeat code a specified number of times',
          'They can run based on conditions',
          'Animation is just drawing in a loop',
          'Games run at 60 loops per second!',
        ],
        codeExample: `// Animation loop
function animate() {
  // Clear the screen
  clearCanvas();
  
  // Update all particles
  for (let i = 0; i < particles.length; i++) {
    moveParticle(particles[i]);
    drawParticle(particles[i]);
  }
  
  // Do it again! (60 times per second)
  requestAnimationFrame(animate);
}`,
      },
    ],
  },
  {
    id: 'creative-technology',
    title: 'Creative Technology',
    description: 'Where art meets code',
    icon: <Palette className="w-6 h-6" />,
    color: 'neon-magenta',
    lessons: [
      {
        id: 'crt-1',
        title: 'What is Creative Coding?',
        duration: '5 min',
        content: 'Creative coding uses programming as a tool for artistic expression. Instead of solving business problems, we create visual experiences, music, and interactive art.',
        keyPoints: [
          'Code can be art, not just utility',
          'Artists and programmers can be the same person',
          'Mistakes often lead to beautiful discoveries',
          'Every artwork can be unique with generative code',
        ],
        activity: 'Visit the Meditative Art lab and generate your own unique artwork!',
      },
      {
        id: 'crt-2',
        title: 'Color and Perception',
        duration: '6 min',
        content: 'Colors on screens work differently than paint. Understanding RGB and HSL helps create stunning visual effects.',
        keyPoints: [
          'Screens mix light (RGB), not pigments',
          'HSL is more intuitive for artists',
          'Colors can evoke emotions and moods',
          'Gradients create depth and movement',
        ],
        codeExample: `// Creating colors programmatically
// HSL: Hue (0-360), Saturation (0-100%), Lightness (0-100%)

// Warm sunset palette
const sunset = [
  'hsl(20, 100%, 60%)',   // Orange
  'hsl(340, 100%, 50%)',  // Pink
  'hsl(280, 80%, 40%)',   // Purple
];

// Rainbow gradient
for (let i = 0; i < 360; i++) {
  const color = \`hsl(\${i}, 100%, 50%)\`;
  drawLine(i, color);
}`,
      },
      {
        id: 'crt-3',
        title: 'Motion and Animation',
        duration: '7 min',
        content: 'Animation brings art to life. Understanding timing, easing, and physics helps create natural-feeling motion.',
        keyPoints: [
          'Animation is just rapid image changes',
          'Easing makes motion feel natural',
          'Physics-based animation is most realistic',
          'Frame rate affects smoothness',
        ],
      },
    ],
  },
  {
    id: 'accessible-interfaces',
    title: 'Accessible Interfaces',
    description: 'Technology for everyone',
    icon: <Accessibility className="w-6 h-6" />,
    color: 'neon-lime',
    lessons: [
      {
        id: 'ai-1',
        title: 'Why Accessibility Matters',
        duration: '5 min',
        content: 'Over 1 billion people worldwide live with some form of disability. Accessible design ensures everyone can use technology, regardless of their abilities.',
        keyPoints: [
          '15% of the world has a disability',
          'Accessibility helps everyone, not just disabled users',
          'It\'s about removing barriers, not special treatment',
          'Good design is accessible design',
        ],
        activity: 'Try using the hand tracking feature—imagine if this was your only way to interact!',
      },
      {
        id: 'ai-2',
        title: 'Hand Gesture Recognition',
        duration: '8 min',
        content: 'Hand tracking uses AI to recognize hand positions and gestures. This enables touchless interaction, benefiting people with mobility challenges and many other use cases.',
        keyPoints: [
          'AI detects 21 points on each hand',
          'Gestures can replace mouse clicks',
          'Useful for sterile environments (medical)',
          'Powers VR and AR interactions',
        ],
        codeExample: `// Detecting a "pinch" gesture
function detectPinch(landmarks) {
  // Get thumb tip and index tip
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  // Calculate distance
  const distance = Math.sqrt(
    (thumbTip.x - indexTip.x) ** 2 +
    (thumbTip.y - indexTip.y) ** 2
  );
  
  // If close enough, it's a pinch!
  return distance < 0.05;
}`,
        activity: 'Enable hand tracking on the home page and try all 5 gestures!',
      },
      {
        id: 'ai-3',
        title: 'Alternative Input Methods',
        duration: '6 min',
        content: 'Beyond mouse and keyboard, there are many ways to interact with computers: voice, eye tracking, motion sensors, and more.',
        keyPoints: [
          'Voice control helps hands-free interaction',
          'Eye tracking enables control for paralyzed users',
          'Motion sensors detect device orientation',
          'Each method opens new possibilities',
        ],
      },
    ],
  },
  {
    id: 'web-technologies',
    title: 'Web Technologies',
    description: 'Building the modern web',
    icon: <Code className="w-6 h-6" />,
    color: 'neon-orange',
    lessons: [
      {
        id: 'wt-1',
        title: 'The Web Platform',
        duration: '5 min',
        content: 'The web is the most accessible platform ever created. With just a URL, anyone can access your creation from anywhere in the world.',
        keyPoints: [
          'No installation required—just open a link',
          'Works on any device with a browser',
          'HTML, CSS, and JavaScript are the core technologies',
          'Modern browsers are incredibly powerful',
        ],
      },
      {
        id: 'wt-2',
        title: 'WebGL and 3D Graphics',
        duration: '7 min',
        content: 'WebGL allows 3D graphics directly in the browser. It uses the GPU for fast rendering, enabling games and visualizations that were once desktop-only.',
        keyPoints: [
          'WebGL talks directly to the graphics card',
          'Three.js makes WebGL easier to use',
          'Can render millions of polygons',
          'Powers browser-based games and tools',
        ],
        codeExample: `// Creating a 3D scene with Three.js
import * as THREE from 'three';

// Scene, Camera, Renderer - the basics
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,                  // Field of view
  window.innerWidth / window.innerHeight,
  0.1,                 // Near clipping plane
  1000                 // Far clipping plane
);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ff00 
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);`,
        activity: 'Explore the Solar System lab to see WebGL in action!',
      },
      {
        id: 'wt-3',
        title: 'Canvas API',
        duration: '6 min',
        content: 'The Canvas API provides a way to draw 2D graphics. It\'s perfect for games, charts, and artistic visualizations.',
        keyPoints: [
          'Draw shapes, images, and text',
          'Full control over every pixel',
          'Great for real-time graphics',
          'Simpler than WebGL for 2D work',
        ],
      },
    ],
  },
];

interface LearningHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningHub = ({ isOpen, onClose }: LearningHubProps) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem('completed-lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const currentLesson = selectedModule?.lessons[currentLessonIndex];

  const markComplete = () => {
    if (!currentLesson) return;
    if (!completedLessons.includes(currentLesson.id)) {
      const updated = [...completedLessons, currentLesson.id];
      setCompletedLessons(updated);
      localStorage.setItem('completed-lessons', JSON.stringify(updated));
    }
    
    // Auto-advance to next lesson
    if (selectedModule && currentLessonIndex < selectedModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative glass-panel rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Learning Hub</h2>
                  <p className="text-xs text-muted-foreground">
                    {completedLessons.length} lessons completed
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-80px)]">
              {/* Sidebar - Modules */}
              <div className="w-80 border-r border-border p-4 overflow-y-auto">
                <div className="space-y-3">
                  {modules.map((module) => {
                    const progress = getModuleProgress(module);
                    const isSelected = selectedModule?.id === module.id;
                    
                    return (
                      <motion.button
                        key={module.id}
                        onClick={() => { setSelectedModule(module); setCurrentLessonIndex(0); }}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          isSelected 
                            ? `bg-${module.color}/20 border border-${module.color}/50` 
                            : 'bg-card/50 hover:bg-card/80 border border-transparent'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-${module.color}/20 flex items-center justify-center flex-shrink-0`}>
                            {module.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{module.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{module.description}</p>
                            
                            {/* Progress bar */}
                            <div className="mt-2">
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-${module.color} transition-all`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {progress}% complete
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content - Lesson */}
              <div className="flex-1 overflow-y-auto">
                {selectedModule && currentLesson ? (
                  <div className="p-6">
                    {/* Lesson Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        {selectedModule.lessons.map((lesson, idx) => (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLessonIndex(idx)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              idx === currentLessonIndex
                                ? 'bg-primary text-primary-foreground'
                                : completedLessons.includes(lesson.id)
                                ? 'bg-neon-lime/20 text-neon-lime'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {completedLessons.includes(lesson.id) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Lesson {currentLessonIndex + 1} of {selectedModule.lessons.length}
                      </span>
                    </div>

                    {/* Lesson Content */}
                    <motion.div
                      key={currentLesson.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-2xl font-bold">{currentLesson.title}</h3>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {currentLesson.duration}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {currentLesson.content}
                      </p>

                      {/* Key Points */}
                      <div className="bg-card/50 rounded-xl p-4 mb-6">
                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Key Points
                        </h4>
                        <ul className="space-y-2">
                          {currentLesson.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Code Example */}
                      {currentLesson.codeExample && (
                        <div className="bg-[#1a1a2e] rounded-xl p-4 mb-6">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4 text-neon-orange" />
                            Code Example
                          </h4>
                          <pre className="text-xs font-mono-lab overflow-x-auto text-neon-lime/80">
                            {currentLesson.codeExample}
                          </pre>
                        </div>
                      )}

                      {/* Activity */}
                      {currentLesson.activity && (
                        <div className="bg-neon-lime/10 border border-neon-lime/30 rounded-xl p-4 mb-6">
                          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Play className="w-4 h-4 text-neon-lime" />
                            Try It Yourself
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {currentLesson.activity}
                          </p>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                        <button
                          onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                          disabled={currentLessonIndex === 0}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <motion.button
                          onClick={markComplete}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {completedLessons.includes(currentLesson.id) ? (
                            <>
                              <Check className="w-4 h-4" />
                              Completed
                            </>
                          ) : currentLessonIndex === selectedModule.lessons.length - 1 ? (
                            'Complete Module'
                          ) : (
                            'Complete & Continue'
                          )}
                        </motion.button>

                        <button
                          onClick={() => setCurrentLessonIndex(Math.min(selectedModule.lessons.length - 1, currentLessonIndex + 1))}
                          disabled={currentLessonIndex === selectedModule.lessons.length - 1}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent disabled:opacity-50"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a module to start learning</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
