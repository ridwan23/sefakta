// Label/callout dengan garis penunjuk ke satu titik. Urutan: titik target berdenyut → garis tergambar → kotak pop.
// Koordinat layar (px). Kotak berpusat di (x, y); garis keluar dari sisi kotak yang paling dekat ke target.
//
//   <Label x={760} y={560} text="Saraf trigeminal" target={[600, 760]} at={q.saraf} />
//   <Label x={300} y={1300} text="Amilosa" sub="pati resisten" target={[480, 1150]} at={q.pati} variant="paper" />
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog, springAt } from '../anim/core';
import { clamp01 } from '../motion';

export type LabelProps = {
  x: number;
  y: number;
  text: string;
  /** baris kecil di bawah teks */
  sub?: string;
  /** titik yang ditunjuk (px); kosong = label tanpa garis */
  target?: [number, number];
  at?: number;
  /** lebar kotak (px); kosong = perkiraan dari panjang teks */
  width?: number;
  fontSize?: number;
  /** solid = kotak tinta; paper = kertas dengan bayangan (kolase); ghost = teks saja */
  variant?: 'solid' | 'paper' | 'ghost';
  ink?: string;
  bg?: string;
  /** warna garis dan titik */
  accent?: string;
  /** garis siku (horizontal lalu ke target) alih-alih lurus */
  elbow?: boolean;
  exitAt?: number;
};

export const Label: React.FC<LabelProps> = ({
  x, y, text, sub, target, at, width, fontSize = 34, variant = 'solid', ink, bg, accent = '#FF765E', elbow = false, exitAt,
}) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  if (at !== undefined && f < at) return null;
  const a = at ?? -1000;
  const out = exitAt === undefined ? 0 : prog(f, exitAt, 8, EASE.in);
  const dot = target ? springAt(f, a, fps, { damping: 10, stiffness: 200 }) : 1;
  const lineP = target ? prog(f, a + 4, 12, EASE.inOut) : 1;
  const boxP = springAt(f, a + (target ? 12 : 0), fps, { damping: 12, stiffness: 190 });
  const fg = ink ?? (variant === 'solid' ? '#FFFFFF' : '#172235');
  const fill = bg ?? (variant === 'solid' ? '#172235' : variant === 'paper' ? '#FFF8EB' : 'transparent');
  const w = width ?? Math.max(text.length * fontSize * 0.58, (sub?.length ?? 0) * fontSize * 0.42) + fontSize * 1.3;
  const h = fontSize * (sub ? 2.3 : 1.65);

  let lineD = '';
  if (target) {
    const [tx, ty] = target;
    const dx = tx - x;
    const dy = ty - y;
    // titik keluar di tepi kotak, searah target
    const sx = Math.abs(dx) / (w / 2 + 1e-6);
    const sy = Math.abs(dy) / (h / 2 + 1e-6);
    const s = 1 / Math.max(sx, sy, 1e-6);
    const ex = x + dx * s;
    const ey = y + dy * s;
    lineD = elbow ? `M${ex} ${ey} L${tx} ${ey} L${tx} ${ty}` : `M${ex} ${ey} L${tx} ${ty}`;
  }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - out, pointerEvents: 'none' }}>
      {target ? (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <path d={lineD} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lineP} />
          <circle cx={target[0]} cy={target[1]} r={11 * dot} fill={accent} />
          <circle cx={target[0]} cy={target[1]} r={11 + 16 * clamp01(dot)} fill="none" stroke={accent} strokeWidth={3} opacity={(1 - clamp01((f - a) / 24)) * 0.8} />
        </svg>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: fill,
          color: fg,
          borderRadius: variant === 'paper' ? 4 : fontSize * 0.35,
          boxShadow: variant === 'ghost' ? undefined : variant === 'paper' ? '0 6px 10px rgba(45,30,12,0.25)' : '0 8px 20px rgba(0,0,0,0.25)',
          transform: `scale(${boxP}) rotate(${variant === 'paper' ? -2 : 0}deg)`,
          opacity: clamp01(boxP * 2),
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 800, fontSize, whiteSpace: 'nowrap' }}>{text}</div>
        {sub ? <div style={{ fontWeight: 600, fontSize: fontSize * 0.62, opacity: 0.75, marginTop: fontSize * 0.12, whiteSpace: 'nowrap' }}>{sub}</div> : null}
      </div>
    </div>
  );
};
