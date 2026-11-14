// Gaya papan tulis/doodle: permukaan papan, garis spidol/kapur yang "boiling" (bergetar tiap beberapa frame seperti
// animasi tangan), arsiran yang tergambar garis demi garis, dan tulisan tangan yang tertulis dari kiri.
// Koordinat layar (px). Semua garis memakai `pathLength`, jadi tidak perlu mengukur path.
//
//   <BoardSurface />                                         // papan putih (variant="chalk" = papan kapur)
//   <SketchPath d="M200 900 C400 700 680 700 880 900" at={q.naik} arrow />
//   <Hatch d={ellipsePath(540, 1000, 200, 140)} box={[340, 860, 400, 280]} at={q.isi} />
//   <SketchText x={540} y={600} text="Gula darah" at={q.judul} />
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog, stepped } from '../anim/core';
import { font } from '../brand/fonts';
import { clamp01, hash } from '../motion';

export const INK = {
  hitam: '#22252B',
  biru: '#1F5FBF',
  merah: '#D23B32',
  hijau: '#1E8A5A',
  kapur: '#F4F1E8',
  kapurKuning: '#F3D46B',
} as const;

const rnd = (seed: number, i: number) => hash(seed * 61.7 + i * 19.3 + 0.25);

export type BoardSurfaceProps = {
  /** whiteboard = putih bersih; chalk = papan kapur gelap dengan debu */
  variant?: 'whiteboard' | 'chalk';
  color?: string;
  /** bekas hapusan samar 0..1 */
  smudge?: number;
};

