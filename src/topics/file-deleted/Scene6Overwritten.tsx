import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene6Overwritten: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // New heavy file package slams down at 1.8s (frame 44)
  const blockDropY = interpolate(frame, [28, 48], [-360, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Impact shake
  const shake = frame >= 46 && frame <= 58 ? Math.sin(frame * 1.6) * 10 : 0;

  // Old file card dissolves away on impact
  const oldPhotoOpacity = interpolate(frame, [44, 52], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Takeaway badge pops in at 2.5s (frame 60)
  const badgeScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, stiffness: 180 },
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
        transform: `translate(${shake}px, ${shake}px)`,
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
            color: PALETTE.rose,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          TITIK AKHIR
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Data Baru Menimpa! 💥
        </div>
      </div>

      {/* Main Impact Arena */}
      <div
        style={{
          position: 'relative',
          width: 580,
          height: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 30,
          marginTop: 20,
        }}
      >
        {/* Base Storage Shelf / Compartment */}
        <div
          style={{
            width: '100%',
            height: 110,
            backgroundColor: PALETTE.bgCard,
            border: `3px solid ${PALETTE.border}`,
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: '#94a3b8',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          📦 KOTAK PENYIMPANAN YANG SAMA
        </div>

        {/* Old Foto_Liburan.jpg resting on base, vanishes when overwritten */}
        <div
          style={{
            position: 'absolute',
            bottom: 130,
            opacity: oldPhotoOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '14px 28px',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 26 }}>📷</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>
              Foto_Liburan.jpg (Data Lama)
            </span>
          </div>
        </div>

        {/* Heavy Slamming File Package: Video_Baru.mp4 */}
        <div
          style={{
            position: 'absolute',
            bottom: 125,
            transform: `translateY(${blockDropY}px)`,
            width: '92%',
            backgroundColor: PALETTE.blue,
            border: '4px solid #ffffff',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 20px 50px rgba(59, 130, 246, 0.45)',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <span>🎬</span> Video_Baru.mp4
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#dbeafe',
              marginTop: 6,
            }}
          >
            Menempati ruang yang tadinya milik foto lama
          </div>
        </div>
      </div>

      {/* Permanently Gone Banner at 2.5s */}
      {frame >= 55 && (
        <div
          style={{
            marginTop: 36,
            transform: `scale(${badgeScale})`,
            backgroundColor: PALETTE.rose,
            border: '2px solid #ffffff',
            color: '#ffffff',
            padding: '18px 44px',
            borderRadius: 100,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 12px 32px rgba(244, 63, 94, 0.45)',
          }}
        >
          <span>✕</span>
          <span>BARU SEKARANG FILE LAMA BENAR-BENAR LENYAP!</span>
        </div>
      )}
    </div>
  );
};
