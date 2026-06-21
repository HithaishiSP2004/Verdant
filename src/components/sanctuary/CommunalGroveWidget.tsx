'use client';

import { motion } from 'framer-motion';

interface CommunalGroveWidgetProps {
  activePanel: 'reflection' | 'logs' | 'projection' | 'community' | null;
  prefersReducedMotion: boolean;
}

export function CommunalGroveWidget({ activePanel, prefersReducedMotion }: CommunalGroveWidgetProps) {
  return (
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
  );
}
