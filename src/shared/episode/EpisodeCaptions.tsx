import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions } from '@remotion/captions';
import { FONT_JAKARTA } from '../brand/fonts';
import { timeKeypoints } from './keypoints';
import type { CaptionColors, CaptionMode, TimelineScene, VisualStyle } from './types';

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

/** Poin kunci (mode "keypoint") yang disorot mengikuti ucapan narator. Setiap kata keypoint dicocokkan (berurutan,
 *  boleh bentuk turunan: "ponsel" ≈ "ponselmu") ke kata naskah di sekitar kata pemicu, memakai waktu hasil alignment:
 *  sorotan berpindah tepat saat kata itu diucapkan; kata yang belum diucapkan redup, yang sudah menyala, dan kata
 *  *berbintang* tetap beraksen. Keypoint muncul pada kata pertamanya yang diucapkan (paling cepat KEYPOINT_LEAD
 *  sebelum kata pemicu), kalau tidak ada, tepat pada kata pemicu. Kata yang tidak diucapkan persis ikut menyala bersama
 *  kata sebelumnya; kata berbintang yang tidak diucapkan disorot pada kata pemicu. Tanpa alignment tidak ada yang
 *  ditampilkan, sama seperti mode subtitle. */
const KEYPOINT_IN = 8; // frame entrance
const KEYPOINT_OUT = 5; // frame keluar sebelum poin berikutnya / akhir scene
const KeypointCaption: React.FC<{ scene: TimelineScene; style: VisualStyle }> = ({ scene, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = captionColors(style);
  const dark = style.tone === 'dark';
  const timed = React.useMemo(() => timeKeypoints(scene, fps), [scene, fps]);
  const kp = scene.captions ? [...timed].reverse().find((k) => f >= k.start) : undefined;
  if (!kp) return null;
  const { start, end } = kp;
  const ms = (f / fps) * 1000;
  const enter = interpolate(f, [start, start + KEYPOINT_IN], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
  const exit = interpolate(f, [end - KEYPOINT_OUT, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) });
  return (
    <div style={{ ...box, opacity: Math.min(1, enter * 1.4) * exit, transform: `translateY(${(1 - enter) * 26}px) scale(${0.86 + 0.14 * enter})` }}>
      <div
        style={{
          fontFamily: FONT_JAKARTA,
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.15,
          textAlign: 'center',
          color: c.text,
          padding: '16px 34px',
          borderRadius: 26,
          background: dark ? 'rgba(6,12,28,0.84)' : 'rgba(255,255,255,0.9)',
          boxShadow: dark ? '0 10px 40px rgba(0,0,0,0.45)' : '0 8px 30px rgba(0,0,0,0.12)',
          maxWidth: 940,
        }}
      >
        {kp.tokens.map((t, j) => {
          const active = t.spoken && ms >= t.fromMs && ms < t.toMs;
          const said = ms >= t.fromMs;
          // denyut kecil saat kata mulai diucapkan (beat)
          const beat = interpolate(ms - t.fromMs, [0, 90, 260], [1, 1.1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <span
              key={j}
              style={{
                display: 'inline-block',
                margin: '0 8px',
                padding: '0 10px',
                borderRadius: 14,
                color: active ? c.highlightText : t.emph && said ? c.highlight : c.text,
                background: active ? c.highlight : 'transparent',
                opacity: said ? 1 : 0.5,
                transform: `scale(${active ? beat : 1})`,
              }}
            >
              {t.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Lapisan teks satu scene sesuai mode caption brief. Satu fokus baca pada satu waktu. */
export const SceneCaption: React.FC<{ scene: TimelineScene; mode: CaptionMode; style: VisualStyle }> = ({ scene, mode, style }) => {
  const text = textStyle(captionColors(style), style.tone);
  if (mode === 'subtitle') return scene.captions ? <Subtitle scene={scene} style={style} /> : null; // belum diselaraskan: tidak menampilkan perkiraan
  if (mode === 'keypoint') return <KeypointCaption scene={scene} style={style} />;
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
