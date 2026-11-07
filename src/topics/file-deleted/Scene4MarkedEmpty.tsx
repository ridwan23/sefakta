import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene4MarkedEmpty: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rubber stamp slams down with impact bounce at 1.2s (frame 30)
  const stampScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  // Magnifying glass glides in at 2.8s (frame 68)
  const lensProgress = interpolate(frame, [60, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lensY = Math.sin(frame * 0.1) * 10;

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
            color: PALETTE.amber,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          STATUS PENYIMPANAN
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Ditandai 'Bebas Dipakai' 📭
        </div>
      </div>

      {/* Main Hero: Storage Locker Compartment */}
      <div
        style={{
          position: 'relative',
          width: 580,
          height: 480,
          backgroundColor: PALETTE.bgCard,
          border: `3px solid ${PALETTE.border}`,
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
        {/* Locker Shelf Outline */}
        <div
          style={{
            position: 'absolute',
            inset: 24,
            border: '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Photo Card Resting Calmly Inside */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '16px 20px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: 0.85,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
                backgroundColor: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
              }}
            >
              🏖️
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>
                Foto_Liburan.jpg
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>
                Datanya masih duduk santai di sini
              </div>
            </div>
          </div>
        </div>

        {/* Slamming Physical Stamp: [ KOSONG / TERSEDIA ] */}
        {frame >= 25 && (
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              transform: `scale(${stampScale}) rotate(-8deg)`,
              backgroundColor: 'rgba(245, 158, 11, 0.95)',
              border: '4px solid #ffffff',
              padding: '18px 48px',
              borderRadius: 20,
              boxShadow: '0 16px 40px rgba(245, 158, 11, 0.4)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: 3,
              }}
            >
              [ KOSONG ]
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#fef3c7',
                letterSpacing: 1.5,
                marginTop: 4,
              }}
            >
              SIAP DITULIS FILE BARU
            </div>
          </div>
        )}

        {/* Detective Magnifier Gliding In at 2.8s */}
        {frame >= 60 && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 32,
              transform: `translateY(${lensY}px) scale(${lensProgress})`,
              zIndex: 15,
              backgroundColor: '#ffffff',
              borderRadius: 100,
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span style={{ fontSize: 28 }}>🔍</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>
                INTIP KE DALAM:
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: PALETTE.blue }}>
                File belum terhapus sama sekali!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Takeaway */}
      <div
        style={{
          marginTop: 36,
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          border: `2px solid ${PALETTE.amber}`,
          color: '#fbbf24',
          padding: '16px 40px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          textAlign: 'center',
        }}
      >
        💡 Sistem cuma menandai ruangnya "bebas dipakai kapan saja"
      </div>
    </div>
  );
};
