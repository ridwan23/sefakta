import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for the Photo Card
  const cardScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Delete button clicks / presses down at frame 55-65
  const btnScale = interpolate(frame, [50, 58, 66], [0, 1.05, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const btnPress = frame >= 65 && frame <= 75 ? 0.92 : 1;

  // Mystery question mark entrance at 3.5s (frame 84)
  const questionScale = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 140 },
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
        zIndex: 10,
        padding: '0 48px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Chapter Title Header */}
      <div
        style={{
          position: 'absolute',
          top: 170,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: PALETTE.sky,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          SEFAKTA TEKNO
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Kamu Hapus Sebuah File...
        </div>
      </div>

      {/* Main Hero: Tactile Polaroid Photo Card */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        {/* Crisp White Polaroid Card */}
        <div
          style={{
            width: 440,
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: '24px 24px 32px 24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Photo Canvas */}
          <div
            style={{
              width: '100%',
              height: 380,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#e0f2fe',
              position: 'relative',
            }}
          >
            {/* Scenery Vector Illustration: Sun, Sky, Mountains, Ocean */}
            <svg width="100%" height="100%" viewBox="0 0 400 380">
              <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              <rect width="400" height="380" fill="url(#skyGrad)" />
              {/* Sun */}
              <circle cx="200" cy="120" r="50" fill={PALETTE.amber} />
              {/* Mountain Back */}
              <polygon points="40,300 170,160 280,300" fill="#93c5fd" />
              {/* Mountain Front */}
              <polygon points="160,300 270,190 380,300" fill="#60a5fa" />
              {/* Ocean / Shore */}
              <rect x="0" y="270" width="400" height="110" fill="#38bdf8" />
              <rect x="0" y="320" width="400" height="60" fill="#0284c7" />
            </svg>
          </div>

          {/* Photo Label / Caption */}
          <div
            style={{
              marginTop: 20,
              fontSize: 28,
              fontWeight: 800,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>📷</span> Foto_Liburan.jpg
          </div>
        </div>

        {/* Action Button: Red Delete Button */}
        {frame >= 45 && (
          <div
            style={{
              marginTop: 36,
              transform: `scale(${btnScale * btnPress})`,
              backgroundColor: PALETTE.rose,
              color: '#ffffff',
              padding: '18px 44px',
              borderRadius: 100,
              fontSize: 32,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 12px 32px rgba(244, 63, 94, 0.45)',
            }}
          >
            <span>🗑️</span>
            <span>HAPUS FILE</span>
          </div>
        )}

        {/* Question Pop at 3.5s */}
        {frame >= 80 && (
          <div
            style={{
              marginTop: 28,
              transform: `scale(${questionScale})`,
              backgroundColor: PALETTE.bgElevated,
              border: `2px solid ${PALETTE.amber}`,
              color: PALETTE.amber,
              padding: '14px 36px',
              borderRadius: 100,
              fontSize: 32,
              fontWeight: 900,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            🤔 Ke mana perginya?
          </div>
        )}
      </div>
    </div>
  );
};
