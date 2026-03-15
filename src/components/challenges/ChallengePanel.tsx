import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp, Star, Flame, X } from 'lucide-react';
import { 
  Challenge, 
  ChallengeCard, 
  particleChallenges, 
  gestureChallenges, 
  creativeChallenges,
  useChallengeProgress
} from './ChallengeSystem';

interface ChallengePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChallenge: (challenge: Challenge) => void;
  activeChallenge?: Challenge | null;
  labFilter?: 'particles' | 'fluid' | 'scene3d' | 'generative' | 'all';
}

const allChallenges = [...particleChallenges, ...gestureChallenges, ...creativeChallenges];

export const ChallengePanel = ({ 
  isOpen, 
  onClose, 
  onStartChallenge,
  activeChallenge,
  labFilter = 'all'
}: ChallengePanelProps) => {
  const { totalPoints, getProgress } = useChallengeProgress();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('all');

  const completedCount = allChallenges.filter(c => getProgress(c.id)?.completed).length;

  const categories = [
    { id: 'learning', label: 'Learning', icon: <Star className="w-4 h-4" />, challenges: allChallenges.filter(c => c.type === 'learning') },
    { id: 'exploration', label: 'Exploration', icon: <Trophy className="w-4 h-4" />, challenges: allChallenges.filter(c => c.type === 'exploration') },
    { id: 'application', label: 'Application', icon: <Flame className="w-4 h-4" />, challenges: allChallenges.filter(c => c.type === 'application') },
    { id: 'mastery', label: 'Mastery', icon: <Flame className="w-4 h-4" />, challenges: allChallenges.filter(c => c.type === 'mastery') },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed right-0 top-0 bottom-0 w-96 max-w-full z-50 glass-panel border-l border-border overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-card/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Challenges</h3>
                  <p className="text-xs text-muted-foreground">{completedCount}/{allChallenges.length} completed</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Points Display */}
            <div className="glass-panel p-3 rounded-xl flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Points</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-neon-orange fill-neon-orange" />
                <span className="font-bold text-xl text-neon-orange">{totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Challenge List */}
          <div className="overflow-y-auto h-[calc(100%-180px)] p-4">
            {categories.map((category) => (
              <div key={category.id} className="mb-4">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="font-medium">{category.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({category.challenges.filter(c => getProgress(c.id)?.completed).length}/{category.challenges.length})
                    </span>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 mt-2 overflow-hidden"
                    >
                      {category.challenges.map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          progress={getProgress(challenge.id)}
                          onStart={onStartChallenge}
                          isActive={activeChallenge?.id === challenge.id}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Achievement Preview */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Next Achievement</p>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-neon-lime" />
                <span className="text-sm font-medium">
                  {completedCount < 3 ? 'Novice Explorer (3 challenges)' :
                   completedCount < 6 ? 'Skilled Creator (6 challenges)' :
                   completedCount < 10 ? 'Lab Master (10 challenges)' : 'Challenge Champion!'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
