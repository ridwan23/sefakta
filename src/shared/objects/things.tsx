// Benda sehari-hari: Car, Tunnel, Glasses, Bowl, Sachet, Cup, Spoon, Phone, Fridge.
//
//   <Car x={540} y={1100} size={520} ground={1180} speed={1} />
//   <Bowl x={540} y={1000} size={420} ground={1120} steam />
//   <Phone x={540} y={900} size={360}><div>…isi layar (HTML)…</div></Phone>
import React, { useId } from 'react';
import { noise1 } from '../anim/core';
import { alpha, darken, lighten, mix } from '../look/color';
import { Shaded } from '../render/Shaded';
import { pouchPath } from '../render/shapes';
import { ObjFrame, type ObjProps } from './ObjFrame';

/** Uap: tiga liuk naik dan memudar, berulang. Koordinat lokal objek. */
const Steam: React.FC<{ x: number; y: number; t: number; spread?: number; height?: number; color?: string; on?: number }> = ({ x, y, t, spread = 40, height = 90, color = '#ffffff', on = 1 }) => (
  <g fill="none" stroke={color} strokeLinecap="round">
    {[-1, 0, 1].map((i) => {
      const ph = (t * 0.45 + (i + 1) * 0.33) % 1;
      const yy = y - ph * height;
      const xx = x + i * spread * 0.5;
      const wv = Math.sin(t * 2 + i * 2) * 8;
      return <path key={i} d={`M${xx} ${yy + 30} C${xx + 12 + wv} ${yy + 18} ${xx - 12 + wv} ${yy + 8} ${xx + wv * 0.5} ${yy - 8}`} strokeWidth={6} opacity={on * 0.55 * Math.sin(ph * Math.PI)} />;
    })}
  </g>
);

export type CarProps = ObjProps & {
  /** kecepatan roda (putaran/dtk); 0 = berhenti */
  speed?: number;
  /** lampu depan menyala */
  lights?: boolean;
};

/** Mobil tampak samping (menghadap kanan). Idle: suspensi memantul; roda berputar sesuai `speed`. */
export const Car: React.FC<CarProps> = (p) => {
  const c = p.color ?? '#F2A100';
  return (
    <ObjFrame
      {...p}
      w={240}
      h={160}
      bob={0}
      sway={0}
      shadowWidth={0.85}
      footInset={13}
      draw={({ t, k }) => {
        const v = p.speed ?? 0;
        const bump = k ? noise1(t * (2 + v * 3), 2) * (1 + v) * 1.2 * k : 0;
        const roll = k ? noise1(t * 1.3, 8) * 0.8 * k : 0;
        const wheel = (cx: number) => (
          <g key={cx} transform={`rotate(${t * v * 360} ${cx} 124)`}>
            <circle cx={cx} cy={124} r={21} fill="#10182C" />
            <circle cx={cx} cy={124} r={11} fill="#C3CBDC" />
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} d={`M${cx} 124 L${cx} 114`} stroke="#6B7690" strokeWidth={3} strokeLinecap="round" transform={`rotate(${a} ${cx} 124)`} />
            ))}
            <circle cx={cx} cy={124} r={3} fill="#10182C" />
          </g>
        );
        return (
          <>
            <g transform={`translate(0 ${bump}) rotate(${roll} 120 100)`}>
              <Shaded d="M14 112 C14 92 26 84 52 80 L74 52 C84 40 96 38 112 38 L150 38 C164 38 174 44 184 58 L200 80 C220 84 228 94 228 112 L228 118 C228 124 224 126 218 126 L22 126 C16 126 14 122 14 118 Z" color={c} material="plastic" depth={14} />
              <Shaded d="M82 56 C88 48 96 46 108 46 L126 46 L126 78 L66 78 Z" color="#7FB8E0" material="glass" depth={6} />
              <Shaded d="M134 46 L150 46 C158 46 164 50 170 58 L180 78 L134 78 Z" color="#7FB8E0" material="glass" depth={6} />
              <path d="M28 96 C80 88 160 88 214 96" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} fill="none" />
              <path d="M128 82 V120" stroke={darken(c, 0.35)} strokeWidth={2} opacity={0.6} />
              <ellipse cx={222} cy={100} rx={6} ry={9} fill="#FFF6C0" />
              {p.lights ? <path d="M226 92 L300 74 L300 128 L226 108 Z" fill="#FFF6C0" opacity={0.3 + 0.05 * Math.sin(t * 7)} /> : null}
              <rect x={14} y={98} width={8} height={10} rx={3} fill="#E04B3A" />
            </g>
            {wheel(64)}
            {wheel(176)}
          </>
        );
      }}
    />
  );
};

