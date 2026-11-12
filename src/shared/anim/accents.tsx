// Gerak sekunder dan aksen: membuat frame tidak pernah beku dan setiap beat terasa.
//
//   <Idle amp={4}>…</Idle>                         gerak napas/mengapung saat hold
//   <Shake at={q.boom}>…</Shake>                     guncangan meluruh saat benturan
//   <svg><DrawPath d="M…" at={q.ke} arrow /></svg>   garis/panah tergambar
//   <CountUp to={1500} at={q.angka} suffix=" kkal" /> angka berhitung lalu "mendarat"
//   <Pulse at={q.di} x={540} y={800} />              cincin penanda titik
//   <Burst at={q.boom} x={540} y={800} />            percikan garis saat benturan
//   <Highlight at={q.kata}>kata</Highlight>          stabilo menyapu di belakang teks
//   <Swap at={q.ganti} a={<A />} b={<B />} />        A berganti B tanpa potong keras
//   <Particles count={40} />                         debu/partikel latar yang hidup
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01, hash } from '../motion';
import { DUR, EASE, impact, noise1, prog, sec, springAt } from './core';

const join = (...t: (string | undefined | false)[]) => t.filter(Boolean).join(' ') || undefined;

/** Gerak diam yang hidup: melayang, berayun, bernapas. Pakai pada objek utama selama hold (amp 2–6 px). */
export const Idle: React.FC<{ amp?: number; rot?: number; breathe?: number; speed?: number; seed?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  amp = 4, rot = 0.8, breathe = 0.012, speed = 1, seed = 0, style, children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (f / fps) * speed;
  const tf = `translate(${(noise1(t * 0.7, seed) * amp).toFixed(2)}px, ${(noise1(t * 0.6, seed + 3) * amp).toFixed(2)}px) rotate(${(noise1(t * 0.5, seed + 5) * rot).toFixed(3)}deg) scale(${(1 + Math.sin(t * 2.1 + seed) * breathe).toFixed(4)})`;
  return <div style={{ ...style, transform: join(style?.transform, tf) }}>{children}</div>;
};

/** Guncangan yang meluruh mulai `at` (benturan, stempel, kejutan). */
export const Shake: React.FC<{ at: number; amp?: number; len?: number; seed?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ at, amp = 14, len = 12, seed = 0, style, children }) => {
  const j = impact(useCurrentFrame(), at, amp, len, seed);
  return <div style={{ ...style, transform: join(style?.transform, `translate(${j.x.toFixed(2)}px, ${j.y.toFixed(2)}px) rotate(${j.r.toFixed(3)}deg)`) }}>{children}</div>;
};

export type DrawPathProps = {
  d: string;
  at: number;
  /** frame (default DUR.slow) */
  dur?: number;
  stroke?: string;
  width?: number;
  /** garis putus-putus [panjang, jarak] dalam px */
  dash?: [number, number];
  /** kepala panah di ujung, muncul saat garis hampir selesai */
  arrow?: boolean;
  /** ujung garis bulat (default) */
  cap?: 'round' | 'butt' | 'square';
  exitAt?: number;
  opacity?: number;
};

