import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

/** One WebGL canvas per shot; the shot's children set camera + lights themselves. */
export const Stage: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity }}>
      <ThreeCanvas width={width} height={height} linear={false} flat={false} gl={{ antialias: true }} camera={{ fov: 45, near: 0.05, far: 200 }}>
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
