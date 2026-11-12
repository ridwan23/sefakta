import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { font } from '../../shared/brand/fonts';
import { hash } from '../../shared/motion';

// Gaya "peta arsip kertas tua abad ke-19" (lihat visualStyle di briefs/tambora-1816.json).
export const C = {
  paper: '#F3EAD7',
  paperDeep: '#E4D3AF',
  land: '#E2D1AC',
  landDim: '#D6C49C',
  ink: '#2B2118',
  inkSoft: 'rgba(43,33,24,0.55)',
  ember: '#B23A0B',
  cold: '#3E5F8A',
  coldSoft: '#9DB0C8',
  sepia: '#8C7B62',
  sun: '#C8901A',
};
export const SERIF = font('playfair-display');

/** 0→1 dengan easing, mulai `at` selama `len` frame. */
export const ramp = (f: number, at: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
/** Pop dengan sedikit overshoot (untuk stempel/ikon). */
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));

/** Kertas arsip: warna dasar, vinyet, dan serat halus (feTurbulence deterministik). */
export const Paper: React.FC<{ children?: React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    {children}
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 0.17  0 0 0 0 0.13  0 0 0 0 0.09  0 0 0 0.10 0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(80,52,20,0.28) 100%)' }} />
    {dim > 0 ? <AbsoluteFill style={{ background: `rgba(30,24,20,${dim})` }} /> : null}
  </AbsoluteFill>
);

/** Label kapital bergaya peta lama. */
export const MapLabel: React.FC<{ x: number; y: number; text: string; o?: number; size?: number; color?: string; align?: 'left' | 'center' | 'right' }> = ({ x, y, text, o = 1, size = 40, color = C.ink, align = 'center' }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, -50%)`, opacity: o, fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, color, whiteSpace: 'nowrap', textShadow: `0 0 10px ${C.paper}, 0 0 4px ${C.paper}` }}>
    {text}
  </div>
);

/** Stempel arsip miring yang "dicap" ke kertas. */
export const Stamp: React.FC<{ x: number; y: number; text: string; t: number; size?: number; color?: string; rotate?: number }> = ({ x, y, text, t, size = 72, color = C.ember, rotate = -6 }) => {
  if (t <= 0) return null;
  const s = interpolate(t, [0, 1], [1.6, 1]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${s})`, opacity: Math.min(1, t * 1.6), border: `${size * 0.08}px solid ${color}`, borderRadius: 14, padding: `${size * 0.12}px ${size * 0.3}px`, color, fontFamily: SERIF, fontWeight: 900, fontSize: size, letterSpacing: size * 0.06, lineHeight: 1.05, textAlign: 'center', whiteSpace: 'pre', background: 'rgba(243,234,215,0.85)' }}>
      {text}
    </div>
  );
};

/** Titik lokasi dengan riak berulang (gelombang dari waktu, deterministik). */
export const Pulse: React.FC<{ x: number; y: number; f: number; color?: string; r?: number; o?: number }> = ({ x, y, f, color = C.ember, r = 14, o = 1 }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o }} width={1080} height={1920}>
    {[0, 1].map((i) => {
      const u = ((f + i * 22) % 44) / 44;
      return <circle key={i} cx={x} cy={y} r={r + u * r * 4} fill="none" stroke={color} strokeWidth={4 * (1 - u)} opacity={1 - u} />;
    })}
    <circle cx={x} cy={y} r={r} fill={color} stroke={C.paper} strokeWidth={4} />
  </svg>
);

/** Gunung api bergaya ukiran (garis arsir), dasar di (x, y). */
export const Volcano: React.FC<{ x: number; y: number; w: number; h: number; glow?: number }> = ({ x, y, w, h, glow = 0 }) => {
  const crater = w * 0.16;
  const pts = `${x - w / 2},${y} ${x - crater / 2},${y - h} ${x + crater / 2},${y - h} ${x + w / 2},${y}`;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
      <defs>
        <clipPath id={`vc-${x}-${y}`}><polygon points={pts} /></clipPath>
      </defs>
      <polygon points={pts} fill={C.landDim} />
      <g clipPath={`url(#vc-${x}-${y})`} stroke={C.inkSoft} strokeWidth={2.5}>
        {Array.from({ length: 40 }, (_, i) => {
          const xx = x - w / 2 + (i / 40) * w;
          return <line key={i} x1={xx} y1={y} x2={xx + h * 0.35} y2={y - h} />;
        })}
      </g>
      <polygon points={pts} fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {glow > 0 ? <ellipse cx={x} cy={y - h} rx={crater * 0.7} ry={crater * 0.25} fill={C.ember} opacity={glow} /> : null}
    </svg>
  );
};

/** Kolom letusan dari kepulan-kepulan tinta. `t` 0→1 = tinggi kolom; kepulan berdenyut pelan. */
export const Plume: React.FC<{ x: number; base: number; top: number; t: number; f: number; width: number; color?: string }> = ({ x, base, top, t, f, width, color = C.ink }) => {
  if (t <= 0) return null;
  const n = 26;
  const head = base + (top - base) * t;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
      {Array.from({ length: n }, (_, i) => {
        const k = i / (n - 1);
        const yy = base + (head - base) * k;
        const spread = width * (0.25 + 0.75 * k);
        const xx = x + (hash(i * 3.1) - 0.5) * spread * 0.6 + Math.sin(f / 18 + i) * 6;
        const r = spread * (0.28 + 0.18 * hash(i * 7.7)) * (0.9 + 0.1 * Math.sin(f / 12 + i * 2));
        return <circle key={i} cx={xx} cy={yy} r={r} fill={i % 3 === 0 ? C.sepia : '#6E5E4A'} stroke={color} strokeWidth={3} opacity={0.92} />;
      })}
    </svg>
  );
};

