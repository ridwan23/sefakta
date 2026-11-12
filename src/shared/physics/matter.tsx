// Bahan yang bergerak dan rig bersendi. Semua SVG/HTML deterministik, dirender di koordinat layar 1080×1920.
//
//   <Joint x={540} y={700} rotate={settle(f, {...})}>   // lengan timbangan berputar di porosnya
//     <Shaded d={rectPath(-300, -8, 600, 16, 8)} color={T.ink} material="metal" />
//     <Joint x={-280} y={0} rotate={-sudutLengan}>…piring tetap tegak…</Joint>
//   </Joint>
//   <Pour at={q.tuang} from={[540, 400]} ground={1200} pileX={540} color="#f3efe6" />
//   <Liquid box={[400, 900, 280, 360]} level={0.6} color="#7B3F00" disturbAt={[q.aduk]} />
//   <Smoke x={540} y={820} at={0} />
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise1 } from '../anim/core';
import { alpha, darken, lighten, litOf, shadowOf } from '../look/color';
import { hash } from '../motion';
import { useLight } from '../render/light';

/** Sendi rig SVG: anak-anaknya digambar relatif terhadap poros (0,0) sendi ini. Sendi boleh bersarang. */
export const Joint: React.FC<{ x: number; y: number; rotate?: number; scale?: number | [number, number]; children: React.ReactNode }> = ({ x, y, rotate = 0, scale = 1, children }) => {
  const [sx, sy] = Array.isArray(scale) ? scale : [scale, scale];
  return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${sx} ${sy})`}>{children}</g>;
};

export type PourProps = {
  at: number;
  /** titik keluar butiran [x, y] */
  from: [number, number];
  /** y permukaan tempat butiran menumpuk */
  ground: number;
  pileX: number;
  pileWidth?: number;
  pileHeight?: number;
  count?: number;
  /** butir per detik */
  rate?: number;
  color?: string;
  size?: number;
  /** sebaran horizontal saat jatuh (px) */
  spread?: number;
  g?: number;
};

/** Butiran tertuang (gula, garam, pasir, beras) yang jatuh dengan gravitasi dan menumpuk menjadi gundukan. */
export const Pour: React.FC<PourProps> = ({ at, from, ground, pileX, pileWidth = 320, pileHeight = 110, count = 140, rate = 70, color = '#F3EFE6', size = 5, spread = 26, g = 3000 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLight();
  const id = useId().replace(/:/g, '');
  const grains: React.ReactNode[] = [];
  let landed = 0;
  for (let i = 0; i < count; i++) {
    const start = at + (i * fps) / rate;
    const hi = pileHeight * Math.sqrt(i / count);
    const drop = Math.max(10, ground - hi - from[1]);
    const tl = Math.sqrt((2 * drop) / g);
    const t = (f - start) / fps;
    if (t < 0) break;
    if (t >= tl) {
      landed++;
      continue;
    }
    const vx = (hash(i * 3.1) - 0.5) * spread * 2;
    const x = from[0] + vx * t + (pileX - from[0]) * (t / tl);
    const y = from[1] + 0.5 * g * t * t;
    const r = size * (0.7 + 0.6 * hash(i * 1.7));
    const v = g * t; // memanjang searah jatuh (motion blur sederhana)
    grains.push(<ellipse key={i} cx={x} cy={y} rx={r} ry={r * (1 + Math.min(1.5, v / 1500))} fill={hash(i) > 0.5 ? color : lighten(color, 0.2)} />);
  }
  const n = landed / count;
  const H = pileHeight * Math.sqrt(n);
  const W = pileWidth * (0.35 + 0.65 * Math.sqrt(n));
  let mound = '';
  if (landed > 0) {
    const steps = 24;
    mound = `M${pileX - W / 2},${ground}`;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const dx = (u - 0.5) * W;
      const bump = noise1(u * 9, 3) * 3;
      const y = ground - H * Math.max(0, 1 - (dx / (W / 2)) ** 2) ** 0.8 + (k === 0 || k === steps ? 0 : bump);
      mound += ` L${pileX + dx},${y}`;
    }
    mound += ' Z';
  }
  const [lx] = L.toLight;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <defs>
          <linearGradient id={`p${id}`} x1={0.5 + lx * 0.5} y1={0} x2={0.5 - lx * 0.5} y2={1}>
            <stop offset={0} stopColor={litOf(color, 0.3, L.color)} />
            <stop offset={0.6} stopColor={color} />
            <stop offset={1} stopColor={shadowOf(color, 0.25)} />
          </linearGradient>
        </defs>
        {mound ? <path d={mound} fill={`url(#p${id})`} /> : null}
        {mound
          ? Array.from({ length: Math.round(18 * n) }, (_, k) => {
              const u = hash(k * 5.3);
              const dx = (u - 0.5) * W * 0.85;
              const y = ground - H * Math.max(0, 1 - (dx / (W / 2)) ** 2) ** 0.8 + 4 + hash(k) * 10;
              return <circle key={k} cx={pileX + dx} cy={y} r={size * 0.7} fill={shadowOf(color, 0.15)} opacity={0.6} />;
            })
          : null}
        {grains}
      </svg>
    </AbsoluteFill>
  );
};

