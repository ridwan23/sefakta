import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene3BrainExperiment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin(frame / 4) * 0.1 + 1;
  const brainGlow = interpolate(frame, [0, 45], [0.2, 0.8]);

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
          background: 'rgba(168, 85, 247, 0.15)',
          border: '2px solid #a855f7',
          color: '#c084fc',
          padding: '12px 28px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        🧠 Anatomi Otak Manusia
      </div>

      {/* Brain SVG Illustration with glowing Amygdala */}
      <div style={{ position: 'relative', width: 360, height: 320, marginBottom: 30 }}>
        <svg width="360" height="320" viewBox="0 0 360 320" fill="none">
          {/* Brain Contour */}
          <path
            d="M80 180 C50 140 70 80 130 60 C180 40 240 50 270 90 C310 130 300 200 250 240 C200 270 120 260 80 180 Z"
            fill="#1e1b4b"
            stroke="#6366f1"
            strokeWidth="6"
          />
          {/* Gyri & Sulci brain curves */}
          <path
            d="M120 80 Q160 110 140 160 Q200 130 220 180"
            stroke="#818cf8"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M160 70 Q190 120 250 110"
            stroke="#818cf8"
            strokeWidth="4"
            fill="none"
          />

          {/* AMYGDALA (Glowing Red / Orange Core) */}
          <g transform={`scale(${pulse})`} transformOrigin="190 190">
            <circle
              cx="190"
              cy="190"
              r="34"
              fill="#f43f5e"
              fillOpacity={brainGlow}
              stroke="#fbbf24"
              strokeWidth="5"
            />
            <circle
              cx="190"
              cy="190"
              r="52"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          </g>

          <text
            x="190"
            y="275"
            fill="#fbbf24"
            fontSize="26"
            fontWeight="900"
            textAnchor="middle"
          >
            AMYGDALA ON! 🔥
          </text>
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
          SIAGA MERAH:
          <br />
          <span style={{ color: '#f43f5e' }}>AMYGDALA DIAMBIL ALIH</span>
        </h2>
        <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 18, lineHeight: 1.4 }}>
          Saat panik atau hidupmu terancam, pusat emosi & pertahanan otak (Amigdala) langsung menyala 100%!
        </p>
      </div>
    </div>
  );
};
