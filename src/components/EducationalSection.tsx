import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Brain, 
  Accessibility, 
  Code,
  Palette,
  BookOpen,
  Rocket,
  Lightbulb
} from 'lucide-react';

const learningAreas = [
  {
    icon: Brain,
    title: 'Computational Thinking',
    description: 'Understand algorithms, physics simulations, and procedural generation through visual, interactive examples.',
    color: 'neon-cyan',
  },
  {
    icon: Palette,
    title: 'Creative Technology',
    description: 'Explore the intersection of art and code. Learn how generative art and creative coding work.',
    color: 'neon-magenta',
  },
  {
    icon: Accessibility,
    title: 'Accessible Interfaces',
    description: 'Experience touchless, gesture-based control—showing how technology can be more inclusive.',
    color: 'neon-lime',
  },
  {
    icon: Code,
    title: 'Web Technologies',
    description: 'See real-world applications of WebGL, Three.js, Canvas APIs, and motion sensors in the browser.',
    color: 'neon-orange',
  },
];

const impactStats = [
  { value: 4, label: 'Interactive Labs', sublabel: 'Hands-on learning' },
  { value: 6, label: 'Educational Games', sublabel: 'Learn through play' },
  { value: 60, label: 'FPS Rendering', sublabel: 'Smooth visuals' },
  { value: 0, label: 'Barriers', sublabel: 'To learning' },
];

const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    if (value === 0) {
      setCount(0);
      return;
    }

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration]);

  return <span ref={ref}>{value === 0 ? '∞' : count}</span>;
};

export const EducationalSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <GraduationCap className="w-4 h-4 text-neon-lime" />
            <span className="text-sm font-mono-lab text-muted-foreground">
              Educational Platform
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Learn by Doing</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This platform demonstrates how interactive technology can make complex concepts 
            accessible and engaging. Perfect for STEM education and creative coding exploration.
          </p>
        </motion.div>

        {/* Learning Areas Grid with Floating Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {learningAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                animate={{ 
                  y: [0, -5, 0],
                }}
                className="glass-panel p-6 rounded-2xl group hover:border-primary/50 transition-all cursor-default"
                style={{
                  animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                <motion.div 
                  className={`w-12 h-12 rounded-xl bg-${area.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: 10 }}
                >
                  <Icon className={`w-6 h-6 text-${area.color}`} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">{area.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {area.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Impact Stats with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 rounded-2xl max-w-4xl mx-auto mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center cursor-default"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold gradient-text mb-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
                >
                  <AnimatedCounter value={stat.value} />
                </motion.div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Societal Benefits with Floating Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            <span className="font-mono-lab text-primary">{'<'}</span>
            Societal Impact
            <span className="font-mono-lab text-primary">{'/>'}</span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Accessibility,
              title: 'Accessibility Innovation',
              description: 'Demonstrating how gesture-based interfaces can help people with mobility challenges interact with technology.',
              gradient: 'from-neon-cyan to-primary',
            },
            {
              icon: BookOpen,
              title: 'STEM Education',
              description: 'Making physics, mathematics, and computer science concepts tangible through interactive visualizations.',
              gradient: 'from-neon-magenta to-secondary',
            },
            {
              icon: Rocket,
              title: 'Future Skills',
              description: 'Inspiring the next generation of creative technologists at the intersection of art, science, and code.',
              gradient: 'from-neon-lime to-neon-orange',
            },
          ].map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Link key={benefit.title} to={`/impact#${index === 0 ? 'accessibility' : index === 1 ? 'stem' : 'future'}`}>
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10, scale: 1.03 }}
                animate={{ 
                  y: [0, -8, 0],
                }}
                className="relative group"
                style={{
                  animation: `float ${3.5 + index * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.3}s`,
                }}
              >
                <div className="glass-panel p-6 rounded-2xl h-full hover:border-primary/50 transition-all">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h4 className="text-lg font-bold mb-3 group-hover:gradient-text transition-all">{benefit.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <motion.div 
            className="glass-panel inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Lightbulb className="w-6 h-6 text-neon-orange animate-pulse" />
            <p className="text-sm">
              <span className="font-bold">Try the experiments:</span>{' '}
              <span className="text-muted-foreground">
                Click on any lab card above to start learning!
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
