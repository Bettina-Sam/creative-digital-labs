import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CatalogItem, NeonColor } from '@/catalog/types';
import { colorBg, colorText, colorBorder } from '@/lib/colorMap';

interface CatalogCardProps {
  item: CatalogItem;
  index: number;
  actionLabelKey: string;
  onClick?: () => void;
}

export const CatalogCard = ({ item, index, actionLabelKey, onClick }: CatalogCardProps) => {
  const { t } = useLanguage();
  const Icon = item.icon;
  const color = item.color as NeonColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <motion.div
        className={`glass-panel p-6 rounded-2xl h-full border-2 border-transparent ${colorBorder[color]} transition-all`}
      >
        <motion.div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
          whileHover={{ rotate: 5 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
          {t(item.titleKey)}
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
          {t(item.descKey)}
        </p>
        {item.featureKeys.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.featureKeys.map(fk => (
              <span key={fk} className="text-xs px-3 py-1 rounded-full bg-background/50 text-muted-foreground">
                {t(fk)}
              </span>
            ))}
          </div>
        )}
        <motion.div
          className={`flex items-center gap-2 text-sm font-medium ${colorText[color]} group-hover:translate-x-2 transition-transform`}
        >
          <Play className="w-4 h-4" />
          <span>{t(actionLabelKey)}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
