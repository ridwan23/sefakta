// Rumus tanpa dependensi: penulisan mirip LaTeX mini, dirender HTML (pecahan, akar, pangkat, indeks, simbol),
// muncul simbol demi simbol, bagian penting bisa disorot. Font serif dari registri (Playfair Display).
//
//   <Formula x={540} y={800} tex="E = mc^2" at={q.rumus} />
//   <Formula x={540} y={1100} tex="\hl{v} = \frac{\Delta s}{\Delta t}" at={q.v} highlightAt={q.kecepatan} />
//
// Sintaks: \frac{a}{b}, \sqrt{x}, x^2, x^{n+1}, x_1, x_{max}, \hl{…} (sorot), \text{kata} (tegak, bukan variabel),
// simbol: \times \cdot \div \pm \approx \ne \le \ge \to \infty \pi \Delta \sigma \mu \alpha \beta \theta \lambda \sum \degree
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog, springAt } from '../anim/core';
import { font } from '../brand/fonts';
import { clamp01 } from '../motion';

const SYM: Record<string, string> = {
  times: '×', cdot: '·', div: '÷', pm: '±', approx: '≈', ne: '≠', le: '≤', ge: '≥', to: '→', infty: '∞',
  pi: 'π', Delta: 'Δ', sigma: 'σ', mu: 'μ', alpha: 'α', beta: 'β', theta: 'θ', lambda: 'λ', sum: 'Σ', degree: '°', gamma: 'γ', rho: 'ρ', omega: 'ω',
};
const OPS = new Set(['=', '+', '-', '−', '×', '·', '÷', '±', '≈', '≠', '≤', '≥', '→', '<', '>']);

type Node =
  | { t: 'leaf'; s: string; kind: 'var' | 'num' | 'op' | 'sym' | 'text'; i: number }
  | { t: 'row'; c: Node[] }
  | { t: 'frac'; a: Node; b: Node; i: number }
  | { t: 'sqrt'; a: Node; i: number }
  | { t: 'sup' | 'sub'; a: Node }
  | { t: 'hl'; a: Node };

/** Parser rekursif kecil. Indeks `i` = urutan kemunculan (untuk stagger). */
const parse = (src: string) => {
  let pos = 0;
  let idx = 0;
  const peek = () => src[pos];
  const readGroup = (): Node => {
    while (peek() === ' ') pos++;
    if (peek() === '{') {
      pos++;
      const r = readRow('}');
      pos++;
      return r;
    }
    return readAtom() ?? { t: 'row', c: [] };
  };
  const readAtom = (): Node | null => {
    const ch = peek();
    if (ch === undefined) return null;
    if (ch === '\\') {
      pos++;
      let name = '';
      while (pos < src.length && /[a-zA-Z]/.test(src[pos])) name += src[pos++];
      if (name === 'frac') {
        const i = idx++;
        return { t: 'frac', a: readGroup(), b: readGroup(), i };
      }
      if (name === 'sqrt') {
        const i = idx++;
        return { t: 'sqrt', a: readGroup(), i };
      }
      if (name === 'hl') return { t: 'hl', a: readGroup() };
      if (name === 'text') {
        while (peek() === ' ') pos++;
        pos++; // {
        let s = '';
        while (pos < src.length && src[pos] !== '}') s += src[pos++];
        pos++;
        return { t: 'leaf', s, kind: 'text', i: idx++ };
      }
      const s = SYM[name] ?? name;
      return { t: 'leaf', s, kind: OPS.has(s) ? 'op' : 'sym', i: idx++ };
    }
    if (ch === '^' || ch === '_') {
      pos++;
      return { t: ch === '^' ? 'sup' : 'sub', a: readGroup() };
    }
    if (/[0-9.,]/.test(ch)) {
      let s = '';
      while (pos < src.length && /[0-9.,]/.test(src[pos])) s += src[pos++];
      return { t: 'leaf', s, kind: 'num', i: idx++ };
    }
    pos++;
    if (ch === '-') return { t: 'leaf', s: '−', kind: 'op', i: idx++ };
    if (OPS.has(ch)) return { t: 'leaf', s: ch, kind: 'op', i: idx++ };
    if (/[a-zA-Z]/.test(ch)) return { t: 'leaf', s: ch, kind: 'var', i: idx++ };
    return { t: 'leaf', s: ch, kind: 'sym', i: idx++ };
  };
  const readRow = (end?: string): Node => {
    const c: Node[] = [];
    while (pos < src.length && peek() !== end) {
      if (peek() === ' ') {
        pos++;
        continue;
      }
      const a = readAtom();
      if (a) c.push(a);
    }
    return { t: 'row', c };
  };
  const root = readRow();
  return { root, count: idx };
};

