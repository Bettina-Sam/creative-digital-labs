import { Atom, Waves, Box, Palette, Hand } from 'lucide-react';
import { LearningContent } from './LearningModal';

export const particlesLearningContent: LearningContent = {
  id: 'particles',
  title: 'Particle Physics & 3D Graphics',
  subtitle: 'Understanding particle systems and WebGL rendering',
  icon: <Atom className="w-6 h-6 text-neon-cyan" />,
  color: 'neon-cyan',
  sections: [
    {
      title: 'What are Particles?',
      content: 'Particle systems simulate many small objects moving together to create complex visual effects. Each particle has properties like position, velocity, color, and lifetime. When thousands of particles follow simple rules, emergent patterns appear—like flocking birds or swirling galaxies.',
      tip: 'In this lab, each particle is attracted to its original position but repelled by your mouse cursor!',
    },
    {
      title: '3D Coordinate Systems',
      content: 'In 3D graphics, every point has three coordinates: X (left/right), Y (up/down), and Z (near/far). We use mathematical formulas to project these 3D points onto your 2D screen. The particles here are arranged on a sphere using spherical coordinates (theta and phi angles).',
      code: `// Converting spherical to 3D Cartesian coordinates
const theta = Math.random() * Math.PI * 2;  // 0 to 360°
const phi = Math.acos(Math.random() * 2 - 1); // 0 to 180°
const radius = 3;

x = radius * sin(phi) * cos(theta);
y = radius * sin(phi) * sin(theta);
z = radius * cos(phi);`,
    },
    {
      title: 'Forces & Motion',
      content: 'Particles move based on physics forces. Each frame, we update positions using velocity (speed + direction). Mouse repulsion creates an invisible force field—the closer you get, the stronger particles are pushed away. This creates the interactive "flowing away" effect.',
      code: `// Mouse repulsion force calculation
const distance = sqrt(dx² + dy²);
const force = max(0, 1 - distance/radius);
particle.x += (dx/distance) * force;`,
      tip: 'Try moving your mouse quickly vs slowly—notice how the particles respond differently!',
    },
    {
      title: 'WebGL & GPU Rendering',
      content: 'Rendering thousands of particles requires GPU acceleration. WebGL sends particle data to the graphics card, which processes all particles in parallel. Three.js makes this easier with BufferGeometry, where we store positions and colors in typed arrays.',
    },
  ],
  concepts: [
    'Particle Systems & Emergent Behavior',
    'Spherical Coordinates (theta, phi)',
    '3D to 2D Projection',
    'Force Fields & Physics Simulation',
    'GPU Parallel Processing',
    'Buffer Geometry Optimization',
  ],
  funFacts: [
    'A single GPU can process millions of particles per second!',
    'Movie studios use particle systems for fire, smoke, and magic effects',
    'Real galaxies contain 100-400 billion stars following similar physics',
  ],
  resources: [
    { title: 'Three.js Documentation', url: 'https://threejs.org/docs/' },
    { title: 'WebGL Fundamentals', url: 'https://webglfundamentals.org/' },
  ],
};

export const fluidLearningContent: LearningContent = {
  id: 'fluid',
  title: 'Fluid Dynamics Visualization',
  subtitle: 'How liquids and particles simulate real-world physics',
  icon: <Waves className="w-6 h-6 text-neon-magenta" />,
  color: 'neon-magenta',
  sections: [
    {
      title: 'Fluid Simulation Basics',
      content: 'Real fluid simulation solves the Navier-Stokes equations, describing how velocity, pressure, and density interact. This simplified version uses particle-based simulation—each colored blob is a particle with velocity that decays over time due to "friction."',
      tip: 'Click and drag to add particles. The faster you move, the faster they travel!',
    },
    {
      title: 'Velocity & Momentum',
      content: 'When you drag the mouse, particles inherit your movement speed and direction. This is momentum transfer—like throwing a ball. The particles continue moving after you release, gradually slowing due to velocity decay (multiplying by 0.99 each frame).',
      code: `// Velocity decay and gravity
particle.vx *= 0.99;  // Friction
particle.vy *= 0.99;
particle.vy += 0.02;  // Gravity pulls down`,
    },
    {
      title: 'Gravity Simulation',
      content: 'Every frame, we add a small downward velocity to simulate Earth\'s gravitational pull. This is why particles arc downward after being thrown. Real physics uses 9.8 m/s², but we use simplified values for visual appeal.',
    },
    {
      title: 'Trail Effects & Blending',
      content: 'The glowing trails are created by not fully clearing the canvas each frame. Instead of erasing everything, we draw a semi-transparent overlay, causing older particles to fade gradually. This technique is called "motion blur" or "trail persistence."',
      code: `// Semi-transparent clear for trail effect
ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
ctx.fillRect(0, 0, width, height);`,
    },
  ],
  concepts: [
    'Navier-Stokes Equations (simplified)',
    'Momentum & Velocity Vectors',
    'Gravity Simulation',
    'Velocity Decay (Friction)',
    'Canvas Blending & Trails',
    'HSL Color Space',
  ],
  funFacts: [
    'The Navier-Stokes equations are one of the Millennium Prize Problems worth $1 million!',
    'Real-time fluid simulation is used in weather forecasting and video games',
    'Water droplets on your window follow these same physics principles',
  ],
  resources: [
    { title: 'Canvas API Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API' },
    { title: 'Fluid Simulation Explained', url: 'https://www.youtube.com/watch?v=qsYE1wMEMPA' },
  ],
};

