'use client';

import { useMemo } from 'react';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { Tree } from './Tree';

export function Forest() {
  const assets = useEcosystemStore((state) => state.assets);
  const vitalityScore = useEcosystemStore((state) => state.vitalityScore);
  const projectionMode = useEcosystemStore((state) => state.projectionMode);
  const projectionYearOffset = useEcosystemStore((state) => state.projectionYearOffset);
  const projectionPath = useEcosystemStore((state) => state.projectionPath);

  // Apply the "Fake Smart" projection morphs to assets list dynamically in-memory
  const processedAssets = useMemo(() => {
    if (!projectionMode || projectionYearOffset === 0) {
      return assets; // Return base assets unchanged
    }

    const morphed: typeof assets = [];
    const isEcosystemHealthy = projectionPath === 'regeneration';

    // Loop through current assets and apply temporal scaling/morphing
    assets.forEach((asset, idx) => {
      let type = asset.assetType;
      let scale = asset.scale || 1.0;
      let pos = asset.pos;

      if (!isEcosystemHealthy) {
        // --- PATH OF CONTINUATION (NEGATIVE FUTURE) ---
        // Trees progressively shrink and wither
        scale = Math.max(0.2, scale * (1 - projectionYearOffset * 0.14));

        if (projectionYearOffset >= 3) {
          // Flower assets disappear entirely
          if (type === 'flower') return;

          // Swap trees to withered logs progressively
          if ((idx + projectionYearOffset) % 2 === 0) {
            type = 'withered_log';
            scale = 0.8;
          }
        }
        
        morphicPush();
      } else {
        // --- PATH OF REMEDIATION (POSITIVE FUTURE) ---
        // Trees progressively grow larger and healthier
        scale = scale * (1 + projectionYearOffset * 0.12);

        morphicPush();

        // Dynamically spawn surrounding flowers at progressive offsets
        if (type !== 'withered_log' && type !== 'flower') {
          const flowerSpawnCount = projectionYearOffset >= 4 ? 3 : projectionYearOffset >= 2 ? 1 : 0;
          for (let f = 0; f < flowerSpawnCount; f++) {
            const angle = (f * Math.PI * 2) / flowerSpawnCount + idx;
            const radius = 0.5 + Math.random() * 0.4;
            const fx = pos[0] + Math.sin(angle) * radius;
            const fz = pos[2] + Math.cos(angle) * radius;
            
            morphicFlowerPush(fx, fz, f);
          }
        }
      }

      function morphicPush() {
        morphed.push({
          ...asset,
          assetType: type,
          scale,
        });
      }

      function morphicFlowerPush(fx: number, fz: number, f: number) {
        morphed.push({
          id: `future-flower-${asset.id}-${f}`,
          userId: asset.userId,
          assetType: 'flower',
          pos: [fx, 0.0, fz],
          scale: 0.7 + Math.random() * 0.4,
          healthState: 1.0,
          createdAt: asset.createdAt
        });
      }
    });

    return morphed;
  }, [assets, vitalityScore, projectionMode, projectionYearOffset, projectionPath]);

  return (
    <group>
      {processedAssets.map((asset) => (
        <Tree
          key={asset.id}
          type={asset.assetType}
          position={asset.pos}
          scale={asset.scale}
        />
      ))}
    </group>
  );
}
