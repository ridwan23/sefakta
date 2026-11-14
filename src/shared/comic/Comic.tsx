// Gaya komik: halaman bertitik halftone, panel bergaris tebal yang "dicap" masuk satu per satu, balon kata yang
// teksnya muncul kata demi kata, kata efek suara (Bangers) dengan ledakan bintang, dan garis kecepatan yang bergetar.
// Koordinat layar (px), x/y = pusat kecuali disebut lain. Isi panel memakai koordinat lokal panel (0..w, 0..h).
//
//   <ComicPage />
//   {comicGrid({ x: 60, y: 300, w: 960, h: 1300, rows: [[1, 1], [2, 1]] }).map((r, i) => (
//     <ComicPanel key={i} {...r} at={q.panel[i]}>…isi panel…</ComicPanel>
//   ))}
//   <SpeechBubble x={540} y={500} w={520} h={220} tail={[400, 760]} text="Kenapa aku bersin?" at={q.tanya} />
//   <SoundWord x={760} y={900} text="HACHIII!" at={q.bersin} />
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, impact, prog, springAt } from '../anim/core';
import { font } from '../brand/fonts';
import { clamp01, hash } from '../motion';

export const COMIC = {
  kertas: '#FFF6E0',
  tinta: '#141414',
  merah: '#E63946',
  kuning: '#FFD23F',
  biru: '#2B7DE9',
  cyan: '#7FD8F5',
  hijau: '#3BB273',
  kulit: '#F4C7A1',
} as const;

const rnd = (seed: number, i: number) => hash(seed * 41.3 + i * 17.9 + 0.75);

export const comicFonts = () => ({ sfx: font('bangers'), text: font('comic-neue') });

// ---------------------------------------------------------------- halftone

export type HalftoneProps = {
  color?: string;
  /** jarak antar-titik (px) */
  size?: number;
  /** ukuran titik maks. relatif jarak, 0..1 */
  dot?: number;
  angle?: number;
  /** pudar: none = rata; radial = penuh di pusat → hilang ke tepi; down = penuh di bawah */
  fade?: 'none' | 'radial' | 'down' | 'up';
  opacity?: number;
  style?: React.CSSProperties;
};

/** Titik halftone ala cetak komik (Ben-Day). Isi parent (position absolute, inset 0). */
export const Halftone: React.FC<HalftoneProps> = ({ color = COMIC.tinta, size = 18, dot = 0.42, angle = 45, fade = 'none', opacity = 0.18, style }) => {
  const id = useId().replace(/:/g, '');
  const grad =
    fade === 'radial'
      ? 'radial-gradient(closest-side, #000 0%, #000 35%, transparent 100%)'
      : fade === 'down'
        ? 'linear-gradient(to bottom, transparent 0%, #000 100%)'
        : fade === 'up'
          ? 'linear-gradient(to top, transparent 0%, #000 100%)'
          : undefined;
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none', ...(grad ? { maskImage: grad, WebkitMaskImage: grad } : {}), ...style }}
    >
      <pattern id={`h${id}`} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
        <circle cx={size / 2} cy={size / 2} r={(size / 2) * dot * 1.4} fill={color} />
      </pattern>
      <rect width="100%" height="100%" fill={`url(#h${id})`} />
    </svg>
  );
};

