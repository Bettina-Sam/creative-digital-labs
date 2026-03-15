import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { 
  GraduationCap, Brain, Palette, Accessibility, Code,
  ChevronRight, BookOpen, CheckCircle, Play, Clock, Star, Volume2,
  Database, Gamepad2, Cpu, Music, History
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { ParticleField } from '@/components/ParticleField';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  content: string;
  keyPoints: string[];
  codeExample?: string;
  tryIt?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  color: string;
  lessons: Lesson[];
  challenges: string[];
}

const modules: Module[] = [
  {
    id: 'computational',
    title: 'Computational Thinking',
    description: 'Learn algorithmic thinking, problem decomposition, and logical reasoning through interactive examples.',
    icon: Brain,
    color: 'neon-cyan',
    lessons: [
      { id: '1', title: 'What is Computational Thinking?', duration: '5 min', content: 'Computational thinking is a problem-solving approach that involves breaking down complex problems into smaller, manageable parts. It is not about thinking like a computer—it is about thinking in a way that computers can help you solve problems efficiently.', keyPoints: ['Decomposition: Breaking problems into smaller parts', 'Pattern recognition: Finding similarities', 'Abstraction: Focusing on important details', 'Algorithm design: Creating step-by-step solutions'], codeExample: '// Example: Sorting a list\nfunction bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}', tryIt: 'Try decomposing a daily task (like making breakfast) into algorithmic steps!' },
      { id: '2', title: 'Breaking Down Problems', duration: '8 min', content: 'Decomposition is the process of breaking a complex problem into smaller, more manageable sub-problems. Each sub-problem can be solved independently, making the overall problem easier to tackle.', keyPoints: ['Identify the main problem clearly', 'List all sub-problems', 'Solve each independently', 'Combine solutions'], tryIt: 'Decompose the problem of building a website into smaller tasks!' },
      { id: '3', title: 'Pattern Recognition', duration: '10 min', content: 'Pattern recognition involves finding similarities or trends in data or problems. By recognizing patterns, we can apply known solutions to new problems.', keyPoints: ['Look for repeating elements', 'Compare with known solutions', 'Use patterns to predict outcomes', 'Generalize patterns into rules'], codeExample: '// Pattern: Fibonacci sequence\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}' },
      { id: '4', title: 'Algorithms & Sequences', duration: '12 min', content: 'An algorithm is a step-by-step set of instructions for solving a problem. Every computer program is an algorithm. Good algorithms are efficient, clear, and correct.', keyPoints: ['Algorithms have input and output', 'Each step must be precise', 'Efficiency matters (Big O notation)', 'Test with edge cases'], codeExample: '// Binary Search Algorithm\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}' },
      { id: '5', title: 'Variables & Data Storage', duration: '10 min', content: 'Variables are containers for storing data values. Understanding how data is stored and manipulated is fundamental to programming.', keyPoints: ['Variables have names and values', 'Different data types exist', 'Scope determines accessibility', 'Constants vs mutable variables'] },
      { id: '6', title: 'Loops & Iteration', duration: '15 min', content: 'Loops allow us to repeat actions efficiently. Instead of writing the same code multiple times, we use loops to iterate over data.', keyPoints: ['For loops for known iterations', 'While loops for conditions', 'Avoid infinite loops', 'Break and continue statements'], codeExample: '// Drawing a pattern with loops\nfor (let row = 0; row < 5; row++) {\n  let line = "";\n  for (let col = 0; col <= row; col++) {\n    line += "* ";\n  }\n  console.log(line);\n}' },
    ],
    challenges: ['Design an algorithm to sort particles by color', 'Create a pattern using loops', 'Build a simple state machine'],
  },
  {
    id: 'creative',
    title: 'Creative Technology',
    description: 'Explore the intersection of art and code. Learn generative art, animations, and creative coding.',
    icon: Palette,
    color: 'neon-magenta',
    lessons: [
      { id: '1', title: 'Introduction to Creative Coding', duration: '6 min', content: 'Creative coding uses programming as a medium for artistic expression. Unlike traditional software development, the goal is visual, auditory, or experiential output rather than functional utility.', keyPoints: ['Code as an artistic medium', 'Generative vs deterministic art', 'Popular tools: p5.js, Processing, Three.js', 'Real-time rendering and interaction'] },
      { id: '2', title: 'Color Theory in Code', duration: '10 min', content: 'Understanding color is essential for creative coding. Colors can be represented in different models: RGB, HSL, and HSV, each useful for different purposes.', keyPoints: ['RGB: Red, Green, Blue channels', 'HSL: Hue, Saturation, Lightness', 'Color harmony: complementary, analogous', 'Opacity and blending modes'], codeExample: '// HSL color generation\nfunction rainbow(steps) {\n  return Array.from({length: steps}, (_, i) => {\n    const hue = (i / steps) * 360;\n    return `hsl(${hue}, 100%, 50%)`;\n  });\n}' },
      { id: '3', title: 'Particle Systems Basics', duration: '12 min', content: 'Particle systems simulate collections of small objects (particles) that together create complex visual effects like fire, smoke, rain, and explosions.', keyPoints: ['Each particle has position, velocity, life', 'Physics: gravity, friction, wind', 'Emission rate and patterns', 'Visual effects through accumulation'] },
      { id: '4', title: 'Generative Art Principles', duration: '15 min', content: 'Generative art uses autonomous systems—algorithms, mathematical functions, or random processes—to create art. The artist designs the system, not the output.', keyPoints: ['Randomness with constraints', 'Perlin noise for organic forms', 'Recursive patterns and fractals', 'Emergence from simple rules'] },
      { id: '5', title: 'Animation & Motion', duration: '10 min', content: 'Animation brings creative code to life. Understanding easing functions, frame-based updates, and physics-based motion is key.', keyPoints: ['RequestAnimationFrame loop', 'Easing functions for natural motion', 'Spring physics for bounce', 'Keyframe interpolation'] },
      { id: '6', title: 'Interactive Visuals', duration: '12 min', content: 'Making visuals respond to user input creates engaging experiences. Mouse, touch, audio, and sensor data can all drive visual changes.', keyPoints: ['Mouse/touch input mapping', 'Audio-reactive visuals', 'Device orientation sensing', 'Gesture recognition'] },
    ],
    challenges: ['Create your first generative artwork', 'Build an interactive particle system', 'Design a color palette generator'],
  },
  {
    id: 'accessible',
    title: 'Accessible Interfaces',
    description: 'Design technology for everyone. Learn inclusive design, alternative inputs, and assistive tech.',
    icon: Accessibility,
    color: 'neon-lime',
    lessons: [
      { id: '1', title: 'Why Accessibility Matters', duration: '8 min', content: 'Web accessibility ensures that websites and applications are usable by everyone, including people with disabilities. It is both an ethical imperative and often a legal requirement.', keyPoints: ['1 billion people have disabilities worldwide', 'WCAG guidelines provide standards', 'Accessible design benefits everyone', 'Legal requirements in many countries'] },
      { id: '2', title: 'Visual Accessibility', duration: '10 min', content: 'Visual accessibility ensures content is perceivable by users with visual impairments, including blindness, low vision, and color blindness.', keyPoints: ['Color contrast ratios (WCAG AA: 4.5:1)', 'Do not rely on color alone', 'Text alternatives for images', 'Scalable text and zoom support'] },
      { id: '3', title: 'Motor Accessibility', duration: '10 min', content: 'Motor accessibility ensures people with limited mobility can navigate and interact with digital interfaces using various input methods.', keyPoints: ['Keyboard navigation is essential', 'Large click/tap targets (44px min)', 'Avoid time-limited interactions', 'Support alternative input devices'] },
      { id: '4', title: 'Alternative Input Methods', duration: '12 min', content: 'Beyond mouse and keyboard, many users rely on alternative input methods including voice control, eye tracking, switch devices, and gesture recognition.', keyPoints: ['Voice commands for navigation', 'Eye tracking technology', 'Switch access for motor disabilities', 'Gesture-based interfaces'] },
      { id: '5', title: 'Screen Readers & Voice', duration: '10 min', content: 'Screen readers convert digital text to speech or braille. Understanding how they interpret web content is crucial for accessible development.', keyPoints: ['ARIA labels and roles', 'Semantic HTML structure', 'Focus management', 'Live regions for dynamic content'] },
      { id: '6', title: 'Testing for Accessibility', duration: '8 min', content: 'Testing is essential to ensure accessibility. Automated tools catch some issues, but manual testing and user testing are equally important.', keyPoints: ['Automated tools: Lighthouse, axe', 'Keyboard-only navigation testing', 'Screen reader testing', 'User testing with diverse groups'] },
    ],
    challenges: ['Audit a website for accessibility', 'Design gesture-based controls', 'Create an accessible color scheme'],
  },
  {
    id: 'web',
    title: 'Web Technologies',
    description: 'Master modern web graphics. Learn Canvas, WebGL, animations, and browser APIs.',
    icon: Code,
    color: 'neon-orange',
    lessons: [
      { id: '1', title: 'Canvas API Basics', duration: '10 min', content: 'The HTML Canvas API provides a way to draw graphics on a web page using JavaScript. It is a low-level, powerful API for 2D rendering.', keyPoints: ['Canvas element and context', 'Drawing shapes and paths', 'Colors, gradients, patterns', 'Coordinate system and transforms'], codeExample: '// Basic canvas setup\nconst canvas = document.getElementById("myCanvas");\nconst ctx = canvas.getContext("2d");\n\n// Draw a circle\nctx.beginPath();\nctx.arc(100, 100, 50, 0, Math.PI * 2);\nctx.fillStyle = "cyan";\nctx.fill();' },
      { id: '2', title: 'Drawing & Animation', duration: '12 min', content: 'Animation on canvas works by clearing and redrawing the canvas many times per second, creating the illusion of movement.', keyPoints: ['RequestAnimationFrame for smooth animation', 'Clear and redraw pattern', 'Delta time for consistent speed', 'Double buffering technique'] },
      { id: '3', title: 'Introduction to WebGL', duration: '15 min', content: 'WebGL is a JavaScript API for rendering 3D graphics in the browser without plugins. It gives direct access to the GPU for high-performance rendering.', keyPoints: ['GPU-accelerated rendering', 'Vertex and fragment shaders', 'Buffers and textures', 'Matrix transformations'] },
      { id: '4', title: 'Three.js Fundamentals', duration: '15 min', content: 'Three.js is a popular JavaScript library that simplifies WebGL development. It provides high-level abstractions for scenes, cameras, lights, and objects.', keyPoints: ['Scene, Camera, Renderer pattern', 'Geometries and materials', 'Lighting and shadows', 'Loading 3D models'] },
      { id: '5', title: 'Browser Sensors & APIs', duration: '10 min', content: 'Modern browsers expose various sensor APIs that enable creative interactions: device orientation, geolocation, ambient light, and more.', keyPoints: ['DeviceOrientation API', 'Web Audio API', 'MediaDevices for camera/mic', 'Gamepad API'] },
      { id: '6', title: 'Performance Optimization', duration: '12 min', content: 'Performance is critical for smooth animations and interactive experiences. Understanding bottlenecks and optimization techniques is essential.', keyPoints: ['Minimize DOM operations', 'Use requestAnimationFrame', 'Object pooling for particles', 'Web Workers for heavy computation'] },
    ],
    challenges: ['Build a 2D canvas animation', 'Create a 3D scene with Three.js', 'Use device motion for interaction'],
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Understand arrays, stacks, queues, trees, and graphs — the building blocks of efficient code.',
    icon: Database,
    color: 'neon-cyan',
    lessons: [
      { id: '1', title: 'Arrays & Lists', duration: '8 min', content: 'Arrays are ordered collections of elements stored in contiguous memory. They provide fast access by index but slow insertion.', keyPoints: ['O(1) random access', 'O(n) insertion/deletion', 'Fixed vs dynamic sizing', 'Multi-dimensional arrays'], codeExample: '// Array operations\nconst arr = [1, 2, 3];\narr.push(4);      // O(1)\narr.unshift(0);   // O(n)\narr.splice(2, 1); // O(n)' },
      { id: '2', title: 'Stacks & Queues', duration: '10 min', content: 'Stacks follow Last-In-First-Out (LIFO) — like a stack of plates. Queues follow First-In-First-Out (FIFO) — like a line at a store.', keyPoints: ['Stack: push/pop operations', 'Queue: enqueue/dequeue', 'Used in undo systems', 'BFS uses queues, DFS uses stacks'] },
      { id: '3', title: 'Hash Maps', duration: '12 min', content: 'Hash maps store key-value pairs with near-instant lookup. They use a hash function to compute an index.', keyPoints: ['O(1) average lookup', 'Collision handling', 'Used everywhere in programming', 'Objects in JS are hash maps'] },
      { id: '4', title: 'Trees & Graphs', duration: '15 min', content: 'Trees are hierarchical structures (DOM, file systems). Graphs model networks and relationships.', keyPoints: ['Binary trees, BSTs', 'Tree traversal: BFS, DFS', 'Graphs: directed vs undirected', 'Adjacency list vs matrix'] },
    ],
    challenges: ['Implement a stack using arrays', 'Build a simple hash map', 'Traverse a binary tree'],
  },
  {
    id: 'game-dev',
    title: 'Game Development',
    description: 'Learn game loops, collision detection, sprite animation, and state machines for interactive games.',
    icon: Gamepad2,
    color: 'neon-magenta',
    lessons: [
      { id: '1', title: 'The Game Loop', duration: '8 min', content: 'Every game runs a continuous loop: update state, then render. RequestAnimationFrame provides smooth 60fps updates.', keyPoints: ['Update → Render cycle', 'Delta time for consistency', 'Fixed vs variable timestep', 'RequestAnimationFrame'] },
      { id: '2', title: 'Collision Detection', duration: '12 min', content: 'Detecting when game objects touch or overlap is fundamental. Simple methods include bounding box and circle collision.', keyPoints: ['AABB (box) collision', 'Circle collision (distance)', 'Pixel-perfect collision', 'Spatial partitioning'] },
      { id: '3', title: 'Sprites & Animation', duration: '10 min', content: 'Sprites are 2D images that represent game objects. Animation works by cycling through frames of a sprite sheet.', keyPoints: ['Sprite sheets', 'Frame-based animation', 'State-based sprites', 'Canvas drawImage'] },
      { id: '4', title: 'Game State Machines', duration: '10 min', content: 'Games have states: menu, playing, paused, game over. State machines organize transitions between these states.', keyPoints: ['Finite state machines', 'State transitions', 'Input handling per state', 'Clean separation of concerns'] },
    ],
    challenges: ['Build a simple platformer', 'Implement collision detection', 'Create a game state machine'],
  },
  {
    id: 'ai-basics',
    title: 'AI & Machine Learning',
    description: 'Explore the fundamentals of artificial intelligence, neural networks, and how machines learn from data.',
    icon: Cpu,
    color: 'neon-lime',
    lessons: [
      { id: '1', title: 'What is AI?', duration: '8 min', content: 'Artificial Intelligence is the simulation of human intelligence by machines. It ranges from simple rules to complex neural networks.', keyPoints: ['Narrow AI vs General AI', 'Rule-based vs learning-based', 'AI in everyday life', 'History of AI development'] },
      { id: '2', title: 'Neural Networks Basics', duration: '12 min', content: 'Neural networks are inspired by the brain. They consist of layers of interconnected nodes that process information.', keyPoints: ['Neurons and weights', 'Layers: input, hidden, output', 'Activation functions', 'Forward propagation'] },
      { id: '3', title: 'Training & Learning', duration: '15 min', content: 'Machine learning involves training models on data. The model adjusts its weights to minimize errors over many iterations.', keyPoints: ['Training data vs test data', 'Loss functions', 'Gradient descent', 'Overfitting and underfitting'] },
      { id: '4', title: 'AI Ethics', duration: '10 min', content: 'AI raises important ethical questions about bias, privacy, job displacement, and decision-making accountability.', keyPoints: ['Bias in training data', 'Privacy concerns', 'Transparency and explainability', 'Responsible AI development'] },
    ],
    challenges: ['Design a simple decision tree', 'Identify bias in a dataset', 'Explain how a recommendation system works'],
  },
  {
    id: 'digital-art',
    title: 'Digital Art History',
    description: 'Trace the evolution of digital art from early computer graphics to modern generative and AI art.',
    icon: History,
    color: 'neon-orange',
    lessons: [
      { id: '1', title: 'Early Computer Art', duration: '8 min', content: 'Digital art began in the 1960s when artists first used computers to generate visual patterns. Pioneers like Vera Molnár and Harold Cohen explored algorithmic creativity.', keyPoints: ['1960s: First computer-generated art', 'Plotters and vector graphics', 'Algorithmic composition', 'Art meets mathematics'] },
      { id: '2', title: 'The Pixel Revolution', duration: '10 min', content: 'The rise of personal computers brought pixel art, digital painting, and graphic design tools that democratized art creation.', keyPoints: ['Pixel art in games', 'Digital painting tools', 'Adobe Photoshop era', 'Web design as art form'] },
      { id: '3', title: 'Generative & Creative Coding', duration: '12 min', content: 'Processing, p5.js, and other tools enabled artists to write code as their medium, creating art that evolves and responds.', keyPoints: ['Processing (2001)', 'Generative art movement', 'Live coding performances', 'Data visualization as art'] },
      { id: '4', title: 'AI Art & The Future', duration: '10 min', content: 'AI tools like DALL-E and Midjourney have transformed art creation. The future blends human creativity with machine intelligence.', keyPoints: ['GANs and diffusion models', 'Human-AI collaboration', 'NFTs and digital ownership', 'Future of creative tools'] },
    ],
    challenges: ['Create art inspired by early computer artists', 'Design a generative artwork', 'Explore AI art tools'],
  },
  {
    id: 'sound-theory',
    title: 'Sound & Music Theory',
    description: 'Understand acoustics, frequencies, harmonics, and how digital audio works — from physics to code.',
    icon: Music,
    color: 'neon-purple',
    lessons: [
      { id: '1', title: 'What is Sound?', duration: '8 min', content: 'Sound is a vibration that travels as a wave through a medium. Frequency determines pitch, amplitude determines volume.', keyPoints: ['Sound as pressure waves', 'Frequency = pitch (Hz)', 'Amplitude = volume (dB)', 'Speed of sound: ~343 m/s'] },
      { id: '2', title: 'Digital Audio', duration: '10 min', content: 'Digital audio converts continuous sound waves into discrete samples. Sample rate and bit depth determine quality.', keyPoints: ['Sampling rate (44.1kHz CD)', 'Bit depth (16-bit, 24-bit)', 'Nyquist theorem', 'Audio codecs: MP3, WAV, FLAC'] },
      { id: '3', title: 'Web Audio API', duration: '12 min', content: 'The Web Audio API lets you create, process, and analyze audio directly in the browser using JavaScript.', keyPoints: ['AudioContext and nodes', 'Oscillators for synthesis', 'Filters and effects', 'Real-time audio visualization'] },
      { id: '4', title: 'Music & Math', duration: '10 min', content: 'Music is deeply mathematical. Scales follow frequency ratios, rhythm uses fractions, and harmony follows patterns.', keyPoints: ['Octave = frequency × 2', '12-tone equal temperament', 'Harmonic series', 'Fourier analysis of sound'] },
    ],
    challenges: ['Build a simple synthesizer', 'Visualize audio frequencies', 'Create a musical scale generator'],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Basics',
    description: 'Learn encryption, password security, safe browsing, and how to protect digital information.',
    icon: Code,
    color: 'neon-cyan',
    lessons: [
      { id: '1', title: 'What is Cybersecurity?', duration: '8 min', content: 'Cybersecurity protects computer systems, networks, and data from digital attacks, theft, and damage.', keyPoints: ['CIA triad: Confidentiality, Integrity, Availability', 'Types of cyber threats', 'Social engineering attacks', 'Defense in depth strategy'] },
      { id: '2', title: 'Encryption Basics', duration: '12 min', content: 'Encryption converts readable data into scrambled text that only authorized parties can decode.', keyPoints: ['Symmetric vs asymmetric encryption', 'AES and RSA algorithms', 'HTTPS and TLS', 'End-to-end encryption'], codeExample: '// Simple Caesar cipher\nfunction encrypt(text, shift) {\n  return text.split("").map(c => {\n    const code = c.charCodeAt(0);\n    if (code >= 65 && code <= 90)\n      return String.fromCharCode(((code - 65 + shift) % 26) + 65);\n    return c;\n  }).join("");\n}' },
      { id: '3', title: 'Password Security', duration: '10 min', content: 'Strong passwords are the first line of defense. Understanding how passwords are cracked helps create better ones.', keyPoints: ['Password entropy and strength', 'Hashing vs encryption', 'Multi-factor authentication', 'Password managers'] },
      { id: '4', title: 'Safe Browsing', duration: '8 min', content: 'The internet has many threats. Learning to recognize phishing, malware, and suspicious websites keeps you safe.', keyPoints: ['Recognizing phishing emails', 'HTTPS and SSL certificates', 'Malware types and prevention', 'Privacy and cookies'] },
    ],
    challenges: ['Create a Caesar cipher encoder', 'Analyze password strength', 'Identify phishing red flags'],
  },
];

