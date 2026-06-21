'use client';

import { motion } from 'framer-motion';

interface HUDHeaderProps {
  vitalityInfo: { status: string; emoji: string };
  totalCo2Saved: number;
  totalCo2Display: string;
  co2Equivalency: string | null;
  activePanel: 'reflection' | 'logs' | 'projection' | 'community' | null;
  setActivePanel: (panel: 'reflection' | 'logs' | 'projection' | 'community' | null) => void;
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (prefers: boolean) => void;
}

export function HUDHeader({
  vitalityInfo,
  totalCo2Saved,
  totalCo2Display,
  co2Equivalency,
  activePanel,
  setActivePanel,
  highContrastMode,
  toggleHighContrastMode,
  prefersReducedMotion,
  setPrefersReducedMotion,
}: HUDHeaderProps) {
  return (
    <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
      {/* Qualitative Vitality plaque */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="nature-card px-5 py-3 flex items-center gap-3 pointer-events-auto select-none"
      >
        <span className="text-2xl" role="img" aria-label="Ecosystem status">{vitalityInfo.emoji}</span>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-text-secondary">Sanctuary State</span>
          <span className="font-serif text-lg font-bold text-white leading-tight">
            {vitalityInfo.status}
          </span>
          {totalCo2Saved > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 mt-0.5">
              ♻️ {totalCo2Display} saved
            </span>
          )}
          {co2Equivalency && (
            <span className="text-[9px] font-mono text-text-secondary mt-0.5">{co2Equivalency}</span>
          )}
        </div>
      </motion.div>

      {/* Global HUD control dials */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 pointer-events-auto"
      >
        <button
          onClick={() => setActivePanel(activePanel === 'reflection' ? null : 'reflection')}
          className="river-stone-btn flex items-center gap-2"
        >
          <span className="font-sans text-xs uppercase tracking-wider">EcoTwin</span>
        </button>
        
        <button
          onClick={() => setActivePanel(activePanel === 'logs' ? null : 'logs')}
          className="river-stone-btn flex items-center gap-2"
        >
          <span className="font-sans text-xs uppercase tracking-wider">Canopy Logs</span>
        </button>
        
        <button
          onClick={toggleHighContrastMode}
          className={`river-stone-btn p-3 flex items-center gap-1.5 ${highContrastMode ? 'bg-sunbeam/20 border-sunbeam text-sunbeam' : ''}`}
          aria-label={`Toggle High Contrast palette mode (currently ${highContrastMode ? 'enabled' : 'disabled'})`}
        >
          👁️ <span className="text-[10px] uppercase font-mono tracking-wider">{highContrastMode ? 'Contrast ON' : 'Contrast'}</span>
        </button>

        <button
          onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
          className={`river-stone-btn p-3 flex items-center gap-1.5 ${prefersReducedMotion ? 'bg-sunbeam/20 border-sunbeam text-sunbeam' : ''}`}
          aria-label={`Toggle Reduced Motion mode (currently ${prefersReducedMotion ? 'enabled' : 'disabled'})`}
        >
          🏃 <span className="text-[10px] uppercase font-mono tracking-wider">{prefersReducedMotion ? 'Motion OFF' : 'Motion'}</span>
        </button>
      </motion.div>
    </header>
  );
}
