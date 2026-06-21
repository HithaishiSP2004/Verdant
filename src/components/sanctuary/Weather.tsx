'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useUIStore } from '@/store/useUIStore';
import * as THREE from 'three';

export function Weather() {
  const { scene } = useThree();
  const weatherCondition = useEcosystemStore((state) => state.weatherCondition);
  const projectionMode = useEcosystemStore((state) => state.projectionMode);
  const projectionYearOffset = useEcosystemStore((state) => state.projectionYearOffset);
  const prefersReducedMotion = useUIStore((state) => state.prefersReducedMotion);
  const highContrastMode = useUIStore((state) => state.highContrastMode);

  const particlesRef = useRef<THREE.Points>(null);

  // Determine active atmosphere properties based on state & projection paths
  const atmosphere = useMemo(() => {
    // If future projection is active, weather is influenced by the timeline
    let activeWeather = weatherCondition;
    if (projectionMode) {
      if (projectionYearOffset >= 3) {
        // Path of continuation vs remediation
        activeWeather = projectionYearOffset === 5 ? 'stormy' : 'foggy';
      } else {
        activeWeather = 'sunny';
      }
    }

    // Assign color palettes based on weather state & high contrast mode
    let fogColor = '#13211a'; // Default forest-deep
    let skyColor = '#1d3228';
    let particleCount = 0;
    let particleColor = '#ffffff';

    if (highContrastMode) {
      fogColor = '#0b111a';
      skyColor = '#0f172a';
    }

    switch (activeWeather) {
      case 'sunny':
        fogColor = highContrastMode ? '#0b111a' : '#13211a';
        skyColor = highContrastMode ? '#0f172a' : '#1d3228';
        particleCount = 50; // Gentle pollen/spores floating
        particleColor = '#facc15'; // Amber/sunbeam spores
        break;
      case 'foggy':
        fogColor = highContrastMode ? '#1e293b' : '#3c4e43'; // Thick mist
        skyColor = highContrastMode ? '#334155' : '#4d6155';
        particleCount = 150;
        particleColor = '#cbd5e1';
        break;
      case 'rainy':
      case 'stormy':
        fogColor = highContrastMode ? '#0f172a' : '#0c1410'; // Deep dark storm
        skyColor = highContrastMode ? '#1e293b' : '#111e18';
        particleCount = 400; // Heavy rain
        particleColor = '#60a5fa'; // Blue droplets
        break;
    }

    // If reduced motion is active, force particle count to zero
    if (prefersReducedMotion) {
      particleCount = 0;
    }

    return { fogColor, skyColor, particleCount, particleColor, activeWeather };
  }, [weatherCondition, projectionMode, projectionYearOffset, prefersReducedMotion, highContrastMode]);

  // Set the scene background color matching the active sky inside useEffect
  useEffect(() => {
    scene.background = new THREE.Color(atmosphere.skyColor);
  }, [scene, atmosphere.skyColor]);

  // Generate random positions for weather particles
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = atmosphere.particleCount;
    if (count === 0) return geo;

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20; // X
      positions[i * 3 + 1] = Math.random() * 10;     // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // Z
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [atmosphere.particleCount]);

  // Animate particles falling down or floating
  useFrame((state, delta) => {
    if (prefersReducedMotion || !particlesRef.current || atmosphere.particleCount === 0) return;

    const pos = particlesRef.current.geometry.attributes.position;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);

      if (atmosphere.activeWeather === 'sunny') {
        // Floating spores drift upward and sway gently
        y += delta * 0.2;
        x += Math.sin(state.clock.elapsedTime + i) * 0.01;
        if (y > 10) y = 0;
      } else {
        // Rain falls down rapidly
        y -= delta * 5.0;
        if (y < 0) {
          y = 10; // Reset to top
        }
      }

      pos.setY(i, y);
      pos.setX(i, x);
    }

    pos.needsUpdate = true;
  });

  return (
    <>
      {/* Fog Overlay */}
      <fog attach="fog" args={[atmosphere.fogColor, 5, 18]} />

      {/* Atmospheric Particles */}
      {atmosphere.particleCount > 0 && (
        <points ref={particlesRef} geometry={particleGeo}>
          <pointsMaterial
            color={atmosphere.particleColor}
            size={atmosphere.activeWeather === 'sunny' ? 0.08 : 0.04}
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}
    </>
  );
}
