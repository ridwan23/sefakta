import React from 'react';
import { Easing, interpolate } from 'remotion';
import { font } from '../../shared/brand/fonts';

/** Palet episode "Gelap ke terang": biru malam gelap + matahari kuning menyala. */
export const C = {
  bg: '#081736',
  bg2: '#0D2250',
  panel: '#122B5E',
  sun: '#FFB000',
  sunSoft: '#FFD34D',
  cream: '#FFF3D6',
  white: '#FFFFFF',
  ink: '#FFFFFF',
  dim: '#B9C6DE',
  sky: '#7FB3D5',
  leaf: '#2E8B57',
  danger: '#FF6B4A',
  ok: '#4ADE80',
};

export const DISPLAY = font('space-grotesk');
export const TEXT = font('plus-jakarta-sans');

/** 0 → 1 dengan easing (default out cubic). */
export const ramp = (f: number, at: number, dur: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
/** 0 → 1 dengan overshoot (masuk pop). */
export const pop = (f: number, at: number, dur = 14) =>
  interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
/** 1 → 0 (keluar). */
export const fade = (f: number, at: number, dur: number) => 1 - ramp(f, at, dur);

/** Teks SVG terpusat di (x, y) — y = garis dasar. */
export const Txt: React.FC<{
  x: number; y: number; text: string; size: number; color?: string; weight?: number;
  o?: number; spacing?: number; display?: boolean; anchor?: 'middle' | 'start' | 'end';
}> = ({ x, y, text, size, color = C.white, weight = 700, o = 1, spacing, display, anchor = 'middle' }) => (
  <text
    x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight}
    fill={color} opacity={o} letterSpacing={spacing}
    fontFamily={display ? DISPLAY : TEXT}
  >
    {text}
  </text>
);

/** Pil/kartu label terpusat. */
export const Tag: React.FC<{
  x: number; y: number; w: number; h: number; t: number; fill?: string; stroke?: string;
  dashed?: boolean; children: React.ReactNode;
}> = ({ x, y, w, h, t, fill = C.panel, stroke = C.sun, dashed, children }) =>
  t <= 0 ? null : (
    <g opacity={Math.min(1, t)} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * t})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={5} strokeDasharray={dashed ? '14 10' : undefined} />
      {children}
    </g>
  );

/** Matahari: bola + sinar yang berputar pelan + pendaran. */
export const Sun: React.FC<{ x: number; y: number; r: number; t?: number; rot?: number; rays?: number }> = ({
  x, y, r, t = 1, rot = 0, rays = 12,
}) => {
  if (t <= 0) return null;
  const rayLen = r * 0.55;
  return (
    <g opacity={Math.min(1, t)} transform={`translate(${x} ${y})`}>
      <circle r={r * 1.9} fill={C.sun} opacity={0.14 * t} />
      <circle r={r * 1.35} fill={C.sun} opacity={0.22 * t} />
      <g transform={`rotate(${rot})`}>
        {Array.from({ length: rays }, (_, i) => {
          const a = (i / rays) * Math.PI * 2;
          const x1 = Math.cos(a) * (r + 14);
          const y1 = Math.sin(a) * (r + 14);
          const x2 = Math.cos(a) * (r + 14 + rayLen);
          const y2 = Math.sin(a) * (r + 14 + rayLen);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.sunSoft} strokeWidth={10} strokeLinecap="round" />;
        })}
      </g>
      <circle r={r} fill={C.sun} />
      <circle r={r * 0.72} fill={C.sunSoft} />
    </g>
  );
};

/** Siluet orang sederhana: kepala + bahu. `s` = skala (1 ≈ tinggi 300 px). */
export const Person: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number; tilt?: number }> = ({
  x, y, s = 1, color = C.white, o = 1, tilt = 0,
}) => (
  <g opacity={o} transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <circle cx={0} cy={-95} r={62} fill={color} />
    <path d="M -120 110 Q -118 -18 0 -18 Q 118 -18 120 110 Z" fill={color} />
  </g>
);

/** Kepala skematik (menghadap kanan): tengkorak lingkaran + hidung baji + mata + otak.
 *  Geometri sengaja sederhana agar terbaca di ponsel: mata (640,660), otak (480,640),
 *  ujung hidung (800,780) pada posisi x=540, y=740, s=1. */