/** Latar halaman komik: kertas krem, halftone samar, dan bayangan tepi. */
export const ComicPage: React.FC<{ color?: string; dots?: string }> = ({ color = COMIC.kertas, dots = COMIC.merah }) => (
  <AbsoluteFill style={{ background: color }}>
    <Halftone color={dots} size={22} opacity={0.12} fade="radial" />
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 200px rgba(80,50,10,0.18)' }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- grid & panel

export type PanelRect = { x: number; y: number; w: number; h: number };

/** Bagi area menjadi panel. `rows` = daftar baris, tiap baris = bobot lebar panel; `heights` = bobot tinggi baris. */
export const comicGrid = (o: { x: number; y: number; w: number; h: number; rows: number[][]; heights?: number[]; gutter?: number }): PanelRect[] => {
  const g = o.gutter ?? 26;
  const hw = o.heights ?? o.rows.map(() => 1);
  const hs = hw.reduce((a, b) => a + b, 0);
  const innerH = o.h - g * (o.rows.length - 1);
  const out: PanelRect[] = [];
  let y = o.y;
  o.rows.forEach((row, ri) => {
    const rh = (innerH * hw[ri]) / hs;
    const ws = row.reduce((a, b) => a + b, 0);
    const innerW = o.w - g * (row.length - 1);
    let x = o.x;
    row.forEach((wt) => {
      const pw = (innerW * wt) / ws;
      out.push({ x, y, w: pw, h: rh });
      x += pw + g;
    });
    y += rh + g;
  });
  return out;
};

export type ComicPanelProps = PanelRect & {
  /** frame panel dicap masuk; tanpa `at` = sudah ada */
  at?: number;
  color?: string;
  border?: number;
  rotate?: number;
  /** titik halftone di latar panel (warna) */
  dots?: string;
  /** kamera di dalam panel: zoom pelan 1 → zoomTo selama panel tampil */
  zoomTo?: number;
  children?: React.ReactNode;
};

/** Panel komik: garis tinta tebal, bayangan offset, masuk dengan "cap" (membesar sedikit lalu menekan). Isi terpotong
 *  di dalam panel dan memakai koordinat lokal (0..w, 0..h). */
export const ComicPanel: React.FC<ComicPanelProps> = ({ x, y, w, h, at, color = '#FFFFFF', border = 9, rotate = 0, dots, zoomTo = 1, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : springAt(frame, at, fps, { damping: 12, stiffness: 170 });
  const s = 1.08 - 0.08 * p;
  const z = 1 + (zoomTo - 1) * clamp01(at === undefined ? 1 : (frame - at) / (fps * 4));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg) scale(${s.toFixed(4)})`,
        opacity: clamp01(p * 3),
        background: color,
        border: `${border}px solid ${COMIC.tinta}`,
        boxShadow: `${border}px ${border}px 0 ${COMIC.tinta}`,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'absolute', left: -border, top: -border, width: w, height: h, transform: `scale(${z.toFixed(4)})` }}>
        {dots ? <Halftone color={dots} size={16} opacity={0.35} fade="radial" /> : null}
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- garis kecepatan & ledakan

export type SpeedLinesProps = {
  cx: number;
  cy: number;
  at?: number;
  color?: string;
  count?: number;
  /** jari-jari kosong di tengah */
  inner?: number;
  outer?: number;
  seed?: number;
  /** ganti pola tiap n frame (garis "bergetar") */
  rate?: number;
};

/** Garis aksi radial (fokus/kejutan). Pola berganti tiap `rate` frame seperti gambar tangan. */
export const SpeedLines: React.FC<SpeedLinesProps> = ({ cx, cy, at, color = COMIC.tinta, count = 46, inner = 260, outer = 1400, seed = 3, rate = 3 }) => {
  const frame = useCurrentFrame();
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : prog(frame, at, 8, EASE.out);
  const k = seed + (Math.floor(frame / rate) % 3) * 7;
  const tris = Array.from({ length: count }, (_, i) => {
    const a = ((i + rnd(k, i) * 0.6) / count) * Math.PI * 2;
    const wd = 0.008 + rnd(k, i + 50) * 0.022;
    const r0 = inner * (0.8 + rnd(k, i + 90) * 0.6) + (1 - p) * 300;
    const p1 = [cx + Math.cos(a - wd) * outer, cy + Math.sin(a - wd) * outer];
    const p2 = [cx + Math.cos(a + wd) * outer, cy + Math.sin(a + wd) * outer];
    const p0 = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0];
    return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z`;
  });
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', opacity: p }}>
      <path d={tris.join('')} fill={color} />
    </svg>
  );
};

const burstPath = (r: number, spikes: number, depth: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r * (0.9 + rnd(seed, i) * 0.2) : r * (1 - depth) * (0.85 + rnd(seed, i) * 0.3);
    pts.push(`${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * 0.78).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};

/** Ledakan bintang (latar kata efek suara atau label "BARU!"). */
export const ComicBurst: React.FC<{ x: number; y: number; r?: number; at?: number; color?: string; spikes?: number; seed?: number; rotate?: number; children?: React.ReactNode }> = ({
  x, y, r = 220, at, color = COMIC.kuning, spikes = 13, seed = 2, rotate = -6, children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : springAt(frame, at, fps, { damping: 9, stiffness: 220 });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${rotate}deg) scale(${p.toFixed(4)})` }}>
      <svg width={r * 2.4} height={r * 2.4} viewBox={`${-r * 1.2} ${-r * 1.2} ${r * 2.4} ${r * 2.4}`} style={{ position: 'absolute', left: -r * 1.2, top: -r * 1.2, overflow: 'visible' }}>
        <path d={burstPath(r, spikes, 0.32, seed)} fill={COMIC.tinta} transform="translate(12 12)" />
        <path d={burstPath(r, spikes, 0.32, seed)} fill={color} stroke={COMIC.tinta} strokeWidth={8} strokeLinejoin="round" />
      </svg>
      {children ? <div style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)' }}>{children}</div> : null}
    </div>
  );
};

