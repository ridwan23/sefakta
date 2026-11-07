import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CAPTIONS, FPS, PALETTE } from './constants';

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const currentSec = frame / FPS;

  // Find active caption segment
  const activeSegment = CAPTIONS.find(
    (cap) => currentSec >= cap.fromSec && currentSec < cap.toSec
  );

  if (!activeSegment) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 48,
        right: 48,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(14, 20, 34, 0.92)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 24,
          padding: '24px 32px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 42,
            lineHeight: 1.35,
            fontWeight: 800,
            letterSpacing: -0.3,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
            color: '#94a3b8',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px 14px',
          }}
        >
          {activeSegment.words.map((item, idx) => {
            const isSpoken =
              currentSec >= item.startSec && currentSec <= item.endSec;
            const hasPassed = currentSec > item.endSec;

            return (
              <span
                key={idx}
                style={{
                  color: isSpoken
                    ? '#ffffff'
                    : hasPassed
                    ? '#f1f5f9'
                    : '#64748b',
                  backgroundColor: isSpoken
                    ? PALETTE.blue
                    : 'transparent',
                  padding: '4px 12px',
                  borderRadius: 10,
                  transform: isSpoken ? 'scale(1.06)' : 'scale(1.0)',
                  transition: 'transform 0.08s ease, color 0.08s ease',
                  fontWeight: isSpoken ? 900 : hasPassed ? 800 : 700,
                }}
              >
                {item.word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
