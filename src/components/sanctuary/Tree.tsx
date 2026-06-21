'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUIStore } from '@/store/useUIStore';
import * as THREE from 'three';

interface TreeProps {
  type: 'oak' | 'pine' | 'flower' | 'withered_log';
  position: [number, number, number];
  scale?: number;
  health?: number;
}

export function Tree({ type, position, scale = 1.0, health = 1.0 }: TreeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const canopyRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useUIStore((state) => state.prefersReducedMotion);
  const highContrastMode = useUIStore((state) => state.highContrastMode);

  // Generate slightly randomized offsets for organic look
  const offsets = useMemo(() => ({
    windSpeed: 0.8 + Math.random() * 0.5,
    windAmplitude: 0.02 + Math.random() * 0.015,
    rotationOffset: Math.random() * Math.PI,
    flowerColor: highContrastMode 
      ? '#facc15' // High contrast Yellow
      : ['#f472b6', '#38bdf8', '#c084fc', '#fb7185'][Math.floor(Math.random() * 4)] // Wildflower pastels
  }), [highContrastMode]);

  // Subtle wind sway animation in the frame loop
  useFrame((state) => {
    if (prefersReducedMotion || !canopyRef.current) return;
    
    // Calculate wind effect using time
    const time = state.clock.getElapsedTime();
    const sway = Math.sin(time * offsets.windSpeed + offsets.rotationOffset) * offsets.windAmplitude;
    
    canopyRef.current.rotation.z = sway;
    canopyRef.current.rotation.x = sway * 0.5;
  });

  // 1. Render Withered Log
  if (type === 'withered_log') {
    return (
      <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
        {/* Fallen log */}
        <mesh rotation={[0, 0, Math.PI / 2.3]} position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 5]} />
          <meshStandardMaterial color="#4a3b32" roughness={0.9} flatShading />
        </mesh>
      </group>
    );
  }

  // 2. Render Flower
  if (type === 'flower') {
    return (
      <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
        {/* Stem */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
        </mesh>
        {/* Petals */}
        <mesh ref={canopyRef as any} position={[0, 0.5, 0]} castShadow>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color={offsets.flowerColor} roughness={0.6} />
        </mesh>
      </group>
    );
  }

  // 3. Render Pine (Conifer)
  if (type === 'pine') {
    return (
      <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
        {/* Trunk */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.14, 1.2, 5]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        {/* Stacked Cones canopy */}
        <group ref={canopyRef} position={[0, 1.2, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <coneGeometry args={[0.6, 0.9, 5]} />
            <meshStandardMaterial color={highContrastMode ? '#0ea5e9' : '#1e3f20'} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <coneGeometry args={[0.45, 0.7, 5]} />
            <meshStandardMaterial color={highContrastMode ? '#38bdf8' : '#2d5a30'} roughness={0.85} flatShading />
          </mesh>
        </group>
      </group>
    );
  }

  // 4. Render Oak (Broadleaf)
  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.0, 6]} />
        <meshStandardMaterial color="#4e3629" roughness={0.9} />
      </mesh>
      {/* Layered Spherical canopy */}
      <group ref={canopyRef} position={[0, 1.2, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <dodecahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial color={highContrastMode ? '#1e3a8a' : '#224d27'} roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0.2, -0.1, 0.2]} castShadow>
          <dodecahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color={highContrastMode ? '#2563eb' : '#2e5c33'} roughness={0.8} flatShading />
        </mesh>
        <mesh position={[-0.2, 0, -0.2]} castShadow>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={highContrastMode ? '#3b82f6' : '#1e4622'} roughness={0.8} flatShading />
        </mesh>
      </group>
    </group>
  );
}
