import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PALETTE } from './constants';

export const GridPattern: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle breathing float for soft background glow
  const breathe = Math.sin(frame * 0.03) * 0.05 + 0.95;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        backgroundColor: PALETTE.bg,
      }}
    >
      {/* Soft atmospheric gradient discs (Warm editorial lighting) */}
      <div
        style={{
          position: 'absolute',
          top: -150,
          left: '50%',
          transform: `translateX(-50%) scale(${breathe})`,
          width: 900,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(14, 20, 34, 0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, rgba(14, 20, 34, 0) 70%)',
        }}
      />

      {/* Minimal Bauhaus / Otl Aicher geometric corner guide marks (Clean print design) */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, opacity: 0.18 }}
      >
        {/* Top & bottom framing guides */}
        <circle cx="80" cy="140" r="4" fill="#ffffff" />
        <circle cx="1000" cy="140" r="4" fill="#ffffff" />
        <circle cx="80" cy="1680" r="4" fill="#ffffff" />
        <circle cx="1000" cy="1680" r="4" fill="#ffffff" />

        {/* Subtle center alignment tick marks */}
        <line x1="540" y1="120" x2="540" y2="135" stroke="#ffffff" strokeWidth="2" />
        <line x1="540" y1="1685" x2="540" y2="1700" stroke="#ffffff" strokeWidth="2" />
      </svg>
    </div>
  );
};
