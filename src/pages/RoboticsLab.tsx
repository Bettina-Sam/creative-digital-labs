import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND';

const RoboticsLab = () => {
  const [gateType, setGateType] = useState<GateType>('AND');
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const { speak, isEnabled } = useVoice();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEnabled) speak(t('voice.roboticsLabWelcome'));
  }, [isEnabled]);

  const getOutput = (): boolean => {
    switch (gateType) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'NOT': return !inputA;
      case 'XOR': return inputA !== inputB;
      case 'NAND': return !(inputA && inputB);
    }
  };

  const output = getOutput();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-6 left-6 z-20">
        <Link to="/experiments"><motion.button className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.05 }}><ArrowLeft className="w-5 h-5" /></motion.button></Link>
      </div>
      <div className="absolute top-6 right-6 z-20">
        <motion.button onClick={() => setShowInfo(!showInfo)} className="glass-panel p-3 rounded-xl" whileHover={{ scale: 1.05 }}><Info className="w-5 h-5" /></motion.button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">{t('robotics.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('robotics.info')}</p>
          </div>

          {/* Gate Selector */}
          <div className="flex justify-center gap-2 flex-wrap">
            {(['AND', 'OR', 'NOT', 'XOR', 'NAND'] as GateType[]).map(g => (
              <motion.button key={g} onClick={() => setGateType(g)} className={`px-4 py-2 rounded-xl font-mono text-sm font-bold transition-all ${gateType === g ? 'bg-primary text-primary-foreground' : 'glass-panel hover:bg-muted/50'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {g}
              </motion.button>
            ))}
          </div>

          {/* Gate Visualization */}
          <div className="glass-panel p-8 rounded-2xl">
            <div className="flex items-center justify-center gap-8">
              {/* Inputs */}
              <div className="space-y-4">
                <motion.button onClick={() => setInputA(!inputA)} className={`w-16 h-16 rounded-xl font-bold text-lg flex items-center justify-center ${inputA ? 'bg-neon-lime/20 text-neon-lime border-2 border-neon-lime/50' : 'bg-muted/20 text-muted-foreground border-2 border-border'}`} whileTap={{ scale: 0.9 }}>
                  {inputA ? '1' : '0'}
                </motion.button>
                {gateType !== 'NOT' && (
                  <motion.button onClick={() => setInputB(!inputB)} className={`w-16 h-16 rounded-xl font-bold text-lg flex items-center justify-center ${inputB ? 'bg-neon-lime/20 text-neon-lime border-2 border-neon-lime/50' : 'bg-muted/20 text-muted-foreground border-2 border-border'}`} whileTap={{ scale: 0.9 }}>
                    {inputB ? '1' : '0'}
                  </motion.button>
                )}
              </div>

              {/* Gate */}
              <motion.div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-mono font-bold text-xl text-primary" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                {gateType}
              </motion.div>

              {/* Output */}
              <motion.div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl ${output ? 'bg-neon-lime/30 text-neon-lime shadow-[0_0_30px_rgba(0,255,100,0.3)]' : 'bg-muted/20 text-muted-foreground'}`} animate={output ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
                {output ? '1' : '0'}
              </motion.div>
            </div>

            {/* Truth table */}
            <div className="mt-6 text-center">
              <p className="text-xs font-mono text-muted-foreground">
                {gateType === 'NOT' ? `NOT(${inputA ? '1' : '0'}) = ${output ? '1' : '0'}` : `${inputA ? '1' : '0'} ${gateType} ${inputB ? '1' : '0'} = ${output ? '1' : '0'}`}
              </p>
            </div>
          </div>

          {showInfo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" />{t('robotics.didYouKnow')}</h3>
              <p className="text-xs text-muted-foreground">{t('robotics.fact')}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoboticsLab;
