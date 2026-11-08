import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import { hash } from '../../shared/motion';

// Gaya "jurnal naturalis lapangan" (lihat visualStyle di briefs/komodo-tanpa-jantan.json).
export const C = {
  paper: '#F1EBDD',
  rule: 'rgba(31,42,30,0.07)',
  ink: '#1F2A1E',
  inkSoft: 'rgba(31,42,30,0.5)',
  green: '#2F6B4F', // komodo, kromosom Z, jantan
  greenSoft: '#B9CDB4',
  terra: '#B4532A', // kromosom W, telur gagal, penekanan
  olive: '#8A8F6A',
  skin: '#8C9070',
  egg: '#F7EFD9',
  sea: '#D7E2DC',
  land: '#E4DCC4',
};
export const HAND = loadCaveat('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;
export const SANS = FONT_JAKARTA;

/** 0→1 dengan easing, mulai `at` selama `len` frame. */
export const ramp = (f: number, at: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
/** Pop dengan sedikit overshoot (ikon, label). */
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));

/** Halaman jurnal: kertas krem, garis bantu halus, margin merah pudar, vinyet. */
export const Journal: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    <svg style={{ position: 'absolute' }} width={1080} height={1920}>
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={0} x2={1080} y1={60 + i * 64} y2={60 + i * 64} stroke={C.rule} strokeWidth={2} />)}
      <line x1={40} x2={40} y1={0} y2={1920} stroke="rgba(180,83,42,0.18)" strokeWidth={3} />
      <filter id="kgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={11} />
        <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.16  0 0 0 0 0.11  0 0 0 0.08 0" />
      </filter>
      <rect width={1080} height={1920} filter="url(#kgrain)" />
    </svg>
    {children}
    <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(60,50,25,0.22) 100%)' }} />
  </AbsoluteFill>
);

/** Label cetak (judul/nama tempat). */
export const Label: React.FC<{ x: number; y: number; text: string; o?: number; size?: number; color?: string; align?: 'left' | 'center' | 'right'; weight?: number }> = ({ x, y, text, o = 1, size = 40, color = C.ink, align = 'center', weight = 800 }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, -50%)`, opacity: o, fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: size * 0.06, color, whiteSpace: 'pre', textAlign: align, lineHeight: 1.1, textShadow: `0 0 10px ${C.paper}, 0 0 4px ${C.paper}` }}>
    {text}
  </div>
);

/** Catatan tulisan tangan naturalis. */
export const Note: React.FC<{ x: number; y: number; text: string; o?: number; size?: number; color?: string; rotate?: number; align?: 'left' | 'center' | 'right' }> = ({ x, y, text, o = 1, size = 56, color = C.ink, rotate = -3, align = 'center' }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, -50%) rotate(${rotate}deg)`, opacity: o, fontFamily: HAND, fontWeight: 700, fontSize: size, color, whiteSpace: 'pre', textAlign: align, lineHeight: 1 }}>
    {text}
  </div>
);