/** Latar papan tulis. Bekas hapusan samar memberi kesan papan yang dipakai, bukan putih kosong. */
export const BoardSurface: React.FC<BoardSurfaceProps> = ({ variant = 'whiteboard', color, smudge = 0.5 }) => {
  const id = useId().replace(/:/g, '');
  const chalk = variant === 'chalk';
  const bg = color ?? (chalk ? '#26332D' : '#F6F6F2');
  const mark = chalk ? '255,255,255' : '60,70,90';
  const blobs = [
    [22, 30, 38, 12],
    [70, 62, 44, 14],
    [35, 82, 30, 10],
    [80, 18, 26, 9],
  ];
  return (
    <AbsoluteFill style={{ background: bg }}>
      <AbsoluteFill
        style={{
          background: blobs.map(([x, y, w, h]) => `radial-gradient(${w}% ${h}% at ${x}% ${y}%, rgba(${mark},${(chalk ? 0.07 : 0.035) * smudge * 2}) 0%, transparent 100%)`).join(','),
        }}
      />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: chalk ? 0.5 : 0.25, mixBlendMode: chalk ? 'screen' : 'multiply' }}>
        <filter id={`d${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
          <feColorMatrix type="matrix" values={chalk ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.4 1.25' : '0 0 0 0 0.4  0 0 0 0 0.42  0 0 0 0 0.48  0 0 0 -2.6 1.3'} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#d${id})`} />
      </svg>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 220px rgba(0,0,0,${chalk ? 0.45 : 0.08})`, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

/** Seed "boiling": berganti tiap `rate` frame, berputar di 3 variasi (pola klasik animasi tangan). */
const useBoilSeed = (rate: number, seed: number) => {
  const f = useCurrentFrame();
  return rate <= 0 ? seed : seed + (Math.floor(f / rate) % 3);
};

/** Filter goyang garis tangan (+ tekstur kapur). Dipakai di dalam <svg>. */
const SketchFilter: React.FC<{ id: string; amp: number; seed: number; chalk: boolean }> = ({ id, amp, seed, chalk }) => (
  // region = seluruh layer layar (garis lurus horizontal punya bbox setipis garis; region per objek akan memotongnya)
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="w" />
    <feDisplacementMap in="SourceGraphic" in2="w" scale={amp} xChannelSelector="R" yChannelSelector="G" result="disp" />
    {chalk ? (
      <>
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={seed + 11} result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.1" result="ga" />
        <feComposite in="disp" in2="ga" operator="in" />
      </>
    ) : null}
  </filter>
);

const Layer: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', opacity }}>
      {children}
    </svg>
  );
};

type SketchBase = {
  at?: number;
  /** frame menggambar */
  dur?: number;
  color?: string;
  width?: number;
  /** kapur: tepi berpasir, sedikit tembus */
  chalk?: boolean;
  /** frame per ganti goyangan (0 = diam); default 4 */
  boil?: number;
  /** kekuatan goyang (px) */
  wobble?: number;
  seed?: number;
  /** gerak patah-patah ala stop-motion (1 = halus) */
  steps?: number;
  exitAt?: number;
};

const useDrawP = (at: number | undefined, dur: number | undefined, def: number, steps: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at === undefined) return 1;
  return prog(stepped(f, steps), at, dur ?? Math.round(fps * def), EASE.inOut);
};

const useExit = (exitAt: number | undefined) => {
  const f = useCurrentFrame();
  return exitAt === undefined ? 1 : 1 - prog(f, exitAt, 8, EASE.in);
};

export type SketchPathProps = SketchBase & {
  d: string;
  /** kepala panah dua goresan di ujung (arah dari titik `arrowFrom` ke ujung; isi bila path melengkung) */
  arrow?: boolean;
  arrowFrom?: [number, number];
  arrowTo?: [number, number];
  /** goresan kedua tipis yang sedikit meleset, khas spidol (default true) */
  double?: boolean;
  fill?: string;
};

/**
 * Garis spidol/kapur tangan: tergambar dari awal ke akhir, bergetar halus (boiling), dengan goresan kedua yang meleset.
 * Untuk panah, isi `arrowFrom`/`arrowTo` (dua titik terakhir arah panah) karena arah ujung path tidak diukur.
 */
export const SketchPath: React.FC<SketchPathProps> = ({
  d, at, dur, color = INK.hitam, width = 7, chalk = false, boil = 4, wobble = 3, seed = 1, steps = 1, exitAt, arrow, arrowFrom, arrowTo, double = true, fill,
}) => {
  const id = `sk${useId().replace(/:/g, '')}`;
  const p = useDrawP(at, dur, 0.6, steps);
  const p2 = clamp01(p * 1.15 - 0.15);
  const out = useExit(exitAt);
  const s = useBoilSeed(boil, seed);
  if (p <= 0 || out <= 0) return null;
  let head: string | null = null;
  if (arrow && arrowFrom && arrowTo) {
    const [x0, y0] = arrowFrom;
    const [x1, y1] = arrowTo;
    const a = Math.atan2(y1 - y0, x1 - x0);
    const L = width * 4.5;
    head = `M${x1 - Math.cos(a + 0.5) * L} ${y1 - Math.sin(a + 0.5) * L} L${x1} ${y1} L${x1 - Math.cos(a - 0.45) * L * 0.9} ${y1 - Math.sin(a - 0.45) * L * 0.9}`;
  }
  const hp = at === undefined ? 1 : clamp01((p - 0.88) / 0.12);
  return (
    <Layer opacity={out * (chalk ? 0.92 : 1)}>
      <defs>
        <SketchFilter id={id} amp={wobble} seed={s} chalk={chalk} />
      </defs>
      <g filter={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {fill ? <path d={d} fill={fill} stroke="none" opacity={clamp01(p * 2 - 1)} /> : null}
        <path d={d} stroke={color} strokeWidth={width} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        {double ? (
          <path d={d} stroke={color} strokeWidth={width * 0.45} opacity={0.55} transform={`translate(${(rnd(seed, 1) - 0.5) * 6} ${(rnd(seed, 2) - 0.5) * 6})`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p2} />
        ) : null}
        {head && hp > 0 ? <path d={head} stroke={color} strokeWidth={width} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - hp} /> : null}
      </g>
    </Layer>
  );
};

export type HatchProps = SketchBase & {
  /** bentuk yang diarsir (path layar). Kosong = kotak `box` */
  d?: string;
  /** kotak pembatas bentuk [x, y, w, h] (px), menentukan panjang dan jumlah garis */
  box: [number, number, number, number];
  /** sudut garis (derajat) */
  angle?: number;
  /** jarak antargaris (px) */
  gap?: number;
  /** arsir silang: set kedua tegak lurus, menyusul setelah set pertama */
  cross?: boolean;
  /** garis tepi bentuk ikut tergambar lebih dulu */
  outline?: boolean;
};

/** Arsiran tangan di dalam bentuk: garis bolak-balik tergambar satu per satu, sedikit miring tidak rata. */
export const Hatch: React.FC<HatchProps> = ({
  d, box, angle = 40, gap = 16, cross = false, outline = true, at, dur, color = INK.hitam, width = 3.5, chalk = false, boil = 4, wobble = 2.5, seed = 4, steps = 1, exitAt,
}) => {
  const uid = useId().replace(/:/g, '');
  const p = useDrawP(at, dur, 1, steps);
  const out = useExit(exitAt);
  const s = useBoilSeed(boil, seed);
  if (p <= 0 || out <= 0) return null;
  const [bx, by, bw, bh] = box;
  const shape = d ?? `M${bx} ${by} H${bx + bw} V${by + bh} H${bx} Z`;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const R = Math.hypot(bw, bh) / 2 + 4;
  const set = (ang: number, k: number) => {
    const n = Math.max(2, Math.ceil((2 * R) / gap));
    return Array.from({ length: n }, (_, i) => {
      const a = ((ang + (rnd(seed + k, i) - 0.5) * 4) * Math.PI) / 180;
      const off = -R + i * gap + (rnd(seed + k, i + 50) - 0.5) * gap * 0.3;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      const ux = Math.cos(a) * R;
      const uy = Math.sin(a) * R;
      const mx = cx + nx * off;
      const my = cy + ny * off;
      const flip = i % 2 === 1 ? -1 : 1; // bolak-balik seperti tangan
      return { d: `M${mx - ux * flip} ${my - uy * flip} L${mx + ux * flip} ${my + uy * flip}`, i, n };
    });
  };
  const outP = outline ? clamp01(p / 0.25) : 1;
  const hp = outline ? clamp01((p - 0.2) / 0.8) : p;
  const lines = (arr: ReturnType<typeof set>, from: number, span: number) =>
    arr.map(({ d: ld, i, n }) => {
      const q = clamp01(((hp - from) / span) * (n + 2) - i);
      return q > 0 ? <path key={i} d={ld} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} /> : null;
    });
  return (
    <Layer opacity={out}>
      <defs>
        <SketchFilter id={`h${uid}`} amp={wobble} seed={s} chalk={chalk} />
        <clipPath id={`c${uid}`}>
          <path d={shape} />
        </clipPath>
      </defs>
      <g filter={`url(#h${uid})`} fill="none" stroke={color} strokeLinecap="round">
        <g clipPath={`url(#c${uid})`} strokeWidth={width} opacity={0.85}>
          {lines(set(angle, 0), 0, cross ? 0.6 : 1)}
          {cross ? lines(set(angle + 90, 7), 0.55, 0.45) : null}
        </g>
        {outline ? <path d={shape} strokeWidth={width * 1.8} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - outP} /> : null}
      </g>
    </Layer>
  );
};

