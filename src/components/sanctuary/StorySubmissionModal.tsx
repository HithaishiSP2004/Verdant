'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent } from 'react';

interface StorySubmissionModalProps {
  habitText: string;
  setHabitText: (text: string) => void;
  analyzing: boolean;
  lastAnalysisResult: {
    natureReflection: string;
    futureProjection5y: string;
    isPositive: boolean;
    co2SavedG: number;
    category: string;
  } | null;
  setLastAnalysisResult: (result: any) => void;
  setLogActionModalOpen: (open: boolean) => void;
  handleLogSubmit: (e: FormEvent) => void;
  prefersReducedMotion: boolean;
}

export function StorySubmissionModal({
  habitText,
  setHabitText,
  analyzing,
  lastAnalysisResult,
  setLastAnalysisResult,
  setLogActionModalOpen,
  handleLogSubmit,
  prefersReducedMotion
}: StorySubmissionModalProps) {
  return (
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

        <span className="text-xs uppercase tracking-widest text-text-secondary block mb-2">Carbon Action Log</span>
        <h2 className="font-serif text-3xl font-bold text-white mb-4">Log a Carbon Action</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">Describe a habit or activity and VERDANT will estimate its carbon footprint impact.</p>

        <AnimatePresence mode="wait">
          {!lastAnalysisResult ? (
            // Step A: Input Form
            <form key="input-form" onSubmit={handleLogSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="habit-input" className="text-xs text-text-secondary">
                  Describe your real-world habit or carbon footprint activity:
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
  );
}