/** Ikon matahari ukiran. `dim` 0→1 meredupkan dan menyamarkan warnanya. */
export const Sun: React.FC<{ x: number; y: number; r: number; dim?: number; spin?: number }> = ({ x, y, r, dim = 0, spin = 0 }) => {
  const fill = dim > 0 ? interpolateHex(C.sun, '#9A9488', dim) : C.sun;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - dim * 0.45 }} width={1080} height={1920}>
      <g transform={`rotate(${spin} ${x} ${y})`}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={x + Math.cos(a) * r * 1.25} y1={y + Math.sin(a) * r * 1.25} x2={x + Math.cos(a) * r * 1.7} y2={y + Math.sin(a) * r * 1.7} stroke={fill} strokeWidth={r * 0.14} strokeLinecap="round" />;
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={C.ink} strokeWidth={4} />
    </svg>
  );
};

/** Awan ukiran (tiga lengkung). */
export const Cloud: React.FC<{ x: number; y: number; s: number; fill?: string; o?: number }> = ({ x, y, s, fill = '#EFE6D2', o = 1 }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o }} width={1080} height={1920}>
    <path d={`M ${x - 90 * s} ${y} a ${40 * s} ${40 * s} 0 0 1 ${50 * s} ${-45 * s} a ${55 * s} ${55 * s} 0 0 1 ${95 * s} ${-10 * s} a ${42 * s} ${42 * s} 0 0 1 ${45 * s} ${55 * s} Z`} fill={fill} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

/** Buku bersampul kulit dengan judul. */
export const Book: React.FC<{ x: number; y: number; w: number; title: string; sub?: string; t: number; rotate?: number }> = ({ x, y, w, title, sub, t, rotate = -4 }) => {
  if (t <= 0) return null;
  const h = w * 1.42;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${interpolate(t, [0, 1], [0.6, 1])})`, opacity: Math.min(1, t * 1.5), background: 'linear-gradient(135deg, #5A2A16 0%, #3A1A0E 100%)', borderRadius: 10, boxShadow: '12px 16px 0 rgba(43,33,24,0.25)', border: `5px solid ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: w * 0.05 }}>
      <div style={{ position: 'absolute', inset: w * 0.05, border: '3px solid #C8A45A', borderRadius: 6 }} />
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: w * 0.105, letterSpacing: w * 0.008, color: '#E9C877' }}>{title}</div>
      {sub ? <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: w * 0.055, color: '#D8B76A' }}>{sub}</div> : null}
    </div>
  );
};

/** Hujan diagonal deterministik. */
export const Rain: React.FC<{ f: number; o: number; count?: number; color?: string; area?: [number, number, number, number] }> = ({ f, o, count = 90, color = C.cold, area = [0, 0, 1080, 1920] }) => {
  if (o <= 0) return null;
  const [ax, ay, aw, ah] = area;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o }} width={1080} height={1920}>
      {Array.from({ length: count }, (_, i) => {
        const x0 = ax + hash(i * 1.7) * aw;
        const y = ay + ((hash(i * 4.3) * ah + f * (26 + hash(i) * 10)) % ah);
        const x = x0 - (y - ay) * 0.18;
        return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 44} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.75} />;
      })}
    </svg>
  );
};

/** Butir salju jatuh pelan dalam area. */
export const Snow: React.FC<{ f: number; o: number; area: [number, number, number, number]; count?: number }> = ({ f, o, area, count = 60 }) => {
  if (o <= 0) return null;
  const [ax, ay, aw, ah] = area;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o }} width={1080} height={1920}>
      {Array.from({ length: count }, (_, i) => {
        const y = ay + ((hash(i * 2.9) * ah + f * (2.2 + hash(i * 5.1) * 2)) % ah);
        const x = ax + hash(i * 1.3) * aw + Math.sin(f / 20 + i) * 10;
        const r = 5 + hash(i * 8.3) * 6;
        return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" stroke={C.cold} strokeWidth={2} />;
      })}
    </svg>
  );
};

/** Tangkai gandum; `wilt` 0→1 merunduk dan memudar. */
export const Wheat: React.FC<{ x: number; y: number; h: number; wilt: number; i: number }> = ({ x, y, h, wilt, i }) => {
  const bend = wilt * (55 + hash(i) * 25);
  const col = interpolateHex('#B8862B', '#7D7466', wilt);
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
      <g transform={`rotate(${bend * 0.25} ${x} ${y})`}>
        <path d={`M ${x} ${y} Q ${x} ${y - h * 0.6} ${x + bend} ${y - h + bend * 0.6}`} fill="none" stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 5 }, (_, k) => {
          const u = 0.62 + k * 0.08;
          const px = x + bend * u * u, py = y - h * u + bend * 0.6 * u * u;
          return (
            <g key={k}>
              <ellipse cx={px - 11} cy={py} rx={9} ry={16} fill={col} stroke={C.ink} strokeWidth={2.5} transform={`rotate(${-30 + bend * 0.4} ${px - 11} ${py})`} />
              <ellipse cx={px + 11} cy={py} rx={9} ry={16} fill={col} stroke={C.ink} strokeWidth={2.5} transform={`rotate(${30 + bend * 0.4} ${px + 11} ${py})`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const interpolateHex = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b), k = Math.max(0, Math.min(1, t));
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};
