'use client';

interface CarbonStoryProps {
  carbonStory: {
    dominantCategory: string;
    logCount: number;
    netDisplay: string;
    isNet: boolean;
  } | null;
  co2Equivalency: string | null;
}

export function CarbonStory({ carbonStory, co2Equivalency }: CarbonStoryProps) {
  if (!carbonStory) return null;

  return (
    <div className="border-t border-white/5 pt-4">
      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-mono block mb-2">My Carbon Story — Footprint Insights</span>
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
  );
}
