// Objek alam: Sun, Flame, Snowflake, Leaf. Semua memancarkan/hidup sendiri, jadi tidak memakai shading berbasis lampu
// kecuali Leaf.
//
//   <Sun x={540} y={420} size={360} at={q.matahari} pulseAt={[q.silau]} />
//   <Flame x={540} y={1000} size={200} intensity={0.8} />
import React, { useId } from 'react';
import { noise1, prog, EASE } from '../anim/core';
import { darken, lighten, mix } from '../look/color';
import { Shaded } from '../render/Shaded';
import { ObjFrame, type ObjProps } from './ObjFrame';

export type SunProps = ObjProps & {
  rays?: number;
  /** frame saat matahari berdenyut (mis. ketika disebut) */
  pulseAt?: number[];
  /** kecerahan 0..1 (0 = redup, cakram saja) */
  glow?: number;
};

/** Cakram bershading dengan sinar berbentuk kelopak dan pendaran. Idle: sinar berputar pelan, berdenyut. */
export const Sun: React.FC<SunProps> = (p) => {
  const id = useId().replace(/:/g, '');
  const c = p.color ?? '#FFB000';
  const n = p.rays ?? 12;
  return (
    <ObjFrame
      {...p}
      w={200}
      h={200}
      bob={1.5}
      sway={0}
      draw={({ f, t, k }) => {
        const abs = f + (p.at ?? 0);
        const kick = (p.pulseAt ?? []).reduce((a, at) => a + (abs >= at ? Math.exp(-(abs - at) / 8) * Math.sin(Math.min(Math.PI, ((abs - at) / 10) * Math.PI)) : 0), 0);
        const breathe = k ? Math.sin(t * 1.6) * 0.03 * k : 0;
        const g = p.glow ?? 1;
        const rayS = 1 + breathe + kick * 0.18;
        return (
          <>
            <defs>
              <radialGradient id={`sg${id}`}>
                <stop offset={0} stopColor={c} stopOpacity={0.55 * g} />
                <stop offset={1} stopColor={c} stopOpacity={0} />
              </radialGradient>
              <radialGradient id={`sd${id}`} cx={0.35} cy={0.3} r={0.8}>
                <stop offset={0} stopColor={lighten(c, 0.7)} />
                <stop offset={0.45} stopColor={lighten(c, 0.1)} />
                <stop offset={1} stopColor={darken(mix(c, '#E05000', 0.4), 0.05)} />
              </radialGradient>
            </defs>
            <circle cx={100} cy={100} r={95 * (1 + kick * 0.12)} fill={`url(#sg${id})`} />
            <g transform={`rotate(${t * 6 * k} 100 100) translate(100 100) scale(${rayS}) translate(-100 -100)`} opacity={0.4 + 0.6 * g}>
              {Array.from({ length: n }, (_, i) => (
                <path key={i} d="M100 18 C93 30 93 40 100 52 C107 40 107 30 100 18 Z" fill={c} transform={`rotate(${(i * 360) / n} 100 100)`} />
              ))}
            </g>
            <circle cx={100} cy={100} r={46 * (1 + kick * 0.06)} fill={`url(#sd${id})`} />
            <ellipse cx={84} cy={82} rx={16} ry={9} fill="#fff" opacity={0.45} transform="rotate(-35 84 82)" />
          </>
        );
      }}
    />
  );
};

export type FlameProps = ObjProps & {
  /** tinggi nyala 0..1 */
  intensity?: number;
};

