// Potongan kertas: lembar terlipat yang membuka (engsel 3D di garis lipat) dan pita/banner dengan ekor terlipat.
// Gerak patah-patah stop-motion lewat `steps` (default on twos).
//
//   <PaperFold x={540} y={900} w={640} h={760} at={q.surat} openAt={q.buka}>…isi…</PaperFold>
//   <Ribbon x={540} y={420} w={620} text="3 LANGKAH" at={q.judul} />
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog, stepped } from '../anim/core';
import { darken, lighten } from '../look/color';
import { clamp01 } from '../motion';
import { paperIn } from './paper';
import { Fiber, PAPER } from './pieces';

export type PaperFoldProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** frame lembar masuk (meluncur); kosong = sudah di tempat */
  at?: number;
  /** frame lipatan mulai membuka; default at + 14 */
  openAt?: number;
  /** v = garis lipat horizontal, separuh bawah membuka ke bawah; h = garis lipat vertikal, separuh kanan membuka ke kanan */
  fold?: 'v' | 'h';
  /** durasi membuka (frame) */
  dur?: number;
  color?: string;
  /** warna sisi belakang lembar */
  back?: string;
  rotate?: number;
  seed?: number;
  steps?: number;
  children?: React.ReactNode;
};

/**
 * Lembar terlipat dua yang membuka seperti surat: separuh lembar berputar 180° di garis lipat (perspektif 3D),
 * sisi belakangnya terlihat saat masih tertutup, bayangan lipatan jatuh ke separuh yang diam, bekas lipatan tetap ada.
 */
export const PaperFold: React.FC<PaperFoldProps> = ({
  x, y, w, h, at, openAt, fold = 'v', dur = 18, color = PAPER.karton, back, rotate = 0, seed = 2, steps = 2, children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = paperIn(frame, at, fps, seed, rotate);
  if (!m.visible) return null;
  const o = openAt ?? (at ?? 0) + 14;
  const sf = stepped(frame, steps);
  // 0 = tertutup (flap terlipat di atas separuh diam), 1 = terbuka rata; sedikit overshoot lalu jatuh rata
  const u = at === undefined && openAt === undefined ? 1 : prog(sf, o, dur, EASE.back);
  const ang = (1 - u) * 180; // derajat lipatan
  const backC = back ?? darken(color, 0.08);
  const V = fold === 'v';
  // separuh diam = atas (v) / kiri (h); flap = bawah / kanan dengan engsel di garis tengah
  const half: React.CSSProperties = V ? { left: 0, top: 0, width: w, height: h / 2 } : { left: 0, top: 0, width: w / 2, height: h };
  const flapPos: React.CSSProperties = V ? { left: 0, top: h / 2, width: w, height: h / 2 } : { left: w / 2, top: 0, width: w / 2, height: h };
  const rot = V ? `rotateX(${ang}deg)` : `rotateY(${-ang}deg)`;
  const origin = V ? '50% 0%' : '0% 50%';
  const cosA = Math.cos((ang * Math.PI) / 180);
  // bayangan flap ke separuh diam, paling kuat saat flap tegak (90°)
  const cast = Math.sin((ang * Math.PI) / 180) * 0.35;
  const face = (offX: number, offY: number) => (
    <div style={{ position: 'absolute', left: -offX, top: -offY, width: w, height: h, background: color }}>
      {children}
      <Fiber opacity={0.2} seed={seed + 3} />
    </div>
  );
  const crease = V
    ? `linear-gradient(180deg, transparent calc(50% - 10px), rgba(60,40,15,0.13) 50%, rgba(255,255,255,0.35) calc(50% + 2px), transparent calc(50% + 12px))`
    : `linear-gradient(90deg, transparent calc(50% - 10px), rgba(60,40,15,0.13) 50%, rgba(255,255,255,0.35) calc(50% + 2px), transparent calc(50% + 12px))`;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: m.transform, opacity: m.opacity, filter: m.filter }}>
      <div style={{ position: 'absolute', inset: 0, perspective: 2200 }}>
        <div style={{ position: 'absolute', ...half, overflow: 'hidden' }}>
          {face(0, 0)}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: V
                ? `linear-gradient(0deg, rgba(40,25,10,${cast}) 0%, transparent ${30 + 50 * (1 - cosA)}%)`
                : `linear-gradient(270deg, rgba(40,25,10,${cast}) 0%, transparent ${30 + 50 * (1 - cosA)}%)`,
            }}
          />
        </div>
        <div style={{ position: 'absolute', ...flapPos, transformOrigin: origin, transform: rot, transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backfaceVisibility: 'hidden' }}>
            {V ? face(0, h / 2) : face(w / 2, 0)}
            <div style={{ position: 'absolute', inset: 0, background: `rgba(40,25,10,${(1 - Math.max(0, cosA)) * 0.3})` }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: backC, transform: V ? 'rotateX(180deg)' : 'rotateY(180deg)', backfaceVisibility: 'hidden', overflow: 'hidden' }}>
            <Fiber opacity={0.25} seed={seed + 9} />
            <div style={{ position: 'absolute', inset: 0, background: `rgba(255,250,235,${clamp01(-cosA) * 0.25})` }} />
          </div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: crease, opacity: clamp01(u * 1.2), pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

