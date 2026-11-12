// Pola scene siap pakai (1): angka besar, mitos lawan fakta, perbandingan.
// Setiap pola mengisi area isi aman (default x 60–1020, y 220–1420), memakai token palet dari `style`,
// dan dipicu frame cue. Pola menangani tata letak + gerak; episode cukup mengisi konten dan cue.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Burst, CountUp, DrawPath, Highlight, Idle, Pulse, Shake } from '../anim/accents';
import { DUR, EASE, prog, sec } from '../anim/core';
import { Reveal, SplitText } from '../anim/Reveal';
import { FONT_JAKARTA } from '../brand/fonts';
import type { VisualStyle } from '../episode/types';
import { alpha } from '../look/color';
import { tokens } from '../look/tokens';

export type Area = [number, number, number, number];
export const SAFE: Area = [60, 220, 960, 1200];
type Base = { style: Pick<VisualStyle, 'tone' | 'palette'>; font?: string; area?: Area };

const box = ([x, y, w, h]: Area): React.CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: h });

export type BigNumberProps = Base & {
  at: number;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** label di atas angka (≤ 5 kata) */
  label?: string;
  /** konteks di bawah angka (≤ 8 kata) */
  context?: string;
  contextAt?: number;
  /** ukuran angka px */
  size?: number;
};

/** Angka kunci: label tersusun, angka berhitung lalu mendarat dengan percikan, stabilo, dan konteks menyusul. */
export const BigNumber: React.FC<BigNumberProps> = ({ style, font = FONT_JAKARTA, area = SAFE, at, value, decimals = 0, prefix, suffix, label, context, contextAt, size = 230 }) => {
  const { fps } = useVideoConfig();
  const T = tokens(style);
  const count = sec(0.9, fps);
  const land = at + 6 + count;
  const [x, y, w, h] = area;
  return (
    <AbsoluteFill>
      <div style={{ ...box(area), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, fontFamily: font, textAlign: 'center' }}>
        {label ? (
          <div style={{ fontSize: 56, fontWeight: 800, color: T.muted, lineHeight: 1.15, maxWidth: w }}>
            <SplitText text={label} at={at} />
          </div>
        ) : null}
        <Shake at={land} amp={10} len={10}>
          <Reveal at={at + 6} kind="zoom">
            <Idle amp={2} rot={0.4} breathe={0.008}>
              <Highlight at={land} color={alpha(T.accent, 0.35)} thickness="0.22em">
                <CountUp to={value} at={at + 6} dur={count} decimals={decimals} prefix={prefix} suffix={suffix} style={{ fontSize: size, fontWeight: 800, color: T.accent, lineHeight: 1, letterSpacing: -4 }} />
              </Highlight>
            </Idle>
          </Reveal>
        </Shake>
        {context ? (
          <div style={{ fontSize: 50, fontWeight: 700, color: T.ink, lineHeight: 1.2, maxWidth: w * 0.9 }}>
            <SplitText text={context} at={contextAt ?? land + 8} kind="rise" dist={24} gap={2} />
          </div>
        ) : null}
      </div>
      <Burst at={land} x={x + w / 2} y={y + h / 2} radius={Math.min(w, size * 2.2) / 2} length={60} color={T.accent} />
    </AbsoluteFill>
  );
};

export type MythFactProps = Base & {
  at: number;
  myth: string;
  /** frame mitos dibantah */
  factAt: number;
  fact: string;
  labels?: { myth: string; fact: string };
};

const Tag: React.FC<{ text: string; bg: string; color: string; font: string }> = ({ text, bg, color, font }) => (
  <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 14, background: bg, color, fontFamily: font, fontWeight: 800, fontSize: 34, letterSpacing: 4 }}>{text}</div>
);

