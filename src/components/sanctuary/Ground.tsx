'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useUIStore } from '@/store/useUIStore';
import * as THREE from 'three';

export function Ground() {
  const vitalityScore = useEcosystemStore((state) => state.vitalityScore);
  const projectionMode = useEcosystemStore((state) => state.projectionMode);
  const projectionYearOffset = useEcosystemStore((state) => state.projectionYearOffset);
  const projectionPath = useEcosystemStore((state) => state.projectionPath);
  const highContrastMode = useUIStore((state) => state.highContrastMode);

  const meshRef = useRef<THREE.Mesh>(null);

  // Generate slightly bumpy terrain vertices for a low-poly landscape look
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 24, 16, 16);
    const pos = geo.attributes.position;
    
    // Add subtle wave displacement to make ground bumpy
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Small procedural hills
      const z = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.4 + Math.sin(x * 0.1) * 0.2;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Dispose of the geometry when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Determine ground material color dynamically based on ecological state
  const groundColor = useMemo(() => {
    // 1. High contrast overrides
    if (highContrastMode) {
      return new THREE.Color('#0f172a'); // Deep slate indigo
    }

    // 2. Compute effective vitality score (takes projection path into account)
    let score = vitalityScore;
    if (projectionMode) {
      // If projecting continuation (negative) path, ground withers (dry soil)
      // If projecting regeneration (positive) path, ground thrives (vibrant moss)
      if (projectionPath === 'continuation') {
        score = Math.max(0.0, score - (projectionYearOffset * 0.08));
      } else {
        score = Math.min(1.0, score + (projectionYearOffset * 0.05));
      }
    }

    // 3. Interpolate between Dry Bark (low vitality) and Deep Forest Moss (high vitality)
    const dryColor = new THREE.Color('#5c4033'); // Dark brown dry clay
    const healthyColor = new THREE.Color('#2d4030'); // Deep Moss green

    return new THREE.Color().lerpColors(dryColor, healthyColor, score);
  }, [vitalityScore, projectionMode, projectionYearOffset, projectionPath, highContrastMode]);

  // Smoothly interpolate material color changes
  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      material.color.lerp(groundColor, 0.05);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        roughness={0.9}
        metalness={0.1}
        flatShading // Low-poly flat shaded faces
      />
    </mesh>
  );
}