export type FormulaProps = {
  x: number;
  y: number;
  tex: string;
  at?: number;
  /** jarak antarsimbol muncul (frame) */
  stagger?: number;
  size?: number;
  color?: string;
  /** warna bagian \hl{…} */
  accent?: string;
  /** frame bagian \hl{…} disorot; default setelah semua simbol muncul */
  highlightAt?: number;
  /** id font dari registri */
  fontId?: string;
  exitAt?: number;
};

/** Rumus yang muncul simbol demi simbol (naik + pop), garis pecahan dan akar tergambar, bagian \hl disorot. */
export const Formula: React.FC<FormulaProps> = ({ x, y, tex, at, stagger = 3, size = 96, color = '#F4F1E8', accent = '#FFB000', highlightAt, fontId = 'playfair-display', exitAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fam = font(fontId);
  const { root, count } = React.useMemo(() => parse(tex), [tex]);
  if (at !== undefined && f < at) return null;
  const a0 = at ?? -1000;
  const hlAt = highlightAt ?? a0 + count * stagger + 10;
  const hlP = at === undefined && highlightAt === undefined ? 1 : prog(f, hlAt, 10, EASE.out);
  const out = exitAt === undefined ? 0 : prog(f, exitAt, 8, EASE.in);
  const pAt = (i: number) => springAt(f, a0 + i * stagger, fps, { damping: 13, stiffness: 200 });
  const drawAt = (i: number) => prog(f, a0 + i * stagger, 10, EASE.inOut);

  const render = (n: Node, key: React.Key, hl = false): React.ReactNode => {
    switch (n.t) {
      case 'row':
        return (
          <span key={key} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {n.c.map((c, i) => render(c, i, hl))}
          </span>
        );
      case 'leaf': {
        const p = pAt(n.i);
        const pad = n.kind === 'op' ? '0 0.22em' : n.kind === 'text' ? '0 0.12em' : '0 0.02em';
        return (
          <span
            key={key}
            style={{
              display: 'inline-block',
              padding: pad,
              fontStyle: n.kind === 'var' ? 'italic' : 'normal',
              fontFamily: n.kind === 'text' ? 'inherit' : fam,
              fontWeight: 700,
              opacity: clamp01(p * 2),
              transform: `translateY(${(1 - p) * 0.35}em) scale(${0.6 + 0.4 * p})`,
            }}
          >
            {n.s}
          </span>
        );
      }
      case 'sup':
      case 'sub':
        return (
          <span key={key} style={{ display: 'inline-flex', fontSize: '0.6em', alignSelf: n.t === 'sup' ? 'flex-start' : 'flex-end', transform: `translateY(${n.t === 'sup' ? -0.35 : 0.3}em)` }}>
            {render(n.a, 0, hl)}
          </span>
        );
      case 'frac': {
        const p = drawAt(n.i);
        return (
          <span key={key} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 0.12em', fontSize: '0.82em' }}>
            <span style={{ padding: '0 0.15em' }}>{render(n.a, 'a', hl)}</span>
            <span style={{ alignSelf: 'stretch', height: '0.07em', background: 'currentColor', margin: '0.08em 0', transform: `scaleX(${p})`, borderRadius: 4 }} />
            <span style={{ padding: '0 0.15em' }}>{render(n.b, 'b', hl)}</span>
          </span>
        );
      }
      case 'sqrt': {
        const p = drawAt(n.i);
        return (
          <span key={key} style={{ display: 'inline-flex', alignItems: 'stretch', margin: '0 0.08em' }}>
            <svg viewBox="0 0 40 100" preserveAspectRatio="none" style={{ width: '0.55em', height: 'auto', alignSelf: 'stretch', overflow: 'visible' }}>
              <path d="M2 62 L12 56 L22 96 L38 2" fill="none" stroke="currentColor" strokeWidth={Math.max(3, size * 0.06)} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            </svg>
            <span style={{ position: 'relative', padding: '0.1em 0.12em 0 0.12em' }}>
              <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '0.07em', background: 'currentColor', transformOrigin: '0 50%', transform: `scaleX(${clamp01(p * 2 - 1)})` }} />
              {render(n.a, 'a', hl)}
            </span>
          </span>
        );
      }
      case 'hl':
        return (
          <span key={key} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', color: hlP > 0 ? accent : undefined }}>
            <span style={{ position: 'absolute', left: '-0.08em', right: '-0.08em', bottom: '-0.02em', height: '0.14em', background: accent, borderRadius: 6, transformOrigin: '0 50%', transform: `scaleX(${hlP})` }} />
            {render(n.a, 0, true)}
          </span>
        );
    }
  };
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.15, opacity: 1 - out }}>
      {render(root, 'r')}
    </div>
  );
};
