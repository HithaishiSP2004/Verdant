'use client';

import { motion } from 'framer-motion';

interface EarthOraclePanelProps {
  activePanel: 'reflection' | 'logs' | 'projection' | 'community' | null;
  prefersReducedMotion: boolean;
  projectionMode: boolean;
  setProjectionMode: (mode: boolean) => void;
  projectionYearOffset: number;
  setProjectionYearOffset: (offset: number) => void;
  projectionPath: 'continuation' | 'regeneration';
  setProjectionPath: (path: 'continuation' | 'regeneration') => void;
  oracleLoading: boolean;
  oracleResults: {
    continuation: { narrative: string; indicators: string[] };
    regeneration: { narrative: string; indicators: string[] };
  } | null;
  actionLogCount: number;
  vitalityScore: number;
}

export function EarthOraclePanel({
  activePanel,
  prefersReducedMotion,
  projectionMode,
  setProjectionMode,
  projectionYearOffset,
  setProjectionYearOffset,
  projectionPath,
  setProjectionPath,
  oracleLoading,
  oracleResults,
  actionLogCount,
  vitalityScore
}: EarthOraclePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: activePanel === 'logs' ? 0 : 1, 
        y: activePanel === 'logs' ? 20 : 0 
      }}
      transition={prefersReducedMotion ? { duration: 0 } : undefined}
      style={{ pointerEvents: activePanel === 'logs' ? 'none' : 'auto' }}
      className="nature-card p-5 w-80 pointer-events-auto flex flex-col gap-3 max-h-[70vh] md:max-h-[66vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-text-secondary font-mono">The Earth Oracle — Future Carbon Projection</span>
        <button
          onClick={() => {
            setProjectionMode(!projectionMode);
            if (!projectionMode) {
              setProjectionYearOffset(1);
              setProjectionPath('regeneration');
            } else {
              setProjectionYearOffset(0);
            }
          }}
          className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full font-sans transition-all ${
            projectionMode ? 'bg-sunbeam text-stone-dark' : 'bg-white/10 text-white'
          }`}
        >
          {projectionMode ? 'Oracle Active' : 'Consult Oracle'}
        </button>
      </div>

      <span className="font-serif text-base text-white block">Future Projection</span>

      {/* FIX 4: Carbon Outlook block — always visible when Oracle is active */}
      {projectionMode && (
        <div className="flex gap-2 text-[10px] font-mono">
          <div className={`flex-1 rounded-xl px-3 py-2 border ${
            projectionPath === 'regeneration'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-white/5 border-white/10 text-text-secondary'
          }`}>
            <span className="uppercase tracking-widest block mb-0.5 font-bold">Regeneration</span>
            <span className="leading-relaxed">Lower future emissions through sustained positive actions.</span>
          </div>
          <div className={`flex-1 rounded-xl px-3 py-2 border ${
            projectionPath === 'continuation'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-white/5 border-white/10 text-text-secondary'
          }`}>
            <span className="uppercase tracking-widest block mb-0.5 font-bold">Continuation</span>
            <span className="leading-relaxed">Higher future emissions if current habits continue.</span>
          </div>
        </div>
      )}

      {projectionMode ? (
        <div className="flex flex-col gap-3">
          {/* Year steps horizontal timeline slider */}
          <div className="flex flex-col gap-1">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={[0, 1, 3, 5].indexOf(projectionYearOffset)}
              onChange={(e) => {
                const stepVal = Number(e.target.value);
                const yearVal = [0, 1, 3, 5][stepVal];
                setProjectionYearOffset(yearVal);
              }}
              aria-label="Future projection year slider"
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={projectionYearOffset}
              aria-valuetext={projectionYearOffset === 0 ? 'Today' : `${projectionYearOffset} year${projectionYearOffset > 1 ? 's' : ''} from now`}
              className="w-full accent-sunbeam cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-secondary font-mono tracking-wider px-1">
              <span className={projectionYearOffset === 0 ? 'text-sunbeam font-bold' : ''}>TODAY</span>
              <span className={projectionYearOffset === 1 ? 'text-sunbeam font-bold' : ''}>Y1</span>
              <span className={projectionYearOffset === 3 ? 'text-sunbeam font-bold' : ''}>Y3</span>
              <span className={projectionYearOffset === 5 ? 'text-sunbeam font-bold' : ''}>Y5</span>
            </div>
          </div>

          {projectionYearOffset > 0 ? (
            <>
              {/* Path Selector Tabs */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 mt-1">
                <button
                  onClick={() => setProjectionPath('continuation')}
                  className={`flex-1 text-[10px] uppercase tracking-wider py-1.5 rounded-lg transition-all ${
                    projectionPath === 'continuation' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Continuation
                </button>
                <button
                  onClick={() => setProjectionPath('regeneration')}
                  className={`flex-1 text-[10px] uppercase tracking-wider py-1.5 rounded-lg transition-all ${
                    projectionPath === 'regeneration' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Regeneration
                </button>
              </div>

              {/* Future narrative and indicators display */}
              {oracleLoading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <div className="w-5 h-5 border-2 border-sunbeam border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] text-text-secondary font-mono">Channeling predictions...</span>
                </div>
              ) : oracleResults ? (
                <div className="flex flex-col gap-2 bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-sunbeam">
                    {projectionPath === 'continuation' ? 'Timeline of Continuation' : 'Timeline of Regeneration'}
                  </span>
                  {/* CO₂ context line — ties projection to real user data */}
                  {actionLogCount > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono text-text-secondary bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        Based on: <strong className="text-emerald-400">{actionLogCount} carbon action{actionLogCount > 1 ? 's' : ''} logged</strong>
                      </span>
                      <span className="text-[9px] font-mono text-text-secondary bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        Vitality: <strong className="text-sunbeam">{Math.round(vitalityScore * 100)}%</strong>
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-text-secondary italic leading-relaxed select-text">
                    &ldquo;{projectionPath === 'continuation' ? oracleResults.continuation.narrative : oracleResults.regeneration.narrative}&rdquo;
                  </p>
                  <div className="border-t border-white/5 pt-2 mt-1 flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-text-secondary">Ecosystem Indicators</span>
                    <ul className="list-disc pl-3 text-[10px] text-text-secondary flex flex-col gap-1">
                      {(projectionPath === 'continuation' ? oracleResults.continuation.indicators : oracleResults.regeneration.indicators).map((ind, i) => (
                        <li key={i} className="select-text">{ind}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-[11px] text-text-secondary leading-relaxed italic text-center py-2">
              Drag the slider to consult The Earth Oracle and project alternative future timelines.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-secondary leading-relaxed">
          Activate the Oracle to simulate how your carbon habits shape future environmental outcomes.
        </p>
      )}
    </motion.div>
  );
}
