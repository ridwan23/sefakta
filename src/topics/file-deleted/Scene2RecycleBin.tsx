import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene2RecycleBin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Lid tilts open
  const lidAngle = interpolate(frame, [0, 24], [0, -32], {
    extrapolateRight: 'clamp',
  });

  // Photo drops into the bin
  const photoDropY = interpolate(frame, [35, 75], [-160, 60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const photoScale = interpolate(frame, [35, 75], [0.8, 0.65], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Restore Pill Pop
  const restoreScale = spring({
    frame: frame - 90,
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
          TAHAP 1: HAPUS BIASA
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Cuma Pindah Tempat 📁
        </div>
      </div>

      {/* Hero Animation: Bin & Falling Photo */}
      <div
        style={{
          position: 'relative',
          width: 500,
          height: 520,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        {/* The Falling Polaroid Photo Card */}
        <div
          style={{
            position: 'absolute',
            top: 100,
            transform: `translateY(${photoDropY}px) scale(${photoScale}) rotate(${interpolate(
              frame,
              [35, 75],
              [0, -8],
              { extrapolateRight: 'clamp' }
            )}deg)`,
            zIndex: 2,
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: '14px 14px 20px 14px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 180,
              height: 140,
              borderRadius: 10,
              backgroundColor: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}
          >
            🏖️
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 16,
              fontWeight: 800,
              color: '#1e293b',
            }}
          >
            Foto_Liburan.jpg
          </div>
        </div>

        {/* Tactile Modern Recycle Bin */}
        <svg
          width="380"
          height="420"
          viewBox="0 0 200 240"
          style={{ position: 'relative', zIndex: 5 }}
        >
          {/* Bin Lid */}
          <g
            transform={`rotate(${lidAngle}, 35, 50)`}
            style={{ transformOrigin: '35px 50px' }}
          >
            {/* Handle */}
            <path
              d="M 85 24 L 85 14 Q 100 8 115 14 L 115 24"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Lid Bar */}
            <rect x="25" y="24" width="150" height="18" rx="9" fill="#3b82f6" />
          </g>

          {/* Bin Body */}
          <path
            d="M 42 55 L 58 210 Q 60 226 78 226 L 122 226 Q 140 226 142 210 L 158 55 Z"
            fill="#1e293b"
            stroke="#3b82f6"
            strokeWidth="5"
          />

          {/* Recycle Loops Symbol */}
          <circle cx="100" cy="140" r="28" fill="rgba(59, 130, 246, 0.2)" />
          <path
            d="M 90 134 A 16 16 0 1 1 114 138"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <polygon points="114,131 118,143 107,139" fill="#60a5fa" />
        </svg>
      </div>

      {/* Restore Notification Badge at 4.0s */}
      {frame >= 90 && (
        <div
          style={{
            marginTop: 10,
            transform: `scale(${restoreScale})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              backgroundColor: PALETTE.emerald,
              color: '#ffffff',
              padding: '16px 42px',
              borderRadius: 100,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
            }}
          >
            <span>↺</span>
            <span>BISA DIKEMBALIKAN (RESTORE)</span>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#34d399',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '8px 24px',
              borderRadius: 100,
            }}
          >
            Isi file masih 100% aman dan utuh
          </div>
        </div>
      )}
    </div>
  );
};