// ---------------------------------------------------------------- kata efek suara

export type SoundWordProps = {
  x: number;
  y: number;
  text: string;
  at?: number;
  size?: number;
  color?: string;
  rotate?: number;
  /** latar ledakan bintang (warna) */
  burst?: string;
  /** getar setelah muncul (px) */
  shake?: number;
};

/** Kata efek suara (BRAK!, HACHIII!) berhuruf Bangers: garis tinta tebal, bayangan 3D, masuk melontar lalu bergetar. */
export const SoundWord: React.FC<SoundWordProps> = ({ x, y, text, at, size = 150, color = COMIC.merah, rotate = -8, burst, shake = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { sfx } = comicFonts();
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : springAt(frame, at, fps, { damping: 8, stiffness: 240 });
  const j = at === undefined ? { x: 0, y: 0, r: 0 } : impact(frame, at + 4, shake, 16, 5);
  const word = (
    <div
      style={{
        fontFamily: sfx,
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: size * 0.03,
        whiteSpace: 'nowrap',
        WebkitTextStroke: `${Math.round(size * 0.07)}px ${COMIC.tinta}`,
        paintOrder: 'stroke fill',
        textShadow: Array.from({ length: 6 }, (_, i) => `${(i + 1) * size * 0.012}px ${(i + 1) * size * 0.012}px 0 ${COMIC.tinta}`).join(','),
      }}
    >
      {text}
    </div>
  );
  return (
    <>
      {burst ? <ComicBurst x={x} y={y} r={size * 1.45} at={at} color={burst} rotate={rotate * 0.5} /> : null}
      <div
        style={{
          position: 'absolute',
          left: x + j.x,
          top: y + j.y,
          transform: `translate(-50%, -50%) rotate(${rotate + j.r}deg) scale(${(0.2 + 0.8 * p).toFixed(4)})`,
          opacity: clamp01(p * 4),
        }}
      >
        {word}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- balon kata

const superEllipse = (cx: number, cy: number, a: number, b: number, t: number, n = 2.8): [number, number] => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [cx + a * Math.sign(c) * Math.abs(c) ** (2 / n), cy + b * Math.sign(s) * Math.abs(s) ** (2 / n)];
};

/** Path balon + ekor sebagai satu garis tertutup (tanpa garis sambungan di pangkal ekor). Koordinat lokal 0..w, 0..h. */
const bubblePath = (w: number, h: number, tail: [number, number] | undefined, kind: 'speech' | 'shout', seed: number) => {
  const cx = w / 2;
  const cy = h / 2;
  const a = w / 2;
  const b = h / 2;
  const N = kind === 'shout' ? 34 : 72;
  const ta = tail ? Math.atan2((tail[1] - cy) / b, (tail[0] - cx) / a) : 0;
  const gap = 0.2;
  const pts: string[] = [];
  const start = tail ? ta + gap : 0;
  const span = tail ? Math.PI * 2 - gap * 2 : Math.PI * 2;
  for (let i = 0; i <= N; i++) {
    const t = start + (span * i) / N;
    const k = kind === 'shout' ? (i % 2 === 0 ? 1.12 + rnd(seed, i) * 0.1 : 0.9) : 1;
    const [px, py] = superEllipse(cx, cy, a * k, b * k, t, kind === 'shout' ? 2.2 : 2.8);
    pts.push(`${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  let d = `M${pts.join('L')}`;
  if (tail) {
    const [ex] = superEllipse(cx, cy, a, b, ta + gap);
    const [mx, my] = [(cx + tail[0]) / 2, (cy + tail[1]) / 2];
    d += `Q${(mx + (ex - cx) * 0.05).toFixed(1)} ${my.toFixed(1)} ${tail[0].toFixed(1)} ${tail[1].toFixed(1)}`;
    d += `Q${mx.toFixed(1)} ${(my + 4).toFixed(1)} ${pts[0]}`;
  }
  return `${d}Z`;
};

export type SpeechBubbleProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  at?: number;
  /** ujung ekor dalam koordinat layar */
  tail?: [number, number];
  /** speech = balon bulat; shout = bergerigi; thought = awan + gelembung; box = kotak narator kuning */
  kind?: 'speech' | 'shout' | 'thought' | 'box';
  size?: number;
  color?: string;
  ink?: string;
  /** frame per kata saat teks muncul (0 = langsung utuh) */
  perWord?: number;
  /** kata yang ditebalkan & diwarnai (indeks) */
  emphasis?: number[];
  emphasisColor?: string;
  seed?: number;
};

/** Balon kata komik. Teks Comic Neue tebal muncul kata demi kata setelah balon "meletup". `w`/`h` menentukan ukuran;
 *  pastikan teks muat (lebar efektif ±75% w untuk speech). */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  x, y, w, h, text, at, tail, kind = 'speech', size = 46, color = '#FFFFFF', ink = COMIC.tinta, perWord = 3, emphasis = [], emphasisColor = COMIC.merah, seed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { text: tf } = comicFonts();
  if (at !== undefined && frame < at) return null;
  const p = at === undefined ? 1 : springAt(frame, at, fps, { damping: 11, stiffness: 200 });
  const left = x - w / 2;
  const top = y - h / 2;
  const lt: [number, number] | undefined = tail ? [tail[0] - left, tail[1] - top] : undefined;
  const words = text.split(/\s+/);
  const shown = at === undefined || perWord <= 0 ? words.length : Math.floor((frame - at - 5) / perWord) + 1;
  const box = kind === 'box';
  const pad = box ? 26 : kind === 'thought' ? w * 0.16 : w * 0.13;
  const origin = lt ? `${((lt[0] / w) * 100).toFixed(1)}% ${((lt[1] / h) * 100).toFixed(1)}%` : '50% 50%';
  let shape: React.ReactNode;
  if (box) {
    shape = <rect x={0} y={0} width={w} height={h} fill={color === '#FFFFFF' ? COMIC.kuning : color} stroke={ink} strokeWidth={6} />;
  } else if (kind === 'thought') {
    const puffs = 11;
    const circles = Array.from({ length: puffs }, (_, i) => {
      const t = (i / puffs) * Math.PI * 2;
      const [px, py] = superEllipse(w / 2, h / 2, w * 0.4, h * 0.36, t, 2);
      return <circle key={i} cx={px} cy={py} r={Math.min(w, h) * (0.2 + rnd(seed, i) * 0.06)} />;
    });
    const trail = lt
      ? [0.35, 0.6, 0.82].map((f, i) => (
          <circle key={`t${i}`} cx={w / 2 + (lt[0] - w / 2) * (0.55 + f * 0.45)} cy={h / 2 + (lt[1] - h / 2) * (0.55 + f * 0.45)} r={22 - i * 6} />
        ))
      : null;
    shape = (
      <>
        <g fill={ink} stroke={ink} strokeWidth={12}>
          {circles}
          <ellipse cx={w / 2} cy={h / 2} rx={w * 0.4} ry={h * 0.36} />
          {trail}
        </g>
        <g fill={color}>
          {circles}
          <ellipse cx={w / 2} cy={h / 2} rx={w * 0.4} ry={h * 0.36} />
          {trail}
        </g>
      </>
    );
  } else {
    shape = <path d={bubblePath(w, h, lt, kind, seed)} fill={color} stroke={ink} strokeWidth={6} strokeLinejoin="round" />;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        height: h,
        transform: `scale(${(0.3 + 0.7 * p).toFixed(4)})`,
        transformOrigin: origin,
        opacity: clamp01(p * 4),
      }}
    >
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {shape}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: `${box ? 18 : h * 0.14}px ${pad}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: box ? 'flex-start' : 'center',
          textAlign: box ? 'left' : 'center',
          fontFamily: tf,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.12,
          color: ink,
          textTransform: 'uppercase',
          boxSizing: 'border-box',
        }}
      >
        <span>
          {words.map((wd, i) => (
            <span key={i} style={{ opacity: i < shown ? 1 : 0, color: emphasis.includes(i) ? emphasisColor : undefined, fontSize: emphasis.includes(i) ? size * 1.15 : undefined }}>
              {wd}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
