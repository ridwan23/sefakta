// Pola scene siap pakai (2): alur proses, peringkat/daftar berbatang, zoom ke detail (kamera atau kaca pembesar).
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CountUp, DrawPath, Pulse } from '../anim/accents';
import { DUR, EASE, prog, sec, track } from '../anim/core';
import { Reveal, SplitText } from '../anim/Reveal';
import { FONT_JAKARTA } from '../brand/fonts';
import { alpha } from '../look/color';
import { Icon } from '../look/Icon';
import { tokens } from '../look/tokens';
import { SAFE, type Area } from './cards';
import type { VisualStyle } from '../episode/types';

type Base = { style: Pick<VisualStyle, 'tone' | 'palette'>; font?: string; area?: Area };

export type FlowStep = { label: string; at: number; /** nama ikon registri (mis. "lucide:flask-conical") atau node sendiri */ icon?: string | React.ReactNode };

/** Langkah proses vertikal: simpul muncul pada cue, penghubung tergambar dari langkah sebelumnya, langkah aktif berdenyut,
 *  langkah lama meredup supaya fokus baca tetap satu. Cocok 3–5 langkah. */
export const ProcessFlow: React.FC<Base & { steps: FlowStep[]; dimPast?: boolean }> = ({ style, font = FONT_JAKARTA, area = SAFE, steps, dimPast = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = tokens(style);
  const [x, y, w, h] = area;
  const n = steps.length;
  const gapY = h / n;
  const node = 150;
  const cx = x + node / 2 + 20;
  const cy = (i: number) => y + gapY * (i + 0.5);
  return (
    <AbsoluteFill>
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
        {steps.slice(1).map((s, i) => (
          <DrawPath key={i} d={`M${cx} ${cy(i) + node / 2 + 10} L${cx} ${cy(i + 1) - node / 2 - 10}`} at={s.at - sec(0.35, fps)} dur={sec(0.35, fps)} stroke={T.accent} width={8} dash={[18, 14]} arrow />
        ))}
      </svg>
      {steps.map((s, i) => {
        const next = steps[i + 1];
        const past = dimPast && next ? prog(f, next.at, 10) : 0;
        return (
          <React.Fragment key={i}>
            <Pulse at={s.at} x={cx} y={cy(i)} size={node * 1.9} color={T.accent} />
            <Reveal at={s.at} kind="pop" style={{ position: 'absolute', left: cx - node / 2, top: cy(i) - node / 2, width: node, height: node, borderRadius: '50%', background: T.surface, boxShadow: T.elevation(3), border: `5px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - past * 0.5 }}>
              {typeof s.icon === 'string' ? <Icon name={s.icon} size={node * 0.52} color={T.ink} draw={{ at: s.at + 4 }} /> : s.icon ?? <span style={{ fontFamily: font, fontWeight: 800, fontSize: 64, color: T.ink }}>{i + 1}</span>}
            </Reveal>
            <div style={{ position: 'absolute', left: cx + node / 2 + 36, top: cy(i) - 60, width: w - node - 80, height: 120, display: 'flex', alignItems: 'center', fontFamily: font, fontWeight: 800, fontSize: 52, lineHeight: 1.1, color: T.ink, opacity: 1 - past * 0.5 }}>
              <SplitText text={s.label} at={s.at + 4} kind="rise" dist={22} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export type RankItem = { label: string; value: number; display?: string };

/** Daftar berbatang: baris muncul berurutan, batang tumbuh sebanding nilai, angka berhitung; satu baris bisa disorot. */
export const RankList: React.FC<Base & { at: number; items: RankItem[]; gap?: number; unit?: string; highlight?: { index: number; at: number }; decimals?: number }> = ({
  style, font = FONT_JAKARTA, area = SAFE, at, items, gap, unit = '', highlight, decimals = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = tokens(style);
  const [x, y, w, h] = area;
  const step = gap ?? sec(0.35, fps);
  const max = Math.max(...items.map((i) => i.value));
  const rowH = Math.min(190, h / items.length);
  const hl = highlight ? prog(f, highlight.at, sec(DUR.base, fps), EASE.out) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: font }}>
      {items.map((it, i) => {
        const start = at + i * step;
        const grow = prog(f, start + 4, sec(0.7, fps), EASE.out);
        const isHl = highlight?.index === i;
        const o = highlight && !isHl ? 1 - 0.5 * hl : 1;
        const barW = (w - 40) * (it.value / max) * grow;
        return (
          <Reveal key={i} at={start} kind="slide-right" dist={40} style={{ position: 'absolute', left: x, top: y + i * rowH + (h - rowH * items.length) / 2, width: w, height: rowH, opacity: o, transform: `scale(${isHl ? 1 + 0.04 * hl : 1})`, transformOrigin: 'left center' }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: T.ink, marginBottom: 12 }}>{it.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ height: 54, width: Math.max(8, barW), borderRadius: 16, background: isHl ? T.accent : alpha(T.ink, 0.22 + 0.1 * (1 - i / items.length)), boxShadow: isHl ? T.elevation(2) : 'none' }} />
              <div style={{ fontSize: 46, fontWeight: 800, color: isHl ? T.accent : T.muted, whiteSpace: 'nowrap' }}>
                {it.display ?? <CountUp to={it.value} at={start + 4} dur={sec(0.7, fps)} decimals={decimals} suffix={unit} />}
              </div>
            </div>
          </Reveal>
        );
      })}
    </AbsoluteFill>
  );
};

export type ZoomDetailProps = Base & {
  at: number;
  /** titik detail di layar */
  focus: [number, number];
  zoom?: number;
  /** camera = seluruh gambar diperbesar ke titik; loupe = kaca pembesar muncul di `loupeAt` */
  mode?: 'camera' | 'loupe';
  loupeAt?: [number, number];
  radius?: number;
  label?: string;
  /** frame kembali (camera) / kaca pembesar menutup (loupe) */
  until?: number;
  children: React.ReactNode;
};

/** Zoom ke detail. `children` = isi scene yang diperbesar (dirender ulang di dalam lensa pada mode loupe). */
export const ZoomDetail: React.FC<ZoomDetailProps> = ({ style, font = FONT_JAKARTA, at, focus, zoom = 2.4, mode = 'loupe', loupeAt, radius = 230, label, until, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = tokens(style);
  const len = sec(0.8, fps);
  if (mode === 'camera') {
    const z = track(f, until ? [[at, 1], [at + len, zoom], [until, zoom], [until + len, 1]] : [[at, 1], [at + len, zoom]]);
    const p = (z - 1) / (zoom - 1 || 1);
    // titik fokus bergeser ke tengah layar sambil diperbesar
    const tx = (540 - focus[0]) * p, ty = (840 - focus[1]) * p;
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: `${focus[0]}px ${focus[1]}px` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const [lx, ly] = loupeAt ?? [Math.min(1020 - radius, focus[0] + 260), Math.max(220 + radius, focus[1] - 380)];
  const open = prog(f, at, sec(DUR.base, fps), EASE.back) * (until ? 1 - prog(f, until, sec(DUR.exit, fps), EASE.in) : 1);
  const r = radius * open;
  return (
    <AbsoluteFill>
      {children}
      {open > 0.01 ? (
        <>
          <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
            <circle cx={focus[0]} cy={focus[1]} r={radius / zoom} fill="none" stroke={T.accent} strokeWidth={5} opacity={open} />
            <DrawPath d={`M${focus[0]} ${focus[1]} L${lx} ${ly}`} at={at} dur={sec(0.25, fps)} stroke={T.accent} width={5} />
          </svg>
          <div style={{ position: 'absolute', left: lx - r, top: ly - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden', border: `8px solid ${T.surface}`, boxShadow: `${T.elevation(4)}, inset 0 0 40px ${alpha('#000000', 0.25)}`, background: T.bg }}>
            <div style={{ position: 'absolute', left: r - focus[0] * zoom, top: r - focus[1] * zoom, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: '0 0' }}>{children}</div>
            {/* kilau kaca */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 30% 25%, ${alpha('#ffffff', 0.35)} 0%, transparent 35%)` }} />
          </div>
          {label ? (
            <Reveal at={at + 8} kind="rise" dist={20} style={{ position: 'absolute', left: lx - 260, top: ly + radius + 22, width: 520, textAlign: 'center', fontFamily: font, fontWeight: 800, fontSize: 44, color: T.ink }}>
              {label}
            </Reveal>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
