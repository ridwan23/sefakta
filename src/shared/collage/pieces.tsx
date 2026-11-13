// Potongan kolase: permukaan kertas, potongan (tepi sobek, halftone), dokumen, stempel, tag, selotip, klip.
// Semua diposisikan absolut di layar (x, y = pusat) dan masuk dengan gerak kertas bila `at` diisi.
//
//   <PaperSurface />                                                     // lapisan paling bawah (krem)
//   <Cutout x={540} y={760} w={620} h={420} rotate={-3} at={q.foto} halftone={0.5} image={staticFile('…')} />
//   <Doc x={540} y={1100} w={600} keyLine="Kalimat kunci" highlightAt={q.baris} at={q.dok} />
//   <Stamp x={760} y={600} text="TERBUKTI" at={q.cap} />
import React, { useId } from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, impact, prog } from '../anim/core';
import { darken, lighten } from '../look/color';
import { clamp01 } from '../motion';
import { paperIn, rnd, tornRectPath, type Edge } from './paper';

export const PAPER = {
  krem: '#F3EBDD',
  kraft: '#C8A97E',
  koran: '#F1ECE0',
  karton: '#FFF8EB',
  tinta: '#1B1B1B',
  stabilo: '#F7E14B',
  merah: '#D33A2C',
  teal: '#2F7F86',
} as const;

/** Serat kertas statis (feTurbulence), dipakai sebagai overlay di permukaan dan potongan. */
const Fiber: React.FC<{ opacity?: number; seed?: number; freq?: number }> = ({ opacity = 0.18, seed = 4, freq = 0.75 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity, pointerEvents: 'none' }}>
      <filter id={`f${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency={`${freq} ${freq * 0.25}`} numOctaves={3} seed={seed} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 -1.1 1.05" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#f${id})`} />
    </svg>
  );
};

export type PaperSurfaceProps = {
  /** warna kertas (default krem) */
  color?: string;
  /** kekuatan serat 0..1 */
  fiber?: number;
  /** gelap di tepi 0..1 */
  vignette?: number;
};

/** Permukaan kertas/karton bertekstur, pengganti Backdrop untuk gaya kolase dan potongan kertas. */
export const PaperSurface: React.FC<PaperSurfaceProps> = ({ color = PAPER.krem, fiber = 0.5, vignette = 0.35 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 40% 30%, ${lighten(color, 0.08)} 0%, ${color} 55%, ${darken(color, 0.06)} 100%)` }}>
    <Fiber opacity={0.35 * fiber} seed={7} freq={0.6} />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 260px rgba(60,40,15,${0.45 * vignette})`, pointerEvents: 'none' }} />
  </AbsoluteFill>
);

type Placed = {
  x: number;
  y: number;
  rotate?: number;
  /** frame masuk (gerak kertas); kosong = sudah menempel */
  at?: number;
  /** variasi bentuk/arah; ganti agar potongan sejenis tidak kembar */
  seed?: number;
  from?: 'top' | 'left' | 'right' | 'bottom';
};

export type CutoutProps = Placed & {
  w: number;
  h: number;
  color?: string;
  /** sisi yang sobek (default semua); [] = potongan gunting rapi */
  torn?: Edge[];
  rough?: number;
  /** tepi putih seperti foto cetak (px) */
  border?: number;
  /** pola titik halftone di atas isi, 0..1 */
  halftone?: number;
  /** gambar isi (staticFile); diberi grayscale ringan bila `halftone` */
  image?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/** Potongan kertas/foto: tepi sobek, serat, bayangan lembut yang mengecil saat menempel. */
export const Cutout: React.FC<CutoutProps> = ({
  x, y, w, h, rotate = 0, at, seed = 1, from, color = PAPER.karton, torn, rough = 7, border = 0, halftone = 0, image, children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = paperIn(frame, at, fps, seed, rotate, from);
  if (!m.visible) return null;
  const clip = tornRectPath(w, h, seed, torn, rough);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: m.transform, opacity: m.opacity, filter: m.filter, ...style }}>
      <div style={{ position: 'absolute', inset: 0, clipPath: `path('${clip}')`, background: color, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: border, overflow: 'hidden' }}>
          {image ? <Img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: halftone ? `grayscale(${0.6 + 0.4 * halftone}) contrast(1.15)` : undefined }} /> : null}
          {children}
          {halftone ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(20,15,10,0.55) 0 1.6px, transparent 2.1px)',
                backgroundSize: '7px 7px',
                mixBlendMode: 'multiply',
                opacity: halftone,
              }}
            />
          ) : null}
        </div>
        <Fiber opacity={0.22} seed={seed + 2} />
      </div>
    </div>
  );
};

