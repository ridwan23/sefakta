// Gaya isometrik garis: proyeksi isometrik 2:1, grid lantai yang tergambar dari tengah, kotak/bangunan garis yang
// tumbuh dari lantai, dan jalur alir (pipa, rute logistik) dengan arus bergerak. Semua dalam satu `IsoView`.
//
//   const v = isoView({ ox: 540, oy: 1000, unit: 70 });          // titik (0,0,0) di layar dan ukuran satu sel
//   <IsoGrid view={v} size={6} at={q.lantai} />
//   <IsoBox view={v} x={-1} y={-1} w={2} d={2} h={3} at={q.gudang} color="#2F7F86" />
//   <IsoFlow view={v} points={[[-3, 0, 0], [0, 0, 0], [0, 3, 0]]} at={q.kirim} />
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog } from '../anim/core';
import { lighten, mix } from '../look/color';
import { clamp01 } from '../motion';

export type IsoView = {
  ox: number;
  oy: number;
  unit: number;
  /** proyeksi titik dunia (x ke kanan-bawah, y ke kiri-bawah, z ke atas; satuan sel) ke layar */
  p: (x: number, y: number, z?: number) => [number, number];
};

/** Proyeksi isometrik "piksel" 2:1 (sudut 26,57°), lazim di ilustrasi isometrik. */
export const isoView = ({ ox, oy, unit }: { ox: number; oy: number; unit: number }): IsoView => ({
  ox,
  oy,
  unit,
  p: (x, y, z = 0) => [ox + (x - y) * unit, oy + (x + y) * unit * 0.5 - z * unit],
});

const pt = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

const Layer: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', opacity }}>
      {children}
    </svg>
  );
};

export const ISO = {
  garis: '#1E2A3A',
  latar: '#EEF2F5',
  grid: '#B9C4CF',
  aksen: '#2F7F86',
  hangat: '#F2A541',
} as const;

export type IsoGridProps = {
  view: IsoView;
  /** jumlah sel dari tengah ke tepi */
  size?: number;
  at?: number;
  color?: string;
  /** garis grid memudar ke tepi */
  fade?: boolean;
};