export type TunnelProps = ObjProps & {
  /** cahaya di ujung 0..1 (naik saat kendaraan mendekati keluar) */
  light?: number;
};

/** Mulut terowongan berlapis dengan cahaya di ujung. Idle: cahaya berdenyut, lampu dinding menyala berurutan. */
export const Tunnel: React.FC<TunnelProps> = (p) => {
  const id = useId().replace(/:/g, '');
  const c = p.color ?? '#26304F';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={200}
      bob={0}
      sway={0}
      draw={({ t, k }) => {
        const L = (p.light ?? 0.6) * (1 + (k ? Math.sin(t * 2.4) * 0.08 * k : 0));
        return (
          <>
            <defs>
              <radialGradient id={`tg${id}`}>
                <stop offset={0} stopColor="#FFF1B0" stopOpacity={0.9 * L} />
                <stop offset={1} stopColor="#FFB000" stopOpacity={0} />
              </radialGradient>
            </defs>
            <Shaded d="M10 190 L10 90 C10 36 56 10 100 10 C144 10 190 36 190 90 L190 190 Z" color={c} material="matte" depth={16} />
            <path d="M34 190 L34 96 C34 56 66 34 100 34 C134 34 166 56 166 96 L166 190 Z" fill={darken(c, 0.35)} />
            <path d="M58 190 L58 104 C58 78 78 60 100 60 C122 60 142 78 142 104 L142 190 Z" fill={darken(c, 0.6)} />
            <path d="M82 190 L82 114 C82 100 90 90 100 90 C110 90 118 100 118 114 L118 190 Z" fill={mix('#0A0F20', '#FFF1B0', Math.min(1, L))} />
            <circle cx={100} cy={150} r={30 + 40 * L} fill={`url(#tg${id})`} />
            {[0, 1, 2, 3].map((i) => {
              const on = 0.4 + 0.6 * Math.max(0, Math.sin(t * 3 - i * 0.9));
              return (
                <g key={i} opacity={on}>
                  <circle cx={44 + i * 6} cy={110 + i * 18} r={3.5 - i * 0.5} fill="#FFD34D" />
                  <circle cx={156 - i * 6} cy={110 + i * 18} r={3.5 - i * 0.5} fill="#FFD34D" />
                </g>
              );
            })}
            <g stroke="#FFD34D" strokeWidth={2.5} opacity={0.45}>
              <path d="M14 172 h172 M16 186 h168" />
            </g>
          </>
        );
      }}
    />
  );
};

