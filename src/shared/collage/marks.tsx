// Anotasi spidol/stabilo: tergambar goresan demi goresan, garis tangan sedikit bergoyang (stabil per seed).
// Koordinat layar (px). Taruh setelah teks/dokumen yang dianotasi.
//
//   <Highlighter x={180} y={1010} w={520} at={q.baris} />          // sapuan stabilo multiply
//   <MarkerCircle x={540} y={800} rx={220} ry={90} at={q.ini} />    // lingkaran spidol
//   <Underline x={200} y={1100} w={420} at={q.kata} double />
//   <MarkerArrow from={[300, 600]} to={[520, 780]} at={q.lihat} />
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, noise1, prog } from '../anim/core';
import { PAPER } from './pieces';
import { rnd, smoothPath } from './paper';

const Layer: React.FC<{ children: React.ReactNode; blend?: React.CSSProperties['mixBlendMode']; opacity?: number }> = ({ children, blend, opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', mixBlendMode: blend, opacity }}>
      {children}
    </svg>
  );
};

/** Garis tangan dengan progres gambar 0..1. */
const Stroke: React.FC<{ d: string; p: number; color: string; width: number; cap?: 'round' | 'butt' }> = ({ d, p, color, width, cap = 'round' }) =>
  p <= 0 ? null : <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap={cap} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;

type Mark = { at?: number; dur?: number; color?: string; seed?: number };

const useDraw = (at: number | undefined, dur: number | undefined, def: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return at === undefined ? 1 : prog(f, at, dur ?? Math.round(fps * def), EASE.inOut);
};

export type HighlighterProps = Mark & { x: number; y: number; w: number; h?: number };

/** Sapuan stabilo tidak rata (multiply), dari kiri ke kanan. `y` = tengah sapuan. */
export const Highlighter: React.FC<HighlighterProps> = ({ x, y, w, h = 44, at, dur, color = PAPER.stabilo, seed = 1 }) => {
  const p = useDraw(at, dur, 0.45);
  const tilt = (rnd(seed, 1) - 0.5) * 8;
  const pts = (off: number, s: number): [number, number][] =>
    Array.from({ length: 6 }, (_, i) => [x - 6 + ((w + 12) * i) / 5, y + off + (tilt * i) / 5 + (rnd(seed + s, i) - 0.5) * 5]);
  return (
    <Layer blend="multiply" opacity={0.85}>
      <Stroke d={smoothPath(pts(0, 0))} p={p} color={color} width={h} cap="butt" />
      <Stroke d={smoothPath(pts(h * 0.28, 9))} p={p} color={color} width={h * 0.35} cap="butt" />
    </Layer>
  );
};

export type MarkerCircleProps = Mark & { x: number; y: number; rx: number; ry?: number; width?: number };

/** Lingkaran spidol tangan: mulai di kiri atas, melewati titik awal sedikit (overshoot), radius bergoyang. */
export const MarkerCircle: React.FC<MarkerCircleProps> = ({ x, y, rx, ry, width = 9, at, dur, color = PAPER.merah, seed = 2 }) => {
  const p = useDraw(at, dur, 0.6);
  const r2 = ry ?? rx;
  const a0 = -2.2 + rnd(seed, 1) * 0.4;
  const span = Math.PI * 2 + 0.45;
  const n = 28;
  const pts: [number, number][] = Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const a = a0 + span * u;
    const k = 1 + noise1(u * 3, seed) * 0.06 + u * 0.07;
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * r2 * k];
  });
  return (
    <Layer>
      <Stroke d={smoothPath(pts)} p={p} color={color} width={width} />
    </Layer>
  );
};

export type UnderlineProps = Mark & { x: number; y: number; w: number; width?: number; double?: boolean };

/** Garis bawah spidol, opsional dua garis (garis kedua menyusul). */
export const Underline: React.FC<UnderlineProps> = ({ x, y, w, width = 8, double, at, dur, color = PAPER.merah, seed = 3 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = dur ?? Math.round(fps * 0.35);
  const p1 = at === undefined ? 1 : prog(f, at, d, EASE.inOut);
  const p2 = at === undefined ? 1 : prog(f, at + d, d, EASE.inOut);
  const line = (dy: number, s: number) =>
    smoothPath(Array.from({ length: 5 }, (_, i) => [x + (w * i) / 4 + (i === 0 ? 0 : (rnd(seed + s, i) - 0.5) * 6), y + dy + (rnd(seed + s, i + 9) - 0.5) * 6 - i * 1.5]));
  return (
    <Layer>
      <Stroke d={line(0, 0)} p={p1} color={color} width={width} />
      {double ? <Stroke d={line(width * 2, 5)} p={p2} color={color} width={width * 0.8} /> : null}
    </Layer>
  );
};

export type MarkerArrowProps = Mark & { from: [number, number]; to: [number, number]; bend?: number; width?: number };

/** Panah spidol melengkung: batang tergambar, lalu dua goresan kepala panah. */
export const MarkerArrow: React.FC<MarkerArrowProps> = ({ from, to, bend = 0.25, width = 8, at, dur, color = PAPER.merah }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d0 = dur ?? Math.round(fps * 0.45);
  const p = at === undefined ? 1 : prog(f, at, d0, EASE.inOut);
  const ph = at === undefined ? 1 : prog(f, at + d0 - 2, 6, EASE.out);
  const [x0, y0] = from;
  const [x1, y1] = to;
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend;
  const my = (y0 + y1) / 2 + (x1 - x0) * bend;
  const ang = Math.atan2(y1 - my, x1 - mx);
  const L = 34;
  const head = (s: number) => `M${x1} ${y1} L${x1 - Math.cos(ang + s * 0.5) * L} ${y1 - Math.sin(ang + s * 0.5) * L}`;
  return (
    <Layer>
      <Stroke d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} p={p} color={color} width={width} />
      <Stroke d={head(1)} p={ph} color={color} width={width} />
      <Stroke d={head(-1)} p={ph} color={color} width={width} />
    </Layer>
  );
};