export type DocProps = Placed & {
  w: number;
  /** jumlah baris samar */
  lines?: number;
  /** satu-satunya baris yang terbaca */
  keyLine?: string;
  /** posisi baris kunci (indeks baris) */
  keyIndex?: number;
  /** frame stabilo menyapu baris kunci */
  highlightAt?: number;
  title?: string;
  color?: string;
  ink?: string;
};

/** Dokumen: judul, baris-baris samar, dan satu baris kunci yang terbaca (opsional disorot stabilo). */
export const Doc: React.FC<DocProps> = ({ w, lines = 9, keyLine, keyIndex = 4, highlightAt, title, color = PAPER.koran, ink = PAPER.tinta, seed = 2, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lh = 34;
  const h = 70 + (title ? 60 : 0) + lines * lh + 40;
  const hp = highlightAt === undefined ? 0 : prog(frame, highlightAt, Math.round(fps * 0.5), EASE.inOut);
  return (
    <Cutout {...rest} seed={seed} w={w} h={h} color={color} torn={['bottom']} rough={9}>
      <div style={{ position: 'absolute', left: 48, right: 48, top: 48, color: ink }}>
        {title ? <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28, opacity: 0.85 }}>{title}</div> : null}
        {Array.from({ length: lines }, (_, i) =>
          keyLine && i === keyIndex ? (
            <div key={i} style={{ position: 'relative', height: lh, display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: -8, top: 4, height: lh - 8, width: `calc(${(hp * 100).toFixed(1)}% + 16px)`, background: PAPER.stabilo, opacity: hp > 0 ? 0.8 : 0, mixBlendMode: 'multiply', borderRadius: 4 }} />
              <div style={{ position: 'relative', fontWeight: 700, fontSize: 26, whiteSpace: 'nowrap' }}>{keyLine}</div>
            </div>
          ) : (
            <div key={i} style={{ height: lh, display: 'flex', alignItems: 'center' }}>
              <div style={{ height: 10, borderRadius: 5, background: ink, opacity: 0.16, width: `${(i === lines - 1 ? 45 : 72 + rnd(seed, i) * 28).toFixed(0)}%` }} />
            </div>
          ),
        )}
      </div>
    </Cutout>
  );
};

export type StampProps = { x: number; y: number; text: string; at?: number; color?: string; rotate?: number; size?: number; seed?: number };

/** Stempel tinta: menghantam (skala besar → 1, guncang), tinta tidak rata. */
export const Stamp: React.FC<StampProps> = ({ x, y, text, at, color = PAPER.merah, rotate = -8, size = 44, seed = 5 }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : prog(frame, at, 6, EASE.in);
  const j = at === undefined ? { x: 0, y: 0, r: 0 } : impact(frame, at + 6, 6, 10, seed);
  const w = Math.max(size * 3, text.length * size * 0.72 + size * 1.4);
  const h = size * 2;
  const s = 1 + (1 - p) * 0.8;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, overflow: 'visible', transform: `translate(${j.x}px, ${j.y}px) rotate(${rotate + j.r}deg) scale(${s})`, opacity: clamp01(p * 1.5) * 0.92, mixBlendMode: 'multiply' }}
    >
      <defs>
        <filter id={`t${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.45" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#t${id})`} fill="none" stroke={color}>
        <rect x={4} y={4} width={w - 8} height={h - 8} rx={size * 0.3} strokeWidth={size * 0.14} />
        <rect x={size * 0.28} y={size * 0.28} width={w - size * 0.56} height={h - size * 0.56} rx={size * 0.18} strokeWidth={size * 0.05} />
        <text x={w / 2} y={h / 2 + size * 0.36} textAnchor="middle" fill={color} stroke="none" fontFamily="inherit" fontWeight={900} fontSize={size} letterSpacing={size * 0.08}>
          {text}
        </text>
      </g>
    </svg>
  );
};

export type TagProps = Placed & { text: string; color?: string; ink?: string; size?: number };

