// Bentuk berbayang dengan material. Satu `d` path → isi bergradien searah cahaya, bayangan dalam di sisi gelap,
// pantulan cahaya di tepi terang, sorotan (spekular) sesuai material, dan tekstur opsional.
// Letakkan di dalam <svg>. Path dibuat dengan helper di shapes.ts (rect, ellipse, blob, dst.).
//
//   <svg width={1080} height={1920}>
//     <Shaded d={rectPath(340, 600, 400, 520, 40)} color="#2E8B57" material="plastic" />
//     <Shaded d={ellipsePath(540, 900, 120, 120)} color="#C0C6D0" material="metal" />
//   </svg>
import React, { createContext, useContext, useId } from 'react';
import { alpha, litOf, mix, shadowOf } from '../look/color';
import { useLight } from './light';

/** clay = plastisin/tanah liat lembut (gaya Clay 3D): bayangan dalam lebar, sorotan lebar redup, permukaan sedikit bergelombang */
export type Material = 'matte' | 'plastic' | 'metal' | 'glass' | 'paper' | 'fabric' | 'clay';

type Stop = [number, string, number?];

export type ShadedProps = {
  d: string;
  color: string;
  material?: Material;
  /** ketebalan visual objek (px): makin besar, bayangan dalam makin lebar */
  depth?: number;
  /** garis tepi tipis (gaya ilustrasi); kosong = tanpa garis */
  outline?: string;
  outlineWidth?: number;
  opacity?: number;
  /** isi tambahan yang ikut terpotong bentuk (label, motif), dirender di atas shading, di bawah sorotan */
  children?: React.ReactNode;
};

const Override = createContext<Material | null>(null);

/**
 * Paksa satu material untuk semua Shaded di dalamnya (kecuali kaca), mis. seluruh objek ilustrasi bergaya clay:
 *   <MaterialStyle material="clay"><Bowl … /><Cup … /></MaterialStyle>
 */
export const MaterialStyle: React.FC<{ material: Material; children: React.ReactNode }> = ({ material, children }) => (
  <Override.Provider value={material}>{children}</Override.Provider>
);

