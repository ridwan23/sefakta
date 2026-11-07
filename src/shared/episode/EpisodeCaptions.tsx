import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions } from '@remotion/captions';
import { FONT_JAKARTA } from '../brand/fonts';
import type { TimelineScene } from './types';

const YELLOW = '#FFB000';
const INK = '#081736';
const box: React.CSSProperties = { position: 'absolute', left: 70, right: 70, bottom: 260, display: 'flex', justifyContent: 'center' };
const text: React.CSSProperties = { fontFamily: FONT_JAKARTA, fontWeight: 800, fontSize: 60, lineHeight: 1.2, textAlign: 'center', color: '#fff', textShadow: `0 4px 0 ${INK}, 0 0 20px rgba(0,0,0,0.6)` };

/** Subtitle kata per kata dari caption hasil penyelarasan audio (waktu relatif awal scene). */
const Subtitle: React.FC<{ scene: TimelineScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const { pages } = React.useMemo(() => createTikTokStyleCaptions({ captions: scene.captions ?? [], combineTokensWithinMilliseconds: 1400 }), [scene.captions]);
  const page = pages.find((p, i) => ms >= p.startMs && ms < (pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 400));
  if (!page) return null;
  return (
    <div style={box}>
      <div style={text}>
        {page.tokens.map((t, i) => {
          const active = ms >= t.fromMs && ms < t.toMs;
          return (
            <span key={i} style={{ color: active ? INK : '#fff', background: active ? YELLOW : 'transparent', borderRadius: 12, padding: '0 6px', textShadow: active ? 'none' : text.textShadow }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Lapisan teks satu scene sesuai mode caption brief. Satu fokus baca pada satu waktu. */
export const SceneCaption: React.FC<{ scene: TimelineScene; mode: 'ringkasan' | 'subtitle' | 'headline' }> = ({ scene, mode }) => {
  if (mode === 'subtitle') return scene.captions ? <Subtitle scene={scene} /> : null; // belum diselaraskan: tidak menampilkan perkiraan
  if (mode === 'ringkasan') {
    return scene.caption ? (
      <div style={box}>
        <div style={text}>{scene.caption}</div>
      </div>
    ) : null;
  }
  return scene.headline ? (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 300 }}>
      <div style={{ ...text, fontSize: 84, maxWidth: 900 }}>{scene.headline}</div>
    </AbsoluteFill>
  ) : null;
};
