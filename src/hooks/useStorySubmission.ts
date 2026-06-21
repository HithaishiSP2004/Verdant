import { useState } from 'react';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useUIStore } from '@/store/useUIStore';

export function useStorySubmission() {
  const assets = useEcosystemStore((s) => s.assets);
  const setAssets = useEcosystemStore((s) => s.setAssets);
  const addActionLog = useEcosystemStore((s) => s.addActionLog);
  const applyActionImpact = useEcosystemStore((s) => s.applyActionImpact);
  const setScreenReaderMirrorText = useUIStore((s) => s.setScreenReaderMirrorText);

  const [habitText, setHabitText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<{
    natureReflection: string;
    futureProjection5y: string;
    category: string;
    co2SavedG: number;
    isPositive: boolean;
  } | null>(null);

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

  return {
    habitText,
    setHabitText,
    analyzing,
    lastAnalysisResult,
    setLastAnalysisResult,
    handleLogSubmit,
  };
}
