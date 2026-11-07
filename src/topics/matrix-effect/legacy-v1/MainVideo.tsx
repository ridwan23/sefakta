import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene3DWorld } from './components/Scene3DWorld';
import { Scene2TickingClock } from './components/Scene2TickingClock';
import { Scene3BrainExperiment } from './components/Scene3BrainExperiment';
import { Scene4HighFPS } from './components/Scene4HighFPS';
import { Scene5MemoryIllusion } from './components/Scene5MemoryIllusion';
import { Scene6EvolutionBenefit } from './components/Scene6EvolutionBenefit';
import { Scene7CTA } from './components/Scene7CTA';
import { VideoOverlay } from './components/VideoOverlay';

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050814',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Background Subtle Gradient Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 60%), radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Scene Sequences (Total 1800 frames = 60s @ 30fps) */}

      {/* Scene 1: Real 3D Diorama World (Three.js WebGL: Ice, Floating Coffee Cup, 3D '3s' Block, Bean-Head Character) */}
      <Sequence from={0} durationInFrames={150}>
        <Scene3DWorld />
        {/* Kinetic Overlay Text for Hook */}
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: 50,
            right: 50,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '2px solid #f43f5e',
              color: '#f43f5e',
              padding: '10px 24px',
              borderRadius: 100,
              fontSize: 24,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            ⚠️ THE ZERO-G SPILL
          </div>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}
          >
            PAS HP MAU JATUH...
            <br />
            <span style={{ color: '#38bdf8' }}>DUNIA BERASA SLOW-MO?!</span>
          </h1>
        </div>
      </Sequence>

      {/* Scene 2: The Matrix Clock (5s - 13s = 240 frames) */}
      <Sequence from={150} durationInFrames={240}>
        <Scene2TickingClock />
      </Sequence>

      {/* Scene 3: Amygdala Activated (13s - 23s = 300 frames) */}
      <Sequence from={390} durationInFrames={300}>
        <Scene3BrainExperiment />
      </Sequence>

      {/* Scene 4: High FPS Recording (23s - 35s = 360 frames) */}
      <Sequence from={690} durationInFrames={360}>
        <Scene4HighFPS />
      </Sequence>

      {/* Scene 5: Retrospective Memory Illusion (35s - 47s = 360 frames) */}
      <Sequence from={1050} durationInFrames={360}>
        <Scene5MemoryIllusion />
      </Sequence>

      {/* Scene 6: Evolution Survival Mechanism (47s - 54s = 210 frames) */}
      <Sequence from={1410} durationInFrames={210}>
        <Scene6EvolutionBenefit />
      </Sequence>

      {/* Scene 7: CTA (54s - 60s = 180 frames) */}
      <Sequence from={1620} durationInFrames={180}>
        <Scene7CTA />
      </Sequence>

      {/* Persistent Dynamic HUD & Captions */}
      <VideoOverlay />
    </AbsoluteFill>
  );
};