export const HeadProfile: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={C.white} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    {/* tengkorak */}
    <circle cx={-40} cy={0} r={250} />
    {/* hidung: baji dari tepi lingkaran */}
    <path d="M 180 -40 L 260 40 L 175 60 Z" />
    {/* leher */}
    <path d="M -120 235 L -120 340 M 40 235 L 40 340" />
    {/* mata */}
    <ellipse cx={100} cy={-80} rx={36} ry={22} fill={C.white} stroke="none" />
    <circle cx={108} cy={-80} r={11} fill={C.bg} stroke="none" />
    {/* otak: lingkaran putus-putus, terpisah jelas dari mata */}
    <circle cx={-60} cy={-100} r={78} stroke={C.sunSoft} strokeWidth={5} strokeDasharray="14 10" />
  </g>
);

/** Mobil sederhana (tampak samping) untuk scene dampak. */
export const Car: React.FC<{ x: number; y: number; s?: number; o?: number; tilt?: number }> = ({ x, y, s = 1, o = 1, tilt = 0 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M -150 30 L -130 -30 Q -120 -55 -85 -58 L -55 -110 Q -45 -125 -20 -125 L 60 -125 Q 85 -125 100 -105 L 135 -58 Q 165 -55 170 -30 L 165 30 Z" fill={C.sun} stroke={C.bg} strokeWidth={5} />
    <path d="M -40 -108 L 45 -108 L 75 -60 L -55 -60 Z" fill={C.sky} opacity={0.9} />
    <circle cx={5} cy={-88} r={17} fill="#0D2250" />
    <circle cx={-95} cy={32} r={30} fill={C.bg} stroke={C.white} strokeWidth={6} />
    <circle cx={95} cy={32} r={30} fill={C.bg} stroke={C.white} strokeWidth={6} />
  </g>
);

/** Terowongan: lengkung gelap di kiri frame. */
export const Tunnel: React.FC<{ x: number; y: number; w: number; h: number; o?: number }> = ({ x, y, w, h, o = 1 }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} fill="#04101F" />
    <path d={`M ${x} ${y + h} L ${x} ${y + 90} Q ${x + w / 2} ${y - 60} ${x + w} ${y + 90} L ${x + w} ${y + h} Z`} fill="#0A1E42" stroke={C.sky} strokeWidth={6} />
    <path d={`M ${x + 26} ${y + h} L ${x + 26} ${y + 110} Q ${x + w / 2} ${y + 10} ${x + w - 26} ${y + 110} L ${x + w - 26} ${y + h} Z`} fill="none" stroke={C.dim} strokeWidth={4} strokeDasharray="18 14" />
  </g>
);

/** Kacamata hitam sederhana. */
export const Glasses: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 1, rot = 0 }) =>
  t <= 0 ? null : (
    <g opacity={Math.min(1, t)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-170} y={-52} width={150} height={104} rx={44} fill="#10131C" stroke={C.sun} strokeWidth={6} />
      <rect x={20} y={-52} width={150} height={104} rx={44} fill="#10131C" stroke={C.sun} strokeWidth={6} />
      <path d="M -20 0 Q 0 -26 20 0" fill="none" stroke={C.sun} strokeWidth={7} />
      <line x1={-170} y1={-10} x2={-215} y2={-28} stroke={C.sun} strokeWidth={7} strokeLinecap="round" />
      <line x1={170} y1={-10} x2={215} y2={-28} stroke={C.sun} strokeWidth={7} strokeLinecap="round" />
      <line x1={-140} y1={-30} x2={-60} y2={10} stroke={C.white} strokeWidth={8} strokeLinecap="round" opacity={0.55} />
      <line x1={50} y1={-30} x2={130} y2={10} stroke={C.white} strokeWidth={8} strokeLinecap="round" opacity={0.55} />
    </g>
  );

/** Partikel cahaya/debu yang melayang — latar tetap hidup. */
export const Motes: React.FC<{ f: number; n?: number; seed?: number }> = ({ f, n = 26, seed = 7 }) => {
  const pts: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const px = ((seed * 137 + i * 389) % 1000) + 40;
    const py = ((seed * 211 + i * 571) % 1150) + 220;
    const drift = Math.sin((f + i * 40) / 55) * 14;
    const tw = 0.35 + 0.3 * Math.sin((f + i * 23) / 30);
    const r = 3 + ((i * 7) % 4);
    pts.push(<circle key={i} cx={px + drift} cy={py + Math.sin((f + i * 31) / 70) * 10} r={r} fill={i % 3 === 0 ? C.sunSoft : C.white} opacity={tw} />);
  }
  return <g>{pts}</g>;
};
