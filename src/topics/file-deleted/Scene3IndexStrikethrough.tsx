import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PALETTE } from './constants';

export const Scene3IndexStrikethrough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Red marker strike-through progress across the index entry
  const strikeWidth = interpolate(frame, [45, 75], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Photo bounce in the storage box to draw attention
  const photoBounce = frame >= 85 ? Math.sin(frame * 0.2) * 6 : 0;

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
        padding: '0 44px',
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
          KOSONGKAN RECYCLE BIN
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Cuma Coret Daftar Isi! 📑
        </div>
      </div>

      {/* Side-by-side Real World Comparison: Index Catalog vs Storage Locker */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          width: '100%',
          maxWidth: 980,
          marginTop: 40,
        }}
      >
        {/* Left: The Catalog / Index Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '2px solid #f1f5f9',
              paddingBottom: 14,
            }}
          >
            <span>📋</span> BUKU DAFTAR ISI
          </div>

          {/* Catalog Entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 700,
                color: '#64748b',
              }}
            >
              📄 1. Dokumen_Kerja.pdf
            </div>

            {/* Target Entry: Struck Through with Red Marker */}
            <div
              style={{
                position: 'relative',
                backgroundColor: frame >= 60 ? '#fee2e2' : '#f8fafc',
                border: `2px solid ${frame >= 60 ? PALETTE.rose : '#e2e8f0'}`,
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 22,
                fontWeight: 900,
                color: frame >= 60 ? PALETTE.rose : '#1e293b',
                transition: 'background-color 0.2s',
              }}
            >
              📷 2. Foto_Liburan.jpg
              {/* Animated Red Marker Strike Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 12,
                  width: `${strikeWidth * 0.9}%`,
                  height: 6,
                  backgroundColor: PALETTE.rose,
                  borderRadius: 4,
                  transform: 'translateY(-50%)',
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 700,
                color: '#64748b',
              }}
            >
              🎵 3. Lagu_Favorit.mp3
            </div>
          </div>

          {/* Strikethrough Status */}
          <div
            style={{
              marginTop: 22,
              backgroundColor: frame >= 60 ? 'rgba(244, 63, 94, 0.12)' : '#f8fafc',
              color: frame >= 60 ? PALETTE.rose : '#64748b',
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {frame >= 60 ? '✕ Judulnya Selesai Dicoret' : '● Terdaftar di Indeks'}
          </div>
        </div>

        {/* Right: The Physical Storage Locker / Box */}
        <div
          style={{
            flex: 1,
            backgroundColor: PALETTE.bgCard,
            border: `3px solid ${frame >= 80 ? PALETTE.emerald : PALETTE.border}`,
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              fontSize: 22,
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: 14,
            }}
          >
            <span>📦</span> KOTAK RAK PENYIMPANAN
          </div>

          {/* The Physical Photo Still Inside the Box! */}
          <div
            style={{
              flex: 1,
              width: '100%',
              minHeight: 180,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateY(${photoBounce}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: '12px 16px 16px 12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  backgroundColor: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                🏖️
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>
                  Foto_Liburan.jpg
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: PALETTE.emerald }}>
                  ● Masih utuh di rak!
                </div>
              </div>
            </div>
          </div>

          {/* Storage Reality Pill */}
          <div
            style={{
              marginTop: 22,
              width: '100%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            ✅ Barangnya Belum Dibuang!
          </div>
        </div>
      </div>

      {/* Big Clarification Pill at Bottom */}
      <div
        style={{
          marginTop: 36,
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: `2px solid ${PALETTE.rose}`,
          color: '#ffffff',
          padding: '16px 36px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          textAlign: 'center',
        }}
      >
        💡 Yang dihapus cuma catatan alamatnya, bukan file fisiknya!
      </div>
    </div>
  );
};
