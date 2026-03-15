import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play,
  RotateCcw,
  Award,
  Flame,
  Zap,
  BookOpen,
  Brain,
  Lightbulb
} from 'lucide-react';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'exploration' | 'application' | 'mastery';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ReactNode;
  requirements: string[];
  learningOutcome: string;
  timeLimit?: number;
  points: number;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  score: number;
  bestTime?: number;
  attempts: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: ChallengeProgress;
  onStart: (challenge: Challenge) => void;
  isActive: boolean;
}

const difficultyColors = {
  beginner: 'neon-lime',
  intermediate: 'neon-orange',
  advanced: 'neon-magenta',
};

const difficultyStars = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const typeIcons = {
  learning: <BookOpen className="w-4 h-4" />,
  exploration: <Star className="w-4 h-4" />,
  application: <Zap className="w-4 h-4" />,
  mastery: <Trophy className="w-4 h-4" />,
};

export const ChallengeCard = ({ challenge, progress, onStart, isActive }: ChallengeCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass-panel p-4 rounded-xl cursor-pointer transition-all ${
        isActive ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/50'
      } ${progress?.completed ? 'bg-neon-lime/5' : ''}`}
      onClick={() => onStart(challenge)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${difficultyColors[challenge.difficulty]}/20 flex items-center justify-center flex-shrink-0`}>
          {challenge.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold">{challenge.title}</h4>
            {progress?.completed && <CheckCircle className="w-4 h-4 text-neon-lime" />}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
          
          {/* Learning Outcome Badge */}
          <div className="flex items-center gap-1 text-xs text-neon-cyan mb-2">
            <Lightbulb className="w-3 h-3" />
            <span>{challenge.learningOutcome}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              {typeIcons[challenge.type]}
              <span className="capitalize text-muted-foreground">{challenge.type}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: difficultyStars[challenge.difficulty] }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 text-${difficultyColors[challenge.difficulty]} fill-current`} />
              ))}
            </div>
            <span className="text-muted-foreground">{challenge.points} pts</span>
            {challenge.timeLimit && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {challenge.timeLimit}s
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ActiveChallengeOverlayProps {
  challenge: Challenge;
  onComplete: (success: boolean, score: number) => void;
  onCancel: () => void;
  currentProgress?: { step: number; total: number };
}

export const ActiveChallengeOverlay = ({ 
  challenge, 
  onComplete, 
  onCancel,
  currentProgress 
}: ActiveChallengeOverlayProps) => {
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimit || 0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!challenge.timeLimit) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(false, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge.timeLimit, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-2xl p-4 min-w-[300px]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary animate-pulse" />
          <span className="font-bold">{challenge.title}</span>
        </div>
        <button onClick={onCancel} className="p-1 rounded hover:bg-accent">
          <XCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Learning Outcome */}
      <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Lightbulb className="w-4 h-4 text-neon-cyan" />
          <span className="text-neon-cyan font-medium">You'll learn:</span>
          <span className="text-muted-foreground">{challenge.learningOutcome}</span>
        </div>
      </div>

      {/* Progress */}
      {currentProgress && (
        <div className="mb-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-neon-lime"
              initial={{ width: 0 }}
              animate={{ width: `${(currentProgress.step / currentProgress.total) * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Step {currentProgress.step} of {currentProgress.total}
          </div>
        </div>
      )}

      {/* Timer */}
      {challenge.timeLimit && (
        <div className="flex items-center gap-2 mb-3">
          <Clock className={`w-4 h-4 ${timeRemaining < 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          <span className={`font-mono-lab ${timeRemaining < 10 ? 'text-destructive' : ''}`}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Requirements */}
      <div className="space-y-1">
        {challenge.requirements.map((req, i) => (
          <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-muted flex items-center justify-center">
              <span className="text-[10px]">{i + 1}</span>
            </div>
            {req}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Educational Challenge definitions
export const learningChallenges: Challenge[] = [
  {
    id: 'learn-particles',
    title: 'Particle Physics 101',
    description: 'Understand how particle systems work by typing a word',
    type: 'learning',
    difficulty: 'beginner',
    icon: <Brain className="w-6 h-6 text-neon-cyan" />,
    requirements: [
      'Go to Particle Universe',
      'Type your name in the text input',
      'Watch particles form the letters',
      'Observe how particles interpolate positions',
    ],
    learningOutcome: 'Vector math and interpolation',
    points: 100,
  },
  {
    id: 'learn-physics',
    title: 'Newton\'s Laws Explorer',
    description: 'Experience gravity and friction in the Physics Playground',
    type: 'learning',
    difficulty: 'beginner',
    icon: <BookOpen className="w-6 h-6 text-neon-magenta" />,
    requirements: [
      'Go to Physics Playground',
      'Complete the Gravity lesson',
      'Complete the Friction lesson',
      'Complete the Velocity lesson',
    ],
    learningOutcome: 'Basic physics simulation',
    points: 150,
  },
  {
    id: 'learn-solar-system',
    title: 'Space Explorer',
    description: 'Learn about our solar system through interactive exploration',
    type: 'learning',
    difficulty: 'beginner',
    icon: <Star className="w-6 h-6 text-neon-lime" />,
    requirements: [
      'Go to Solar System Explorer',
      'Click on each planet',
      'Read 3 fun facts',
      'Observe different orbit speeds',
    ],
    learningOutcome: 'Planetary science basics',
    points: 120,
  },
];

export const applicationChallenges: Challenge[] = [
  {
    id: 'apply-art',
    title: 'Digital Artist',
    description: 'Create and save your own meditative artwork',
    type: 'application',
    difficulty: 'intermediate',
    icon: <Zap className="w-6 h-6 text-neon-orange" />,
    requirements: [
      'Go to Meditative Art',
      'Try all 4 art styles',
      'Generate at least 3 variations',
      'Download your favorite',
    ],
    learningOutcome: 'Generative art principles',
    points: 200,
  },
  {
    id: 'apply-gestures',
    title: 'Gesture Master',
    description: 'Control the interface without touching anything',
    type: 'application',
    difficulty: 'intermediate',
    icon: <Award className="w-6 h-6 text-neon-lime" />,
    requirements: [
      'Enable hand tracking',
      'Perform all 5 gestures',
      'Navigate using gestures',
      'Control a lab with gestures',
    ],
    learningOutcome: 'Accessible interface design',
    timeLimit: 120,
    points: 250,
  },
];

export const masteryChallenges: Challenge[] = [
  {
    id: 'master-complete',
    title: 'Lab Scientist',
    description: 'Complete all learning modules and explore every lab',
    type: 'mastery',
    difficulty: 'advanced',
    icon: <Trophy className="w-6 h-6 text-neon-magenta" />,
    requirements: [
      'Complete 3 learning challenges',
      'Visit all 4 labs',
      'Spend 10+ minutes exploring',
      'Try hand gesture control',
    ],
    learningOutcome: 'Full platform mastery',
    points: 500,
  },
  {
    id: 'master-teach',
    title: 'Knowledge Sharer',
    description: 'Demonstrate understanding by teaching concepts',
    type: 'mastery',
    difficulty: 'advanced',
    icon: <Flame className="w-6 h-6 text-neon-orange" />,
    requirements: [
      'Complete the Learning Hub',
      'Explain one concept to someone',
      'Show them a lab demonstration',
      'Help them complete a challenge',
    ],
    learningOutcome: 'Teaching reinforces learning',
    points: 400,
  },
];

// Combine all challenges
export const particleChallenges = learningChallenges;
export const gestureChallenges = applicationChallenges;
export const creativeChallenges = masteryChallenges;

// Progress hook
export const useChallengeProgress = () => {
  const [progress, setProgress] = useState<ChallengeProgress[]>(() => {
    const saved = localStorage.getItem('challenge-progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [totalPoints, setTotalPoints] = useState(() => {
    const saved = localStorage.getItem('challenge-points');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('challenge-progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('challenge-points', totalPoints.toString());
  }, [totalPoints]);

  const completeChallenge = (challengeId: string, score: number, time?: number) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.challengeId === challengeId);
      if (existing) {
        return prev.map((p) =>
          p.challengeId === challengeId
            ? {
                ...p,
                completed: true,
                score: Math.max(p.score, score),
                bestTime: time ? Math.min(p.bestTime || Infinity, time) : p.bestTime,
                attempts: p.attempts + 1,
              }
            : p
        );
      }
      return [...prev, { challengeId, completed: true, score, bestTime: time, attempts: 1 }];
    });
    setTotalPoints((prev) => prev + score);
  };

  const getProgress = (challengeId: string) => progress.find((p) => p.challengeId === challengeId);

  return { progress, totalPoints, completeChallenge, getProgress };
};