const LearnPage = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('completed-lessons');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) {
      speak(t('voice.learnWelcome'));
    }
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem('completed-lessons', JSON.stringify([...completedLessons]));
  }, [completedLessons]);

  const handleLessonComplete = (moduleId: string, lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      const key = `${moduleId}-${lessonId}`;
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => completedLessons.has(`${module.id}-${l.id}`)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  const openLesson = (module: Module, lesson: Lesson) => {
    setSelectedLesson(lesson);
    if (isEnabled) {
      speak(`${lesson.title}. ${lesson.content.substring(0, 150)}`);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <GraduationCap className="w-4 h-4 text-neon-lime" />
              <span className="text-sm font-mono-lab text-muted-foreground">{t('learn.badge')}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">{t('learn.title')}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('learn.subtitle')}</p>
          </motion.div>

          {/* Lesson Detail View */}
          {selectedLesson && selectedModule ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <motion.button onClick={() => setSelectedLesson(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6" whileHover={{ x: -5 }}>
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>{t('common.back')}</span>
              </motion.button>

              <div className="glass-panel p-8 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold gradient-text">{selectedLesson.title}</h1>
                  <motion.button onClick={() => speak(selectedLesson.content)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Volume2 className="w-4 h-4" />
                    {t('learn.readAloud')}
                  </motion.button>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8">{selectedLesson.content}</p>

                {/* Key Points */}
                {selectedLesson.keyPoints.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-neon-orange" />
                      {t('learn.keyPoints')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedLesson.keyPoints.map((point, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 glass-panel p-3 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-neon-lime shrink-0 mt-0.5" />
                          <span className="text-sm">{point}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Example */}
                {selectedLesson.codeExample && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4">{t('learn.codeExample')}</h3>
                    <div className="bg-background/80 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-sm font-mono-lab text-neon-cyan whitespace-pre-wrap">{selectedLesson.codeExample}</pre>
                    </div>
                  </div>
                )}

                {/* Try It */}
                {selectedLesson.tryIt && (
                  <motion.div className="glass-panel p-6 rounded-xl border-2 border-neon-lime/30 bg-neon-lime/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Play className="w-5 h-5 text-neon-lime" />
                      {t('learn.tryIt')}
                    </h3>
                    <p className="text-muted-foreground">{selectedLesson.tryIt}</p>
                  </motion.div>
                )}

                {/* Mark Complete */}
                <div className="mt-8 flex justify-end">
                  <motion.button
                    onClick={() => handleLessonComplete(selectedModule.id, selectedLesson.id)}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
                      completedLessons.has(`${selectedModule.id}-${selectedLesson.id}`)
                        ? 'bg-neon-lime/20 text-neon-lime'
                        : 'bg-primary/20 text-primary'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {completedLessons.has(`${selectedModule.id}-${selectedLesson.id}`) ? t('learn.completed') : t('learn.markComplete')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : !selectedModule ? (
            /* Module Selection */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {modules.map((module, index) => {
                const Icon = module.icon;
                const progress = getModuleProgress(module);
                return (
                  <motion.div key={module.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -8, scale: 1.02 }} onClick={() => setSelectedModule(module)} className="cursor-pointer group">
                    <motion.div className={`glass-panel p-6 rounded-2xl h-full border-2 border-transparent hover:border-${module.color}/50 transition-all`} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 + index * 0.5 }}>
                      <div className="flex items-start justify-between mb-4">
                        <motion.div className={`w-12 h-12 rounded-xl bg-${module.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`} whileHover={{ rotate: 5 }}>
                          <Icon className={`w-6 h-6 text-${module.color}`} />
                        </motion.div>
                        {progress > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-background/50 overflow-hidden">
                              <motion.div className={`h-full bg-${module.color}`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
                          </div>
                        )}
                      </div>
                      <h2 className={`text-xl font-bold mb-2 text-${module.color}`}>{module.title}</h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{module.description}</p>
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /><span>{module.lessons.length} {t('learn.lessons')}</span></div>
                        <div className="flex items-center gap-1"><Star className="w-4 h-4" /><span>{module.challenges.length} {t('learn.challenges')}</span></div>
                      </div>
                      <motion.div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:translate-x-2 transition-transform">
                        <Play className="w-4 h-4" />
                        <span>{t('learn.startLearning')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Module Detail View */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <motion.button onClick={() => setSelectedModule(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8" whileHover={{ x: -5 }}>
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>{t('learn.backToModules')}</span>
              </motion.button>

              <div className="glass-panel p-8 rounded-2xl mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-${selectedModule.color}/20 flex items-center justify-center`}>
                    <selectedModule.icon className={`w-8 h-8 text-${selectedModule.color}`} />
                  </div>
                  <div>
                    <h1 className={`text-3xl font-bold text-${selectedModule.color}`}>{selectedModule.title}</h1>
                    <p className="text-muted-foreground">{selectedModule.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{t('learn.progress')}</span>
                    <span className="font-mono">{getModuleProgress(selectedModule)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-background/50 overflow-hidden">
                    <motion.div className={`h-full bg-gradient-to-r from-${selectedModule.color} to-primary`} initial={{ width: 0 }} animate={{ width: `${getModuleProgress(selectedModule)}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" />{t('learn.lessonsHeader')}</h2>
                  <div className="space-y-3">
                    {selectedModule.lessons.map((lesson, index) => {
                      const isCompleted = completedLessons.has(`${selectedModule.id}-${lesson.id}`);
                      return (
                        <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} onClick={() => openLesson(selectedModule, lesson)} className={`glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${isCompleted ? 'border-neon-lime/50 bg-neon-lime/5' : 'hover:border-primary/50'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-neon-lime/20' : 'bg-primary/20'}`}>
                              {isCompleted ? <CheckCircle className="w-5 h-5 text-neon-lime" /> : <span className="font-bold text-primary">{index + 1}</span>}
                            </div>
                            <div>
                              <h3 className="font-medium">{lesson.title}</h3>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /><span>{lesson.duration}</span></div>
                            </div>
                          </div>
                          <Play className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5" />{t('learn.challenges')}</h2>
                  <div className="space-y-3">
                    {selectedModule.challenges.map((challenge, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="glass-panel p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neon-orange/20 flex items-center justify-center shrink-0"><Star className="w-4 h-4 text-neon-orange" /></div>
                          <p className="text-sm">{challenge}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default LearnPage;
