// Entrance/exit siap pakai. Semua dipicu frame cue (relatif awal scene), mis. dari cueFrames().
//
//   <Reveal at={q.gula} kind="pop" style={{ position: 'absolute', left: 540, top: 700, transform: 'translate(-50%,-50%)' }}>…</Reveal>
//   <Stagger at={q.tiga} gap={4} kind="rise" style={{ display: 'flex', gap: 24 }}>{items}</Stagger>
//   <SplitText text="99% maltodekstrin" at={q.isi} kind="mask" accentWords={['99%']} accentStyle={{ color: '#FFB000' }} />
//
// Default sudah mengandung easing, overshoot, blur gerak, dan fade yang lebih cepat dari gerak (lihat docs/TATA-GERAK.md).
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01 } from '../motion';
import { DUR, EASE, impact, sec, springAt } from './core';

export type RevealKind =
  | 'fade' | 'rise' | 'drop' | 'pop' | 'zoom' | 'stamp' | 'flip' | 'mask'
  | 'slide-left' | 'slide-right' | 'wipe-right' | 'wipe-left' | 'wipe-up' | 'wipe-down';
export type ExitKind = 'fade' | 'shrink' | 'sink' | 'blur' | 'pop' | 'wipe' | 'mask';

type Fx = { o: number; tf: string; blur: number; clip?: string };
const NONE: Fx = { o: 1, tf: '', blur: 0 };

const enterFx = (kind: RevealKind, f: number, at: number, dur: number, fps: number, dist: number): Fx => {
  if (f < at) return { o: 0, tf: kind === 'mask' ? 'translateY(110%)' : '', blur: 0, clip: undefined };
  const raw = clamp01((f - at) / dur);
  const p = EASE.out(raw);
  const fade = clamp01(raw * 2.5); // opacity selesai lebih dulu dari gerak
  const snap = EASE.snap(raw);
  switch (kind) {
    case 'fade':
      return { o: p, tf: '', blur: 0 };
    case 'rise':
      return { o: fade, tf: `translateY(${(1 - p) * dist}px)`, blur: (1 - p) * 6 };
    case 'drop': {
      const s = springAt(f, at, fps, { damping: 9, stiffness: 200 });
      return { o: clamp01((f - at) / 3), tf: `translateY(${-(1 - s) * dist * 1.6}px)`, blur: 0 };
    }
    case 'pop': {
      const s = springAt(f, at, fps, { damping: 10, stiffness: 210 });
      return { o: clamp01((f - at) / 4), tf: `scale(${s}) rotate(${(1 - s) * -8}deg)`, blur: 0 };
    }
    case 'zoom':
      return { o: fade, tf: `scale(${1 + (1 - p) * 0.25})`, blur: (1 - p) * 14 };
    case 'stamp': {
      const land = at + Math.max(3, Math.round(dur * 0.45));
      if (f < land) {
        const q = EASE.in(clamp01((f - at) / (land - at)));
        return { o: clamp01((f - at) / 2), tf: `scale(${1.9 - 0.9 * q}) rotate(${-6 + 3 * q}deg)`, blur: (1 - q) * 4 };
      }
      const d = f - land;
      const j = impact(f, land, 10, 10);
      return { o: 1, tf: `translate(${j.x}px, ${j.y}px) scale(${1 + 0.07 * Math.exp(-d / 3) * Math.cos(d * 0.9)}) rotate(-3deg)`, blur: 0 };
    }
    case 'flip':
      return { o: fade, tf: `perspective(900px) rotateX(${(1 - EASE.back(raw)) * 80}deg)`, blur: 0 };
    case 'mask':
      return { o: 1, tf: `translateY(${(1 - snap) * 110}%)`, blur: 0 };
    case 'slide-left':
      return { o: fade, tf: `translateX(${(1 - snap) * dist * 2}px)`, blur: (1 - snap) * 8 };
    case 'slide-right':
      return { o: fade, tf: `translateX(${-(1 - snap) * dist * 2}px)`, blur: (1 - snap) * 8 };
    case 'wipe-right':
      return { o: 1, tf: '', blur: 0, clip: `inset(0 ${(1 - p) * 100}% 0 0)` };
    case 'wipe-left':
      return { o: 1, tf: '', blur: 0, clip: `inset(0 0 0 ${(1 - p) * 100}%)` };
    case 'wipe-up':
      return { o: 1, tf: '', blur: 0, clip: `inset(${(1 - p) * 100}% 0 0 0)` };
    case 'wipe-down':
      return { o: 1, tf: '', blur: 0, clip: `inset(0 0 ${(1 - p) * 100}% 0)` };
  }
};

const exitFx = (kind: ExitKind, f: number, at: number, dur: number, dist: number): Fx => {
  if (f < at) return NONE;
  const raw = clamp01((f - at) / dur);
  const p = EASE.in(raw);
  switch (kind) {
    case 'fade':
      return { o: 1 - p, tf: '', blur: 0 };
    case 'shrink':
      return { o: 1 - p, tf: `scale(${1 - 0.25 * p})`, blur: 0 };
    case 'sink':
      return { o: 1 - p, tf: `translateY(${p * dist}px)`, blur: p * 6 };
    case 'blur':
      return { o: 1 - p, tf: `scale(${1 + 0.1 * p})`, blur: p * 16 };
    case 'pop': {
      const s = raw < 0.35 ? 1 + 0.12 * EASE.out(raw / 0.35) : 1.12 * (1 - EASE.in((raw - 0.35) / 0.65));
      return { o: 1 - clamp01((raw - 0.5) * 2), tf: `scale(${s})`, blur: 0 };
    }
    case 'wipe':
      return { o: 1, tf: '', blur: 0, clip: `inset(0 0 0 ${p * 100}%)` };
    case 'mask':
      return { o: 1, tf: `translateY(${-p * 110}%)`, blur: 0 };
  }
};

