import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions } from '@remotion/captions';
import { FONT_JAKARTA } from '../brand/fonts';
import type { CaptionColors, TimelineScene, VisualStyle } from './types';

/** Default warna caption per tone latar (kontras ≥ 4,5:1 antara sorotan dan teksnya). */
export const DEFAULT_CAPTION_COLORS: Record<VisualStyle['tone'], CaptionColors> = {
  dark: { text: '#FFFFFF', highlight: '#FFB000', highlightText: '#081736' },
  light: { text: '#081736', highlight: '#0D2250', highlightText: '#FFFFFF' },
};
export const captionColors = (style: VisualStyle): CaptionColors => ({ ...DEFAULT_CAPTION_COLORS[style.tone], ...style.captionColors });

const box: React.CSSProperties = { position: 'absolute', left: 70, right: 70, bottom: 260, display: 'flex', justifyContent: 'center' };
/** Bayangan/halo mengikuti tone supaya teks tetap terbaca di atas visual apa pun. */
const textStyle = (c: CaptionColors, tone: VisualStyle['tone']): React.CSSProperties => ({
  fontFamily: FONT_JAKARTA,
  fontWeight: 800,
  fontSize: 60,
  lineHeight: 1.2,
  textAlign: 'center',
  color: c.text,
  textShadow: tone === 'dark' ? '0 4px 0 rgba(0,0,0,0.55), 0 0 20px rgba(0,0,0,0.6)' : '0 0 14px rgba(255,255,255,0.95), 0 0 4px rgba(255,255,255,0.95)',
});

/** Subtitle kata per kata dari caption hasil penyelarasan audio (waktu relatif awal scene). */
const Subtitle: React.FC<{ scene: TimelineScene; style: VisualStyle }> = ({ scene, style }) => {
  const c = captionColors(style);
  const text = textStyle(c, style.tone);
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
            <span key={i} style={{ color: active ? c.highlightText : c.text, background: active ? c.highlight : 'transparent', borderRadius: 12, padding: '0 6px', textShadow: active ? 'none' : text.textShadow }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Lapisan teks satu scene sesuai mode caption brief. Satu fokus baca pada satu waktu. */
export const SceneCaption: React.FC<{ scene: TimelineScene; mode: 'ringkasan' | 'subtitle' | 'headline'; style: VisualStyle }> = ({ scene, mode, style }) => {
  const text = textStyle(captionColors(style), style.tone);
  if (mode === 'subtitle') return scene.captions ? <Subtitle scene={scene} style={style} /> : null; // belum diselaraskan: tidak menampilkan perkiraan
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