export type LiquidProps = {
  /** kotak wadah [x, y, w, h] */
  box: [number, number, number, number];
  /** path bentuk bagian dalam wadah (default: kotak) */
  clip?: string;
  /** tinggi cairan 0..1, atau animasi pengisian */
  level?: number;
  fill?: { at: number; from: number; to: number; dur: number };
  color?: string;
  /** frame saat cairan terguncang (diaduk, dijatuhi benda) */
  disturbAt?: number[];
  /** kemiringan permukaan (derajat) bila wadah dimiringkan */
  tilt?: number;
  bubbles?: number;
};

/** Cairan dalam wadah: permukaan bergelombang, guncangan yang teredam, gradien kedalaman, kilau permukaan, gelembung. */
export const Liquid: React.FC<LiquidProps> = ({ box, clip, level = 0.6, fill, color = '#3A7BD5', disturbAt = [], tilt = 0, bubbles = 6 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const [x, y, w, h] = box;
  const t = f / fps;
  let lv = level;
  if (fill) {
    const u = Math.max(0, Math.min(1, (f - fill.at) / fill.dur));
    lv = fill.from + (fill.to - fill.from) * (1 - (1 - u) ** 3);
  }
  const surf = y + h * (1 - lv);
  const slosh = disturbAt.reduce((a, d) => (f >= d ? a + 22 * Math.exp(-(f - d) / (fps * 0.7)) : a), 0);
  const fillWave = fill && f >= fill.at && f <= fill.at + fill.dur + fps ? 8 : 0;
  const amp = 2.5 + slosh + fillWave;
  const slope = Math.tan((tilt * Math.PI) / 180);
  const pts: string[] = [];
  for (let px = x - 10; px <= x + w + 10; px += 12) {
    const yy = surf + slope * (px - (x + w / 2)) + amp * Math.sin(px * 0.028 - t * 4.2) + amp * 0.35 * Math.sin(px * 0.071 + t * 2.6);
    pts.push(`${px},${yy}`);
  }
  const surfacePath = `M${pts.join(' L')}`;
  const body = `${surfacePath} L${x + w + 10},${y + h + 10} L${x - 10},${y + h + 10} Z`;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1}>
      <defs>
        <clipPath id={`c${id}`}>
          <path d={clip ?? `M${x},${y} H${x + w} V${y + h} H${x} Z`} />
        </clipPath>
        <linearGradient id={`g${id}`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={lighten(color, 0.18)} stopOpacity={0.92} />
          <stop offset={1} stopColor={darken(color, 0.35)} stopOpacity={0.97} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <path d={body} fill={`url(#g${id})`} />
        {/* kilau permukaan & meniskus */}
        <path d={surfacePath} fill="none" stroke={alpha(lighten(color, 0.6), 0.85)} strokeWidth={5} />
        <path d={surfacePath} fill="none" stroke={alpha('#ffffff', 0.35)} strokeWidth={2} transform="translate(0 7)" />
        {Array.from({ length: bubbles }, (_, i) => {
          const speed = 60 + 80 * hash(i * 2.3);
          const period = (h * lv + 40) / speed;
          const ph = ((t + hash(i) * period) % period) / period;
          const by = y + h - ph * (h * lv);
          const bx = x + w * (0.15 + 0.7 * hash(i * 4.1)) + noise1(t + i, i) * 6;
          return <circle key={i} cx={bx} cy={by} r={3 + 4 * hash(i * 7.7)} fill="none" stroke={alpha('#ffffff', 0.5 * (1 - ph))} strokeWidth={2} />;
        })}
      </g>
    </svg>
  );
};

/** Uap/asap: gumpalan yang naik, membesar, bergoyang, dan memudar. */
export const Smoke: React.FC<{ x: number; y: number; at?: number; height?: number; width?: number; color?: string; density?: number; opacity?: number }> = ({
  x, y, at = 0, height = 320, width = 90, color = '#ffffff', density = 1, opacity = 0.35,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const life = fps * 2.4;
  const every = Math.max(2, Math.round(6 / density));
  const puffs: React.ReactNode[] = [];
  for (let s = Math.floor((f - life) / every) * every; s <= f; s += every) {
    if (s < at) continue;
    const age = (f - s) / life;
    if (age < 0 || age > 1) continue;
    const i = s / every;
    const px = x + noise1(age * 2 + i * 0.37, i) * width * age + (hash(i) - 0.5) * 16;
    const py = y - age * height;
    const r = 18 + age * 70 * (0.7 + 0.6 * hash(i * 3));
    const o = opacity * Math.sin(Math.PI * age) * (0.6 + 0.4 * hash(i * 5));
    puffs.push(<circle key={s} cx={px} cy={py} r={r} fill={color} opacity={o} />);
  }
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', filter: 'blur(14px)' }} width={1} height={1}>
      {puffs}
    </svg>
  );
};