/** Kacamata hitam: lensa membulat tidak simetris, kilap melengkung. Idle: ayunan halus, kilap bergeser. */
export const Glasses: React.FC<ObjProps> = (p) => {
  const id = useId().replace(/:/g, '');
  const frame = p.color ?? '#111111';
  return (
    <ObjFrame
      {...p}
      w={220}
      h={120}
      bob={3}
      sway={2}
      draw={({ t, k }) => {
        const shine = k ? ((t * 0.35) % 1) * 1.6 - 0.3 : 0.3;
        const lens = (d: string, side: 'l' | 'r') => (
          <g>
            <clipPath id={`gl${side}${id}`}>
              <path d={d} />
            </clipPath>
            <path d={d} fill="#1F2A44" />
            <path d={d} fill={alpha('#3A4A6E', 0.8)} transform="translate(-4 -4)" clipPath={`url(#gl${side}${id})`} />
            <g clipPath={`url(#gl${side}${id})`}>
              <path d={`M${(side === 'l' ? 10 : 116) + shine * 100} 30 l18 0 l-30 70 l-18 0 Z`} fill="#fff" opacity={0.28} />
              <path d={side === 'l' ? 'M32 44 C44 40 60 40 72 46' : 'M138 44 C150 40 166 40 178 46'} stroke="#fff" strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" fill="none" />
            </g>
            <path d={d} fill="none" stroke={frame} strokeWidth={5} />
          </g>
        );
        return (
          <>
            <path d="M22 36 C10 36 8 28 14 24" stroke={frame} strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d="M198 36 C210 36 212 28 206 24" stroke={frame} strokeWidth={7} fill="none" strokeLinecap="round" />
            {lens('M18 38 C18 34 24 32 34 32 L82 32 C98 32 104 44 100 66 C96 88 78 96 58 94 C34 92 20 76 18 38 Z', 'l')}
            {lens('M202 38 C202 34 196 32 186 32 L138 32 C122 32 116 44 120 66 C124 88 142 96 162 94 C186 92 200 76 202 38 Z', 'r')}
            <path d="M100 40 C106 34 114 34 120 40" stroke={frame} strokeWidth={6} fill="none" strokeLinecap="round" />
          </>
        );
      }}
    />
  );
};

export type BowlProps = ObjProps & {
  /** isi mangkuk */
  fill?: 'rice' | 'soup' | 'empty';
  /** uap mengepul (true atau kekuatan 0..1) */
  steam?: boolean | number;
};

/** Mangkuk keramik dengan nasi berbutir (atau kuah). Idle: uap mengepul. */
export const Bowl: React.FC<BowlProps> = (p) => {
  const c = p.color ?? '#F4F6FA';
  const content = p.fill ?? 'rice';
  const steam = p.steam === undefined ? 1 : p.steam === true ? 1 : p.steam === false ? 0 : p.steam;
  return (
    <ObjFrame
      {...p}
      w={220}
      h={180}
      bob={0}
      sway={0}
      shadowWidth={0.7}
      footInset={22}
      draw={({ t }) => (
        <>
          {steam > 0 ? <Steam x={110} y={30} t={t} spread={60} height={70} on={steam} /> : null}
          {content === 'rice' ? (
            <>
              <Shaded d="M44 84 C44 40 78 22 110 24 C142 22 176 40 176 84 Z" color="#FFF7E2" material="matte" depth={10} />
              <g fill="#E4D6B0" opacity={0.9}>
                {Array.from({ length: 22 }, (_, i) => {
                  const a = (i * 137.5 * Math.PI) / 180;
                  const r = 8 + ((i * 53) % 52);
                  const x = 110 + Math.cos(a) * r * 1.05;
                  const y = 62 - Math.abs(Math.sin(a)) * (r * 0.55) + (r > 40 ? 8 : 0);
                  return <ellipse key={i} cx={x} cy={Math.min(80, Math.max(32 + Math.abs(x - 110) * 0.35, y))} rx={6.5} ry={3.2} transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />;
                })}
              </g>
            </>
          ) : content === 'soup' ? (
            <ellipse cx={110} cy={82} rx={76} ry={12} fill="#C9862F" />
          ) : null}
          <Shaded d="M30 80 L190 80 C190 124 160 156 110 156 C60 156 30 124 30 80 Z" color={c} material="plastic" depth={16} />
          <path d="M30 80 L190 80" stroke={darken(c, 0.12)} strokeWidth={3} />
          <path d="M84 156 L86 166 L134 166 L136 156" fill={darken(c, 0.18)} />
          <path d="M44 100 C60 116 90 124 110 124" stroke={mix(c, '#7FA0C8', 0.6)} strokeWidth={4} fill="none" opacity={0.45} />
        </>
      )}
    />
  );
};

export type SachetProps = ObjProps & {
  /** teks label pendek, atau SVG (koordinat lokal 200×240); kosong = ikon daun */
  label?: React.ReactNode;
};

