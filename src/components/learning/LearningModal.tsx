import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Lightbulb, Code, ExternalLink, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export interface LearningContent {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  sections: {
    title: string;
    content: string;
    code?: string;
    tip?: string;
  }[];
  concepts: string[];
  funFacts: string[];
  resources: { title: string; url: string }[];
}

interface LearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: LearningContent;
  onStartChallenge?: () => void;
}

export const LearningModal = ({ isOpen, onClose, content, onStartChallenge }: LearningModalProps) => {
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const markCompleted = (index: number) => {
    if (!completedSections.includes(index)) {
      setCompletedSections([...completedSections, index]);
    }
  };

  const handleNext = () => {
    markCompleted(activeSection);
    if (activeSection < content.sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const progress = (completedSections.length / content.sections.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-panel rounded-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${content.color}/20 flex items-center justify-center`}>
                    {content.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{content.title}</h2>
                    <p className="text-muted-foreground text-sm">{content.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${content.color} to-primary`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Section Navigation */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {content.sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeSection === index
                        ? 'bg-primary text-primary-foreground'
                        : completedSections.includes(index)
                        ? 'bg-neon-lime/20 text-neon-lime'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {completedSections.includes(index) && <CheckCircle className="w-4 h-4" />}
                    {section.title}
                  </button>
                ))}
              </div>

              {/* Active Section Content */}
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-foreground/90 leading-relaxed">
                    {content.sections[activeSection].content}
                  </p>
                </div>

                {content.sections[activeSection].code && (
                  <div className="bg-background/50 rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="w-4 h-4 text-neon-cyan" />
                      <span className="text-xs font-mono-lab text-muted-foreground">Code Example</span>
                    </div>
                    <pre className="text-sm font-mono-lab overflow-x-auto">
                      <code className="text-neon-lime">{content.sections[activeSection].code}</code>
                    </pre>
                  </div>
                )}

                {content.sections[activeSection].tip && (
                  <div className="bg-neon-orange/10 border border-neon-orange/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-neon-orange flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/90">{content.sections[activeSection].tip}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Concepts & Fun Facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="glass-panel p-4 rounded-xl">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-neon-cyan" />
                    Key Concepts
                  </h4>
                  <ul className="space-y-2">
                    {content.concepts.map((concept, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        {concept}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel p-4 rounded-xl">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-neon-orange" />
                    Fun Facts
                  </h4>
                  <ul className="space-y-2">
                    {content.funFacts.map((fact, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        ✨ {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Resources */}
              {content.resources.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold mb-3">Learn More</h4>
                  <div className="flex flex-wrap gap-2">
                    {content.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {completedSections.length}/{content.sections.length} sections completed
              </span>
              <div className="flex gap-3">
                {onStartChallenge && (
                  <motion.button
                    onClick={onStartChallenge}
                    className="px-6 py-2 rounded-xl bg-neon-lime/20 text-neon-lime font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4" />
                    Start Challenge
                  </motion.button>
                )}
                <motion.button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeSection < content.sections.length - 1 ? 'Next Section' : 'Complete'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
