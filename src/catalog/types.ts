import { LucideIcon } from 'lucide-react';
import { AppMode } from '@/context/ModeContext';

export type ContentCategory = 'labs' | 'games' | 'create' | 'learn';

export type NeonColor = 'neon-cyan' | 'neon-magenta' | 'neon-lime' | 'neon-orange' | 'neon-purple';

export type LabEngineType =
  | 'particles' | 'fluid' | 'solar-system' | 'waves' | 'gravity'
  | 'light' | 'sound' | 'magnetism' | 'chemistry' | 'fractals'
  | 'pendulum' | 'electricity' | 'optics' | 'thermo' | 'ecosystem'
  | 'astronomy' | 'robotics' | 'dna'
  // New engine types for expanded catalog
  | 'projectile' | 'spring' | 'buoyancy' | 'diffusion' | 'doppler'
  | 'interference' | 'capacitor' | 'lens' | 'telescope' | 'radioactivity'
  | 'crystal' | 'geology' | 'weather' | 'tides' | 'photosynthesis'
  | 'genetics' | 'neuron' | 'relativity' | 'quantum' | 'plasma'
  | 'aerodynamics' | 'bridge' | 'gear' | 'pulley';

export interface CatalogItem {
  id: string;
  category: ContentCategory;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  mode: AppMode | 'both';
  color: NeonColor;
  gradient: string;
  tags: string[];
  featureKeys: string[];
  estimatedMinutes?: number;
  engineType?: string;
  engineConfig?: Record<string, unknown>;
  /** Legacy route for backward compat (e.g. '/particles') */
  legacyPath?: string;
}

/** Filter catalog by mode */
export const filterByMode = (items: CatalogItem[], mode: AppMode): CatalogItem[] => {
  return items.filter(item => item.mode === mode || item.mode === 'both');
};