/** Kantung sachet bersegel gerigi atas-bawah, kilap plastik. Idle: melayang dan miring pelan. */
export const Sachet: React.FC<SachetProps> = (p) => {
  const c = p.color ?? '#CFE6C8';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={240}
      bob={6}
      sway={3}
      shadowWidth={0.55}
      draw={() => (
        <Shaded d={pouchPath(40, 16, 120, 208, 8, 8)} color={c} material="plastic" depth={14}>
          <path d="M40 32 H160 M40 208 H160" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} strokeDasharray="3 4" />
          <path d="M54 46 C50 96 50 156 56 196" stroke="#fff" strokeOpacity={0.6} strokeWidth={5} fill="none" strokeLinecap="round" />
          {typeof p.label === 'string' ? (
            <>
              <rect x={52} y={100} width={96} height={40} rx={8} fill="#fff" opacity={0.85} />
              <text x={100} y={128} textAnchor="middle" fontFamily="inherit" fontWeight={800} fontSize={p.label.length > 6 ? 16 : 20} fill={darken(c, 0.6)}>{p.label}</text>
            </>
          ) : p.label ?? (
            <>
              <circle cx={100} cy={120} r={30} fill="#2E8B57" />
              <path d="M100 140 C92 118 96 104 112 98 C112 114 108 128 100 140 Z" fill="#A8E6B8" />
            </>
          )}
        </Shaded>
      )}
    />
  );
};

export type CupProps = ObjProps & {
  /** warna minuman; kosong = gelas kosong */
  drink?: string;
  /** tinggi isi 0..1 */
  level?: number;
  steam?: boolean | number;
};

/** Cangkir keramik bergagang dengan minuman. Idle: uap (bila panas), permukaan bergelombang halus. */
export const Cup: React.FC<CupProps> = (p) => {
  const id = useId().replace(/:/g, '');
  const c = p.color ?? '#F2F4F8';
  const steam = p.steam === undefined ? 0 : p.steam === true ? 1 : p.steam === false ? 0 : p.steam;
  const body = 'M40 60 L50 190 C52 204 62 210 76 210 L124 210 C138 210 148 204 150 190 L160 60 Z';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={220}
      bob={0}
      sway={0}
      shadowWidth={0.6}
      footInset={10}
      draw={({ t, k }) => {
        const lv = p.level ?? 0.85;
        const top = 210 - 150 * lv;
        const wave = k ? Math.sin(t * 2) * 1.5 : 0;
        return (
          <>
            {steam > 0 ? <Steam x={100} y={20} t={t} spread={40} height={60} on={steam} /> : null}
            <path d="M156 92 C192 92 196 160 150 166" stroke={darken(c, 0.08)} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d="M156 92 C192 92 196 160 150 166" stroke={lighten(c, 0.4)} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
            <Shaded d={body} color={c} material="plastic" depth={16} />
            <clipPath id={`cc${id}`}>
              <path d={body} />
            </clipPath>
            {p.drink ? (
              <g clipPath={`url(#cc${id})`}>
                <ellipse cx={100} cy={top + wave} rx={60} ry={8} fill={lighten(p.drink, 0.15)} />
              </g>
            ) : null}
            <ellipse cx={100} cy={60} rx={60} ry={10} fill="none" stroke={darken(c, 0.15)} strokeWidth={3} />
          </>
        );
      }}
    />
  );
};

/** Sendok logam. Idle: berayun pelan dengan kilap bergeser. */
export const Spoon: React.FC<ObjProps> = (p) => {
  const c = p.color ?? '#C8CED8';
  return (
    <ObjFrame
      {...p}
      w={80}
      h={240}
      bob={2}
      sway={2.5}
      shadowWidth={0.4}
      draw={() => (
        <>
          <Shaded d="M40 6 C62 6 72 30 70 52 C68 74 54 86 46 90 L46 226 C46 232 34 232 34 226 L34 90 C26 86 12 74 10 52 C8 30 18 6 40 6 Z" color={c} material="metal" depth={10} />
          <ellipse cx={34} cy={36} rx={8} ry={16} fill="#fff" opacity={0.4} transform="rotate(-15 34 36)" />
        </>
      )}
    />
  );
};

