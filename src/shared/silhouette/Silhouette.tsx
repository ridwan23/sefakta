// Gaya siluet: langit bergradien, cakram matahari/bulan, dan lapisan siluet (pegunungan, bukit, pepohonan, kota)
// yang makin pudar ke kejauhan (perspektif udara) dan bergeser parallax. Satu palet langit menentukan semua warna.
//
//   <SilhouetteSky palette={SKY.senja} sunY={0.52} />
//   <Ridge kind="mountains" palette={SKY.senja} depth={0.9} y={1180} seed={2} />
//   <Ridge kind="hills"     palette={SKY.senja} depth={0.55} y={1320} seed={5} />
//   <Ridge kind="trees"     palette={SKY.senja} depth={0.2} y={1500} seed={8} at={q.hutan} />
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, noise1, prog } from '../anim/core';
import { mix } from '../look/color';
import { hash } from '../motion';

export type SkyPalette = {
  /** langit atas, tengah, dekat cakrawala */
  top: string;
  mid: string;
  horizon: string;
  /** warna cakram (matahari/bulan) */
  sun: string;
  /** warna siluet terdekat */
  near: string;
};

export const SKY: Record<'senja' | 'fajar' | 'malam' | 'kabut', SkyPalette> = {
  senja: { top: '#2B1E4A', mid: '#B4436C', horizon: '#F6A04D', sun: '#FFE3A3', near: '#1A1026' },
  fajar: { top: '#3A5A8C', mid: '#E7A1A0', horizon: '#FCE3B0', sun: '#FFF6DC', near: '#22263A' },
  malam: { top: '#060B1E', mid: '#13254A', horizon: '#2E4A72', sun: '#E8EEF7', near: '#03060F' },
  kabut: { top: '#8EA3B0', mid: '#C3CED3', horizon: '#E9ECEA', sun: '#FFFFFF', near: '#2F3B40' },
};

export type SilhouetteSkyProps = {
  palette?: SkyPalette;
  /** posisi cakram (0..1 layar); sunY > 1 = tanpa cakram */
  sunX?: number;
  sunY?: number;
  sunR?: number;
  /** cakram naik dari bawah mulai frame ini (opsional) */
  riseAt?: number;
  /** bintang (malam) 0..1 */
  stars?: number;
};