/** Grid lantai isometrik: garis tergambar dari tengah keluar, memudar di tepi. */
export const IsoGrid: React.FC<IsoGridProps> = ({ view, size = 6, at, color = ISO.grid, fade = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = at === undefined ? 1 : prog(f, at, Math.round(fps * 0.8), EASE.out);
  if (P <= 0) return null;
  const lines: React.ReactNode[] = [];
  for (let i = -size; i <= size; i++) {
    const order = Math.abs(i) / size;
    const q = clamp01((P - order * 0.5) / 0.5);
    if (q <= 0) continue;
    const op = fade ? 0.25 + 0.75 * (1 - order) ** 1.5 : 1;
    // garis sepanjang x (y tetap) dan sepanjang y (x tetap), tumbuh dari tengah ke dua arah
    const L = size * q;
    lines.push(<path key={`a${i}`} d={`M${pt(view.p(-L, i))} L${pt(view.p(L, i))}`} opacity={op} />);
    lines.push(<path key={`b${i}`} d={`M${pt(view.p(i, -L))} L${pt(view.p(i, L))}`} opacity={op} />);
  }
  return (
    <Layer>
      <g stroke={color} strokeWidth={2} fill="none" strokeLinecap="round">
        {lines}
      </g>
    </Layer>
  );
};

export type IsoBoxProps = {
  view: IsoView;
  /** sudut belakang (x, y) di lantai, satuan sel */
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  /** tinggi dasar (z) */
  z?: number;
  at?: number;
  color?: string;
  line?: string;
  /** garis saja (wireframe) tanpa isi */
  wire?: boolean;
  /** konten di sisi kanan-depan (mis. jendela): baris × kolom kotak kecil */
  windows?: [number, number];
  /** label di atap */
  label?: string;
};

/**
 * Balok/bangunan isometrik bergaris: tumbuh dari lantai (tinggi 0 → h dengan sedikit overshoot), tiga sisi berbeda
 * terang (atas paling terang, kiri sedang, kanan gelap), garis tepi tegas.
 */
export const IsoBox: React.FC<IsoBoxProps> = ({ view, x, y, w, d, h, z = 0, at, color = '#FFFFFF', line = ISO.garis, wire = false, windows, label }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at !== undefined && f < at) return null;
  const g = at === undefined ? 1 : prog(f, at, Math.round(fps * 0.5), EASE.back);
  const hh = Math.max(0.001, h * g);
  const P = view.p;
  const z0 = z;
  const z1 = z + hh;
  // sudut: A=(x,y) belakang, B=(x+w,y) kanan, C=(x+w,y+d) depan, D=(x,y+d) kiri
  const top = `M${pt(P(x, y, z1))} L${pt(P(x + w, y, z1))} L${pt(P(x + w, y + d, z1))} L${pt(P(x, y + d, z1))} Z`;
  const left = `M${pt(P(x, y + d, z1))} L${pt(P(x + w, y + d, z1))} L${pt(P(x + w, y + d, z0))} L${pt(P(x, y + d, z0))} Z`;
  const right = `M${pt(P(x + w, y, z1))} L${pt(P(x + w, y + d, z1))} L${pt(P(x + w, y + d, z0))} L${pt(P(x + w, y, z0))} Z`;
  const fills = wire ? ['none', 'none', 'none'] : [lighten(color, 0.35), color, mix(color, '#1E2A3A', 0.22)];
  const win: React.ReactNode[] = [];
  if (windows && !wire) {
    const [rows, cols] = windows;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        // sisi kanan: sepanjang y pada x+w
        const y0 = y + ((c + 0.25) / cols) * d;
        const y1 = y + ((c + 0.75) / cols) * d;
        const za = z + ((r + 0.3) / rows) * h;
        const zb = z + ((r + 0.75) / rows) * h;
        if (zb > z1) continue;
        win.push(<path key={`${r}-${c}`} d={`M${pt(P(x + w, y0, zb))} L${pt(P(x + w, y1, zb))} L${pt(P(x + w, y1, za))} L${pt(P(x + w, y0, za))} Z`} fill={ISO.hangat} opacity={0.85} />);
      }
  }
  const [lx, ly] = P(x + w / 2, y + d / 2, z1);
  return (
    <Layer opacity={clamp01(g * 4)}>
      <g stroke={line} strokeWidth={3} strokeLinejoin="round">
        <path d={left} fill={fills[1]} />
        <path d={right} fill={fills[2]} />
        <path d={top} fill={fills[0]} />
      </g>
      <g stroke={line} strokeWidth={2}>
        {win}
      </g>
      {label ? (
        <text x={lx} y={ly + 10} textAnchor="middle" fontFamily="inherit" fontWeight={800} fontSize={view.unit * 0.42} fill={line} opacity={clamp01((g - 0.7) / 0.3)}>
          {label}
        </text>
      ) : null}
    </Layer>
  );
};

export type IsoFlowProps = {
  view: IsoView;
  /** titik jalur (x, y, z) satuan sel; segmen sebaiknya sejajar sumbu */
  points: [number, number, number?][];
  at?: number;
  color?: string;
  width?: number;
  /** arus bergerak (titik-titik mengalir) setelah jalur tergambar */
  flow?: boolean;
  /** px per detik arus */
  speed?: number;
};

/** Jalur alir isometrik: pipa tergambar dari awal ke akhir, lalu arus putus-putus bergerak di dalamnya. */
export const IsoFlow: React.FC<IsoFlowProps> = ({ view, points, at, color = ISO.aksen, width = 10, flow = true, speed = 120 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = at === undefined ? 1 : prog(f, at, Math.round(fps * 0.7), EASE.inOut);
  if (p <= 0) return null;
  const d = points.map(([x, y, z], i) => `${i ? 'L' : 'M'}${pt(view.p(x, y, z ?? 0))}`).join(' ');
  const t = (f - (at ?? 0)) / fps;
  return (
    <Layer>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke={ISO.garis} strokeWidth={width + 6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        <path d={d} stroke={color} strokeWidth={width} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        {flow && p >= 1 ? <path d={d} stroke="#FFFFFF" strokeWidth={width * 0.4} strokeDasharray={`${width * 0.6} ${width * 2.4}`} strokeDashoffset={-t * speed} opacity={0.9} /> : null}
      </g>
    </Layer>
  );
};
