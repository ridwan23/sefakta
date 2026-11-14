// Gaya grid Swiss (International Typographic Style): grid modular yang terlihat, tipografi sans tebal rata kiri
// (Inter 900, spasi rapat), blok warna yang menyapu masuk mengikuti sel grid, garis tipis, dan banyak ruang kosong.
// Semua posisi diambil dari grid, bukan angka bebas.
//
//   const g = swissGrid();                                 // 6 kolom × 12 baris di dalam margin aman
//   <SwissSurface />
//   <SwissGridLines g={g} at={0} />
//   <SwissBlock {...g.rect(0, 2, 4, 3)} color={SWISS.merah} at={q.blok} from="left" />
//   <SwissType {...g.rect(0, 6, 6, 3)} lines={['78%', 'air']} at={q.angka} size={220} />
//   <SwissRule {...g.rect(0, 9, 6, 0)} at={q.garis} />
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, prog } from '../anim/core';
import { font } from '../brand/fonts';
import { clamp01 } from '../motion';

export const SWISS = {
  kertas: '#F1EEE7',
  hitam: '#111111',
  merah: '#E3241B',
  biru: '#1F4FD8',
  kuning: '#F7C600',
  abu: '#8C8C8C',
} as const;

export const swissFont = () => font('inter');

export type Rect = { x: number; y: number; w: number; h: number };

export type SwissGrid = {
  cols: number;
  rows: number;
  colW: number;
  rowH: number;
  gutter: number;
  box: Rect;
  /** sel (col, row) seluas (cs × rs) sel, termasuk gutter di dalamnya */
  rect: (col: number, row: number, cs?: number, rs?: number) => Rect;
};

/** Grid modular. Default memakai margin aman SeFakta (atas 260 untuk watermark, bawah 420 untuk caption). */
export const swissGrid = (o: { cols?: number; rows?: number; gutter?: number; box?: Rect } = {}): SwissGrid => {
  const cols = o.cols ?? 6;
  const rows = o.rows ?? 12;
  const gutter = o.gutter ?? 24;
  const box = o.box ?? { x: 72, y: 260, w: 1080 - 144, h: 1920 - 260 - 420 };
  const colW = (box.w - gutter * (cols - 1)) / cols;
  const rowH = (box.h - gutter * (rows - 1)) / rows;
  return {
    cols, rows, colW, rowH, gutter, box,
    rect: (c, r, cs = 1, rs = 1) => ({
      x: box.x + c * (colW + gutter),
      y: box.y + r * (rowH + gutter),
      w: cs * colW + Math.max(0, cs - 1) * gutter,
      h: rs * rowH + Math.max(0, rs - 1) * gutter,
    }),
  };
};

export const SwissSurface: React.FC<{ color?: string }> = ({ color = SWISS.kertas }) => <AbsoluteFill style={{ background: color }} />;

/** Garis bantu grid yang tergambar lalu memudar ke `rest` (grid tetap terasa, tidak mengganggu). */
export const SwissGridLines: React.FC<{ g: SwissGrid; at?: number; color?: string; rest?: number }> = ({ g, at = 0, color = SWISS.hitam, rest = 0.08 }) => {
  const frame = useCurrentFrame();
  const lines: React.ReactNode[] = [];
  for (let c = 0; c <= g.cols; c++) {
    const x = c === g.cols ? g.box.x + g.box.w : g.rect(c, 0).x;
    const p = prog(frame, at + c * 2, 18, EASE.inOut);
    lines.push(<line key={`c${c}`} x1={x} x2={x} y1={g.box.y} y2={g.box.y + g.box.h * p} />);
    if (c > 0 && c < g.cols) {
      const x2 = x - g.gutter;
      lines.push(<line key={`cg${c}`} x1={x2} x2={x2} y1={g.box.y} y2={g.box.y + g.box.h * p} />);
    }
  }
  for (let r = 0; r <= g.rows; r++) {
    const y = r === g.rows ? g.box.y + g.box.h : g.rect(0, r).y;
    const p = prog(frame, at + 6 + r, 18, EASE.inOut);
    lines.push(<line key={`r${r}`} y1={y} y2={y} x1={g.box.x} x2={g.box.x + g.box.w * p} />);
  }
  const fade = 0.35 - (0.35 - rest) * prog(frame, at + 30, 20);
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g stroke={color} strokeWidth={1.5} opacity={fade}>
        {lines}
      </g>
    </svg>
  );
};

type Dir = 'left' | 'right' | 'up' | 'down';
const CLIP: Record<Dir, (p: number) => string> = {
  left: (p) => `inset(0 ${(1 - p) * 100}% 0 0)`,
  right: (p) => `inset(0 0 0 ${(1 - p) * 100}%)`,
  down: (p) => `inset(0 0 ${(1 - p) * 100}% 0)`,
  up: (p) => `inset(${(1 - p) * 100}% 0 0 0)`,
};

/** Blok warna yang menyapu masuk dari satu sisi (tepi tegas, tanpa bayangan). */
export const SwissBlock: React.FC<Rect & { color?: string; at?: number; from?: Dir; dur?: number; children?: React.ReactNode }> = ({
  x, y, w, h, color = SWISS.merah, at, from = 'left', dur = 14, children,
}) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : prog(frame, at, dur, EASE.inOut);
  if (p <= 0) return null;
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: color, clipPath: CLIP[from](p), overflow: 'hidden' }}>{children}</div>;
};

/** Garis tipis horizontal/vertikal yang memanjang (pemisah, sumbu). `h` = 0 → horizontal. */
export const SwissRule: React.FC<Rect & { at?: number; color?: string; weight?: number }> = ({ x, y, w, h, at, color = SWISS.hitam, weight = 6 }) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : prog(frame, at, 16, EASE.inOut);
  const horiz = h <= w;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: horiz ? w * p : weight,
        height: horiz ? weight : h * p,
        background: color,
      }}
    />
  );
};

export type SwissTypeProps = Rect & {
  lines: string[];
  at?: number;
  size?: number;
  weight?: 400 | 700 | 900;
  color?: string;
  /** warna per baris (menimpa `color`) */
  colors?: (string | undefined)[];
  /** jeda antar-baris (frame) */
  stagger?: number;
  /** jangkar vertikal di dalam rect */
  align?: 'top' | 'bottom';
};

/** Tipografi Swiss: rata kiri, spasi huruf rapat, tiap baris naik dari balik garis (mask). */
export const SwissType: React.FC<SwissTypeProps> = ({ x, y, w, h, lines, at, size = 120, weight = 900, color = SWISS.hitam, colors, stagger = 5, align = 'top' }) => {
  const frame = useCurrentFrame();
  const ff = swissFont();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: align === 'top' ? 'flex-start' : 'flex-end',
        fontFamily: ff,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: weight === 900 ? -size * 0.045 : -size * 0.02,
        color,
      }}
    >
      {lines.map((ln, i) => {
        const p = at === undefined ? 1 : prog(frame, at + i * stagger, 14, EASE.out);
        return (
          <div key={i} style={{ overflow: 'hidden', paddingBottom: size * 0.06 }}>
            <div style={{ transform: `translateY(${((1 - p) * 105).toFixed(1)}%)`, color: colors?.[i], whiteSpace: 'nowrap', opacity: clamp01(p * 3) }}>{ln}</div>
          </div>
        );
      })}
    </div>
  );
};