/** Mitos muncul di kartu, dicoret saat dibantah, kartu tergetar lalu tergantikan kartu fakta yang dicap. */
export const MythFact: React.FC<MythFactProps> = ({ style, font = FONT_JAKARTA, area = SAFE, at, myth, factAt, fact, labels = { myth: 'MITOS', fact: 'FAKTA' } }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = tokens(style);
  const [x, y, w, h] = area;
  const cardW = w;
  const cardY = y + h * 0.22;
  const swapAt = factAt + sec(0.55, fps);
  const dim = 1 - 0.35 * prog(f, factAt, 8);
  const card = (children: React.ReactNode, border: string): React.CSSProperties => ({
    position: 'absolute', left: x, top: cardY, width: cardW, padding: '48px 52px', borderRadius: 36, background: T.surface,
    boxShadow: T.elevation(3), border: `4px solid ${border}`, fontFamily: font, boxSizing: 'border-box',
  });
  return (
    <AbsoluteFill>
      <Shake at={factAt + 2} amp={12} len={10}>
        <Reveal at={at} kind="rise" exitAt={swapAt} exit="sink" style={{ ...card(null, alpha(T.danger, 0.5)), opacity: dim }}>
          <Tag text={labels.myth} bg={T.danger} color="#fff" font={font} />
          <div style={{ marginTop: 28, fontSize: 64, fontWeight: 800, color: T.ink, lineHeight: 1.15 }}>
            <SplitText text={myth} at={at + 6} />
          </div>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={cardW} height={10}>
            <DrawPath d={`M40 150 C ${cardW * 0.3} 120, ${cardW * 0.6} 210, ${cardW - 40} 170`} at={factAt} dur={sec(0.3, fps)} stroke={T.danger} width={14} />
          </svg>
        </Reveal>
      </Shake>
      <Reveal at={swapAt} kind="flip" style={card(null, T.good)}>
        <Reveal at={swapAt + 6} kind="stamp" inline origin="center">
          <Tag text={labels.fact} bg={T.good} color="#fff" font={font} />
        </Reveal>
        <div style={{ marginTop: 28, fontSize: 64, fontWeight: 800, color: T.ink, lineHeight: 1.15 }}>
          <SplitText text={fact} at={swapAt + 10} />
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};

export type CompareSide = { title: string; value?: string; node?: React.ReactNode };
export type CompareProps = Base & {
  at: number;
  left: CompareSide;
  right: CompareSide;
  /** frame sisi kanan muncul (default at + 0,5 dtk) */
  rightAt?: number;
  /** sorot pemenang: sisi lain meredup */
  verdict?: { side: 'left' | 'right'; at: number; text?: string };
};

/** Dua sisi berdampingan dengan pembatas tergambar dan lencana VS; vonis menyorot satu sisi. */
export const Compare: React.FC<CompareProps> = ({ style, font = FONT_JAKARTA, area = SAFE, at, left, right, rightAt, verdict }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = tokens(style);
  const [x, y, w, h] = area;
  const rAt = rightAt ?? at + sec(0.5, fps);
  const colW = (w - 40) / 2;
  const v = verdict ? prog(f, verdict.at, sec(DUR.base, fps), EASE.out) : 0;
  const side = (s: CompareSide, i: 0 | 1, start: number) => {
    const win = verdict && (verdict.side === 'left' ? 0 : 1) === i;
    const scale = verdict ? (win ? 1 + 0.05 * v : 1 - 0.04 * v) : 1;
    const o = verdict && !win ? 1 - 0.45 * v : 1;
    return (
      <Reveal at={start} kind={i === 0 ? 'slide-right' : 'slide-left'} style={{ position: 'absolute', left: x + i * (colW + 40), top: y + 80, width: colW, height: h - 260 }}>
        <div
          style={{
            width: '100%', height: '100%', borderRadius: 32, background: T.surface, boxShadow: T.elevation(win ? 4 : 2), boxSizing: 'border-box',
            border: `4px solid ${win ? alpha(T.accent, v) : 'transparent'}`, padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 24, fontFamily: font, transform: `scale(${scale})`, opacity: o,
          }}
        >
          <div style={{ fontSize: 46, fontWeight: 800, color: T.ink, textAlign: 'center', lineHeight: 1.1 }}>{s.title}</div>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.node}</div>
          {s.value ? <div style={{ fontSize: 72, fontWeight: 800, color: win ? T.accent : T.ink }}>{s.value}</div> : null}
        </div>
      </Reveal>
    );
  };
  return (
    <AbsoluteFill>
      {side(left, 0, at)}
      {side(right, 1, rAt)}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
        <DrawPath d={`M${x + w / 2} ${y + 80} L${x + w / 2} ${y + h - 180}`} at={at + 4} stroke={T.line} width={4} dash={[14, 12]} />
      </svg>
      <Reveal at={rAt + 6} kind="pop" style={{ position: 'absolute', left: x + w / 2 - 56, top: y + (h - 100) / 2 - 56, width: 112, height: 112, borderRadius: '50%', background: T.accent, color: T.accentInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 800, fontSize: 40, boxShadow: T.elevation(3) }}>
        VS
      </Reveal>
      {verdict?.text ? (
        <Reveal at={verdict.at + 6} kind="rise" style={{ position: 'absolute', left: x, top: y + h - 140, width: w, textAlign: 'center', fontFamily: font, fontWeight: 800, fontSize: 52, color: T.ink }}>
          {verdict.text}
        </Reveal>
      ) : null}
      {verdict ? <Pulse at={verdict.at} x={x + (verdict.side === 'left' ? colW / 2 : colW + 40 + colW / 2)} y={y + 80 + (h - 260) / 2} size={colW * 1.2} color={T.accent} /> : null}
    </AbsoluteFill>
  );
};