/** Path SVG yang tergambar dari awal ke akhir. Letakkan di dalam <svg>. Tidak perlu mengukur panjang path. */
export const DrawPath: React.FC<DrawPathProps> = ({ d, at, dur, stroke = 'currentColor', width = 8, dash, arrow, cap = 'round', exitAt, opacity = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const p = prog(f, at, dur ?? sec(DUR.slow, fps), EASE.inOut);
  const out = exitAt === undefined ? 0 : prog(f, exitAt, sec(DUR.exit, fps), EASE.in);
  if (p <= 0) return null;
  const head = clamp01((p - 0.85) / 0.15);
  const common = { d, fill: 'none', strokeWidth: width, strokeLinecap: cap, strokeLinejoin: 'round' as const };
  return (
    <g opacity={opacity * (1 - out)}>
      <defs>
        {arrow ? (
          <marker id={`a${id}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={stroke} opacity={head} />
          </marker>
        ) : null}
        {dash ? (
          <mask id={`m${id}`} maskUnits="userSpaceOnUse">
            <path {...common} stroke="#fff" strokeWidth={width + 4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          </mask>
        ) : null}
      </defs>
      {dash ? (
        <path {...common} stroke={stroke} strokeDasharray={dash.join(' ')} strokeDashoffset={-f * 0.6} mask={`url(#m${id})`} />
      ) : (
        <path {...common} stroke={stroke} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      )}
      {/* kepala panah di path tak terlihat terpisah, supaya tidak ikut terpotong dash/mask */}
      {arrow ? <path {...common} stroke="transparent" markerEnd={`url(#a${id})`} /> : null}
    </g>
  );
};

const fmtCache = new Map<string, Intl.NumberFormat>();
const fmt = (n: number, decimals: number) => {
  const k = String(decimals);
  if (!fmtCache.has(k)) fmtCache.set(k, new Intl.NumberFormat('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  return fmtCache.get(k)!.format(n);
};

/** Angka berhitung lalu mendarat dengan sentakan kecil. Format Indonesia (1.500; 0,5). */
export const CountUp: React.FC<{ to: number; from?: number; at: number; dur?: number; decimals?: number; prefix?: string; suffix?: string; style?: React.CSSProperties }> = ({
  to, from = 0, at, dur, decimals = 0, prefix = '', suffix = '', style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = dur ?? sec(0.9, fps);
  const v = from + (to - from) * prog(f, at, len, EASE.snap);
  const d = f - (at + len);
  const kick = d >= 0 ? 1 + 0.08 * Math.exp(-d / 4) * Math.cos(d * 0.8) : 1;
  return (
    <span style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums', ...style, transform: join(style?.transform, `scale(${kick.toFixed(4)})`) }}>
      {prefix}
      {fmt(v, decimals)}
      {suffix}
    </span>
  );
};

/** Cincin yang mengembang dari sebuah titik (menandai lokasi/objek). Koordinat layar px. */
export const Pulse: React.FC<{ at: number; x: number; y: number; size?: number; color?: string; rings?: number; gap?: number; width?: number; repeat?: number }> = ({
  at, x, y, size = 220, color = '#FFB000', rings = 2, gap = 7, width = 6, repeat,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = sec(0.8, fps);
  const local = repeat && f >= at ? at + ((f - at) % repeat) : at;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: rings }, (_, i) => {
        const p = prog(f, local + i * gap, len, EASE.out);
        if (p <= 0 || p >= 1) return null;
        const r = size * p;
        return (
          <div
            key={i}
            style={{ position: 'absolute', left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: '50%', border: `${width * (1 - p) + 1}px solid ${color}`, opacity: 1 - p }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Percikan garis radial saat benturan/penekanan. */
export const Burst: React.FC<{ at: number; x: number; y: number; count?: number; radius?: number; length?: number; color?: string; width?: number; seed?: number }> = ({
  at, x, y, count = 10, radius = 110, length = 46, color = '#FFB000', width = 7, seed = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = prog(f, at, sec(0.5, fps), EASE.snap);
  if (p <= 0 || p >= 1) return null;
  const tail = prog(f, at + 3, sec(0.5, fps), EASE.out);
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + hash(i + seed) * 0.35;
        const r0 = radius * (0.4 + 0.6 * tail);
        const r1 = radius * (0.4 + 0.6 * p) + length * (1 - tail);
        return (
          <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={width * (1 - tail) + 0.5} strokeLinecap="round" />
        );
      })}
    </svg>
  );
};

/** Stabilo yang menyapu di belakang teks (bisa beberapa baris). */
export const Highlight: React.FC<{ at: number; dur?: number; color?: string; thickness?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at, dur, color = '#FFB000', thickness = '0.42em', children, style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = prog(f, at, dur ?? sec(DUR.base, fps), EASE.inOut);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 88%',
        backgroundSize: `${(p * 100).toFixed(2)}% ${thickness}`,
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** A berganti B di sekitar frame `at` dengan transisi (bukan potong keras). */
export const Swap: React.FC<{ at: number; a: React.ReactNode; b: React.ReactNode; kind?: 'blur' | 'flip' | 'pop'; dur?: number; style?: React.CSSProperties }> = ({ at, a, b, kind = 'blur', dur, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = dur ?? sec(DUR.base, fps);
  const half = Math.round(len / 2);
  const out = prog(f, at - half, half, EASE.in);
  const inn = prog(f, at, len, EASE.out);
  const fx = (t: number, entering: boolean): React.CSSProperties => {
    if (kind === 'flip') return { transform: `perspective(900px) rotateY(${entering ? (1 - t) * -90 : t * 90}deg)`, opacity: entering ? (t > 0 ? 1 : 0) : t < 1 ? 1 : 0 };
    if (kind === 'pop') {
      const s = entering ? springAt(f, at, fps, { damping: 10 }) : 1 - t;
      return { transform: `scale(${s})`, opacity: entering ? clamp01(t * 3) : 1 - t };
    }
    return { transform: `scale(${entering ? 1.08 - 0.08 * t : 1 - 0.06 * t})`, filter: `blur(${((entering ? 1 - t : t) * 14).toFixed(2)}px)`, opacity: entering ? t : 1 - t };
  };
  return (
    <div style={{ position: 'relative', ...style }}>
      {out < 1 ? <div style={fx(out, false)}>{a}</div> : null}
      {f >= at ? <div style={{ position: out < 1 ? 'absolute' : 'relative', inset: 0, ...fx(inn, true) }}>{b}</div> : null}
    </div>
  );
};

/** Partikel latar deterministik (debu, gelembung, bintang, butir gula). Mengisi frame dengan gerak halus. */
export const Particles: React.FC<{
  count?: number;
  seed?: number;
  color?: string;
  /** rentang radius px */
  size?: [number, number];
  /** kecepatan naik px/dtk (negatif = turun) */
  rise?: number;
  /** goyangan horizontal px */
  sway?: number;
  opacity?: [number, number];
  blur?: number;
  /** area [x, y, w, h] */
  area?: [number, number, number, number];
  twinkle?: boolean;
}> = ({ count = 40, seed = 1, color = '#ffffff', size = [2, 6], rise = 24, sway = 18, opacity = [0.15, 0.55], blur = 0, area = [0, 0, 1080, 1920], twinkle }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const [ax, ay, aw, ah] = area;
  return (
    <svg style={{ position: 'absolute', left: ax, top: ay, filter: blur ? `blur(${blur}px)` : undefined, pointerEvents: 'none' }} width={aw} height={ah}>
      {Array.from({ length: count }, (_, i) => {
        const h = (k: number) => hash(i * 7.31 + seed * 13.7 + k);
        const speed = rise * (0.6 + 0.8 * h(1));
        const y = (((h(2) * ah - t * speed) % ah) + ah) % ah;
        const x = h(3) * aw + noise1(t * 0.4 + i, seed) * sway;
        const r = size[0] + (size[1] - size[0]) * h(4);
        const base = opacity[0] + (opacity[1] - opacity[0]) * h(5);
        const o = twinkle ? base * (0.55 + 0.45 * Math.sin(t * (2 + 3 * h(6)) + i)) : base;
        const edge = Math.min(1, y / 80, (ah - y) / 80); // memudar di tepi area agar tidak muncul tiba-tiba
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={Math.max(0, o * edge)} />;
      })}
    </svg>
  );
};
