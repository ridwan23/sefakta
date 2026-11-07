import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene4HighFPS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Number counter: 30 FPS jumps up to 240 FPS
  const fpsCount = Math.floor(
    interpolate(frame, [0, 90, 240], [30, 240, 960], {
      extrapolateRight: 'clamp',
    })
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 60px 180px',
      }}
    >
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '2px solid #38bdf8',
          color: '#38bdf8',
          padding: '12px 28px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 30,
        }}
      >
        📹 Rekaman Super Detail
      </div>

      {/* Massive FPS Display */}
      <div
        style={{
          background: 'linear-gradient(180deg, #0f172a, #020617)',
          border: '4px solid #38bdf8',
          borderRadius: 40,
          padding: '40px 60px',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(56, 189, 248, 0.3)',
          marginBottom: 40,
          width: '80%',
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 800, color: '#94a3b8' }}>
          RECORDING FRAME RATE
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#38bdf8',
            fontFamily: 'monospace',
            lineHeight: 1,
            margin: '20px 0',
            textShadow: '0 0 30px rgba(56, 189, 248, 0.8)',
          }}
        >
          {fpsCount} <span style={{ fontSize: 48 }}>FPS</span>
        </div>
        <div style={{ fontSize: 28, color: '#34d399', fontWeight: 700 }}>
          ● ULTRA HIGH DENSITY MEMORY
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            textTransform: 'uppercase',
          }}
        >
          OTAK MEREKAM JAUH
          <br />
          <span style={{ color: '#38bdf8' }}>LEBIH BANYAK INFORMASI!</span>
        </h2>
        <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 18, lineHeight: 1.4 }}>
          Otak mengaktifkan jalur memori sekunder darurat. Setiap detail visual, suara, dan posisi tubuh direkam secara hiper-cepat!
        </p>
      </div>
    </div>
  );
};
