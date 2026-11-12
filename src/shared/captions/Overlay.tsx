// Word-by-word captions (vertical 9:16). Shared across topics: pass `lines` (+ optional per-word `anchors`) and a theme.
import { FONT_JAKARTA } from '../brand/fonts';
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

const FONT = `${FONT_JAKARTA}, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

type Theme = 'dark' | 'light' | 'pop';
const STYLE: Record<Theme, { active: string; activeBg: string; past: string; future: string; shadow: string; stroke?: string; fade: string }> = {
  dark: {
    active: '#0f172a',
    activeBg: '#fde047',
    past: '#ffffff',
    future: 'rgba(255,255,255,0.55)',
    shadow: '0 3px 0 #0f172a, 0 0 18px rgba(0,0,0,0.75)',
    stroke: '2px #0f172a',
    fade: 'linear-gradient(180deg, rgba(2,6,23,0) 68%, rgba(2,6,23,0.6) 100%)',
  },
  pop: {
    active: '#FFD23F',
    activeBg: '#16131F', // ink chip: stays visible on every pop background (incl. the yellow ones)
    past: '#ffffff',
    future: 'rgba(255,255,255,0.6)',
    shadow: '5px 5px 0 #16131F',
    stroke: '3px #16131F',
    fade: 'none',
  },
  light: {
    active: '#ffffff',
    activeBg: '#F07A5B',
    past: '#2F3E8F',
    future: 'rgba(47,62,143,0.42)',
    shadow: '0 0 14px rgba(247,241,232,0.95), 0 0 4px rgba(247,241,232,0.95)',
    fade: 'linear-gradient(180deg, rgba(247,241,232,0) 70%, rgba(247,241,232,0.85) 100%)',
  },
};

export type CaptionLine = { from: number; to: number; text: string; anchors?: Record<number, number> };

/** Word start/end frames: anchored words start exactly at their anchor; the words between anchors share
 *  the gap in proportion to their length. */
const wordSpans = (line: CaptionLine) => {
  const words = line.text.split(' ');
  const weights = words.map((w) => 2 + w.length);
  const pts: [number, number][] = [[0, line.from]];
  Object.entries(line.anchors ?? {})
    .map(([k, v]) => [Number(k), v] as [number, number])
    .sort((a, b) => a[0] - b[0])
    .forEach((p) => (p[0] > 0 ? pts.push(p) : (pts[0] = p)));
  pts.push([words.length, line.to]);
  const starts: number[] = [];
  for (let j = 0; j < pts.length - 1; j++) {
    const [i0, t0] = pts[j];
    const [i1, t1] = pts[j + 1];
    const tot = weights.slice(i0, i1).reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    for (let i = i0; i < i1; i++) {
      starts[i] = t0 + ((t1 - t0) * acc) / tot;
      acc += weights[i];
    }
  }
  return words.map((w, i) => ({ w, a: starts[i], b: i + 1 < words.length ? starts[i + 1] : line.to }));
};

const Captions: React.FC<{ f: number; theme: Theme; lines: CaptionLine[] }> = ({ f, theme, lines }) => {
  const st = STYLE[theme];
  const line = lines.find((l) => f >= l.from && f < l.to + 4);
  if (!line) return null;
  const spans = wordSpans(line);
  // long lines: show a window of ~9 words around the spoken word
  const found = spans.findIndex((s) => f >= s.a && f < s.b);
  const cur = found === -1 ? (f >= line.to ? spans.length - 1 : 0) : found;
  const page = Math.floor(cur / 9);
  const shown = spans.slice(page * 9, page * 9 + 9);
  return (
    <div data-layout-ignore style={{ position: 'absolute', left: 60, right: 60, bottom: 230, display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 14px', fontFamily: FONT, fontWeight: 900, fontSize: 58, lineHeight: 1.2, textAlign: 'center' }}>
        {shown.map((s, i) => {
          const active = f >= s.a && f < s.b;
          const past = f >= s.b;
          return (
            <span
              key={i}
              style={{
                color: active ? st.active : past ? st.past : st.future,
                background: active ? st.activeBg : 'transparent',
                padding: '0 12px',
                borderRadius: 12,
                transform: active ? 'scale(1.06)' : 'none',
                textShadow: active ? 'none' : st.shadow,
                WebkitTextStroke: active ? undefined : st.stroke,
                paintOrder: 'stroke fill',
              }}
            >
              {s.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Overlay: React.FC<{ theme?: Theme; lines: CaptionLine[] }> = ({ theme = 'dark', lines }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* bottom fade so captions always read */}
      <AbsoluteFill style={{ background: STYLE[theme].fade }} />
      <Captions f={f} theme={theme} lines={lines} />
    </AbsoluteFill>
  );
};
