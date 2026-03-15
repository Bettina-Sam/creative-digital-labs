import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Wand2, Play } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { ParticleField } from '@/components/ParticleField';
import { WhiteboardModule } from '@/components/whiteboard/WhiteboardModule';
import { ParticleArtStudio } from '@/components/create/ParticleArtStudio';
import { ColorLaboratory } from '@/components/create/ColorLaboratory';
import { LayerComposer } from '@/components/create/LayerComposer';
import { SoundVisualizer } from '@/components/create/SoundVisualizer';
import { GradientDesigner } from '@/components/create/GradientDesigner';
import { PixelArtEditor } from '@/components/create/PixelArtEditor';
import { MusicSequencer } from '@/components/create/MusicSequencer';
import { TypographyPlayground } from '@/components/create/TypographyPlayground';
import { PatternGenerator } from '@/components/create/PatternGenerator';
import { AsciiArtGenerator } from '@/components/create/AsciiArtGenerator';
import { MandalaMaker } from '@/components/create/MandalaMaker';
import { EmojiArtCanvas } from '@/components/create/EmojiArtCanvas';
import { CodeArtGenerator } from '@/components/create/CodeArtGenerator';
import { StickerCollage } from '@/components/create/StickerCollage';
import { AnimationStudio } from '@/components/create/AnimationStudio';
import { ColorBlindnessSimulator } from '@/components/create/ColorBlindnessSimulator';
import { DataVisualizer } from '@/components/create/DataVisualizer';
// New school tools
import { ShapeBuilder } from '@/components/create/ShapeBuilder';
import { PaintMixer } from '@/components/create/PaintMixer';
import { ComicMaker } from '@/components/create/ComicMaker';
import { VoiceRecorder } from '@/components/create/VoiceRecorder';
import { SketchPad } from '@/components/create/SketchPad';
import { PhotoFilter } from '@/components/create/PhotoFilter';
import { RulerDraw } from '@/components/create/RulerDraw';
import { JigsawMaker } from '@/components/create/JigsawMaker';
import { GlobePaint } from '@/components/create/GlobePaint';
import { LightArt } from '@/components/create/LightArt';
import { BeatMaker } from '@/components/create/BeatMaker';
import { MathArt } from '@/components/create/MathArt';
// New college tools
import { ThreeDModeler } from '@/components/create/ThreeDModeler';
import { ShaderLab } from '@/components/create/ShaderLab';
import { SvgEditor } from '@/components/create/SvgEditor';
import { ApiViz } from '@/components/create/ApiViz';
import { AlgorithmViz } from '@/components/create/AlgorithmViz';
import { RegexBuilder } from '@/components/create/RegexBuilder';
import { BinaryArt } from '@/components/create/BinaryArtTool';
import { FourierDraw } from '@/components/create/FourierDraw';
import { Spectrogram } from '@/components/create/SpectrogramTool';
import { GraphPlotter } from '@/components/create/GraphPlotter';
import { LatexRender } from '@/components/create/LatexRender';
import { CircuitDraw } from '@/components/create/CircuitDraw';

import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMode } from '@/context/ModeContext';
import { toolsCatalog } from '@/catalog/tools';
import { filterByMode, NeonColor } from '@/catalog/types';
import { colorBg, colorText, colorBorder } from '@/lib/colorMap';

const toolModalMap: Record<string, boolean> = {
  'whiteboard': true, 'particle-art': true, 'color-lab': true, 'layer-composer': true,
  'sound-viz': true, 'gradient': true, 'pixel-art': true, 'music-seq': true,
  'typography': true, 'pattern-gen': true, 'ascii-art': true, 'mandala': true,
  'emoji-art': true, 'code-art': true, 'sticker': true, 'animation': true,
  'color-blind': true, 'data-viz': true,
  'shape-builder': true, 'paint-mix': true, 'comic-maker': true, 'voice-recorder': true,
  'sketch-pad': true, 'photo-filter': true, 'ruler-draw': true, 'jigsaw': true,
  'globe-paint': true, 'light-art': true, 'beat-maker': true, 'math-art': true,
  '3d-modeler': true, 'shader-lab': true, 'svg-editor': true, 'api-viz': true,
  'algorithm-viz': true, 'regex-builder': true, 'binary-art': true, 'fourier-draw': true,
  'spectrogram': true, 'graph-plotter': true, 'latex-render': true, 'circuit-draw': true,
};

const getBaseId = (id: string) => id.replace(/-c$/, '');

