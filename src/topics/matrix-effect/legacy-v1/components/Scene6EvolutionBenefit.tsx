import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene6EvolutionBenefit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shieldPulse = Math.sin(frame / 5) * 8;

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
          background: 'rgba(52, 211, 153, 0.15)',
          border: '2px solid #34d399',
          color: '#34d399',
          padding: '12px 28px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        🛡️ Fungsi Evolusi Manusia
      </div>

      {/* Shield Vector Illustration */}
      <div style={{ position: 'relative', width: 280, height: 280, marginBottom: 40 }}>
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
          {/* Shield Outline */}
          <path
            d="M140 20 L240 60 C240 160 140 250 140 250 C140 250 40 160 40 60 Z"
            fill="url(#shieldGrad)"
            stroke="#34d399"
            strokeWidth="8"
          />
          {/* Glowing heart/pulse in center */}
          <circle cx="140" cy="130" r={40 + shieldPulse} fill="rgba(52, 211, 153, 0.3)" />
          <path
            d="M110 130 L130 150 L170 110"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#064e3b" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#022c22" stop-opacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            textTransform: 'uppercase',
          }}
        >
          CARA ALAMI OTAK
          <br />
          <span style={{ color: '#34d399' }}>MENYELAMATKAN NYAWAMU!</span>
        </h2>
        <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 18, lineHeight: 1.4 }}>
          Merekam setiap milidetik bahaya membantu manusia purba belajar dan reflek menghindari ancaman maut di masa depan.
        </p>
      </div>
    </div>
  );
};