export type RibbonProps = {
  x: number;
  y: number;
  /** lebar pita depan (px) */
  w: number;
  text: string;
  at?: number;
  h?: number;
  color?: string;
  ink?: string;
  rotate?: number;
  size?: number;
  steps?: number;
};

/** Pita banner kertas: badan pita membentang dari tengah, lalu dua ekor bertakik muncul dari balik lipatan. */
export const Ribbon: React.FC<RibbonProps> = ({ x, y, w, text, at, h = 110, color = PAPER.merah, ink = '#FFF8EB', rotate = -2, size, steps = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at !== undefined && frame < at) return null;
  const sf = stepped(frame, steps);
  const band = at === undefined ? 1 : prog(sf, at, Math.round(fps * 0.35), EASE.back);
  const tail = at === undefined ? 1 : prog(sf, at + Math.round(fps * 0.22), Math.round(fps * 0.3), EASE.back);
  const fs = size ?? h * 0.46;
  const tw = h * 1.05; // panjang ekor
  const drop = h * 0.32; // ekor sedikit lebih rendah dari badan
  const notch = h * 0.32;
  const dark = darken(color, 0.28);
  const tailC = darken(color, 0.12);
  const W = w + 2 * tw;
  // ekor kiri dalam koordinat svg (0..W), ditarik ke balik badan saat tail < 1
  const slide = (1 - tail) * tw * 0.9;
  const lx = tw + slide;
  const left = `M${lx} ${drop} H${lx - tw} L${lx - tw + notch} ${drop + h / 2} L${lx - tw} ${drop + h} H${lx} Z`;
  const rx = tw + w - slide;
  const right = `M${rx} ${drop} H${rx + tw} L${rx + tw - notch} ${drop + h / 2} L${rx + tw} ${drop + h} H${rx} Z`;
  return (
    <svg
      width={W}
      height={h + drop}
      style={{ position: 'absolute', left: x - W / 2, top: y - h / 2, overflow: 'visible', transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 6px 7px rgba(45,30,12,0.28))' }}
    >
      <g opacity={clamp01(tail * 3)}>
        <path d={left} fill={tailC} />
        <path d={right} fill={tailC} />
        {/* segitiga lipatan: sisi gelap tempat ekor berbelok ke belakang badan */}
        <path d={`M${tw} ${h} L${tw + h * 0.0001} ${drop + h} L${tw + h * 0.45} ${h} Z`} fill={dark} />
        <path d={`M${tw + w} ${h} L${tw + w} ${drop + h} L${tw + w - h * 0.45} ${h} Z`} fill={dark} />
      </g>
      <g transform={`translate(${W / 2} 0) scale(${band} 1) translate(${-W / 2} 0)`}>
        <rect x={tw} y={0} width={w} height={h} fill={color} />
        <rect x={tw} y={h * 0.1} width={w} height={h * 0.08} fill={lighten(color, 0.25)} opacity={0.5} />
        <rect x={tw} y={h * 0.86} width={w} height={h * 0.14} fill={dark} opacity={0.25} />
      </g>
      <text
        x={W / 2}
        y={h / 2 + fs * 0.36}
        textAnchor="middle"
        fill={ink}
        fontFamily="inherit"
        fontWeight={800}
        fontSize={fs}
        letterSpacing={fs * 0.06}
        opacity={clamp01((band - 0.6) / 0.4)}
      >
        {text}
      </text>
    </svg>
  );
};
