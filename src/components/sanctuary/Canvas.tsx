'use client';

import React, { Component, ReactNode } from 'react';
import { Canvas as FiberCanvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Weather } from './Weather';
import { Ground } from './Ground';
import { Forest } from './Forest';

// WebGL Fallback Error Boundary
interface Props {
  children?: ReactNode;
}
interface State {
  hasError: boolean;
}
class WebGLErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebGL Rendering Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-stone-900 border border-white/5 rounded-3xl">
          <p className="font-serif text-2xl mb-4 text-sunbeam">Your Digital Sanctuary is resting.</p>
          <p className="text-sm text-text-secondary max-w-md">
            WebGL is currently disabled or unsupported by your browser. We have loaded a lightweight static sanctuary interface for you.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SanctuaryCanvas() {
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner">
        <FiberCanvas
          shadows
          camera={{ position: [0, 6, 12], fov: 42 }}
          gl={{ antialias: true, alpha: false }}
        >
          {/* Natural Ambient Illumination */}
          <ambientLight intensity={0.5} />
          
          {/* Volumetric Sunlight Direction */}
          <directionalLight
            castShadow
            position={[8, 12, 5]}
            intensity={1.0}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />

          {/* Core Interactive Elements */}
          <Weather />
          <Ground />
          <Forest />

          {/* Natural Navigation Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1} // Prevent going below the ground plane
            minDistance={4}
            maxDistance={18}
          />
        </FiberCanvas>
      </div>
    </WebGLErrorBoundary>
  );
}
