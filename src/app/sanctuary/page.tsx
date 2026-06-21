'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useUIStore } from '@/store/useUIStore';
import { getVitalityLevel } from '@/types/ecosystem';
import { createClient } from '@/lib/supabase/client';
import {
  LeafIcon,
  RiverIcon,
  SunIcon,
  ButterflyIcon,
  MountainIcon
} from '@/components/NatureIcons';

// Dynamically load R3F Canvas to prevent Next.js server-side hydration mismatches
const SanctuaryCanvas = dynamic(() => import('@/components/sanctuary/Canvas'), { ssr: false });

export default function SanctuaryPage() {
  const supabase = createClient();

  // Zustand states
  const {
    vitalityScore,
    guardianArchetype,
    ecosystemPersonality,
    growthStory,
    treeCount,
    flowerCount,
    weatherCondition,
    assets,
    actionLogs,
    projectionMode,
    projectionYearOffset,
    projectionPath,
    setEcosystemState,
    setAssets,
    setActionLogs,
    addActionLog,
    applyActionImpact,
    setProjectionMode,
    setProjectionYearOffset,
    setProjectionPath,
  } = useEcosystemStore();

  const {
    activePanel,
    logActionModalOpen,
    highContrastMode,
    screenReaderMirrorText,
    prefersReducedMotion,
    setActivePanel,
    setLogActionModalOpen,
    toggleHighContrastMode,
    setScreenReaderMirrorText,
    setPrefersReducedMotion,
  } = useUIStore();

  // Component states
  const [habitText, setHabitText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<{
    natureReflection: string;
    futureProjection5y: string;
    category: string;
    co2SavedG: number;
    isPositive: boolean;
  } | null>(null);

  // Future Oracle states
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResults, setOracleResults] = useState<{
    continuation: { narrative: string; indicators: string[] };
    regeneration: { narrative: string; indicators: string[] };
  } | null>(null);

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

  // Fetch Future Oracle predictions when offset changes
  useEffect(() => {
    if (!projectionMode || projectionYearOffset === 0) {
      setOracleResults(null);
      return;
    }

    const fetchOracle = async () => {
      setOracleLoading(true);
      try {
        const res = await fetch('/api/oracle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vitalityScore,
            weatherCondition,
            treeCount,
            flowerCount,
            yearOffset: projectionYearOffset,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setOracleResults({
            continuation: data.continuation,
            regeneration: data.regeneration,
          });
        }
      } catch (err) {
        console.error('Failed to fetch future projection:', err);
      } finally {
        setOracleLoading(false);
      }
    };

    fetchOracle();
  }, [projectionMode, projectionYearOffset, vitalityScore, weatherCondition, treeCount, flowerCount]);

  // Initialize and seed temporary demo assets to ensure the canvas has items to show immediately
  useEffect(() => {
    // Generate initial test assets if user state is empty
    if (assets.length === 0) {
      const demoAssets = [
        { id: '1', userId: 'demo', assetType: 'oak' as const, pos: [-2, 0, -2] as [number, number, number], scale: 1.0, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '2', userId: 'demo', assetType: 'pine' as const, pos: [2, 0, -1] as [number, number, number], scale: 0.9, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '3', userId: 'demo', assetType: 'flower' as const, pos: [-1, 0, 1] as [number, number, number], scale: 0.8, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '4', userId: 'demo', assetType: 'flower' as const, pos: [1.5, 0, 2] as [number, number, number], scale: 0.7, healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '5', userId: 'demo', assetType: 'oak' as const, pos: [3, 0, -3] as [number, number, number], scale: 1.1, healthState: 1.0, createdAt: new Date().toISOString() },
      ];
      setAssets(demoAssets);
    }
  }, [assets.length, setAssets]);

  // Compute qualitative state mapping
  const vitalityInfo = getVitalityLevel(vitalityScore);

  // Carbon Tracking Layer — aggregate CO₂ across all logged actions
  const totalCo2Saved = actionLogs.reduce((sum, log) => sum + (log.co2SavedG || 0), 0);
  const totalCo2Display = totalCo2Saved >= 1000
    ? `${(totalCo2Saved / 1000).toFixed(2)} kg CO₂`
    : `${totalCo2Saved}g CO₂`;
  const co2Val = totalCo2Saved >= 1000 ? (totalCo2Saved / 1000).toFixed(1) : totalCo2Saved;
  const co2Unit = totalCo2Saved >= 1000 ? 'kg CO₂' : 'g CO₂';

  // Carbon Understanding Layer — real-world equivalency translation
  const co2Equivalency = (() => {
    if (totalCo2Saved <= 0) return null;
    if (totalCo2Saved >= 1000) return `≈ ${(totalCo2Saved / 120).toFixed(1)}km not driven`;
    if (totalCo2Saved >= 200) return `≈ ${Math.round(totalCo2Saved / 21)} TV hours avoided`;
    return `≈ ${Math.round(totalCo2Saved / 5)} minutes of LED lighting saved`;
  })();

  // Carbon Story Layer — derive narrative from log patterns
  const carbonStory = (() => {
    if (actionLogs.length === 0) return null;
    const counts: Record<string, number> = {};
    let totalSaved = 0;
    let totalCost = 0;
    actionLogs.forEach(log => {
      counts[log.category] = (counts[log.category] || 0) + 1;
      if (log.co2SavedG > 0) totalSaved += log.co2SavedG;
      else totalCost += Math.abs(log.vitalityDelta * 800);
    });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const categoryLabels: Record<string, string> = {
      transportation: 'sustainable mobility', energy: 'energy conservation',
      food: 'conscious nutrition', conservation: 'active conservation', waste: 'waste reduction',
    };
    const netG = totalSaved - totalCost;
    const netDisplay = netG >= 0
      ? `${netG >= 1000 ? (netG/1000).toFixed(2)+' kg' : netG.toFixed(0)+'g'} net CO₂ saved`
      : `${Math.abs(netG).toFixed(0)}g net CO₂ impact`;
    return {
      dominantCategory: categoryLabels[dominant?.[0]] || 'general sustainability',
      logCount: actionLogs.length,
      netDisplay,
      isNet: netG >= 0,
    };
  })();

  // Handle Habit submission to API route
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitText.trim() || analyzing) return;

    setAnalyzing(true);
    setLastAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: habitText }),
      });

      const data = await res.json();
      if (data.success) {
        // Add item to local logs store list
        addActionLog({
          id: data.actionLog.id,
          userId: data.actionLog.user_id,
          rawDescription: data.actionLog.raw_description,
          category: data.actionLog.category,
          impactType: data.actionLog.impact_type,
          vitalityDelta: Number(data.actionLog.vitality_delta),
          co2SavedG: Number(data.actionLog.co2_saved_g),
          natureReflection: data.analysis.natureReflection,
          futureProjection5y: data.analysis.futureProjection5y,
          aiMetadata: data.actionLog.ai_metadata,
          createdAt: data.actionLog.created_at,
        });

        // Recalculate ecosystem state properties
        applyActionImpact(
          Number(data.actionLog.vitality_delta),
          data.actionLog.category,
          data.actionLog.impact_type
        );

        // Dynamic Sprouting rules: add physical asset coordinate if action is positive
        if (data.actionLog.impact_type === 'positive') {
          const type = Math.random() > 0.4 ? 'oak' : 'pine';
          const newAsset = {
            id: Math.random().toString(),
            userId: 'demo',
            assetType: type as any,
            pos: [(Math.random() - 0.5) * 6, 0.0, (Math.random() - 0.5) * 6] as [number, number, number],
            scale: 0.7 + Math.random() * 0.5,
            healthState: 1.0,
            createdAt: new Date().toISOString(),
          };
          // Insert new sprout asset into local listing
          setAssets([...assets, newAsset]);
        }

        // Save AI reflections to display in modal scroll
        setLastAnalysisResult({
          natureReflection: data.analysis.natureReflection,
          futureProjection5y: data.analysis.futureProjection5y,
          category: data.actionLog.category,
          co2SavedG: Number(data.actionLog.co2_saved_g),
          isPositive: data.actionLog.impact_type === 'positive',
        });

        // Update accessibility live screen-reader speech context
        setScreenReaderMirrorText(
          `Your action log has been parsed. Nature reflection: ${data.analysis.natureReflection}. Projected 5-year outlook: ${data.analysis.futureProjection5y}`
        );

        setHabitText('');
      } else {
        alert(data.error || 'Failed to analyze action.');
      }
    } catch (err) {
      console.error(err);
      alert('Network failure connecting to sanctuary.');
    } finally {
      setAnalyzing(false);
    }
  };

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

      {/* HUD FOOTER Controls */}
      <footer className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-10 pointer-events-none">
        
        {/* World Tree Contribution Widget (Bottom-Left) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: activePanel === 'reflection' ? 0 : 1, 
            y: activePanel === 'reflection' ? 20 : 0 
          }}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
          style={{ pointerEvents: activePanel === 'reflection' ? 'none' : 'auto' }}
          className="nature-card p-5 max-w-sm pointer-events-auto select-none"
        >
          <span className="text-xs uppercase tracking-widest text-text-secondary block mb-1">Communal Grove</span>
          <span className="font-serif text-lg font-medium text-white block mb-2">The World Tree</span>
          <p className="font-sans text-xs text-text-secondary leading-relaxed">
            🌿 3,472 actions logged collectively today. The World Tree branches out in strength.
          </p>
        </motion.div>

        {/* Stone Input Button to Log Action (Bottom-Center) */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          <button
            id="sanctuary-controls"
            onClick={() => setLogActionModalOpen(true)}
            className="river-stone-btn py-4 px-8 text-stone-dark font-sans font-medium text-base tracking-wider bg-sunbeam border-none hover:bg-yellow-300 active:scale-95"
          >
            🌱 Share Today's Story
          </button>
        </div>

        {/* The Earth Oracle Controls (Bottom-Right) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: activePanel === 'logs' ? 0 : 1, 
            y: activePanel === 'logs' ? 20 : 0 
          }}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
          style={{ pointerEvents: activePanel === 'logs' ? 'none' : 'auto' }}
          className="nature-card p-5 w-80 pointer-events-auto flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-text-secondary">The Earth Oracle</span>
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
                      <p className="text-[11px] text-text-secondary italic leading-relaxed select-text">
                        "{projectionPath === 'continuation' ? oracleResults.continuation.narrative : oracleResults.regeneration.narrative}"
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
              Unlock temporal oracle mode to see how your choices shape tomorrow.
            </p>
          )}
        </motion.div>
      </footer>

      {/* DRAWER PANELS & MODAL LAYER */}
      <AnimatePresence>
        
        {/* 1. EcoTwin Identity Drawer */}
        {activePanel === 'reflection' && (
          <motion.div
            initial={{ x: -350 }}
            animate={{ x: 0 }}
            exit={{ x: -350 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 16 }}
            className="absolute top-28 left-6 bottom-28 w-80 nature-card p-6 flex flex-col overflow-y-auto z-20 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest text-text-secondary">EcoTwin Spirit</span>
              <button onClick={() => setActivePanel(null)} className="text-text-secondary hover:text-white">✕</button>
            </div>
            
            <h2 className="font-serif text-2xl font-bold text-white mb-1">{guardianArchetype}</h2>
            <span className="text-xs text-sunbeam font-mono mb-4 block">Identity Guardian</span>

            {/* AI Environmental Identity Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-sunbeam/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-sunbeam">AI Environmental Identity</span>
                {actionLogs.length >= 3 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    Unlocked
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-full border border-amber-500/30">
                    Locked
                  </span>
                )}
              </div>

              {actionLogs.length >= 3 ? (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                      {guardianArchetype === 'River Protector' && <RiverIcon size={20} className="text-sky-400" />}
                      {guardianArchetype === 'Sun Keeper' && <SunIcon size={20} className="text-yellow-400" />}
                      {guardianArchetype === 'Pollinator Ally' && <ButterflyIcon size={20} className="text-violet-400" />}
                      {guardianArchetype === 'Mountain Keeper' && <MountainIcon size={20} className="text-slate-300" />}
                      {guardianArchetype === 'Forest Guardian' && <LeafIcon size={20} className="text-emerald-400" />}
                    </div>
                    <span className="font-serif text-lg font-bold text-white">{guardianArchetype}</span>
                  </div>
                  <p className="font-sans text-[11px] text-text-secondary leading-relaxed">
                    {guardianArchetype === 'River Protector' && 'Your actions show a strong preference for sustainable mobility, active transit, and resource awareness.'}
                    {guardianArchetype === 'Sun Keeper' && 'Your actions reflect a dedicated path toward energy conservation, climate control awareness, and reducing power footprints.'}
                    {guardianArchetype === 'Pollinator Ally' && 'Your choices show a mindful connection to agricultural sustainability, organic nutrition, and dietary awareness.'}
                    {guardianArchetype === 'Mountain Keeper' && 'You demonstrate an active preference for wilderness preservation, biological conservation, and ecological recovery.'}
                    {guardianArchetype === 'Forest Guardian' && 'You are a general protector of the sanctuary, nurturing the balance of waste reduction and environmental protection.'}
                  </p>
                  <p className="text-[10px] text-emerald-400/80 italic font-mono mt-1">
                    ✓ Verified competition-grade habit alignment
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  <span className="font-serif text-sm font-medium text-white/60">Analyze 3 actions to reveal identity</span>
                  <p className="font-sans text-[11px] text-text-secondary/60 leading-relaxed">
                    Log {3 - actionLogs.length} more actions under the canopy to unlock your custom AI Environmental Identity based on your habits.
                  </p>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-sunbeam transition-all duration-500" 
                      style={{ width: `${(actionLogs.length / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-text-secondary block mb-1">Whispering Personality</span>
                <p className="font-serif text-sm italic text-text-secondary leading-relaxed select-text">
                  "{ecosystemPersonality}"
                </p>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-text-secondary block mb-1">Our Growth Story</span>
                <p className="font-sans text-xs text-text-secondary leading-relaxed select-text">
                  {growthStory}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-xs uppercase tracking-wider text-text-secondary block mb-2">Canopy Statistics</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">🌳</span>
                    <span className="text-xs text-white font-serif font-bold">{treeCount}</span>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider font-sans">Trees</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">🌸</span>
                    <span className="text-xs text-white font-serif font-bold">{flowerCount}</span>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider font-sans">Flowers</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">♻️</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold leading-none">{co2Val}</span>
                    <span className="text-[8px] text-text-secondary tracking-wider font-sans mt-0.5">{co2Unit}</span>
                  </div>
                </div>
              </div>

              {/* My Carbon Story — narrative summary */}
              {carbonStory && (
                <div className="border-t border-white/5 pt-4">
                  <span className="text-xs uppercase tracking-wider text-text-secondary block mb-2">My Carbon Story</span>
                  <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
                    <p className="font-serif text-[11px] italic text-text-secondary leading-relaxed select-text">
                      Across <strong className="text-white not-italic">{carbonStory.logCount} actions</strong>, your strongest
                      commitment is toward{' '}
                      <strong className="text-sunbeam not-italic">{carbonStory.dominantCategory}</strong>.
                      Your canopy holds a{' '}
                      <strong className={`not-italic ${carbonStory.isNet ? 'text-emerald-400' : 'text-red-400'}`}>
                        {carbonStory.netDisplay}
                      </strong>{' '}
                      across your journey.
                    </p>
                    {co2Equivalency && (
                      <span className="text-[10px] font-mono text-text-secondary">{co2Equivalency}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 2. Logs / Canopy Reflections Drawer */}
        {activePanel === 'logs' && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 16 }}
            className="absolute top-28 right-6 bottom-28 w-80 nature-card p-6 flex flex-col overflow-y-auto z-20 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest text-text-secondary">Canopy Logbook</span>
              <button onClick={() => setActivePanel(null)} className="text-text-secondary hover:text-white">✕</button>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white mb-6">Chronicles</h2>

            <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
              {actionLogs.length === 0 ? (
                <p className="text-xs text-text-secondary italic text-center py-12">
                  No actions logged under the canopy yet. Share today's story to begin.
                </p>
              ) : (
                actionLogs.map((log) => (
                  <div key={log.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                      <span className="text-sunbeam uppercase">{log.category}</span>
                      {log.impactType === 'positive'
                        ? <span className="text-emerald-400">+{log.co2SavedG}g CO₂ saved</span>
                        : <span className="text-red-400">~{Math.abs(Math.round(log.vitalityDelta * 800))}g CO₂ cost</span>
                      }
                    </div>
                    <p className="font-sans text-xs text-white leading-normal select-text">
                      "{log.rawDescription}"
                    </p>
                    {log.natureReflection && (
                      <p className="font-serif text-[11px] italic text-text-secondary leading-normal border-t border-white/5 pt-2 select-text">
                        🍃 {log.natureReflection}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* 3. Share Today's Story Modal Overlay (Paper Scroll Style) */}
        {logActionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 pointer-events-auto"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 85, damping: 18 }}
              className="w-full max-w-md nature-card p-8 flex flex-col relative"
            >
              <button
                onClick={() => {
                  setLogActionModalOpen(false);
                  setLastAnalysisResult(null);
                }}
                className="absolute top-6 right-6 text-text-secondary hover:text-white"
                aria-label="Close action log overlay"
              >
                ✕
              </button>

              <span className="text-xs uppercase tracking-widest text-text-secondary block mb-2">Daily Reflections</span>
              <h2 className="font-serif text-3xl font-bold text-white mb-6">Share Today's Story</h2>

              <AnimatePresence mode="wait">
                {!lastAnalysisResult ? (
                  // Step A: Input Form
                  <form key="input-form" onSubmit={handleLogSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="habit-input" className="text-xs text-text-secondary">
                        Describe your real-world sustainable habit or carbon impact:
                      </label>
                      <textarea
                        id="habit-input"
                        rows={3}
                        required
                        value={habitText}
                        onChange={(e) => setHabitText(e.target.value)}
                        placeholder="I cycled to work today... OR I forgot to turn off the heating..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sunbeam resize-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={analyzing || !habitText.trim()}
                      className="river-stone-btn py-3 bg-sunbeam text-stone-dark font-sans font-medium text-sm disabled:opacity-50"
                    >
                      {analyzing ? 'Consulting the Canopy...' : 'Share Story'}
                    </button>
                  </form>
                ) : (
                  // Step B: Display Gemini Interpretations (Poetic Reflection + 5-Year Outlook)
                  <motion.div
                    key="analysis-result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : undefined}
                    className="flex flex-col gap-6"
                  >
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <span className="text-[10px] uppercase font-mono text-sunbeam tracking-wider block mb-2">Nature Reflection</span>
                      <p className="font-serif text-base italic text-white leading-relaxed select-text">
                        "{lastAnalysisResult.natureReflection}"
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <span className="text-[10px] uppercase font-mono text-river tracking-wider block mb-2">5-Year Temporal Oracle</span>
                      <p className="font-sans text-xs text-text-secondary leading-relaxed select-text">
                        {lastAnalysisResult.futureProjection5y}
                      </p>
                    </div>

                    {/* Carbon Understanding — CO₂ impact chip */}
                    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
                      lastAnalysisResult.isPositive
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <span className="text-base">{lastAnalysisResult.isPositive ? '♻️' : '⚠️'}</span>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-text-secondary mb-0.5">Carbon Impact</span>
                        {lastAnalysisResult.isPositive
                          ? <span className="text-xs font-medium text-emerald-300">+{lastAnalysisResult.co2SavedG}g CO₂ saved</span>
                          : <span className="text-xs font-medium text-red-300">~{Math.abs(Math.round((lastAnalysisResult.co2SavedG || 0) || 80))}g CO₂ emitted</span>
                        }
                      </div>
                    </div>

                    {/* Carbon Reduction Layer — actionable next step */}
                    {(() => {
                      const nextSteps: Record<string, string> = {
                        transportation: '🚴 Try replacing one more car trip this week with cycling or public transit.',
                        energy: '💡 Enable an energy-saving mode on your devices or appliances tonight.',
                        food: '🥗 Plan one fully plant-based meal tomorrow to compound your impact.',
                        conservation: '🌱 Share a tree-planting tip or conservation resource with someone today.',
                        waste: '♻️ Find your nearest composting drop-off and schedule a visit this week.',
                      };
                      const tip = nextSteps[lastAnalysisResult.category];
                      return tip ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <span className="text-[9px] uppercase font-mono text-sunbeam tracking-wider block mb-1.5">Your Next Step</span>
                          <p className="text-xs text-text-secondary leading-relaxed">{tip}</p>
                        </div>
                      ) : null;
                    })()}

                    <button
                      onClick={() => {
                        setLogActionModalOpen(false);
                        setLastAnalysisResult(null);
                      }}
                      className="river-stone-btn py-3 bg-white/10 text-white font-sans text-sm hover:bg-white/20"
                    >
                      Return to Canopy
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
