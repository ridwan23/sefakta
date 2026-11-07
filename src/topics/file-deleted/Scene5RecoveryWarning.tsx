import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene5RecoveryWarning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Search beam sweep across the card
  const beamX = interpolate(frame, [0, 60], [-200, 200], {
    extrapolateRight: 'clamp',
  });

  // Warning pill badge pops in at 2.2s (frame 52)
  const warnScale = spring({
    frame: frame - 48,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  // Photo re-emergence visibility
  const photoAlpha = interpolate(frame, [30, 60], [0.3, 1], {
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
            color: PALETTE.violet,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          ALAT PEMULIHAN
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Bisa Dilacak Software Recovery! 🔎
        </div>
      </div>

      {/* Hero Visual Card: Scanner Chamber */}
      <div
        style={{
          position: 'relative',
          width: 580,
          height: 440,
          backgroundColor: PALETTE.bgCard,
          border: `3px solid ${PALETTE.violet}`,
          borderRadius: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          marginTop: 20,
        }}
      >
        {/* Soft Search Beam (Friendly spotlight, not cyber laser) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 140,
            background:
              'linear-gradient(90deg, rgba(139, 92, 246, 0) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(139, 92, 246, 0) 100%)',
            transform: `translateX(${beamX}px)`,
          }}
        />

        {/* Polaroid Card Reconstructed */}
        <div
          style={{
            opacity: photoAlpha,
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: '20px 24px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'scale(1.05)',
          }}
        >
          <div
            style={{
              width: 220,
              height: 150,
              borderRadius: 12,
              backgroundColor: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
            }}
          >
            🏖️
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 22,
              fontWeight: 900,
              color: '#1e293b',
            }}
          >
            Foto_Liburan.jpg
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 16,
              fontWeight: 800,
              color: PALETTE.violet,
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              padding: '4px 14px',
              borderRadius: 100,
            }}
          >
            ✓ Berhasil Terbaca Ulang
          </div>
        </div>
      </div>

      {/* Mandatory Honest Warning: Not Always Guaranteed */}
      {frame >= 48 && (
        <div
          style={{
            marginTop: 36,
            transform: `scale(${warnScale})`,
            backgroundColor: PALETTE.rose,
            color: '#ffffff',
            padding: '20px 48px',
            borderRadius: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 12px 32px rgba(244, 63, 94, 0.45)',
          }}
        >
          <span style={{ fontSize: 36 }}>⚠️</span>
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              TIDAK SELALU BERHASIL!
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fee2e2',
                marginTop: 2,
              }}
            >
              Hanya bisa selama ruangnya belum tertimpa data baru
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
