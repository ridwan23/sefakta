import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene7CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buttonPop = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, mass: 0.6 },
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
        ✨ Fakta Sains Menarik
      </div>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            textTransform: 'uppercase',
          }}
        >
          PERNAH ALAMIN
          <br />
          <span style={{ color: '#38bdf8', textShadow: '0 0 30px rgba(56, 189, 248, 0.6)' }}>
            EFEK SLOW-MO INI?
          </span>
        </h2>
        <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 20, lineHeight: 1.4 }}>
          Tulis pengalamanmu di kolom komentar dan share ke teman yang suka panikan!
        </p>
      </div>

      {/* CTA Box */}
      <div
        style={{
          transform: `scale(${Math.max(0, buttonPop)})`,
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '4px solid #38bdf8',
          borderRadius: 36,
          padding: '40px 50px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(56, 189, 248, 0.4)',
          width: '90%',
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24', marginBottom: 12 }}>
          Mau Fakta Sains Harian Lainnya?
        </div>
        <div
          style={{
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
            color: '#020617',
            padding: '24px 40px',
            borderRadius: 100,
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: 1.5,
            marginTop: 20,
          }}
        >
          👉 FOLLOW @SEFAKTA
        </div>
      </div>
    </div>
  );
};