/** Nyala api berlapis (luar, tengah, inti). Idle: berkedip dan meliuk dengan noise. */
export const Flame: React.FC<FlameProps> = (p) => {
  const c = p.color ?? '#FF7A1A';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={260}
      bob={0}
      sway={0}
      shadowWidth={0.45}
      draw={({ t, k }) => {
        const I = p.intensity ?? 1;
        const layer = (scale: number, seed: number, fill: string, op = 1) => {
          const w1 = noise1(t * 3.1 * (k || 0.3), seed) * 14;
          const w2 = noise1(t * 2.3 * (k || 0.3), seed + 5) * 10;
          const h = (0.65 + 0.35 * I) * (1 + noise1(t * 4 * (k || 0.3), seed + 9) * 0.06);
          const top = 250 - 220 * h * scale;
          const halfW = 62 * scale;
          return (
            <path
              d={`M100 250 C${100 - halfW * 1.2} 250 ${100 - halfW * 1.3} ${200 - 30 * scale} ${100 - halfW * 0.9 + w2 * 0.4} ${170 - 40 * scale} C${100 - halfW * 0.6} ${140 - 30 * scale} ${100 + w1 * 0.6} ${top + 60 * scale} ${100 + w1} ${top} C${100 + halfW * 0.5 + w1 * 0.4} ${top + 70 * scale} ${100 + halfW * 1.1} ${150 - 20 * scale} ${100 + halfW * 1.1} ${200 - 20 * scale} C${100 + halfW * 1.15} ${235} ${100 + halfW * 0.7} 250 100 250 Z`}
              fill={fill}
              opacity={op}
            />
          );
        };
        return (
          <>
            <ellipse cx={100} cy={170} rx={95} ry={90} fill={c} opacity={0.12 + 0.05 * Math.sin(t * 9)} />
            {layer(1, 1, c)}
            {layer(0.72, 3, lighten(mix(c, '#FFC23A', 0.6), 0.05))}
            {layer(0.42, 7, '#FFF4C2', 0.95)}
          </>
        );
      }}
    />
  );
};

/** Kepingan salju enam lengan bercabang. Idle: berputar pelan dan berkilau. */
export const Snowflake: React.FC<ObjProps> = (p) => {
  const c = p.color ?? '#DDF1FF';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={200}
      bob={4}
      sway={0}
      draw={({ t, k }) => (
        <g transform={`rotate(${t * 12 * k} 100 100)`}>
          <circle cx={100} cy={100} r={92} fill={c} opacity={0.12} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 60} 100 100)`} stroke={c} strokeWidth={9} strokeLinecap="round" fill="none">
              <path d="M100 100 V18" />
              <path d="M100 46 l-18 -16 M100 46 l18 -16 M100 72 l-14 -12 M100 72 l14 -12" strokeWidth={7} />
              <path d="M100 100 V18" stroke="#fff" strokeWidth={2.5} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />
            </g>
          ))}
          <circle cx={100} cy={100} r={14} fill={c} />
        </g>
      )}
    />
  );
};

export type LeafProps = ObjProps & {
  /** frame mulai layu (warna memudar, ujung terkulai) */
  wiltAt?: number;
};

/** Daun dengan tulang daun. Idle: bergoyang tertiup angin dari pangkal. */
export const Leaf: React.FC<LeafProps> = (p) => {
  const c = p.color ?? '#3E9B5A';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={240}
      bob={2}
      sway={3}
      draw={({ f, t, k }) => {
        const wilt = p.wiltAt === undefined ? 0 : prog(f + (p.at ?? 0), p.wiltAt, 45, EASE.inOut);
        const col = mix(c, '#B08A3E', wilt * 0.75);
        const bend = (k ? noise1(t * 0.8, 4) * 6 * k : 0) + wilt * 28;
        return (
          <g transform={`rotate(${bend} 100 232)`}>
            <path d="M100 236 C100 200 100 180 100 160" stroke={darken(col, 0.35)} strokeWidth={6} strokeLinecap="round" />
            <Shaded d="M100 168 C40 150 22 90 50 40 C70 14 96 8 100 6 C104 8 130 14 150 40 C178 90 160 150 100 168 Z" color={col} material="matte" depth={14} />
            <g stroke={lighten(col, 0.35)} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8}>
              <path d="M100 162 C100 110 100 60 100 14" />
              {[130, 104, 78, 54].map((y, i) => (
                <path key={i} d={`M100 ${y} C88 ${y - 10} 74 ${y - 18} ${60 + i * 4} ${y - 30} M100 ${y} C112 ${y - 10} 126 ${y - 18} ${140 - i * 4} ${y - 30}`} />
              ))}
            </g>
          </g>
        );
      }}
    />
  );
};
