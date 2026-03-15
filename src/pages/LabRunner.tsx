import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { labsCatalog } from '@/catalog/labs';
import { ProjectileEngine } from '@/components/engines/ProjectileEngine';
import { SpringEngine } from '@/components/engines/SpringEngine';
import { BuoyancyEngine } from '@/components/engines/BuoyancyEngine';
import { DiffusionEngine } from '@/components/engines/DiffusionEngine';
import { WeatherEngine } from '@/components/engines/WeatherEngine';
import { PhotosynthesisEngine } from '@/components/engines/PhotosynthesisEngine';
import { GeologyEngine } from '@/components/engines/GeologyEngine';
import { TidesEngine } from '@/components/engines/TidesEngine';
import { LensEngine } from '@/components/engines/LensEngine';
import { PulleyEngine } from '@/components/engines/PulleyEngine';
import { GearEngine } from '@/components/engines/GearEngine';
import { CrystalEngine } from '@/components/engines/CrystalEngine';
import { RelativityEngine } from '@/components/engines/RelativityEngine';
import { QuantumEngine } from '@/components/engines/QuantumEngine';
import { PlasmaEngine } from '@/components/engines/PlasmaEngine';
import { RadioactivityEngine } from '@/components/engines/RadioactivityEngine';
import { DopplerEngine } from '@/components/engines/DopplerEngine';
import { InterferenceEngine } from '@/components/engines/InterferenceEngine';
import { CapacitorEngine } from '@/components/engines/CapacitorEngine';
import { TelescopeEngine } from '@/components/engines/TelescopeEngine';
import { GeneticsEngine } from '@/components/engines/GeneticsEngine';
import { NeuronEngine } from '@/components/engines/NeuronEngine';
import { AerodynamicsEngine } from '@/components/engines/AerodynamicsEngine';
import { BridgeEngine } from '@/components/engines/BridgeEngine';

const engineMap: Record<string, React.FC> = {
  projectile: ProjectileEngine,
  spring: SpringEngine,
  buoyancy: BuoyancyEngine,
  diffusion: DiffusionEngine,
  weather: WeatherEngine,
  photosynthesis: PhotosynthesisEngine,
  geology: GeologyEngine,
  tides: TidesEngine,
  lens: LensEngine,
  pulley: PulleyEngine,
  gear: GearEngine,
  crystal: CrystalEngine,
  relativity: RelativityEngine,
  quantum: QuantumEngine,
  plasma: PlasmaEngine,
  radioactivity: RadioactivityEngine,
  doppler: DopplerEngine,
  interference: InterferenceEngine,
  capacitor: CapacitorEngine,
  telescope: TelescopeEngine,
  genetics: GeneticsEngine,
  neuron: NeuronEngine,
  aerodynamics: AerodynamicsEngine,
  bridge: BridgeEngine,
};

const LabRunner = () => {
  const { labId } = useParams<{ labId: string }>();
  const { t } = useLanguage();

  const lab = labsCatalog.find(l => l.id === labId);
  if (!lab) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Lab not found</h1>
            <Link to="/experiments" className="text-primary underline">{t('common.back')}</Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const EngineComponent = engineMap[lab.engineType || ''];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 glass-panel">
          <div className="container mx-auto px-4 py-3 flex items-center gap-4">
            <Link to="/experiments">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${lab.gradient} flex items-center justify-center`}>
                <lab.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm">{t(lab.titleKey)}</h1>
                <p className="text-xs text-muted-foreground">{t(lab.descKey)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engine */}
        <div className="pt-16">
          {EngineComponent ? (
            <EngineComponent />
          ) : (
            <div className="flex items-center justify-center h-[80vh]">
              <p className="text-muted-foreground">{t('labs.title')}: {lab.engineType}</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default LabRunner;
