import React from 'react';
import { Easing, interpolate } from 'remotion';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import { hash, lerp } from '../../shared/motion';

// Gaya "Diagram dapur terang" (visualStyle di briefs/nasi-dingin.json). Semua koordinat = piksel layar 1080×1920.
// Bentuk membedakan makna, bukan hanya warna: pati panas = garis BERGELOMBANG longgar, pati dingin = KISI rapat
// bergaris tegas; nasi baru matang = kurva PUTUS-PUTUS, nasi dingin = kurva PENUH. Merah hanya untuk peringatan.
export const C = {
  bg: '#F6F1E7',
  bgDeep: '#EDE4D2',
  card: '#FFFFFF',
  ink: '#0D2250',
  dim: 'rgba(13,34,80,0.62)',
  faint: 'rgba(13,34,80,0.16)',
  hi: '#FFB000', // Kuning Fakta: isian/latar dengan teks gelap (tone light)
  hiLine: '#C98A00',
  wood: '#B5651D',
  cold: '#D7E7F3',
  coldLine: '#5C8FB8',
  warn: '#D64533',
  ok: '#2E8B6E',
  rice: '#FFFDF7',
};
export const SANS = FONT_JAKARTA;

export const ramp = (f: number, at: number, len = 12, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));

/** Latar krem dengan butir halus (deterministik). */
export const Paper: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <rect width={1080} height={1920} fill={C.bg} />
    {Array.from({ length: 90 }, (_, i) => (
      <circle key={i} cx={hash(i) * 1080} cy={hash(i + 99) * 1920} r={2 + hash(i + 7) * 3} fill={C.ink} opacity={0.035} />
    ))}
  </svg>
);

