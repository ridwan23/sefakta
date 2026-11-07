import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DURATION_IN_FRAMES, FPS, SCENES, TOTAL_SECONDS, PALETTE } from './constants';

export const StatusHUD: React.FC = () => {
  const frame = useCurrentFrame();

  // Find active scene
  const activeIndex = SCENES.findIndex(
    (s) => frame >= s.from && frame < s.from + s.duration
  );
  const currentSceneIndex = activeIndex === -1 ? SCENES.length - 1 : activeIndex;
  const activeScene = SCENES[currentSceneIndex];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
      }}
    >
      {/* 1. Clean 8-Segment Story Progress Bar (Instagram / TikTok style) */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 48,
          right: 48,
          display: 'flex',
          gap: 8,
          height: 6,
        }}
      >
        {SCENES.map((scene, idx) => {
          let fillPercent = 0;
          if (idx < currentSceneIndex) {
            fillPercent = 100;
          } else if (idx === currentSceneIndex) {
            const frameInScene = frame - scene.from;
            fillPercent = Math.min(100, Math.max(0, (frameInScene / scene.duration) * 100));
          }

          return (
            <div
              key={scene.id}
              style={{
                flex: 1,
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${fillPercent}%`,
                  backgroundColor: '#ffffff',
                  borderRadius: 4,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Top Header: Clean Brand & Live File State Chip */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 48,
          right: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left: Brand Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'rgba(24, 32, 50, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            padding: '10px 20px',
            borderRadius: 100,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: PALETTE.emerald,
            }}
          />
          <span
            style={{
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            @sefaktaofficial
          </span>
        </div>

        {/* Right: Live File State Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'rgba(24, 32, 50, 0.9)',
            border: `2px solid ${activeScene.statusColor}`,
            padding: '10px 22px',
            borderRadius: 100,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: activeScene.statusColor,
            }}
          />
          <span
            style={{
              color: '#ffffff',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 0.3,
            }}
          >
            Foto_Liburan.jpg: <span style={{ color: activeScene.statusColor }}>{activeScene.status}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
