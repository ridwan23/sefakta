import React from 'react';
import { useCurrentFrame } from 'remotion';

interface SceneTiming {
  start: number;
  end: number;
  vo: string;
}

export const SCENE_TIMINGS: SceneTiming[] = [
  {
    start: 0,
    end: 150, // 0-5s
    vo: 'Pernah nggak, pas HP mau jatuh atau lagi terpeleset, rasanya dunia mendadak bergerak lambat ala film The Matrix?!',
  },
  {
    start: 150,
    end: 390, // 5-13s
    vo: 'Banyak orang ngira ini cuma ilusi perasaan. Tapi ternyata di dalam otak kita, ada mekanisme sains yang luar biasa!',
  },
  {
    start: 390,
    end: 690, // 13-23s
    vo: 'Saat panik atau hidupmu terancam, pusat emosi dan alarm darurat otak bernama AMIGDALA langsung aktif seratus persen!',
  },
  {
    start: 690,
    end: 1050, // 23-35s
    vo: 'Amigdala menyalakan jalur perekam cadangan. Otakmu mulai mencatat jauh lebih banyak detail gambar, suara, dan posisi per detik!',
  },
  {
    start: 1050,
    end: 1410, // 35-47s
    vo: 'Penelitian ilmiah membuktikan: waktu aslinya tetap sama. Tapi karena memorimu sangat padat, pas otak memutarnya kembali, durasinya terasa jauh lebih panjang!',
  },
  {
    start: 1410,
    end: 1620, // 47-54s
    vo: 'Secara evolusi, ini senjata nenek moyang kita agar otak punya rekaman detail buat belajar bertahan hidup dari bahaya maut.',
  },
  {
    start: 1620,
    end: 1800, // 54-60s
    vo: 'Pernah ngalamin sensasi slow-mo ini? Tulis di komentar dan follow @sefaktaofficial buat fakta sains unik berikutnya!',
  },
];

export const VideoOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Find active VO
  const activeScene =
    SCENE_TIMINGS.find((s) => frame >= s.start && frame < s.end) ||
    SCENE_TIMINGS[SCENE_TIMINGS.length - 1];

  const seconds = Math.floor(frame / 30);
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(remSec).padStart(2, '0')} / 01:00`;

  return (
    <>
      {/* Top 7 Segment Progress Bars (Stories/Reels Style) */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 40,
          right: 40,
          display: 'flex',
          gap: 10,
          zIndex: 50,
        }}
      >
        {SCENE_TIMINGS.map((scene, i) => {
          let progress = 0;
          if (frame >= scene.end) {
            progress = 100;
          } else if (frame >= scene.start) {
            progress = ((frame - scene.start) / (scene.end - scene.start)) * 100;
          }
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 8,
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#ffffff',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Top Brand Pill & Time */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 100,
            padding: '12px 28px',
            fontSize: 26,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#f43f5e',
              boxShadow: '0 0 16px #f43f5e',
            }}
          />
          SEFAKTA
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(251, 191, 36, 0.4)',
            borderRadius: 100,
            padding: '12px 24px',
            fontSize: 24,
            fontWeight: 800,
            color: '#fbbf24',
            fontFamily: 'monospace',
          }}
        >
          {timeStr}
        </div>
      </div>

      {/* Bottom Dynamic Subtitle / Caption Card */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 40,
          right: 40,
          background: 'rgba(5, 8, 20, 0.92)',
          border: '2px solid rgba(255, 255, 255, 0.16)',
          borderRadius: 32,
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          zIndex: 50,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 28,
            color: '#020617',
            fontWeight: 900,
          }}
        >
          🎙️
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#f8fafc',
            flex: 1,
          }}
        >
          "{activeScene.vo}"
        </div>
      </div>
    </>
  );
};
