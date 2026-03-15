import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CustomCursor } from "@/components/CustomCursor";
import { Navigation } from "@/components/Navigation";
import { VoiceAssistantControls } from "@/components/VoiceAssistantControls";
import { CreativeFooter } from "@/components/CreativeFooter";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { LanguageProvider } from "@/context/LanguageContext";
import { VoiceProvider } from "@/context/VoiceContext";
import { ModeProvider } from "@/context/ModeContext";
import { useEasterEggs } from "@/hooks/useEasterEggs";
import Index from "./pages/Index";
import ExperimentsPage from "./pages/ExperimentsPage";
import LearnPage from "./pages/LearnPage";
import GamesPage from "./pages/GamesPage";
import CreatePage from "./pages/CreatePage";
import ParticlesLab from "./pages/ParticlesLab";
import FluidLab from "./pages/FluidLab";
import Scene3DLab from "./pages/Scene3DLab";
import GenerativeLab from "./pages/GenerativeLab";
import GravityLab from "./pages/GravityLab";
import LightLab from "./pages/LightLab";
import SoundLab from "./pages/SoundLab";
import MagnetismLab from "./pages/MagnetismLab";
import ChemistryLab from "./pages/ChemistryLab";
import FractalLab from "./pages/FractalLab";
import PendulumLab from "./pages/PendulumLab";
import ElectricityLab from "./pages/ElectricityLab";
import OpticsLab from "./pages/OpticsLab";
import ThermoLab from "./pages/ThermoLab";
import EcosystemLab from "./pages/EcosystemLab";
import AstronomyLab from "./pages/AstronomyLab";
import RoboticsLab from "./pages/RoboticsLab";
import DnaLab from "./pages/DnaLab";
import ImpactPage from "./pages/ImpactPage";
import LabRunner from "./pages/LabRunner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/particles" element={<ParticlesLab />} />
        <Route path="/fluid" element={<FluidLab />} />
        <Route path="/scene3d" element={<Scene3DLab />} />
        <Route path="/generative" element={<GenerativeLab />} />
        <Route path="/gravity" element={<GravityLab />} />
        <Route path="/light" element={<LightLab />} />
        <Route path="/sound" element={<SoundLab />} />
        <Route path="/magnetism" element={<MagnetismLab />} />
        <Route path="/chemistry" element={<ChemistryLab />} />
        <Route path="/fractals" element={<FractalLab />} />
        <Route path="/pendulum" element={<PendulumLab />} />
        <Route path="/electricity" element={<ElectricityLab />} />
        <Route path="/optics" element={<OpticsLab />} />
        <Route path="/thermo" element={<ThermoLab />} />
        <Route path="/ecosystem" element={<EcosystemLab />} />
        <Route path="/astronomy" element={<AstronomyLab />} />
        <Route path="/robotics" element={<RoboticsLab />} />
        <Route path="/dna" element={<DnaLab />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/labs/:labId" element={<LabRunner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { showConfetti } = useEasterEggs();
  const location = useLocation();

  const isLabPage = ['/particles', '/fluid', '/scene3d', '/generative', '/gravity', '/light', '/sound', '/magnetism', '/chemistry', '/fractals', '/pendulum', '/electricity', '/optics', '/thermo', '/ecosystem', '/astronomy', '/robotics', '/dna'].includes(location.pathname) || location.pathname.startsWith('/labs/');

  return (
    <>
      <CustomCursor />
      <Navigation />
      <AnimatedRoutes />
      {!isLabPage && <CreativeFooter />}
      <VoiceAssistantControls />
      <ConfettiEffect active={showConfetti} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <ModeProvider>
            <VoiceProvider>
              <AppContent />
            </VoiceProvider>
          </ModeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
