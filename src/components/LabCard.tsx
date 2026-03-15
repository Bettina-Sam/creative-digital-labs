import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LabCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: 'cyan' | 'magenta' | 'lime' | 'orange';
  index: number;
}

const colorClasses = {
  cyan: 'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/30 hover:border-neon-cyan/60',
  magenta: 'from-neon-magenta/20 to-neon-magenta/5 border-neon-magenta/30 hover:border-neon-magenta/60',
  lime: 'from-neon-lime/20 to-neon-lime/5 border-neon-lime/30 hover:border-neon-lime/60',
  orange: 'from-neon-orange/20 to-neon-orange/5 border-neon-orange/30 hover:border-neon-orange/60',
};

const glowClasses = {
  cyan: 'group-hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)]',
  magenta: 'group-hover:shadow-[0_0_30px_hsl(var(--neon-magenta)/0.3)]',
  lime: 'group-hover:shadow-[0_0_30px_hsl(var(--neon-lime)/0.3)]',
  orange: 'group-hover:shadow-[0_0_30px_hsl(var(--neon-orange)/0.3)]',
};

const iconColorClasses = {
  cyan: 'text-neon-cyan',
  magenta: 'text-neon-magenta',
  lime: 'text-neon-lime',
  orange: 'text-neon-orange',
};

export const LabCard = ({ title, description, icon: Icon, path, color, index }: LabCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <Link to={path} data-cursor-hover className="group block">
        <motion.div
          className={`relative p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-500 ${colorClasses[color]} ${glowClasses[color]}`}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-current rounded-tl-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-current rounded-br-xl opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start gap-4">
            <motion.div
              className={`p-3 rounded-xl bg-card/50 ${iconColorClasses[color]}`}
              whileHover={{ rotate: 10 }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Enter indicator */}
          <motion.div
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            <span className="text-xs font-mono-lab uppercase tracking-wider text-muted-foreground">
              Enter Lab →
            </span>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