export const scene3DLearningContent: LearningContent = {
  id: 'scene3d',
  title: '3D Scenes & Motion Sensors',
  subtitle: 'Creating immersive 3D environments with device interaction',
  icon: <Box className="w-6 h-6 text-neon-lime" />,
  color: 'neon-lime',
  sections: [
    {
      title: 'WebGL 3D Rendering',
      content: 'This scene uses Three.js to render 3D geometry with realistic lighting. Each floating shape is an icosahedron (20-sided polyhedron) with a distortion shader that morphs the surface in real-time. The starfield background uses point sprites for thousands of distant stars.',
    },
    {
      title: 'Device Motion APIs',
      content: 'Modern devices have gyroscopes and accelerometers. The DeviceOrientation API provides beta (front/back tilt), gamma (left/right tilt), and alpha (compass heading). We use these to control the camera, creating a "window into another world" effect.',
      code: `// Reading device orientation
window.addEventListener('deviceorientation', (e) => {
  const tiltX = e.beta;   // -180 to 180°
  const tiltY = e.gamma;  // -90 to 90°
  camera.position.x = tiltY * 0.02;
  camera.position.y = tiltX * 0.01;
});`,
      tip: 'On mobile, enable motion controls and tilt your device to look around the scene!',
    },
    {
      title: 'Parallax Effect',
      content: 'Parallax creates depth perception by moving objects at different speeds based on distance. Closer objects move more than distant ones. The camera follows your mouse/device tilt while objects float at different depths, enhancing the 3D illusion.',
    },
    {
      title: 'Shader Materials',
      content: 'The wobbly surface effect uses a "distort" shader that displaces vertices based on noise functions. Shaders are programs running on the GPU that control how each pixel is colored. MeshDistortMaterial provides this effect without writing custom GLSL code.',
    },
  ],
  concepts: [
    'WebGL Pipeline',
    'Icosahedron Geometry',
    'Device Orientation API',
    'Parallax Depth Perception',
    'Vertex Displacement Shaders',
    'Point Sprites for Stars',
  ],
  funFacts: [
    'Your phone has more sensors than early spacecraft!',
    'VR headsets use the same orientation APIs for head tracking',
    'Parallax was first used in 2D video games to fake 3D depth',
  ],
  resources: [
    { title: 'Three.js Journey Course', url: 'https://threejs-journey.com/' },
    { title: 'Device Orientation MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent' },
  ],
};