export type RevealProps = {
  /** frame mulai (relatif scene) */
  at: number;
  kind?: RevealKind;
  /** durasi entrance dalam frame (default DUR.base) */
  dur?: number;
  /** jarak gerak px untuk rise/drop/slide */
  dist?: number;
  /** frame mulai keluar; kosong = tetap tampil */
  exitAt?: number;
  exit?: ExitKind;
  exitDur?: number;
  /** span inline-block (untuk kata di dalam kalimat) */
  inline?: boolean;
  /** transform-origin, mis. 'bottom center' untuk stempel yang mendarat */
  origin?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Satu elemen masuk (dan opsional keluar). Transform milik `style` (mis. centering) tetap dipakai. */
export const Reveal: React.FC<RevealProps> = ({ at, kind = 'rise', dur, dist = 60, exitAt, exit = 'fade', exitDur, inline, origin, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enterFx(kind, f, at, dur ?? sec(DUR.base, fps), fps, dist);
  const x = exitAt === undefined ? NONE : exitFx(exit, f, exitAt, exitDur ?? sec(DUR.exit, fps), dist);
  const Tag = inline ? 'span' : 'div';
  const blur = e.blur + x.blur;
  const anim: React.CSSProperties = {
    opacity: e.o * x.o,
    transform: [e.tf, x.tf].filter(Boolean).join(' ') || undefined,
    filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
    clipPath: x.clip ?? e.clip,
    transformOrigin: origin,
  };
  const base: React.CSSProperties = inline ? { display: 'inline-block' } : {};
  if (kind === 'mask' || exit === 'mask') {
    // bingkai diam yang memotong isi; isinya yang bergerak
    return (
      <Tag style={{ ...base, overflow: 'hidden', verticalAlign: 'bottom', ...style }}>
        <Tag style={{ ...base, display: 'block', ...anim }}>{children}</Tag>
      </Tag>
    );
  }
  return <Tag style={{ ...base, ...style, ...anim, transform: [style?.transform, anim.transform].filter(Boolean).join(' ') || undefined }}>{children}</Tag>;
};

export type StaggerProps = Omit<RevealProps, 'children' | 'inline'> & {
  /** jeda antaranak dalam frame (default 4 ≈ 0,13 dtk) */
  gap?: number;
  /** jeda keluar antaranak (default 2) */
  exitGap?: number;
  /** gaya pembungkus tiap anak */
  itemStyle?: React.CSSProperties;
  children: React.ReactNode;
};

/** Anak-anak muncul berurutan. `style` = gaya wadah (mis. flex/grid). */
export const Stagger: React.FC<StaggerProps> = ({ at, gap = 4, exitAt, exitGap = 2, style, itemStyle, children, ...rest }) => (
  <div style={style}>
    {React.Children.toArray(children).map((c, i) => (
      <Reveal key={i} {...rest} at={at + i * gap} exitAt={exitAt === undefined ? undefined : exitAt + i * exitGap} style={itemStyle}>
        {c}
      </Reveal>
    ))}
  </div>
);

export type SplitTextProps = Omit<RevealProps, 'children' | 'inline'> & {
  text: string;
  by?: 'word' | 'char';
  /** jeda antarkata/huruf dalam frame (default 3 untuk kata, 1 untuk huruf) */
  gap?: number;
  /** kata yang diberi `accentStyle` (dicocokkan tanpa tanda baca, huruf kecil) */
  accentWords?: string[];
  accentStyle?: React.CSSProperties;
};

const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}%]/gu, '');

/** Teks yang tersusun kata per kata (atau huruf per huruf). Pembungkus baris tetap di batas kata. */
export const SplitText: React.FC<SplitTextProps> = ({ text, by = 'word', gap, at, exitAt, accentWords = [], accentStyle, style, kind = 'mask', ...rest }) => {
  const words = text.split(/\s+/).filter(Boolean);
  const accents = new Set(accentWords.map(bare));
  const step = gap ?? (by === 'word' ? 3 : 1);
  let n = 0;
  return (
    <span style={style}>
      {words.map((w, wi) => {
        const accent = accents.has(bare(w)) ? accentStyle : undefined;
        const space = wi < words.length - 1 ? { marginRight: '0.26em' } : {};
        if (by === 'word') {
          const i = n++;
          return (
            <Reveal key={wi} inline kind={kind} {...rest} at={at + i * step} exitAt={exitAt === undefined ? undefined : exitAt + i} style={{ ...space, ...accent }}>
              {w}
            </Reveal>
          );
        }
        return (
          <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap', ...space, ...accent }}>
            {[...w].map((ch, ci) => {
              const i = n++;
              return (
                <Reveal key={ci} inline kind={kind} {...rest} at={at + i * step} exitAt={exitAt === undefined ? undefined : exitAt + Math.floor(i / 2)}>
                  {ch}
                </Reveal>
              );
            })}
          </span>
        );
      })}
    </span>
  );
};