/** Stempel kotak miring (penekanan utama). */
export const Stamp: React.FC<{ x: number; y: number; text: string; t: number; size?: number; color?: string; rotate?: number }> = ({ x, y, text, t, size = 64, color = C.terra, rotate = -5 }) => {
  if (t <= 0) return null;
  const s = interpolate(t, [0, 1], [1.5, 1]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${s})`, opacity: Math.min(1, t * 1.6), border: `${size * 0.08}px solid ${color}`, borderRadius: 14, padding: `${size * 0.12}px ${size * 0.3}px`, color, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: size * 0.05, lineHeight: 1.05, textAlign: 'center', whiteSpace: 'pre', background: 'rgba(241,235,221,0.9)' }}>
      {text}
    </div>
  );
};

/** Sketsa komodo tampak samping, menghadap kanan. (x, y) = pusat badan; `s` = skala (1 ≈ lebar 490 px). */
export const Komodo: React.FC<{ x: number; y: number; s?: number; flip?: boolean; f?: number; o?: number; fill?: string; tongue?: boolean }> = ({ x, y, s = 1, flip = false, f = 0, o = 1, fill = C.skin, tongue = true }) => {
  const sway = Math.sin(f / 9) * 6;
  const flick = tongue && Math.floor(f / 6) % 5 === 0;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o, overflow: 'visible' }} width={1080} height={1920}>
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={C.ink} strokeWidth={5 / Math.max(0.4, s) * 0.9} strokeLinejoin="round" strokeLinecap="round">
        {/* kaki sisi jauh */}
        <path d="M 40 22 L 28 58 L 46 64" fill="none" strokeWidth={12} stroke={C.ink} opacity={0.55} />
        <path d="M -78 18 L -92 56 L -74 62" fill="none" strokeWidth={12} stroke={C.ink} opacity={0.55} />
        {/* ekor */}
        <path d={`M -70 -6 C -150 -10, -210 ${8 + sway}, -270 ${34 + sway} C -205 ${24 + sway * 0.6}, -150 26, -70 30 Z`} fill={fill} />
        {/* badan */}
        <path d="M -90 10 C -90 -28, -30 -40, 30 -34 C 80 -30, 105 -14, 110 6 C 100 30, 50 40, 0 40 C -50 40, -90 36, -90 10 Z" fill={fill} />
        {/* leher + kepala */}
        <path d="M 95 -14 C 125 -30, 160 -34, 196 -24 C 214 -18, 222 -6, 214 4 C 190 12, 150 18, 108 26 Z" fill={fill} />
        <circle cx={182} cy={-18} r={4.5} fill={C.ink} stroke="none" />
        <path d="M 200 2 C 190 8, 170 10, 150 12" fill="none" strokeWidth={3} />
        {flick ? <path d="M 214 2 L 244 6 M 236 6 L 250 -2 M 236 6 L 250 14" fill="none" stroke={C.terra} strokeWidth={4} /> : null}
        {/* kaki sisi dekat */}
        <path d="M 62 26 L 82 62 L 104 64" fill="none" strokeWidth={14} />
        <path d="M -56 28 L -40 64 L -18 66" fill="none" strokeWidth={14} />
        {/* sisik / arsir */}
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={-70 + i * 12 + hash(i) * 6} cy={-14 + hash(i * 3.1) * 30} r={3} fill={C.ink} stroke="none" opacity={0.35} />
        ))}
        <path d="M -60 -26 C -20 -36, 40 -34, 90 -20" fill="none" strokeWidth={3} opacity={0.6} />
      </g>
    </svg>
  );
};

/** Bayi komodo (sketsa kecil) — dipakai saat menetas. */
export const Hatchling: React.FC<{ x: number; y: number; s?: number; f?: number; o?: number; flip?: boolean }> = ({ x, y, s = 0.32, f = 0, o = 1, flip }) => (
  <Komodo x={x} y={y} s={s} f={f} o={o} flip={flip} fill="#A7AE86" tongue={false} />
);

/** Telur dengan bintik; `crack` 0→1 memunculkan retakan, `open` 0→1 melepas cangkang atas. `dead` = pudar + silang. */
export const Egg: React.FC<{ x: number; y: number; r: number; crack?: number; open?: number; dead?: number; o?: number; children?: React.ReactNode; tint?: string }> = ({ x, y, r, crack = 0, open = 0, dead = 0, o = 1, children, tint = C.egg }) => {
  const rx = r * 0.78;
  const zig = Array.from({ length: 7 }, (_, i) => `${-rx + (i * 2 * rx) / 6},${(i % 2 ? -1 : 1) * r * 0.08}`).join(' L ');
  const fill = dead > 0 ? interpolate(dead, [0, 1], [0, 1]) : 0;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o, overflow: 'visible' }} width={1080} height={1920}>
      <g transform={`translate(${x} ${y})`}>
        {/* bagian bawah */}
        <path d={`M ${-rx} 0 A ${rx} ${r} 0 0 0 ${rx} 0 Z`} fill={tint} stroke={C.ink} strokeWidth={6} opacity={1 - fill * 0.45} />
        {/* bagian atas (terangkat saat open) */}
        <g transform={`translate(${open * rx * 0.6} ${-open * r * 0.9}) rotate(${open * 28})`} opacity={1 - open * 0.15}>
          <path d={`M ${-rx} 0 A ${rx} ${r} 0 0 1 ${rx} 0 Z`} fill={tint} stroke={C.ink} strokeWidth={6} opacity={1 - fill * 0.45} />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={(hash(i + x) - 0.5) * rx * 1.1} cy={-r * (0.25 + hash(i * 5 + x) * 0.5)} r={r * 0.05} fill={C.olive} opacity={0.6} />)}
        </g>
        {crack > 0 && open < 0.05 ? <path d={`M ${zig}`} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray={`${crack * rx * 3} ${rx * 3}`} /> : null}
        {children}
        {dead > 0 ? (
          <g stroke={C.terra} strokeWidth={14} strokeLinecap="round" opacity={dead}>
            <line x1={-r * 0.55} y1={-r * 0.55} x2={r * 0.55} y2={r * 0.55} />
            <line x1={r * 0.55} y1={-r * 0.55} x2={-r * 0.55} y2={r * 0.55} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

/** Kromosom seks: Z (panjang, hijau) atau W (pendek, terakota). Bentuk + huruf + warna dibedakan, bukan warna saja. */
export const Chromo: React.FC<{ x: number; y: number; kind: 'Z' | 'W'; t: number; s?: number; rotate?: number }> = ({ x, y, kind, t, s = 1, rotate = 0 }) => {
  if (t <= 0) return null;
  const h = (kind === 'Z' ? 190 : 120) * s, w = 46 * s, color = kind === 'Z' ? C.green : C.terra;
  const k = interpolate(t, [0, 1], [0.4, 1]);
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: Math.min(1, t * 1.5), overflow: 'visible' }} width={1080} height={1920}>
      <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${k})`}>
        <path d={`M ${-w / 2} ${-h / 2 + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${w / 2} ${-h / 2 + w / 2} L ${w / 2} -10 Q ${w * 0.18} 0 ${w / 2} 10 L ${w / 2} ${h / 2 - w / 2} A ${w / 2} ${w / 2} 0 0 1 ${-w / 2} ${h / 2 - w / 2} L ${-w / 2} 10 Q ${-w * 0.18} 0 ${-w / 2} -10 Z`} fill={color} stroke={C.ink} strokeWidth={5} />
        {[-0.3, 0.3].map((p) => <line key={p} x1={-w / 2 + 6} x2={w / 2 - 6} y1={p * h} y2={p * h} stroke={C.paper} strokeWidth={4} opacity={0.7} />)}
      </g>
      <text x={x} y={y + (h / 2) * k + 64 * s} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={58 * s} fill={color}>{kind}</text>
    </svg>
  );
};

