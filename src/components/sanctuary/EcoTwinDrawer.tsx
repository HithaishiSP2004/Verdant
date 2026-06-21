'use client';

import { motion } from 'framer-motion';
import { GuardianArchetype, ActionLog } from '@/types/ecosystem';
import {
  LeafIcon,
  RiverIcon,
  SunIcon,
  ButterflyIcon,
  MountainIcon
} from '@/components/NatureIcons';
import { CarbonStory } from './CarbonStory';

interface EcoTwinDrawerProps {
  guardianArchetype: GuardianArchetype;
  actionLogs: ActionLog[];
  ecosystemPersonality: string;
  growthStory: string;
  treeCount: number;
  flowerCount: number;
  co2Val: string | number;
  co2Unit: string;
  co2Equivalency: string | null;
  carbonStory: {
    dominantCategory: string;
    logCount: number;
    netDisplay: string;
    isNet: boolean;
  } | null;
  prefersReducedMotion: boolean;
  setActivePanel: (panel: 'reflection' | 'logs' | null) => void;
}

export function EcoTwinDrawer({
  guardianArchetype,
  actionLogs,
  ecosystemPersonality,
  growthStory,
  treeCount,
  flowerCount,
  co2Val,
  co2Unit,
  co2Equivalency,
  carbonStory,
  prefersReducedMotion,
  setActivePanel
}: EcoTwinDrawerProps) {
  return (
    <motion.div
      initial={{ x: -350 }}
      animate={{ x: 0 }}
      exit={{ x: -350 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 16 }}
      className="absolute top-28 left-6 bottom-28 w-80 nature-card p-6 flex flex-col overflow-y-auto z-20 pointer-events-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-text-secondary">EcoTwin Spirit</span>
        <button onClick={() => setActivePanel(null)} className="text-text-secondary hover:text-white">✕</button>
      </div>
      
      <h2 className="font-serif text-2xl font-bold text-white mb-1">{guardianArchetype}</h2>
      <span className="text-xs text-sunbeam font-mono mb-3 block">
        {guardianArchetype === 'River Protector' && 'Hydrological Guardian'}
        {guardianArchetype === 'Sun Keeper' && 'Atmospheric Guardian'}
        {guardianArchetype === 'Pollinator Ally' && 'Biodiversity Guardian'}
        {guardianArchetype === 'Mountain Keeper' && 'Lithospheric Guardian'}
        {guardianArchetype === 'Forest Guardian' && 'Ecosystem Guardian'}
      </span>

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

      <div className="flex flex-col gap-3">
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

        <CarbonStory carbonStory={carbonStory} co2Equivalency={co2Equivalency} />
      </div>
    </motion.div>
  );
}
