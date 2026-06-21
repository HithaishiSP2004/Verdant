import { useMemo } from 'react';
import { ActionLog } from '@/types/ecosystem';

export function useCarbonStats(actionLogs: ActionLog[]) {
  return useMemo(() => {
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

    return {
      totalCo2Saved,
      totalCo2Display,
      co2Val,
      co2Unit,
      co2Equivalency,
      carbonStory,
    };
  }, [actionLogs]);
}