const CreatePage = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();
  const { mode } = useMode();
  const tools = filterByMode(toolsCatalog, mode);

  useEffect(() => { if (isEnabled) speak(t('voice.createWelcome')); }, [isEnabled]);

  const handleToolClick = (id: string) => {
    const baseId = getBaseId(id);
    if (toolModalMap[baseId]) setActiveModal(baseId);
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <motion.div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <Wand2 className="w-4 h-4 text-neon-magenta" />
              <span className="text-sm font-mono-lab text-muted-foreground">{t('create.badge')}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6"><span className="gradient-text">{t('create.title')}</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('create.subtitle')}</p>
            <p className="text-sm text-muted-foreground mt-2">{tools.length} {t('create.badge')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const color = tool.color as NeonColor;
              return (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ y: -10, scale: 1.02 }} onClick={() => handleToolClick(tool.id)} className="cursor-pointer group">
                  <motion.div className={`glass-panel p-6 rounded-2xl h-full border-2 border-transparent ${colorBorder[color]} transition-all`}>
                    <motion.div className={`w-14 h-14 rounded-2xl ${colorBg[color]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`} whileHover={{ rotate: 5 }}>
                      <Icon className={`w-7 h-7 ${colorText[color]}`} />
                    </motion.div>
                    <h2 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">{t(tool.titleKey)}</h2>
                    <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{t(tool.descKey)}</p>
                    {tool.featureKeys.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.featureKeys.map(fk => (<span key={fk} className="text-xs px-3 py-1 rounded-full bg-background/50 text-muted-foreground">{t(fk)}</span>))}
                      </div>
                    )}
                    <motion.div className={`flex items-center gap-2 text-sm font-medium ${colorText[color]} group-hover:translate-x-2 transition-transform`}>
                      <Play className="w-4 h-4" /><span>{t('create.openTool')}</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Original 18 tools */}
        <WhiteboardModule isOpen={activeModal === 'whiteboard'} onClose={() => setActiveModal(null)} onSpeak={speak} />
        <ParticleArtStudio isOpen={activeModal === 'particle-art'} onClose={() => setActiveModal(null)} />
        <ColorLaboratory isOpen={activeModal === 'color-lab'} onClose={() => setActiveModal(null)} />
        <LayerComposer isOpen={activeModal === 'layer-composer'} onClose={() => setActiveModal(null)} />
        <SoundVisualizer isOpen={activeModal === 'sound-viz'} onClose={() => setActiveModal(null)} />
        <GradientDesigner isOpen={activeModal === 'gradient'} onClose={() => setActiveModal(null)} />
        <PixelArtEditor isOpen={activeModal === 'pixel-art'} onClose={() => setActiveModal(null)} />
        <MusicSequencer isOpen={activeModal === 'music-seq'} onClose={() => setActiveModal(null)} />
        <TypographyPlayground isOpen={activeModal === 'typography'} onClose={() => setActiveModal(null)} />
        <PatternGenerator isOpen={activeModal === 'pattern-gen'} onClose={() => setActiveModal(null)} />
        <AsciiArtGenerator isOpen={activeModal === 'ascii-art'} onClose={() => setActiveModal(null)} />
        <MandalaMaker isOpen={activeModal === 'mandala'} onClose={() => setActiveModal(null)} />
        <EmojiArtCanvas isOpen={activeModal === 'emoji-art'} onClose={() => setActiveModal(null)} />
        <CodeArtGenerator isOpen={activeModal === 'code-art'} onClose={() => setActiveModal(null)} />
        <StickerCollage isOpen={activeModal === 'sticker'} onClose={() => setActiveModal(null)} />
        <AnimationStudio isOpen={activeModal === 'animation'} onClose={() => setActiveModal(null)} />
        <ColorBlindnessSimulator isOpen={activeModal === 'color-blind'} onClose={() => setActiveModal(null)} />
        <DataVisualizer isOpen={activeModal === 'data-viz'} onClose={() => setActiveModal(null)} />
        {/* 12 new school tools */}
        <ShapeBuilder isOpen={activeModal === 'shape-builder'} onClose={() => setActiveModal(null)} />
        <PaintMixer isOpen={activeModal === 'paint-mix'} onClose={() => setActiveModal(null)} />
        <ComicMaker isOpen={activeModal === 'comic-maker'} onClose={() => setActiveModal(null)} />
        <VoiceRecorder isOpen={activeModal === 'voice-recorder'} onClose={() => setActiveModal(null)} />
        <SketchPad isOpen={activeModal === 'sketch-pad'} onClose={() => setActiveModal(null)} />
        <PhotoFilter isOpen={activeModal === 'photo-filter'} onClose={() => setActiveModal(null)} />
        <RulerDraw isOpen={activeModal === 'ruler-draw'} onClose={() => setActiveModal(null)} />
        <JigsawMaker isOpen={activeModal === 'jigsaw'} onClose={() => setActiveModal(null)} />
        <GlobePaint isOpen={activeModal === 'globe-paint'} onClose={() => setActiveModal(null)} />
        <LightArt isOpen={activeModal === 'light-art'} onClose={() => setActiveModal(null)} />
        <BeatMaker isOpen={activeModal === 'beat-maker'} onClose={() => setActiveModal(null)} />
        <MathArt isOpen={activeModal === 'math-art'} onClose={() => setActiveModal(null)} />
        {/* 12 new college tools */}
        <ThreeDModeler isOpen={activeModal === '3d-modeler'} onClose={() => setActiveModal(null)} />
        <ShaderLab isOpen={activeModal === 'shader-lab'} onClose={() => setActiveModal(null)} />
        <SvgEditor isOpen={activeModal === 'svg-editor'} onClose={() => setActiveModal(null)} />
        <ApiViz isOpen={activeModal === 'api-viz'} onClose={() => setActiveModal(null)} />
        <AlgorithmViz isOpen={activeModal === 'algorithm-viz'} onClose={() => setActiveModal(null)} />
        <RegexBuilder isOpen={activeModal === 'regex-builder'} onClose={() => setActiveModal(null)} />
        <BinaryArt isOpen={activeModal === 'binary-art'} onClose={() => setActiveModal(null)} />
        <FourierDraw isOpen={activeModal === 'fourier-draw'} onClose={() => setActiveModal(null)} />
        <Spectrogram isOpen={activeModal === 'spectrogram'} onClose={() => setActiveModal(null)} />
        <GraphPlotter isOpen={activeModal === 'graph-plotter'} onClose={() => setActiveModal(null)} />
        <LatexRender isOpen={activeModal === 'latex-render'} onClose={() => setActiveModal(null)} />
        <CircuitDraw isOpen={activeModal === 'circuit-draw'} onClose={() => setActiveModal(null)} />
      </div>
    </PageTransition>
  );
};

export default CreatePage;