/** Label gantung (tag bertali): masuk lalu berayun sebentar dari lubang talinya. */
export const Tag: React.FC<TagProps> = ({ x, y, text, at, rotate = -6, color = PAPER.karton, ink = PAPER.tinta, size = 34, seed = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at !== undefined && frame < at) return null;
  const f = at === undefined ? 1e3 : frame - at;
  const swing = Math.exp(-f / 14) * Math.sin(f / 3.2) * 14 * (rnd(seed, 1) > 0.5 ? 1 : -1);
  const drop = at === undefined ? 1 : prog(frame, at, Math.round(fps * 0.3), EASE.out);
  const w = text.length * size * 0.62 + size * 2.4;
  const h = size * 1.9;
  const d = `M${h * 0.45} 0 H${w} V${h} H${h * 0.45} L0 ${h / 2} Z`;
  return (
    <svg
      width={w + 40}
      height={h}
      viewBox={`-40 0 ${w + 40} ${h}`}
      style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, overflow: 'visible', transformOrigin: `${size * 0.9 + 40}px 50%`, transform: `translateY(${(1 - drop) * -40}px) rotate(${rotate + swing}deg)`, opacity: clamp01(drop * 2), filter: 'drop-shadow(0 5px 6px rgba(45,30,12,0.25))' }}
    >
      <path d={`M${size * 0.9} ${h / 2} C${size * 0.2} ${h / 2 - 20} -20 ${h / 2 + 30} -40 ${h / 2 - 10}`} stroke="#8A6A45" strokeWidth={3} fill="none" />
      <path d={d} fill={color} />
      <path d={d} fill="none" stroke={darken(color, 0.12)} strokeWidth={2} />
      <circle cx={size * 0.9} cy={h / 2} r={size * 0.2} fill={darken(color, 0.25)} />
      <text x={size * 1.5} y={h / 2 + size * 0.36} fill={ink} fontFamily="inherit" fontWeight={800} fontSize={size}>
        {text}
      </text>
    </svg>
  );
};

export type TapeProps = { x: number; y: number; w?: number; rotate?: number; at?: number; color?: string; seed?: number };

/** Selotip kertas bening: ujung bergerigi, ditempel dengan sapuan cepat. Taruh setelah potongan yang ditempel. */
export const Tape: React.FC<TapeProps> = ({ x, y, w = 160, rotate = -12, at, color = '#F4E6B0', seed = 8 }) => {
  const frame = useCurrentFrame();
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : prog(frame, at, 7, EASE.out);
  const h = w * 0.3;
  const d = tornRectPath(w, h, seed, ['left', 'right'], 6, 6);
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, overflow: 'visible', transform: `rotate(${rotate}deg) scaleX(${p})`, transformOrigin: '0 50%', opacity: 0.78, filter: 'drop-shadow(0 1px 1.5px rgba(45,30,12,0.2))' }}>
      <path d={d} fill={color} />
      <rect x={0} y={h * 0.18} width={w} height={h * 0.16} fill="#fff" opacity={0.35} />
    </svg>
  );
};

export type PaperClipProps = { x: number; y: number; size?: number; rotate?: number; at?: number; color?: string };

/** Klip kertas kawat logam. Masuk dengan meluncur turun singkat. */
export const PaperClip: React.FC<PaperClipProps> = ({ x, y, size = 60, rotate = 8, at, color = '#9AA3AE' }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : prog(frame, at, 8, EASE.out);
  const w = size;
  const h = size * 2.6;
  const d = `M${w * 0.62} ${h * 0.3} V${h * 0.78} a${w * 0.17} ${w * 0.17} 0 0 1 ${-w * 0.34} 0 V${h * 0.16} a${w * 0.29} ${w * 0.29} 0 0 1 ${w * 0.58} 0 V${h * 0.84} a${w * 0.4} ${w * 0.4} 0 0 1 ${-w * 0.8} 0 V${h * 0.3}`;
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, overflow: 'visible', transform: `translateY(${(1 - p) * -30}px) rotate(${rotate}deg)`, opacity: clamp01(p * 2), filter: 'drop-shadow(1px 3px 2px rgba(45,30,12,0.3))' }}>
      <defs>
        <linearGradient id={`m${id}`} x1={0} x2={1}>
          <stop offset={0} stopColor={lighten(color, 0.45)} />
          <stop offset={0.5} stopColor={color} />
          <stop offset={1} stopColor={darken(color, 0.3)} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#m${id})`} strokeWidth={size * 0.075} strokeLinecap="round" />
    </svg>
  );
};
