import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene5MemoryIllusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stampScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, mass: 0.5 },
  });

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
          background: 'rgba(251, 191, 36, 0.15)',
          border: '2px solid #fbbf24',
          color: '#fbbf24',
          padding: '12px 28px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        🔬 Hasil Penelitian Ilmiah
      </div>

      {/* Comparison: Real Time vs Memory Playback */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          width: '90%',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            background: '#1e293b',
            border: '2px solid #475569',
            borderRadius: 24,
            padding: '24px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800, color: '#e2e8f0' }}>
            Waktu Nyata
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f43f5e' }}>
            0.5 Detik
          </div>
        </div>

        <div
          style={{
            background: '#0f172a',
            border: '3px solid #fbbf24',
            borderRadius: 24,
            padding: '28px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.25)',
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800, color: '#f8fafc' }}>
            Playback Ingatan
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#fbbf24' }}>
            ~3 Detik 🤯
          </div>
        </div>
      </div>

      {/* Reality Check Stamp */}
      <div
        style={{
          transform: `scale(${Math.max(0, stampScale)}) rotate(-8deg)`,
          background: '#dc2626',
          color: '#ffffff',
          padding: '14px 40px',
          borderRadius: 16,
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: 3,
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.6)',
          marginBottom: 30,
        }}
      >
        ILUSI RETROSPEKTIF!
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            textTransform: 'uppercase',
          }}
        >
          WAKTU NYATA TETAP SAMA,
          <br />
          <span style={{ color: '#fbbf24' }}>INGATANMU YANG LEBIH PADAT!</span>
        </h2>
        <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 18, lineHeight: 1.4 }}>
          Jadi dunia nggak beneran gerak lambat—otakmu cuma menguraikan tumpukan data memori super padat pas mengingatnya kembali.
        </p>
      </div>
    </div>
  );
};
