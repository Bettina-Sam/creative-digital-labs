/**
 * Safe Tailwind color class mappings.
 * Dynamic Tailwind classes like `bg-${color}/20` get purged at build time.
 * Use these mappings instead to ensure all classes are statically present.
 */

import { NeonColor } from '@/catalog/types';

export const colorBg: Record<NeonColor, string> = {
  'neon-cyan': 'bg-neon-cyan/20',
  'neon-magenta': 'bg-neon-magenta/20',
  'neon-lime': 'bg-neon-lime/20',
  'neon-orange': 'bg-neon-orange/20',
  'neon-purple': 'bg-neon-purple/20',
};

export const colorText: Record<NeonColor, string> = {
  'neon-cyan': 'text-neon-cyan',
  'neon-magenta': 'text-neon-magenta',
  'neon-lime': 'text-neon-lime',
  'neon-orange': 'text-neon-orange',
  'neon-purple': 'text-neon-purple',
};

export const colorBorder: Record<NeonColor, string> = {
  'neon-cyan': 'hover:border-neon-cyan/50',
  'neon-magenta': 'hover:border-neon-magenta/50',
  'neon-lime': 'hover:border-neon-lime/50',
  'neon-orange': 'hover:border-neon-orange/50',
  'neon-purple': 'hover:border-neon-purple/50',
};

export const colorProgressBg: Record<NeonColor, string> = {
  'neon-cyan': 'bg-neon-cyan',
  'neon-magenta': 'bg-neon-magenta',
  'neon-lime': 'bg-neon-lime',
  'neon-orange': 'bg-neon-orange',
  'neon-purple': 'bg-neon-purple',
};
