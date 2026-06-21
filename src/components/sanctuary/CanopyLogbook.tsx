'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ActionLog } from '@/types/ecosystem';

interface CanopyLogbookProps {
  actionLogs: ActionLog[];
  prefersReducedMotion: boolean;
  setActivePanel: (panel: 'reflection' | 'logs' | null) => void;
  onSelectRoadmapItem?: (text: string) => void;
}

const ROADMAP_ITEMS = [
  {
    category: 'transportation',
    icon: '🚲',
    title: 'Mindful Commuting',
    description: 'Walk, cycle, or use public transit instead of driving.',
    co2Saved: '200g per km',
    templateText: 'I cycled 5km to run errands today instead of taking my car.'
  },
  {
    category: 'energy',
    icon: '🔌',
    title: 'Vampire Draw Reduction',
    description: 'Unplug devices, turn off standby switches, and use smart power strips.',
    co2Saved: '50g per hour',
    templateText: 'I unplugged all chargers and put computer equipment on a smart power strip today.'
  },
  {
    category: 'food',
    icon: '🥗',
    title: 'Conscious Plant-Based Meal',
    description: 'Substitute a meat dish with a plant-based alternative.',
    co2Saved: '800g per meal',
    templateText: 'I chose a plant-based salad and legume dish for dinner tonight.'
  },
  {
    category: 'conservation',
    icon: '🌱',
    title: 'Native Soil Restoration',
    description: 'Plant local species or trees to enhance biodiversity.',
    co2Saved: '400g per sapling',
    templateText: 'I planted three native saplings and weeded the local garden plot.'
  },
  {
    category: 'waste',
    icon: '♻️',
    title: 'Organic Waste Composting',
    description: 'Compost scraps and reuse single-use packaging.',
    co2Saved: '300g per day',
    templateText: 'I separated organic waste for composting and brought a reusable bag to the grocery.'
  }
];

export function CanopyLogbook({
  actionLogs,
  prefersReducedMotion,
  setActivePanel,
  onSelectRoadmapItem
}: CanopyLogbookProps) {
  const [tab, setTab] = useState<'history' | 'roadmap'>('history');

  return (
    <motion.div
      initial={{ x: 350 }}
      animate={{ x: 0 }}
      exit={{ x: 350 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 16 }}
      className="absolute top-28 right-6 bottom-28 w-80 nature-card p-6 flex flex-col overflow-y-auto z-20 pointer-events-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-widest text-text-secondary font-mono">Canopy Logbook — Carbon History</span>
        <button onClick={() => setActivePanel(null)} className="text-text-secondary hover:text-white">✕</button>
      </div>

      <h2 className="font-serif text-2xl font-bold text-white mb-4">Carbon Chronicles</h2>

      {/* Tab Switcher */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5 flex-shrink-0">
        <button
          onClick={() => setTab('history')}
          className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
            tab === 'history'
              ? 'bg-sunbeam/20 text-sunbeam border border-sunbeam/30 font-bold'
              : 'text-text-secondary hover:text-white border border-transparent'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setTab('roadmap')}
          className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
            tab === 'roadmap'
              ? 'bg-sunbeam/20 text-sunbeam border border-sunbeam/30 font-bold'
              : 'text-text-secondary hover:text-white border border-transparent'
          }`}
        >
          Roadmap
        </button>
      </div>

      {tab === 'history' ? (
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          {actionLogs.length === 0 ? (
            <p className="text-xs text-text-secondary italic text-center py-12">
              No carbon actions logged yet. Start by sharing a sustainable habit — every action is analyzed for CO₂ impact and tracked in your carbon history.
            </p>
          ) : (
            actionLogs.map((log) => (
              <div key={log.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                  <span className="text-sunbeam uppercase">{log.category}</span>
                  {log.co2SavedG > 0
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
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          <div className="mb-2 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block mb-1">
              🌿 Action Roadmap
            </span>
            <p className="text-[10px] text-text-secondary leading-normal">
              Select a recommended task to act on. Logging it directly reduces your environmental footprint.
            </p>
          </div>
          {ROADMAP_ITEMS.map((item) => (
            <div key={item.title} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="font-serif text-sm font-bold text-white leading-tight">{item.title}</span>
              </div>
              <p className="font-sans text-[11px] text-text-secondary leading-normal">
                {item.description}
              </p>
              <div className="flex justify-between items-center mt-1 border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                  ≈ {item.co2Saved}
                </span>
                {onSelectRoadmapItem && (
                  <button
                    onClick={() => onSelectRoadmapItem(item.templateText)}
                    className="text-[9px] font-mono uppercase bg-sunbeam/20 hover:bg-sunbeam/30 text-sunbeam px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Log This
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
