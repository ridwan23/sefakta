import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Falling phone animation
  const phoneDrop = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const phoneY = interpolate(frame, [0, 60, 150], [-200, 20, 60], {
    extrapolateRight: 'clamp',
  });

  const phoneRotate = interpolate(frame, [0, 80, 150], [-25, 45, 60]);

  // Bullet time clock scale
  const slowMotionTextOpacity = interpolate(frame, [45, 60], [0, 1]);
  const matrixPulse = Math.sin(frame / 6) * 10;

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
      {/* Badge */}
      <div
        style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '2px solid #f43f5e',
          color: '#f43f5e',
          padding: '12px 28px',
          borderRadius: 100,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        ⚠️ Situasi Darurat
      </div>

      {/* Visual illustration: Falling Smartphone in Slow Motion */}
      <div
        style={{
          width: 400,
          height: 480,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Rippling Time Dilation Wave */}
        <div
          style={{
            position: 'absolute',
            width: 320 + matrixPulse * 2,
            height: 320 + matrixPulse * 2,
            borderRadius: '50%',
            border: '3px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)',
          }}
        />

        {/* Falling Smartphone SVG */}
        <div
          style={{
            transform: `translateY(${phoneY}px) rotate(${phoneRotate}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <svg width="220" height="380" viewBox="0 0 220 380" fill="none">
            {/* Phone Body */}
            <rect
              x="10"
              y="10"
              width="200"
              height="360"
              rx="36"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="6"
            />
            {/* Screen */}
            <rect
              x="22"
              y="32"
              width="176"
              height="316"
              rx="24"
              fill="#1e293b"
            />
            {/* Display Glitch/Crack Preview */}
            <path
              d="M30 60 L100 140 L70 200 L160 280"
              stroke="#f43f5e"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            {/* Shock Warning */}
            <circle cx="110" cy="190" r="40" fill="rgba(244, 63, 94, 0.2)" />
            <text
              x="110"
              y="202"
              fill="#f43f5e"
              fontSize="38"
              fontWeight="900"
              textAnchor="middle"
            >
              !
            </text>
          </svg>
        </div>
      </div>

      {/* Kinetic Typography */}
      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            textTransform: 'uppercase',
          }}
        >
          PAS HP MAU JATUH...
          <br />
          <span style={{ color: '#38bdf8', textShadow: '0 0 30px rgba(56, 189, 248, 0.6)' }}>
            DUNIA BERASA SLOW-MO?!
          </span>
        </h1>
        <p
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginTop: 20,
            opacity: slowMotionTextOpacity,
            lineHeight: 1.4,
          }}
        >
          Pernah nggak, waktu panik atau kecelakaan, sepersekian detik berasa jadi beberapa detik?!
        </p>
      </div>
    </div>
  );
};
