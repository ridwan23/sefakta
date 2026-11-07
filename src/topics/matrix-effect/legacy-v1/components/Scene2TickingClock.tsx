import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene2TickingClock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clock Hand: normal speed then suddenly drags slow
  const clockAngle = interpolate(frame, [0, 60, 240], [0, 360, 480]);

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
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
        padding: '120px 60px 180px',
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '2px solid #38bdf8',
          color: '#38bdf8',
          padding: '12px 28px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        ⏱️ Dilatasi Waktu Psikologis
      </div>

      {/* Clock Visual */}
      <div style={{ position: 'relative', width: 340, height: 340, marginBottom: 40 }}>
        <svg width="340" height="340" viewBox="0 0 340 340" fill="none">
          {/* Outer Ring */}
          <circle
            cx="170"
            cy="170"
            r="150"
            stroke="#1e293b"
            strokeWidth="16"
            fill="#0b0f19"
          />
          <circle
            cx="170"
            cy="170"
            r="150"
            stroke="#fbbf24"
            strokeWidth="6"
            strokeDasharray="20 12"
          />
          {/* Hour Marks */}
          <circle cx="170" cy="40" r="8" fill="#fbbf24" />
          <circle cx="300" cy="170" r="8" fill="#fbbf24" />
          <circle cx="170" cy="300" r="8" fill="#fbbf24" />
          <circle cx="40" cy="170" r="8" fill="#fbbf24" />

          {/* Clock Hands with Slow-Mo drag effect */}
          <g transform={`rotate(${clockAngle} 170 170)`}>
            <line
              x1="170"
              y1="170"
              x2="170"
              y2="55"
              stroke="#f43f5e"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle cx="170" cy="170" r="14" fill="#f43f5e" />
          </g>
        </svg>

        {/* Floating Matrix Text */}
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e1b4b',
            border: '2px solid #a855f7',
            padding: '8px 24px',
            borderRadius: 12,
            fontSize: 24,
            fontWeight: 900,
            color: '#c084fc',
            whiteSpace: 'nowrap',
          }}
        >
          0.1x SLOW MOTION
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            textTransform: 'uppercase',
          }}
        >
          KAYAK MASUK KE
          <br />
          <span style={{ color: '#fbbf24' }}>THE MATRIX EFFECT!</span>
        </h2>
        <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 18, lineHeight: 1.4 }}>
          Kenapa otak kita bisa mendadak ngerasa waktu berjalan jauh lebih lambat dari aslinya?
        </p>
      </div>
    </div>
  );
};