export type SketchTextProps = {
  x: number;
  y: number;
  text: string;
  at?: number;
  /** frame menulis; default 0,08 dtk per huruf */
  dur?: number;
  size?: number;
  color?: string;
  /** perataan terhadap x */
  align?: 'left' | 'center' | 'right';
  rotate?: number;
  /** id font dari registri (default caveat, tulisan tangan) */
  fontId?: string;
  steps?: number;
  exitAt?: number;
};

/** Tulisan tangan yang tertulis dari kiri ke kanan (wipe dengan ujung lunak), sedikit miring. */
export const SketchText: React.FC<SketchTextProps> = ({ x, y, text, at, dur, size = 76, color = INK.hitam, align = 'center', rotate = -1.5, fontId = 'caveat', steps = 2, exitAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fam = font(fontId);
  const D = dur ?? Math.max(8, Math.round(text.length * fps * 0.06));
  const p = at === undefined ? 1 : prog(stepped(f, steps), at, D, EASE.linear);
  const out = useExit(exitAt);
  if (p <= 0 || out <= 0) return null;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  const edge = p * 112 - 6;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) rotate(${rotate}deg)`,
        fontFamily: fam,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        color,
        whiteSpace: 'nowrap',
        // padding: glyph tulisan tangan menjorok keluar kotak teks; tanpa ini mask memotong huruf terakhir
        padding: '0.15em 0.35em',
        opacity: out,
        WebkitMaskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 6}%)`,
        maskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 6}%)`,
      }}
    >
      {text}
    </div>
  );
};