/** Langit gradien dengan cakram bercahaya dan bintang berkelip opsional. Lapisan paling bawah. */
export const SilhouetteSky: React.FC<SilhouetteSkyProps> = ({ palette = SKY.senja, sunX = 0.5, sunY = 0.55, sunR = 150, riseAt, stars = 0 }) => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const rise = riseAt === undefined ? 1 : prog(f, riseAt, Math.round(fps * 2.5), EASE.inOut);
  const cx = sunX * W;
  const cy = sunY * H + (1 - rise) * 260;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.mid} 55%, ${palette.horizon} 78%)` }}>
      {stars > 0 ? (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 70 }, (_, i) => {
            const sx = hash(i * 3.1) * W;
            const sy = hash(i * 7.7) * H * 0.55;
            const tw = 0.55 + 0.45 * Math.sin(f / (8 + hash(i) * 10) + i);
            return <circle key={i} cx={sx} cy={sy} r={1 + hash(i * 1.3) * 2.2} fill="#fff" opacity={stars * tw * (1 - sy / (H * 0.6))} />;
          })}
        </svg>
      ) : null}
      {sunY <= 1 ? (
        <>
          <div style={{ position: 'absolute', left: cx - sunR * 4, top: cy - sunR * 4, width: sunR * 8, height: sunR * 8, borderRadius: '50%', background: `radial-gradient(circle, ${palette.sun}66 0%, ${palette.sun}22 30%, transparent 60%)` }} />
          <div style={{ position: 'absolute', left: cx - sunR, top: cy - sunR, width: sunR * 2, height: sunR * 2, borderRadius: '50%', background: palette.sun, boxShadow: `0 0 60px ${palette.sun}` }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

type Kind = 'mountains' | 'hills' | 'trees' | 'city' | 'grass';

/** Profil atas satu lapisan (y relatif ke garis dasar, negatif = naik) di posisi x. Deterministik per seed. */
const profile = (kind: Kind, x: number, seed: number) => {
  switch (kind) {
    case 'mountains': {
      // puncak tajam: |noise| terbalik berlapis
      const a = 1 - Math.abs(noise1(x / 260, seed));
      const b = 1 - Math.abs(noise1(x / 110, seed + 3));
      return -(a ** 2 * 300 + b ** 2 * 70);
    }
    case 'hills':
      return -(110 + noise1(x / 320, seed) * 80 + noise1(x / 130, seed + 5) * 25);
    case 'grass':
      return -(20 + noise1(x / 90, seed) * 12) - (hash(Math.floor(x / 9) + seed * 13) > 0.6 ? 14 * hash(Math.floor(x / 9) * 2.3 + seed) : 0);
    default:
      return -100;
  }
};

export type RidgeProps = {
  kind?: Kind;
  palette?: SkyPalette;
  /** 0 = paling dekat (gelap, warna `near`), 1 = paling jauh (hampir menyatu dengan cakrawala) */
  depth?: number;
  /** garis dasar lapisan (px dari atas); di bawahnya terisi penuh sampai bawah layar */
  y: number;
  seed?: number;
  /** skala tinggi profil */
  scale?: number;
  /** px per detik pergeseran parallax (lapisan dekat lebih cepat); 0 = diam */
  drift?: number;
  /** muncul naik dari bawah */
  at?: number;
  color?: string;
};

/**
 * Satu lapisan siluet selebar layar. Warna dicampur ke arah cakrawala sesuai `depth` (perspektif udara), jadi
 * tumpukan beberapa Ridge otomatis berjenjang. kind: mountains, hills, trees (pohon cemara/bulat), city (gedung), grass.
 */
export const Ridge: React.FC<RidgeProps> = ({ kind = 'hills', palette = SKY.senja, depth = 0.5, y, seed = 1, scale = 1, drift, at, color }) => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const fill = color ?? mix(palette.near, palette.horizon, depth * 0.78);
  const v = drift ?? 6 + (1 - depth) * 22;
  const shift = (f / fps) * v;
  const rise = at === undefined ? 1 : prog(f, at, Math.round(fps * 0.9), EASE.out);
  const dy = (1 - rise) * 320;
  const x0 = -60;
  const x1 = W + 60;
  let d = '';
  if (kind === 'trees') {
    // deretan pohon: cemara (segitiga bertingkat) dan pohon bulat, posisi dari hash per slot dunia
    const slot = 46;
    const first = Math.floor((x0 + shift) / slot) - 1;
    const last = Math.ceil((x1 + shift) / slot) + 1;
    const parts: string[] = [];
    for (let i = first; i <= last; i++) {
      const r = hash(i * 1.37 + seed * 9.1);
      const cx = i * slot - shift + (hash(i * 2.9 + seed) - 0.5) * 20;
      const th = (90 + r * 150) * scale;
      const tw = (34 + r * 30) * scale;
      if (hash(i * 5.3 + seed) > 0.35) {
        parts.push(`M${cx - tw} ${y + 4} L${cx - tw * 0.35} ${y - th * 0.45} L${cx - tw * 0.7} ${y - th * 0.45} L${cx} ${y - th} L${cx + tw * 0.7} ${y - th * 0.45} L${cx + tw * 0.35} ${y - th * 0.45} L${cx + tw} ${y + 4} Z`);
      } else {
        const rr = tw * 0.95;
        parts.push(`M${cx - 6} ${y + 4} L${cx - 6} ${y - th * 0.45} A${rr} ${rr} 0 1 1 ${cx + 6} ${y - th * 0.45} L${cx + 6} ${y + 4} Z`);
      }
    }
    d = `M${x0} ${H} L${x0} ${y} L${x1} ${y} L${x1} ${H} Z ${parts.join(' ')}`;
  } else if (kind === 'city') {
    const parts: string[] = [];
    // slot dunia tetap → gedung tidak "meloncat" saat bergeser
    const slot = 84 * scale;
    const first = Math.floor((x0 + shift) / slot) - 1;
    const last = Math.ceil((x1 + shift) / slot) + 1;
    for (let i = first; i <= last; i++) {
      const cx = i * slot - shift + (hash(i * 2.3 + seed) - 0.5) * slot * 0.3;
      const bw = slot * (0.7 + hash(i * 1.91 + seed * 3.3) * 0.6);
      const bh = (80 + hash(i * 4.1 + seed) ** 1.5 * 360) * scale;
      parts.push(`M${cx} ${y + 2} V${y - bh} H${cx + bw} V${y + 2} Z`);
      if (hash(i * 7.7 + seed) > 0.8) parts.push(`M${cx + bw / 2 - 2} ${y - bh} V${y - bh - 60 * scale} H${cx + bw / 2 + 2} V${y - bh} Z`); // antena
    }
    d = `M${x0} ${H} L${x0} ${y} L${x1} ${y} L${x1} ${H} Z ${parts.join(' ')}`;
  } else {
    const step = kind === 'grass' ? 4 : 12;
    const pts: string[] = [];
    for (let x = x0; x <= x1; x += step) pts.push(`L${x} ${(y + profile(kind, x + shift, seed) * scale).toFixed(1)}`);
    d = `M${x0} ${H} ${pts.join(' ')} L${x1} ${H} Z`;
  }
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, transform: `translateY(${dy}px)` }}>
      <path d={d} fill={fill} fillRule="nonzero" />
    </svg>
  );
};

export type HazeProps = { palette?: SkyPalette; y: number; height?: number; opacity?: number };

/** Kabut tipis di antara lapisan: pita gradien warna cakrawala, memisahkan kedalaman. */
export const Haze: React.FC<HazeProps> = ({ palette = SKY.senja, y, height = 220, opacity = 0.55 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y - height / 2, height, background: `linear-gradient(180deg, transparent, ${palette.horizon} 55%, transparent)`, opacity }} />
);
