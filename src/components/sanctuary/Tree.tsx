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

// Shared geometries instantiated once at module scope to avoid garbage collection and GPU allocation thrashing
const sharedGeometries = {
  witheredLog: new THREE.CylinderGeometry(0.15, 0.15, 1.2, 5),
  flowerStem: new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4),
  flowerPetals: new THREE.DodecahedronGeometry(0.12, 0),
  pineTrunk: new THREE.CylinderGeometry(0.08, 0.14, 1.2, 5),
  pineCanopy1: new THREE.ConeGeometry(0.6, 0.9, 5),
  pineCanopy2: new THREE.ConeGeometry(0.45, 0.7, 5),
  oakTrunk: new THREE.CylinderGeometry(0.12, 0.18, 1.0, 6),
  oakCanopy1: new THREE.DodecahedronGeometry(0.7, 1),
  oakCanopy2: new THREE.DodecahedronGeometry(0.45, 0),
  oakCanopy3: new THREE.DodecahedronGeometry(0.5, 0),
};

// Shared materials instantiated once at module scope
const sharedMaterials = {
  witheredLog: new THREE.MeshStandardMaterial({ color: '#4a3b32', roughness: 0.9, flatShading: true }),
  flowerStem: new THREE.MeshStandardMaterial({ color: '#4d7c0f', roughness: 0.8 }),
  pineTrunk: new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.9 }),
  oakTrunk: new THREE.MeshStandardMaterial({ color: '#4e3629', roughness: 0.9 }),
  
  // Normal mode canopy materials
  normal: {
    pineCanopy1: new THREE.MeshStandardMaterial({ color: '#1e3f20', roughness: 0.85, flatShading: true }),
    pineCanopy2: new THREE.MeshStandardMaterial({ color: '#2d5a30', roughness: 0.85, flatShading: true }),
    oakCanopy1: new THREE.MeshStandardMaterial({ color: '#224d27', roughness: 0.8, flatShading: true }),
    oakCanopy2: new THREE.MeshStandardMaterial({ color: '#2e5c33', roughness: 0.8, flatShading: true }),
    oakCanopy3: new THREE.MeshStandardMaterial({ color: '#1e4622', roughness: 0.8, flatShading: true }),
  },
  
  // High contrast mode canopy materials
  highContrast: {
    pineCanopy1: new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.85, flatShading: true }),
    pineCanopy2: new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.85, flatShading: true }),
    oakCanopy1: new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.8, flatShading: true }),
    oakCanopy2: new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.8, flatShading: true }),
    oakCanopy3: new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.8, flatShading: true }),
  }
};

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
        <mesh 
          rotation={[0, 0, Math.PI / 2.3]} 
          position={[0, 0.15, 0]} 
          castShadow 
          receiveShadow
          geometry={sharedGeometries.witheredLog}
          material={sharedMaterials.witheredLog}
        />
      </group>
    );
  }

  // 2. Render Flower
  if (type === 'flower') {
    return (
      <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
        {/* Stem */}
        <mesh 
          position={[0, 0.25, 0]} 
          castShadow
          geometry={sharedGeometries.flowerStem}
          material={sharedMaterials.flowerStem}
        />
        {/* Petals */}
        <mesh 
          ref={canopyRef as any} 
          position={[0, 0.5, 0]} 
          castShadow
          geometry={sharedGeometries.flowerPetals}
        >
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
        <mesh 
          position={[0, 0.6, 0]} 
          castShadow 
          receiveShadow
          geometry={sharedGeometries.pineTrunk}
          material={sharedMaterials.pineTrunk}
        />
        {/* Stacked Cones canopy */}
        <group ref={canopyRef} position={[0, 1.2, 0]}>
          <mesh 
            position={[0, 0, 0]} 
            castShadow
            geometry={sharedGeometries.pineCanopy1}
            material={highContrastMode ? sharedMaterials.highContrast.pineCanopy1 : sharedMaterials.normal.pineCanopy1}
          />
          <mesh 
            position={[0, 0.5, 0]} 
            castShadow
            geometry={sharedGeometries.pineCanopy2}
            material={highContrastMode ? sharedMaterials.highContrast.pineCanopy2 : sharedMaterials.normal.pineCanopy2}
          />
        </group>
      </group>
    );
  }

  // 4. Render Oak (Broadleaf)
  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh 
        position={[0, 0.5, 0]} 
        castShadow 
        receiveShadow
        geometry={sharedGeometries.oakTrunk}
        material={sharedMaterials.oakTrunk}
      />
      {/* Layered Spherical canopy */}
      <group ref={canopyRef} position={[0, 1.2, 0]}>
        <mesh 
          position={[0, 0.2, 0]} 
          castShadow
          geometry={sharedGeometries.oakCanopy1}
          material={highContrastMode ? sharedMaterials.highContrast.oakCanopy1 : sharedMaterials.normal.oakCanopy1}
        />
        <mesh 
          position={[0.2, -0.1, 0.2]} 
          castShadow
          geometry={sharedGeometries.oakCanopy2}
          material={highContrastMode ? sharedMaterials.highContrast.oakCanopy2 : sharedMaterials.normal.oakCanopy2}
        />
        <mesh 
          position={[-0.2, 0, -0.2]} 
          castShadow
          geometry={sharedGeometries.oakCanopy3}
          material={highContrastMode ? sharedMaterials.highContrast.oakCanopy3 : sharedMaterials.normal.oakCanopy3}
        />
      </group>
    </group>
  );
}