export type PhoneProps = ObjProps & {
  /** warna layar saat tidak ada isi */
  screen?: string;
  /** isi layar (SVG, koordinat lokal: layar 22..138 × 30..290) */
  children?: React.ReactNode;
  /** layar menyala dengan notifikasi berdenyut */
  notify?: boolean;
};

/** Ponsel tegak dengan layar. Idle: melayang tipis, pantulan layar bergeser. */
export const Phone: React.FC<PhoneProps> = (p) => {
  const id = useId().replace(/:/g, '');
  const c = p.color ?? '#1B2233';
  return (
    <ObjFrame
      {...p}
      w={160}
      h={320}
      bob={3}
      sway={1}
      shadowWidth={0.6}
      draw={({ t, k }) => (
        <>
          <Shaded d="M30 4 L130 4 C146 4 156 14 156 30 L156 290 C156 306 146 316 130 316 L30 316 C14 316 4 306 4 290 L4 30 C4 14 14 4 30 4 Z" color={c} material="plastic" depth={12} />
          <clipPath id={`ps${id}`}>
            <rect x={14} y={22} width={132} height={276} rx={14} />
          </clipPath>
          <rect x={14} y={22} width={132} height={276} rx={14} fill={p.screen ?? '#2D5B86'} />
          <g clipPath={`url(#ps${id})`}>
            {p.children}
            <path d={`M${-40 + ((t * 0.25 * (k || 0.3)) % 1) * 260} 22 l40 0 l-80 276 l-40 0 Z`} fill="#fff" opacity={0.08} />
          </g>
          <rect x={60} y={10} width={40} height={6} rx={3} fill={darken(c, 0.4)} />
          {p.notify ? <circle cx={136} cy={34} r={9 + Math.sin(t * 5) * 2} fill="#E04B3A" /> : null}
        </>
      )}
    />
  );
};

export type FridgeProps = ObjProps & {
  /** pintu bawah terbuka 0..1 */
  open?: number;
};

/** Kulkas dua pintu. Idle: dengung halus; pintu bawah bisa dibuka (cahaya dingin di dalam). */
export const Fridge: React.FC<FridgeProps> = (p) => {
  const c = p.color ?? '#E6ECF2';
  return (
    <ObjFrame
      {...p}
      w={200}
      h={320}
      bob={0}
      sway={0}
      shadowWidth={0.8}
      draw={({ t, k }) => {
        const o = p.open ?? 0;
        const hum = k ? Math.sin(t * 40) * 0.25 * k : 0;
        return (
          <g transform={`translate(${hum} 0)`}>
            <Shaded d="M30 6 L170 6 C182 6 190 14 190 26 L190 306 C190 314 184 318 176 318 L24 318 C16 318 10 314 10 306 L10 26 C10 14 18 6 30 6 Z" color={c} material="plastic" depth={16} />
            <path d="M10 116 H190" stroke={darken(c, 0.2)} strokeWidth={3} />
            <rect x={24} y={40} width={8} height={56} rx={4} fill={darken(c, 0.3)} />
            {o > 0 ? (
              <>
                <rect x={14} y={120} width={172} height={192} rx={6} fill="#DDF3FF" />
                <rect x={14} y={120} width={172} height={192} rx={6} fill="#9FD3F0" opacity={0.25 + 0.05 * Math.sin(t * 3)} />
                <path d="M20 190 H180 M20 250 H180" stroke="#B8D8EA" strokeWidth={4} />
                <path d={`M190 120 L${190 + 120 * o} ${128 - 6 * o} L${190 + 120 * o} ${308 + 6 * o} L190 312 Z`} fill={darken(c, 0.08)} />
              </>
            ) : (
              <rect x={24} y={140} width={8} height={70} rx={4} fill={darken(c, 0.3)} />
            )}
            {k ? <circle cx={170} cy={26} r={3} fill={mix('#4FD18B', c, 0.2 + 0.2 * Math.sin(t * 2))} /> : null}
          </g>
        );
      }}
    />
  );
};

export { Steam };
