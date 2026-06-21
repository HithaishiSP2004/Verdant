'use client';

import { motion } from 'framer-motion';
import { ActionLog } from '@/types/ecosystem';

interface CanopyLogbookProps {
  actionLogs: ActionLog[];
  prefersReducedMotion: boolean;
  setActivePanel: (panel: 'reflection' | 'logs' | null) => void;
}

export function CanopyLogbook({
  actionLogs,
  prefersReducedMotion,
  setActivePanel
}: CanopyLogbookProps) {
  return (
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
  );
}