/** Teks HTML terpusat pada (x, y). */
export const Label: React.FC<{ x: number; y: number; text: string; t?: number; size?: number; color?: string; bg?: string; weight?: number; maxW?: number; border?: string }> = ({
  x, y, text, t = 1, size = 44, color = C.ink, bg, weight = 800, maxW = 900, border,
}) => {
  if (t <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${lerp(0.85, 1, Math.min(1, t))})`, opacity: Math.min(1, t),
      fontFamily: SANS, fontWeight: weight, fontSize: size, color, letterSpacing: 1, whiteSpace: 'nowrap', maxWidth: maxW, textAlign: 'center',
      background: bg, border, padding: bg ? '10px 26px' : 0, borderRadius: 18, boxShadow: bg ? '0 6px 0 rgba(13,34,80,0.12)' : undefined,
    }}>
      {text}
    </div>
  );
};

/** Stempel miring dengan garis coret opsional. */
export const Stamp: React.FC<{ x: number; y: number; text: string; t: number; strike?: number; rot?: number; size?: number; color?: string }> = ({ x, y, text, t, strike = 0, rot = -6, size = 78, color = C.ink }) => {
  if (t <= 0) return null;
  const s = lerp(1.6, 1, Math.min(1, t));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, t * 2) }}>
      <div style={{ position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: size, color, border: `8px solid ${color}`, borderRadius: 16, padding: '6px 30px', background: 'rgba(255,253,247,0.88)', whiteSpace: 'nowrap', letterSpacing: 2 }}>
        {text}
        {strike > 0 ? (
          <div style={{ position: 'absolute', left: -20, top: '50%', height: 14, width: `calc(${strike * 100}% + ${strike * 40}px)`, background: C.warn, borderRadius: 7, transform: 'rotate(-4deg)' }} />
        ) : null}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ objek dapur (SVG)
/** Mangkuk nasi, pusat bibir mangkuk di (x, y). */
export const Bowl: React.FC<{ x: number; y: number; s?: number; tint?: string }> = ({ x, y, s = 1, tint = C.card }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 0 Q -150 -95 0 -105 Q 150 -95 150 0 Z" fill={C.rice} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    {Array.from({ length: 16 }, (_, i) => {
      const gx = -110 + (i % 8) * 31 + (Math.floor(i / 8) ? 15 : 0), gy = -30 - Math.floor(i / 8) * 34 - Math.abs(-110 + (i % 8) * 31) * -0.05;
      return <ellipse key={i} cx={gx} cy={gy} rx={11} ry={6} transform={`rotate(${hash(i) * 60 - 30} ${gx} ${gy})`} fill="none" stroke={C.faint} strokeWidth={4} />;
    })}
    <path d="M -165 0 L 165 0 Q 150 125 0 130 Q -150 125 -165 0 Z" fill={tint} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -60 50 Q 0 64 60 50" fill="none" stroke={C.hi} strokeWidth={10} strokeLinecap="round" />
    <rect x={-60} y={126} width={120} height={20} rx={8} fill={C.ink} />
  </g>
);

/** Uap: tiga garis bergelombang naik. */
export const Steam: React.FC<{ x: number; y: number; o: number; f: number }> = ({ x, y, o, f }) => {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {[-55, 0, 55].map((dx, i) => {
        const ph = f * 0.12 + i * 2;
        const d = Array.from({ length: 9 }, (_, k) => `${k ? 'L' : 'M'} ${x + dx + Math.sin(ph + k * 0.9) * 14} ${y - k * 22}`).join(' ');
        return <path key={i} d={d} fill="none" stroke={C.dim} strokeWidth={8} strokeLinecap="round" opacity={0.75 - i * 0.1} />;
      })}
    </g>
  );
};

/** Kulkas dengan kepingan salju, pusat (x, y). */
export const Fridge: React.FC<{ x: number; y: number; w: number; h: number; o: number; door?: number }> = ({ x, y, w, h, o, door = 0 }) => {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={34} fill={C.cold} stroke={C.ink} strokeWidth={8} />
      <line x1={x - w / 2 + 20} x2={x + w / 2 - 20} y1={y - h / 2 + 48} y2={y - h / 2 + 48} stroke={C.coldLine} strokeWidth={5} />
      <Snow x={x - w / 2 + 52} y={y - h / 2 + 26} r={16} />
      {/* pintu: panel yang berputar ke kiri (skala x) */}
      {door < 1 ? (
        <g transform={`translate(${x - w / 2} 0) scale(${1 - door} 1) translate(${-(x - w / 2)} 0)`}>
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={34} fill={C.card} stroke={C.ink} strokeWidth={8} />
          <rect x={x + w / 2 - 46} y={y - 70} width={16} height={140} rx={8} fill={C.ink} />
        </g>
      ) : null}
    </g>
  );
};

export const Snow: React.FC<{ x: number; y: number; r: number; color?: string }> = ({ x, y, r, color = C.coldLine }) => (
  <g stroke={color} strokeWidth={r * 0.25} strokeLinecap="round">
    {[0, 60, 120].map((a) => {
      const dx = Math.cos((a * Math.PI) / 180) * r, dy = Math.sin((a * Math.PI) / 180) * r;
      return <line key={a} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} />;
    })}
  </g>
);

/** Jam bundar; `sweep` 0→1 = jarum berputar satu kali. */
export const Clock: React.FC<{ x: number; y: number; r: number; sweep: number; o: number }> = ({ x, y, r, sweep, o }) => {
  if (o <= 0) return null;
  const a = sweep * Math.PI * 2 - Math.PI / 2;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={C.card} stroke={C.ink} strokeWidth={7} />
      <path d={`M ${x} ${y} L ${x} ${y - r} A ${r} ${r} 0 ${sweep > 0.5 ? 1 : 0} 1 ${x + Math.cos(a) * r} ${y + Math.sin(a) * r} Z`} fill={C.hi} opacity={0.55} />
      <line x1={x} y1={y} x2={x + Math.cos(a) * r * 0.8} y2={y + Math.sin(a) * r * 0.8} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={y} r={7} fill={C.ink} />
    </g>
  );
};

/** Api kompor kecil. */
export const Flame: React.FC<{ x: number; y: number; o: number; f: number; s?: number }> = ({ x, y, o, f, s = 1 }) => {
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      {[-60, 0, 60].map((dx, i) => {
        const h = 70 + Math.sin(f * 0.5 + i * 1.7) * 10;
        return (
          <g key={i}>
            <path d={`M ${dx - 24} 0 Q ${dx - 26} ${-h * 0.55} ${dx} ${-h} Q ${dx + 26} ${-h * 0.55} ${dx + 24} 0 Z`} fill={C.hi} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M ${dx - 10} 0 Q ${dx - 10} ${-h * 0.3} ${dx} ${-h * 0.5} Q ${dx + 10} ${-h * 0.3} ${dx + 10} 0 Z`} fill={C.warn} />
          </g>
        );
      })}
      <rect x={-110} y={0} width={220} height={18} rx={9} fill={C.ink} />
    </g>
  );
};

export const Check: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 64 }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <circle r={r} fill={C.ok} />
      <path d={`M ${-r * 0.42} 0 L ${-r * 0.1} ${r * 0.32} L ${r * 0.45} ${-r * 0.32}`} fill="none" stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const Cross: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 64 }) => {
  if (t <= 0) return null;
  const k = r * 0.36;
  return (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <circle r={r} fill={C.warn} />
      <path d={`M ${-k} ${-k} L ${k} ${k} M ${k} ${-k} L ${-k} ${k}`} stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" />
    </g>
  );
};