/** Simbol jenis kelamin dalam lingkaran (♂ hijau / ♀ terakota), ≥ 80 px agar terbaca di ponsel. */
export const Sex: React.FC<{ x: number; y: number; kind: 'm' | 'f'; t: number; r?: number }> = ({ x, y, kind, t, r = 46 }) => {
  if (t <= 0) return null;
  const color = kind === 'm' ? C.green : C.terra;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, transform: `translate(-50%,-50%) scale(${t})`, borderRadius: '50%', background: color, border: `5px solid ${C.ink}`, color: '#FFFFFF', fontSize: r * 1.25, lineHeight: `${r * 2 - 10}px`, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 700 }}>
      {kind === 'm' ? '♂' : '♀'}
    </div>
  );
};

/** Titik lokasi dengan riak. */
export const Pin: React.FC<{ x: number; y: number; f: number; t: number; color?: string; r?: number }> = ({ x, y, f, t, color = C.terra, r = 14 }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, opacity: t }} width={1080} height={1920}>
    {[0, 1].map((i) => {
      const u = ((f + i * 22) % 44) / 44;
      return <circle key={i} cx={x} cy={y} r={r + u * r * 3.5} fill="none" stroke={color} strokeWidth={4 * (1 - u)} opacity={1 - u} />;
    })}
    <circle cx={x} cy={y} r={r * t} fill={color} stroke={C.paper} strokeWidth={4} />
  </svg>
);

/** Ombak sketsa (garis lengkung berulang). */
export const Waves: React.FC<{ f: number; area: [number, number, number, number]; o?: number; count?: number }> = ({ f, area, o = 1, count = 14 }) => {
  const [x0, y0, x1, y1] = area;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o }} width={1080} height={1920}>
      {Array.from({ length: count }, (_, i) => {
        const x = x0 + hash(i * 3.3) * (x1 - x0) + Math.sin((f + i * 17) / 20) * 14;
        const y = y0 + hash(i * 7.7) * (y1 - y0);
        return <path key={i} d={`M ${x} ${y} q 18 -14 36 0 q 18 14 36 0`} fill="none" stroke={C.green} strokeWidth={4} opacity={0.45} strokeLinecap="round" />;
      })}
    </svg>
  );
};
