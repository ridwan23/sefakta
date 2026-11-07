import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene7SSDATRIM: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Flag tag pops in at 1.2s (frame 30)
  const flagScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Physical cleaning happens progressively across the 4 blocks
  const cleanProgress = interpolate(frame, [60, 115], [0, 4], {
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
            color: PALETTE.sky,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          SSD MODERN
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Perintah Otomatis TRIM ⚡
        </div>
      </div>

      {/* Main SSD Storage Chamber */}
      <div
        style={{
          position: 'relative',
          width: 580,
          backgroundColor: PALETTE.bgCard,
          border: `3px solid ${PALETTE.sky}`,
          borderRadius: 28,
          padding: '36px 30px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          marginTop: 20,
        }}
      >
        {/* Header inside SSD */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: 16,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff' }}>
            💾 Sel Memori SSD
          </div>
          <div
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              color: PALETTE.sky,
              padding: '6px 18px',
              borderRadius: 100,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            Sistem Pintar Aktif
          </div>
        </div>

        {/* 4 Storage Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((blockNum, idx) => {
            const isCleaned = cleanProgress > idx;
            return (
              <div
                key={blockNum}
                style={{
                  height: 140,
                  backgroundColor: isCleaned ? '#064e3b' : PALETTE.bgElevated,
                  border: `2px solid ${isCleaned ? PALETTE.emerald : PALETTE.border}`,
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background-color 0.25s',
                }}
              >
                <div style={{ fontSize: 28 }}>
                  {isCleaned ? '✨' : '🧹'}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: isCleaned ? '#34d399' : '#94a3b8',
                  }}
                >
                  {isCleaned ? 'Bersih' : 'Jadwal'}
                </div>
              </div>
            );
          })}
        </div>

        {/* TRIM Tag at 1.2s */}
        {frame >= 25 && (
          <div
            style={{
              marginTop: 24,
              transform: `scale(${flagScale})`,
              backgroundColor: PALETTE.sky,
              color: '#0e1422',
              padding: '12px 28px',
              borderRadius: 100,
              fontSize: 22,
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            🏷️ TRIM: Menandai blok untuk dibersihkan berkala
          </div>
        )}
      </div>

      {/* Mandatory Clarification Pill */}
      <div
        style={{
          marginTop: 36,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          color: '#e2e8f0',
          padding: '16px 36px',
          borderRadius: 100,
          fontSize: 22,
          fontWeight: 800,
          textAlign: 'center',
        }}
      >
        ⏳ Pembersihan fisik dilakukan bertahap di latar belakang
      </div>
    </div>
  );
};
