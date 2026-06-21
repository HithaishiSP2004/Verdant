'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useUIStore } from '@/store/useUIStore';
import { getVitalityLevel } from '@/types/ecosystem';
import { EcoTwinDrawer } from '@/components/sanctuary/EcoTwinDrawer';
import { CanopyLogbook } from '@/components/sanctuary/CanopyLogbook';
import { StorySubmissionModal } from '@/components/sanctuary/StorySubmissionModal';
import { EarthOraclePanel } from '@/components/sanctuary/EarthOraclePanel';
import { HUDHeader } from '@/components/sanctuary/HUDHeader';
import { CommunalGroveWidget } from '@/components/sanctuary/CommunalGroveWidget';
import { useCarbonStats } from '@/hooks/useCarbonStats';
import { useFutureOracle } from '@/hooks/useFutureOracle';
import { useStorySubmission } from '@/hooks/useStorySubmission';

// Dynamically load R3F Canvas to prevent Next.js server-side hydration mismatches
const SanctuaryCanvas = dynamic(() => import('@/components/sanctuary/Canvas'), { ssr: false });

export default function SanctuaryPage() {
  // Zustand states
  const vitalityScore = useEcosystemStore((s) => s.vitalityScore);
  const guardianArchetype = useEcosystemStore((s) => s.guardianArchetype);
  const ecosystemPersonality = useEcosystemStore((s) => s.ecosystemPersonality);
  const growthStory = useEcosystemStore((s) => s.growthStory);
  const treeCount = useEcosystemStore((s) => s.treeCount);
  const flowerCount = useEcosystemStore((s) => s.flowerCount);
  const weatherCondition = useEcosystemStore((s) => s.weatherCondition);
  const assetsLength = useEcosystemStore((s) => s.assets.length);
  const actionLogs = useEcosystemStore((s) => s.actionLogs);
  const projectionMode = useEcosystemStore((s) => s.projectionMode);
  const projectionYearOffset = useEcosystemStore((s) => s.projectionYearOffset);
  const projectionPath = useEcosystemStore((s) => s.projectionPath);
  
  const setAssets = useEcosystemStore((s) => s.setAssets);
  const setProjectionMode = useEcosystemStore((s) => s.setProjectionMode);
  const setProjectionYearOffset = useEcosystemStore((s) => s.setProjectionYearOffset);
  const setProjectionPath = useEcosystemStore((s) => s.setProjectionPath);

  const activePanel = useUIStore((s) => s.activePanel);
  const logActionModalOpen = useUIStore((s) => s.logActionModalOpen);
  const highContrastMode = useUIStore((s) => s.highContrastMode);
  const screenReaderMirrorText = useUIStore((s) => s.screenReaderMirrorText);
  const prefersReducedMotion = useUIStore((s) => s.prefersReducedMotion);
  
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const setLogActionModalOpen = useUIStore((s) => s.setLogActionModalOpen);
  const toggleHighContrastMode = useUIStore((s) => s.toggleHighContrastMode);
  const setPrefersReducedMotion = useUIStore((s) => s.setPrefersReducedMotion);

  // Custom Hooks
  const {
    habitText,
    setHabitText,
    analyzing,
    lastAnalysisResult,
    setLastAnalysisResult,
    handleLogSubmit,
  } = useStorySubmission();

  const {
    totalCo2Saved,
    totalCo2Display,
    co2Val,
    co2Unit,
    co2Equivalency,
    carbonStory,
  } = useCarbonStats(actionLogs);

  const { oracleLoading, oracleResults } = useFutureOracle(
    projectionMode,
    projectionYearOffset,
    vitalityScore,
    weatherCondition,
    treeCount,
    flowerCount
  );

  // Synchronize system accessibility preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [setPrefersReducedMotion]);

  // Initialize and seed temporary demo assets to ensure the canvas has items to show immediately
  useEffect(() => {
    // Generate initial test assets if user state is empty
    if (assetsLength === 0) {
      const demoAssets = [
        { id: '1', userId: 'demo', assetType: 'oak' as const, pos: [-2, 0, -2] as [number, number, number], scale: 1.0, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '2', userId: 'demo', assetType: 'pine' as const, pos: [2, 0, -1] as [number, number, number], scale: 0.9, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '3', userId: 'demo', assetType: 'flower' as const, pos: [-1, 0, 1] as [number, number, number], scale: 0.8, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '4', userId: 'demo', assetType: 'flower' as const, pos: [1.5, 0, 2] as [number, number, number], scale: 0.7, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '5', userId: 'demo', assetType: 'oak' as const, pos: [3, 0, -3] as [number, number, number], scale: 1.1, healthState: 1.0, createdAt: new Date().toISOString() },
      ];
      setAssets(demoAssets);
    }
  }, [assetsLength, setAssets]);

  // Compute qualitative state mapping
  const vitalityInfo = getVitalityLevel(vitalityScore);

  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col ${highContrastMode ? 'high-contrast' : ''}`}>
      
      {/* Visual Skip Link for screen readers */}
      <a href="#sanctuary-controls" className="skip-link font-sans font-medium">
        Skip directly to controls interface
      </a>

      {/* Screen Reader Accessible Live region */}
      <div className="sr-only" aria-live="polite">
        {screenReaderMirrorText}
      </div>

      {/* BACKGROUND Layer: WebGL R3F Nature Sandbox */}
      <div className="absolute inset-0 z-0">
        <SanctuaryCanvas />
      </div>

      {/* FOREGROUND Layer: HUD Header overlay */}
      <HUDHeader
        vitalityInfo={vitalityInfo}
        totalCo2Saved={totalCo2Saved}
        totalCo2Display={totalCo2Display}
        co2Equivalency={co2Equivalency}
        carbonStory={carbonStory}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        highContrastMode={highContrastMode}
        toggleHighContrastMode={toggleHighContrastMode}
        prefersReducedMotion={prefersReducedMotion}
        setPrefersReducedMotion={setPrefersReducedMotion}
      />

      {/* HUD FOOTER Controls */}
      <footer className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-10 pointer-events-none">
        
        {/* World Tree Contribution Widget (Bottom-Left) */}
        <CommunalGroveWidget
          activePanel={activePanel}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Stone Input Button to Log Action (Bottom-Center) */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          <button
            id="sanctuary-controls"
            onClick={() => setLogActionModalOpen(true)}
            className="river-stone-btn py-4 px-8 text-stone-dark font-sans font-medium text-base tracking-wider bg-sunbeam border-none hover:bg-yellow-300 active:scale-95"
          >
            ♻️ Log a Carbon Action
          </button>
        </div>

        <EarthOraclePanel
          activePanel={activePanel}
          prefersReducedMotion={prefersReducedMotion}
          projectionMode={projectionMode}
          setProjectionMode={setProjectionMode}
          projectionYearOffset={projectionYearOffset}
          setProjectionYearOffset={setProjectionYearOffset}
          projectionPath={projectionPath}
          setProjectionPath={setProjectionPath}
          oracleLoading={oracleLoading}
          oracleResults={oracleResults}
          actionLogCount={actionLogs.length}
          vitalityScore={vitalityScore}
        />
      </footer>

      {/* DRAWER PANELS & MODAL LAYER */}
      <AnimatePresence>
        
        {/* 1. EcoTwin Identity Drawer */}
        {activePanel === 'reflection' && (
          <EcoTwinDrawer
            guardianArchetype={guardianArchetype}
            actionLogs={actionLogs}
            ecosystemPersonality={ecosystemPersonality}
            growthStory={growthStory}
            treeCount={treeCount}
            flowerCount={flowerCount}
            co2Val={co2Val}
            co2Unit={co2Unit}
            co2Equivalency={co2Equivalency}
            carbonStory={carbonStory}
            prefersReducedMotion={prefersReducedMotion}
            setActivePanel={setActivePanel}
          />
        )}

        {/* 2. Logs / Canopy Reflections Drawer */}
        {activePanel === 'logs' && (
          <CanopyLogbook
            actionLogs={actionLogs}
            prefersReducedMotion={prefersReducedMotion}
            setActivePanel={setActivePanel}
            onSelectRoadmapItem={(text) => {
              setHabitText(text);
              setLogActionModalOpen(true);
            }}
          />
        )}

        {/* 3. Share Today's Story Modal Overlay (Paper Scroll Style) */}
        {logActionModalOpen && (
          <StorySubmissionModal
            habitText={habitText}
            setHabitText={setHabitText}
            analyzing={analyzing}
            lastAnalysisResult={lastAnalysisResult}
            setLastAnalysisResult={setLastAnalysisResult}
            setLogActionModalOpen={setLogActionModalOpen}
            handleLogSubmit={handleLogSubmit}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
