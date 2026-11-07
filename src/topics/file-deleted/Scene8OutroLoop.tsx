import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene8OutroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Laptop graphic entrance spring
  const laptopScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Follow CTA badge pops in at 2.2s (frame 52)
  const ctaScale = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // Seamless Loop Transition (Frames 95 to 119 = last second)
  // Seamlessly dissolves back into the pristine Photo Card of Scene 1 Frame 0
  const loopTransition = interpolate(frame, [95, 119], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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
      {/* 1. Outro Content (fades gently out into the seamless loop) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 1 - loopTransition,
          transform: `scale(${laptopScale})`,
          width: '100%',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: PALETTE.amber,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            TIPS KEAMANAN DATA
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            Mau Jual Laptop / HP? 💻
          </div>
        </div>

        {/* Tactile Laptop with Shield Padlock */}
        <div
          style={{
            position: 'relative',
            width: 480,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Laptop Screen Frame */}
          <div
            style={{
              width: 400,
              height: 240,
              backgroundColor: PALETTE.bgCard,
              border: '4px solid #64748b',
              borderRadius: '20px 20px 4px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ fontSize: 56 }}>🔒</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: PALETTE.sky,
                marginTop: 10,
              }}
            >
              Hapus biasa belum tentu aman!
            </div>
          </div>
          {/* Laptop Base */}
          <div
            style={{
              width: 480,
              height: 24,
              backgroundColor: '#475569',
              borderRadius: '0 0 20px 20px',
            }}
          />
        </div>

        {/* Big Social Follow CTA */}
        {frame >= 48 && (
          <div
            style={{
              marginTop: 40,
              transform: `scale(${ctaScale})`,
              backgroundColor: PALETTE.emerald,
              color: '#ffffff',
              padding: '22px 52px',
              borderRadius: 100,
              boxShadow: '0 16px 40px rgba(16, 185, 129, 0.4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              IKUTI @SEFAKTA 🔔
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#d1fae5',
                marginTop: 4,
              }}
            >
              Satu fakta baru tiap hari.
            </div>
          </div>
        )}
      </div>

      {/* 2. Seamless Infinite Loop Layer (Identical to Frame 0 of Scene 1) */}
      {frame >= 95 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loopTransition,
            zIndex: 20,
            padding: '0 48px',
          }}
        >
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
              marginTop: 20,
            }}
          >
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
              <svg width="100%" height="100%" viewBox="0 0 400 380">
                <defs>
                  <linearGradient id="skyGradLoop" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                  </linearGradient>
                </defs>
                <rect width="400" height="380" fill="url(#skyGradLoop)" />
                <circle cx="200" cy="120" r="50" fill={PALETTE.amber} />
                <polygon points="40,300 170,160 280,300" fill="#93c5fd" />
                <polygon points="160,300 270,190 380,300" fill="#60a5fa" />
                <rect x="0" y="270" width="400" height="110" fill="#38bdf8" />
                <rect x="0" y="320" width="400" height="60" fill="#0284c7" />
              </svg>
            </div>

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
        </div>
      )}
    </div>
  );
};
