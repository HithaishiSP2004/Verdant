import { useState, useEffect } from 'react';

interface OracleResults {
  continuation: { narrative: string; indicators: string[] };
  regeneration: { narrative: string; indicators: string[] };
}

export function useFutureOracle(
  projectionMode: boolean,
  projectionYearOffset: number,
  vitalityScore: number,
  weatherCondition: string,
  treeCount: number,
  flowerCount: number
) {
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResults, setOracleResults] = useState<OracleResults | null>(null);

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

  return { oracleLoading, oracleResults };
}