export const Shaded: React.FC<ShadedProps> = ({ d, color, material: own = 'matte', depth: ownDepth = 18, outline, outlineWidth = 3, opacity = 1, children }) => {
  const forced = useContext(Override);
  const material: Material = forced && own !== 'glass' ? forced : own;
  // clay terlihat lebih tebal: bayangan dalam diperlebar
  const depth = material === 'clay' && own !== 'clay' ? ownDepth * 1.5 : ownDepth;
  const L = useLight();
  const id = useId().replace(/:/g, '');
  const [lx, ly] = L.toLight;
  const k = L.intensity;
  // gradien bentuk: dari sisi terang (ke arah lampu) ke sisi gelap
  const x1 = 0.5 + lx * 0.5, y1 = 0.5 + ly * 0.5, x2 = 0.5 - lx * 0.5, y2 = 0.5 - ly * 0.5;
  const stops: Record<Material, Stop[]> = {
    matte: [[0, litOf(color, 0.22 * k, L.color)], [0.55, color], [1, shadowOf(color, 0.3 * k)]],
    paper: [[0, litOf(color, 0.12 * k, L.color)], [0.6, color], [1, shadowOf(color, 0.16 * k)]],
    fabric: [[0, litOf(color, 0.16 * k, L.color)], [0.5, color], [1, shadowOf(color, 0.34 * k)]],
    clay: [[0, litOf(color, 0.3 * k, L.color)], [0.5, color], [1, shadowOf(color, 0.24 * k)]],
    plastic: [[0, litOf(color, 0.3 * k, L.color)], [0.45, color], [1, shadowOf(color, 0.36 * k)]],
    metal: [
      [0, litOf(color, 0.55 * k, L.color)], [0.18, shadowOf(color, 0.25 * k)], [0.42, litOf(color, 0.35 * k)],
      [0.62, color], [0.8, shadowOf(color, 0.45 * k)], [1, litOf(color, 0.15 * k)],
    ],
    glass: [[0, litOf(color, 0.5, L.color), 0.4], [0.5, color, 0.18], [1, shadowOf(color, 0.3), 0.35]],
  };
  const spec: Record<Material, { o: number; r: number; sharp: number } | null> = {
    matte: null, paper: null, fabric: null,
    clay: { o: 0.4, r: 0.36, sharp: 0.55 },
    plastic: { o: 0.75, r: 0.22, sharp: 0.35 },
    metal: { o: 0.9, r: 0.16, sharp: 0.2 },
    glass: { o: 0.95, r: 0.14, sharp: 0.15 },
  };
  const s = spec[material];
  const off = depth * 0.45;
  const innerDark = alpha(shadowOf(color, 0.6), material === 'glass' ? 0.2 : 0.38 * k + 0.1);
  const rim = alpha(litOf(color, 0.8, L.color), material === 'metal' || material === 'glass' ? 0.9 : 0.45 * k);
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`b${id}`} x1={x1} y1={y1} x2={x2} y2={y2}>
          {stops[material].map(([o, c, a], i) => (
            <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
          ))}
        </linearGradient>
        {s ? (
          <radialGradient id={`s${id}`} cx={0.5 + lx * 0.27} cy={0.5 + ly * 0.27} r={s.r} fx={0.5 + lx * 0.3} fy={0.5 + ly * 0.3}>
            <stop offset={0} stopColor="#ffffff" stopOpacity={s.o} />
            <stop offset={s.sharp} stopColor="#ffffff" stopOpacity={s.o * 0.6} />
            <stop offset={1} stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        ) : null}
        {/* bayangan dalam (sisi jauh dari lampu) + pantulan tepi (sisi lampu) */}
        <filter id={`f${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feOffset in="SourceAlpha" dx={lx * off} dy={ly * off} result="o1" />
          <feGaussianBlur in="o1" stdDeviation={depth * (material === 'clay' ? 0.6 : 0.35)} result="b1" />
          <feComposite in="SourceAlpha" in2="b1" operator="out" result="edgeDark" />
          <feFlood floodColor={innerDark} />
          <feComposite in2="edgeDark" operator="in" result="dark" />
          <feOffset in="SourceAlpha" dx={-lx * 3} dy={-ly * 3} result="o2" />
          <feGaussianBlur in="o2" stdDeviation={1.6} result="b2" />
          <feComposite in="SourceAlpha" in2="b2" operator="out" result="edgeLit" />
          <feFlood floodColor={rim} />
          <feComposite in2="edgeLit" operator="in" result="lit" />
          {material === 'paper' || material === 'fabric' || material === 'clay' ? (
            <>
              <feTurbulence type="fractalNoise" baseFrequency={material === 'fabric' ? '0.9 0.25' : material === 'clay' ? 0.05 : 0.8} numOctaves={2} seed={7} result="n" />
              {/* clay: gelombang lebar (bekas pijatan), bukan serat */}
              <feColorMatrix in="n" type="matrix" values={material === 'clay' ? '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 -0.05' : '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0'} result="na" />
              <feComposite in="na" in2="SourceAlpha" operator="in" result="tex" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="tex" />
                <feMergeNode in="dark" />
                <feMergeNode in="lit" />
              </feMerge>
            </>
          ) : (
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="dark" />
              <feMergeNode in="lit" />
            </feMerge>
          )}
        </filter>
        <clipPath id={`c${id}`}>
          <path d={d} />
        </clipPath>
        <linearGradient id={`k${id}`} gradientTransform={`rotate(${(-L.angle + 35).toFixed(1)} 0.5 0.5)`}>
          <stop offset={0.2} stopColor="#fff" stopOpacity={0} />
          <stop offset={0.26} stopColor="#fff" stopOpacity={0.9} />
          <stop offset={0.31} stopColor="#fff" stopOpacity={0} />
          <stop offset={0.36} stopColor="#fff" stopOpacity={0.35} />
          <stop offset={0.39} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#b${id})`} filter={`url(#f${id})`} />
      {children ? <g clipPath={`url(#c${id})`}>{children}</g> : null}
      {material === 'glass' ? <path d={d} fill="none" stroke={alpha(mix(color, '#ffffff', 0.7), 0.7)} strokeWidth={4} /> : null}
      {s ? <path d={d} fill={`url(#s${id})`} style={{ mixBlendMode: 'screen' }} /> : null}
      {material === 'glass' || material === 'metal' ? (
        // pita pantulan memanjang (streak) khas permukaan licin, miring terhadap arah cahaya
        <path d={d} fill={`url(#k${id})`} opacity={material === 'glass' ? 0.6 : 0.4} />
      ) : null}
      {outline ? <path d={d} fill="none" stroke={outline} strokeWidth={outlineWidth} strokeLinejoin="round" /> : null}
    </g>
  );
};
