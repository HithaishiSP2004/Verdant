'use client';

import { motion } from 'framer-motion';

interface HUDHeaderProps {
  vitalityInfo: { status: string; emoji: string };
  totalCo2Saved: number;
  totalCo2Display: string;
  co2Equivalency: string | null;
  carbonStory: {
    dominantCategory: string;
    logCount: number;
    netDisplay: string;
    isNet: boolean;
  } | null;
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
  carbonStory,
  activePanel,
  setActivePanel,
  highContrastMode,
  toggleHighContrastMode,
  prefersReducedMotion,
  setPrefersReducedMotion,
}: HUDHeaderProps) {
  return (
    <header className="absolute top-6 left-6 right-6 flex items-start justify-between z-10 pointer-events-none">
      {/* HUD Header plaques */}
      <div className="flex gap-4 items-start pointer-events-auto">
        {/* Plaque 1: Qualitative Vitality */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="nature-card px-5 py-3 flex items-center gap-3 select-none"
        >
          <span className="text-2xl" role="img" aria-label="Ecosystem status">{vitalityInfo.emoji}</span>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-text-secondary">Sanctuary State</span>
            <span className="font-serif text-base font-bold text-white leading-tight">
              {vitalityInfo.status}
            </span>
          </div>
        </motion.div>

        {/* Plaque 2: Dedicated prominent Carbon Footprint Tracker */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="nature-card px-5 py-3 flex items-center gap-3.5 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.08)] select-none"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-lg">
            ♻️
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-400 font-bold">
              Carbon Footprint Tracker
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-serif text-xl font-bold text-white leading-none">
                {totalCo2Saved > 0 ? totalCo2Display : '0g CO₂'}
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">saved</span>
            </div>
            {totalCo2Saved > 0 && carbonStory ? (
              <span className="text-[9px] text-text-secondary mt-0.5 font-sans leading-none">
                Net Balance: <strong className={carbonStory.isNet ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>{carbonStory.netDisplay}</strong>
              </span>
            ) : (
              <span className="text-[9px] text-text-secondary mt-0.5 font-sans leading-none">
                No active carbon reduction logged yet
              </span>
            )}
            {co2Equivalency && (
              <span className="text-[9px] text-text-secondary font-mono mt-0.5 leading-none">
                {co2Equivalency}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Global HUD control dials */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 pointer-events-auto"
      >
        <button
          onClick={() => setActivePanel(activePanel === 'reflection' ? null : 'reflection')}
          className={`river-stone-btn flex items-center gap-2 ${activePanel === 'reflection' ? 'bg-sunbeam/20 border-sunbeam text-sunbeam' : ''}`}
        >
          <span className="font-sans text-xs uppercase tracking-wider">EcoTwin (Carbon Identity)</span>
        </button>
        
        <button
          onClick={() => setActivePanel(activePanel === 'logs' ? null : 'logs')}
          className={`river-stone-btn flex items-center gap-2 ${activePanel === 'logs' ? 'bg-sunbeam/20 border-sunbeam text-sunbeam' : ''}`}
        >
          <span className="font-sans text-xs uppercase tracking-wider">Canopy Logs (Carbon History)</span>
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
