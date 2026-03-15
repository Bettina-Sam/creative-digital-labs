import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Accessibility, BookOpen, Rocket, CheckCircle2 } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { ParticleField } from '@/components/ParticleField';

const tracks = [
  {
    id: 'accessibility',
    icon: Accessibility,
    title: 'Accessibility Innovation',
    description:
      'A practical roadmap for designing interfaces that work for more people—across vision, motor, and cognitive needs.',
    bullets: [
      'Design for keyboard + screen readers first',
      'Create alternatives to drag/precision input',
      'Measure contrast + readability, not vibes',
      'Test with reduced motion and large text',
    ],
  },
  {
    id: 'stem',
    icon: BookOpen,
    title: 'STEM Education',
    description:
      'How the labs map to real concepts (physics, vectors, trig, systems) and how to teach them step-by-step.',
    bullets: [
      'Particles → vectors, interpolation, forces',
      'Fluids → velocity fields, momentum, drag',
      'Waves → sine/cosine, interference, phase',
      'Solar system → orbits, scaling, time steps',
    ],
  },
  {
    id: 'future',
    icon: Rocket,
    title: 'Future Skills',
    description:
      'A learning path from “play” → “build” → “explain” so users can prove understanding through creation.',
    bullets: [
      'Observe → describe the behavior you see',
      'Modify → change one parameter, predict outcome',
      'Build → recreate a behavior from scratch',
      'Explain → teach it back with voice + diagrams',
    ],
  },
];

const ImpactPage = () => {
  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <div className="flex items-center gap-3 mb-10">
            <Link to="/" className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2" data-cursor-hover>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>

          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Social Impact</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clear, readable roadmaps for how this project supports accessibility and STEM learning.
            </p>
          </motion.header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {tracks.map((t, idx) => {
              const Icon = t.icon;
              return (
                <motion.section
                  id={t.id}
                  key={t.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="glass-panel p-6 rounded-2xl"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {t.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.section>
              );
            })}
          </main>
        </div>

        <footer className="relative z-10 border-t border-border py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-primary font-medium">Created by Bettina Anne Sam</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default ImpactPage;