export const generativeLearningContent: LearningContent = {
  id: 'generative',
  title: 'Generative Art & Flow Fields',
  subtitle: 'Creating art through algorithms and mathematics',
  icon: <Palette className="w-6 h-6 text-neon-orange" />,
  color: 'neon-orange',
  sections: [
    {
      title: 'What is Generative Art?',
      content: 'Generative art uses algorithms to create visuals that are partially random, partially controlled. The artist designs rules and parameters, but the computer generates infinite variations. Each seed number produces a unique, reproducible artwork.',
    },
    {
      title: 'Flow Fields',
      content: 'A flow field is a grid where each cell contains a direction (angle). Particles read the angle at their position and move that direction. By changing how angles are calculated, we create different patterns—noise-based fields create organic, natural-looking flows.',
      code: `// Creating a flow field with noise
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const noise = seededRandom(seed + x*0.1 + y*0.1);
    flowField[x + y*cols] = noise * Math.PI * 4;
  }
}`,
      tip: 'Move your mouse to influence the flow direction—particles bend toward your cursor!',
    },
    {
      title: 'Seeded Randomness',
      content: 'True randomness can\'t be reproduced. "Seeded" random uses a mathematical formula that looks random but always gives the same sequence for the same seed. This lets you save and recreate specific artworks.',
      code: `// Seeded random number generator
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x); // Returns 0-1
}`,
    },
    {
      title: 'Particle Trails & Color',
      content: 'Each particle remembers its recent positions (history array). Drawing lines through these points creates flowing trails. Colors are assigned in HSL (Hue, Saturation, Lightness) format, making it easy to create harmonious palettes by varying just the hue.',
    },
  ],
  concepts: [
    'Algorithmic Art Generation',
    'Flow Fields & Vector Fields',
    'Perlin/Simplex Noise',
    'Seeded Random Number Generators',
    'HSL Color Model',
    'Particle History & Trails',
  ],
  funFacts: [
    'Some generative art NFTs have sold for millions of dollars!',
    'Flow fields are used in weather visualization for wind patterns',
    'The same math creates both art and scientific simulations',
  ],
  resources: [
    { title: 'The Coding Train (YouTube)', url: 'https://www.youtube.com/c/TheCodingTrain' },
    { title: 'Generative Artistry', url: 'https://generativeartistry.com/' },
  ],
};

export const handTrackingLearningContent: LearningContent = {
  id: 'handtracking',
  title: 'Hand Gesture Recognition',
  subtitle: 'How AI vision enables touchless interaction',
  icon: <Hand className="w-6 h-6 text-neon-lime" />,
  color: 'neon-lime',
  sections: [
    {
      title: 'Computer Vision Basics',
      content: 'Computer vision teaches machines to "see" by analyzing images pixel by pixel. Machine learning models are trained on millions of hand images to recognize patterns. MediaPipe, developed by Google, provides pre-trained models that run efficiently in the browser.',
    },
    {
      title: 'Hand Landmark Detection',
      content: 'The AI identifies 21 key points on each hand: fingertips, knuckles, and palm center. These landmarks are tracked in 3D space (x, y, z coordinates). By analyzing the relative positions of these points, we can recognize different gestures.',
      code: `// 21 Hand landmarks (0-20)
// 0: Wrist
// 4: Thumb tip, 8: Index tip
// 12: Middle tip, 16: Ring tip
// 20: Pinky tip

// Detect if hand is open (all fingers extended)
const isOpen = thumbTip.y < thumbBase.y &&
               indexTip.y < indexBase.y && ...`,
      tip: 'Try holding your hand flat in front of the camera—watch the 21 tracking points appear!',
    },
    {
      title: 'Gesture Classification',
      content: 'We classify gestures by analyzing finger positions. A fist has all fingertips below their bases. A peace sign has index and middle extended, others closed. Pinch is detected by measuring the distance between thumb and index fingertips.',
      code: `// Pinch detection
const thumbToIndex = distance(
  landmarks[4],  // Thumb tip
  landmarks[8]   // Index tip
);
const isPinching = thumbToIndex < 0.05;`,
    },
    {
      title: 'Accessibility Applications',
      content: 'Hand tracking enables people with mobility challenges to use computers without traditional input devices. It also benefits sterile environments (medical), VR/AR interaction, sign language recognition, and touchless public kiosks.',
    },
  ],
  concepts: [
    'Convolutional Neural Networks',
    'Landmark Detection',
    'Gesture Classification',
    'Real-time Video Processing',
    'WebML & Browser AI',
    'Accessibility & Inclusive Design',
  ],
  funFacts: [
    'MediaPipe can track hands at 30+ FPS on a smartphone!',
    'Sign language translation AI could help 70 million deaf people globally',
    'The same technology powers Snapchat filters and Apple Face ID',
  ],
  resources: [
    { title: 'MediaPipe Documentation', url: 'https://developers.google.com/mediapipe' },
    { title: 'Web AI Models', url: 'https://www.tensorflow.org/js' },
  ],
};