/** Bakteri: kapsul kecil yang tumbuh di (x, y) dalam radius `spread`; `grow` 0→1 menambah jumlah. */
export const Bacteria: React.FC<{ x: number; y: number; spread: number; grow: number; f: number; glow?: number; n?: number }> = ({ x, y, spread, grow, f, glow = 0, n = 16 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = Math.max(0, Math.min(1, grow * n - i));
      if (t <= 0) return null;
      const bx = x + (hash(i * 3 + 1) - 0.5) * spread * 2, by = y + (hash(i * 3 + 2) - 0.5) * spread * 0.9;
      const rot = hash(i * 3 + 3) * 180 + Math.sin(f * 0.1 + i) * 8;
      return (
        <g key={i} transform={`translate(${bx} ${by}) rotate(${rot}) scale(${t})`}>
          {glow > 0 ? <rect x={-28} y={-16} width={56} height={32} rx={16} fill={C.warn} opacity={0.3 * glow} /> : null}
          <rect x={-20} y={-10} width={40} height={20} rx={10} fill={C.warn} stroke={C.ink} strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

/** Ikon orang (kepala + badan), tinggi ±130 px. */
export const Person: React.FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color = C.ink }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${t})`} fill={color}>
      <circle cx={0} cy={-42} r={26} />
      <path d="M -42 60 Q -42 -6 0 -6 Q 42 -6 42 60 Z" />
    </g>
  );
};

/** Enzim: lingkaran bermulut (membuka-menutup), menghadap kiri. */
export const Enzyme: React.FC<{ x: number; y: number; chomp: number; o?: number; r?: number }> = ({ x, y, chomp, o = 1, r = 62 }) => {
  if (o <= 0) return null;
  const a = (10 + 32 * chomp) * (Math.PI / 180);
  const p1 = [-Math.cos(a) * r, -Math.sin(a) * r], p2 = [-Math.cos(a) * r, Math.sin(a) * r];
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <path d={`M 0 0 L ${p1[0]} ${p1[1]} A ${r} ${r} 0 1 1 ${p2[0]} ${p2[1]} Z`} fill={C.wood} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={8} cy={-r * 0.45} r={9} fill={C.card} />
    </g>
  );
};

// ------------------------------------------------------------------ diagram pati
export const LENS = { x: 540, y: 820, r: 380 };

/** Rantai pati di dalam lensa butir nasi.
 *  `cold` 0 = bergelombang longgar (panas), 1 = lurus rapat + ikatan silang (kristal).
 *  `cut` 0→1 = rantai terpotong menjadi titik gula (kuning) — hanya bermakna saat panas. */
export const StarchChains: React.FC<{ cold: number; cut: number; f: number; o?: number }> = ({ cold, cut, f, o = 1 }) => {
  const N = 7, x0 = LENS.x - 320, x1 = LENS.x + 320;
  const spread = lerp(92, 50, cold), amp = lerp(30, 0, cold);
  const ys = Array.from({ length: N }, (_, i) => LENS.y + (i - (N - 1) / 2) * spread);
  const chain = (i: number) => Array.from({ length: 41 }, (_, k) => {
    const x = lerp(x0, x1, k / 40);
    return [x, ys[i] + amp * Math.sin(x * 0.028 + i * 1.3 + f * 0.09)] as const;
  });
  const seg = 64, gap = cut * 34;
  return (
    <g opacity={o}>
      {cold > 0 ? ys.slice(0, -1).map((y, i) => Array.from({ length: 11 }, (_, k) => {
        const x = x0 + 30 + k * 58 + (i % 2) * 29;
        return <line key={`${i}-${k}`} x1={x} y1={y} x2={x} y2={y + spread} stroke={C.ink} strokeWidth={6} opacity={cold} />;
      })) : null}
      {ys.map((_, i) => (
        <path key={i} d={chain(i).map(([x, y], k) => `${k ? 'L' : 'M'} ${x} ${y}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={lerp(9, 12, cold)} strokeLinecap="round"
          strokeDasharray={cut > 0 ? `${seg - gap} ${gap}` : undefined} />
      ))}
      {cut > 0 ? ys.map((_, i) => chain(i).filter((_, k) => k % 4 === 2).map(([x, y], k) => (
        <circle key={`${i}-${k}`} cx={x + (hash(i * 40 + k) - 0.5) * 18 * cut} cy={y + (hash(i * 40 + k + 1) - 0.5) * 30 * cut} r={12 * cut} fill={C.hi} stroke={C.ink} strokeWidth={3} />
      ))) : null}
    </g>
  );
};

/** Kurva gula darah setelah makan (puncak `peak` px di atas garis dasar). `draw` 0→1. */
export const GlucoseCurve: React.FC<{ x0: number; y0: number; w: number; peak: number; draw: number; dashed?: boolean; color: string; width?: number }> = ({ x0, y0, w, peak, draw, dashed, color, width = 10 }) => {
  if (draw <= 0) return null;
  const pts = Array.from({ length: 61 }, (_, k) => {
    const u = k / 60;
    const g = Math.exp(-(((u - 0.32) / 0.16) ** 2)) * (u < 0.32 ? 1 : 1) + 0.12 * Math.exp(-(((u - 0.62) / 0.18) ** 2));
    return [x0 + u * w, y0 - 30 - peak * g] as const;
  });
  const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return (
    <g>
      <clipPath id={`clip-${color.replace('#', '')}-${dashed ? 'd' : 's'}`}>
        <rect x={x0 - 20} y={0} width={(w + 40) * draw} height={1920} />
      </clipPath>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '22 18' : undefined}
        clipPath={`url(#clip-${color.replace('#', '')}-${dashed ? 'd' : 's'})`} />
    </g>
  );
};
