// Latar berdimensi: gradien bercahaya, pendaran aksen yang melayang, pola halus, grain, dan vignette.
// Menggantikan latar warna rata. Semua dari token palet, jadi selalu senada dengan visualStyle episode.
//
//   <Backdrop style={style} pattern="dots" />            // lapisan paling bawah scene
//   <Grain opacity={0.06} />                              // tekstur di atas objek (opsional, mis. gaya kertas/film)
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise1 } from '../anim/core';
import type { VisualStyle } from '../episode/types';
import { alpha, darken, lighten, mix } from './color';
import { tokens } from './tokens';

/** Grain film/kertas deterministik. `animated` = butir berganti tiap 2 frame (film); false = statis (kertas). */
export const Grain: React.FC<{ opacity?: number; scale?: number; animated?: boolean; blend?: React.CSSProperties['mixBlendMode'] }> = ({
  opacity = 0.06, scale = 0.9, animated = true, blend = 'overlay',
}) => {
  const f = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  const seed = animated ? Math.floor(f / 2) % 97 : 3;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: blend, opacity }}>
      <svg width="100%" height="100%">
        <filter id={`g${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency={scale} numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export type BackdropProps = {
  style: Pick<VisualStyle, 'tone' | 'palette'>;
  /** pola latar halus */
  pattern?: 'none' | 'dots' | 'grid' | 'lines' | 'paper';
  /** titik pusat cahaya (px) */
  lightAt?: [number, number];
  /** pendaran aksen yang melayang */
  glow?: boolean;
  grain?: number;
  vignette?: number;
  /** pergeseran pola per detik (parallax pelan) */
  drift?: number;
};

export const Backdrop: React.FC<BackdropProps> = ({ style, pattern = 'none', lightAt = [380, 520], glow = true, grain = 0.05, vignette = 0.35, drift = 6 }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const T = tokens(style);
  const t = f / fps;
  const top = T.tone === 'light' ? lighten(T.bg, 0.35) : lighten(T.bg, 0.1);
  const bottom = T.tone === 'light' ? darken(T.bg2, 0.04) : darken(T.bg, 0.35);
  const ink = T.tone === 'light' ? T.ink : '#ffffff';
  const off = t * drift;
  const patterns: Record<string, React.CSSProperties> = {
    none: {},
    dots: { backgroundImage: `radial-gradient(${alpha(mix(ink, T.bg, 0.2), 0.14)} 2.2px, transparent 2.6px)`, backgroundSize: '44px 44px', backgroundPosition: `${off}px ${off * 0.6}px` },
    grid: {
      backgroundImage: `linear-gradient(${alpha(ink, 0.06)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${alpha(ink, 0.06)} 1.5px, transparent 1.5px)`,
      backgroundSize: '72px 72px',
      backgroundPosition: `${off}px ${off}px`,
    },
    lines: { backgroundImage: `repeating-linear-gradient(-30deg, ${alpha(ink, 0.05)} 0 2px, transparent 2px 26px)`, backgroundPosition: `${off}px 0` },
    paper: {},
  };
  const blob = (seed: number, x: number, y: number, r: number, color: string, o: number) => (
    <div
      style={{
        position: 'absolute',
        left: x + noise1(t * 0.15, seed) * 120 - r,
        top: y + noise1(t * 0.12, seed + 4) * 140 - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(color, o)} 0%, ${alpha(color, 0)} 70%)`,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at ${(lightAt[0] / width) * 100}% ${(lightAt[1] / height) * 100}%, ${top} 0%, ${T.bg} 45%, ${bottom} 100%)`, overflow: 'hidden' }}>
      {glow ? (
        <>
          {blob(1, width * 0.82, height * 0.22, 520, T.accent, T.tone === 'light' ? 0.14 : 0.18)}
          {blob(2, width * 0.15, height * 0.78, 600, T.accent2, T.tone === 'light' ? 0.1 : 0.14)}
        </>
      ) : null}
      {pattern !== 'none' && pattern !== 'paper' ? <AbsoluteFill style={patterns[pattern]} /> : null}
      {pattern === 'paper' ? <Grain opacity={T.tone === 'light' ? 0.22 : 0.1} scale={0.6} animated={false} blend="multiply" /> : null}
      {grain > 0 ? <Grain opacity={grain} /> : null}
      {vignette > 0 ? <AbsoluteFill style={{ background: `radial-gradient(120% 85% at 50% 45%, transparent 55%, ${alpha(T.tone === 'light' ? darken(T.bg, 0.6) : '#000000', vignette)} 100%)` }} /> : null}
    </AbsoluteFill>
  );
};
