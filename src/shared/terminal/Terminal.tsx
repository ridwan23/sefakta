// Gaya terminal: jendela konsol gelap, font mono (JetBrains Mono), perintah diketik huruf demi huruf dengan kursor
// berkedip, keluaran muncul baris demi baris, bilah progres ASCII, dan sorotan token. Layar menggulir sendiri bila
// baris melebihi `rows`. Sengaja BUKAN "hujan karakter" hijau: palet netral dengan aksen, terbaca seperti terminal nyata.
//
//   <TermSurface />
//   <TerminalWindow x={60} y={360} w={960} h={900} title="bash — sefakta" at={0}>
//     <TermScript at={10} lines={[
//       { kind: 'cmd', text: 'ping google.com' },
//       { kind: 'out', text: '64 bytes: time=**23 ms**', gap: 4 },
//       { kind: 'progress', text: 'unduh', to: 0.62, dur: 40 },
//       { kind: 'err', text: 'koneksi terputus' },
//     ]} />
//   </TerminalWindow>
//
// Di dalam teks, **kata** = sorotan warna aksen.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog, springAt } from '../anim/core';
import { font } from '../brand/fonts';
import { clamp01 } from '../motion';

export const TERM = {
  latar: '#0A0E14',
  jendela: '#11161F',
  bar: '#1A212C',
  teks: '#D6DEEB',
  redup: '#6B7686',
  prompt: '#7FD88F',
  aksen: '#FFC857',
  info: '#6CC4FF',
  galat: '#FF6B6B',
  ok: '#7FD88F',
} as const;

export const termFont = () => font('jetbrains-mono');

/** Latar gelap dengan vignette dan garis scan yang sangat halus. */
export const TermSurface: React.FC<{ color?: string; scan?: boolean }> = ({ color = TERM.latar, scan = true }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 40%, ${color} 40%, #04060A 100%)` }}>
    {scan ? (
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 5px)' }} />
    ) : null}
  </AbsoluteFill>
);

export type TerminalWindowProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  at?: number;
  /** ukuran huruf isi; tinggi baris = size × 1.5 */
  size?: number;
  children?: React.ReactNode;
};

const TermCtx = React.createContext<{ size: number; rows: number; width: number }>({ size: 34, rows: 12, width: 900 });

/** Jendela terminal dengan bilah judul. Muncul dengan pegas (skala + naik). Anak-anaknya: <TermScript/> atau teks bebas. */
export const TerminalWindow: React.FC<TerminalWindowProps> = ({ x, y, w, h, title = 'bash', at, size = 34, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = at === undefined ? 1 : springAt(frame, at, fps, { damping: 16, stiffness: 160 });
  if (s <= 0) return null;
  const bar = Math.round(size * 1.6);
  const pad = Math.round(size * 0.9);
  const rows = Math.max(1, Math.floor((h - bar - pad * 2) / (size * 1.5)));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: TERM.jendela,
        borderRadius: 22,
        border: '2px solid rgba(255,255,255,0.08)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        transform: `translateY(${((1 - s) * 60).toFixed(1)}px) scale(${(0.94 + 0.06 * s).toFixed(4)})`,
        opacity: clamp01(s * 2),
        fontFamily: termFont(),
      }}
    >
      <div style={{ height: bar, background: TERM.bar, display: 'flex', alignItems: 'center', padding: `0 ${pad}px`, gap: size * 0.4 }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{ width: size * 0.5, height: size * 0.5, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: 'center', color: TERM.redup, fontSize: size * 0.62, marginRight: size * 1.5 }}>{title}</div>
      </div>
      <div style={{ position: 'absolute', left: pad, right: pad, top: bar + pad, bottom: pad, overflow: 'hidden', fontSize: size, lineHeight: 1.5, color: TERM.teks }}>
        <TermCtx.Provider value={{ size, rows, width: w - pad * 2 }}>{children}</TermCtx.Provider>
      </div>
    </div>
  );
};

/** Teks dengan **sorotan**. */
export const TermText: React.FC<{ text: string; color?: string; accent?: string }> = ({ text, color, accent = TERM.aksen }) => (
  <span style={{ color }}>
    {text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
      p.startsWith('**') ? (
        <span key={i} style={{ color: accent, fontWeight: 700 }}>
          {p.slice(2, -2)}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </span>
);

/** Panjang teks tampak (tanpa penanda **). */
const visLen = (t: string) => t.replace(/\*\*/g, '').length;
/** Potong teks ke n karakter tampak, penanda ** tetap seimbang. */
const cut = (t: string, n: number) => {
  let out = '';
  let seen = 0;
  let open = false;
  for (let i = 0; i < t.length && seen < n; i++) {
    if (t.startsWith('**', i)) {
      out += '**';
      open = !open;
      i++;
      continue;
    }
    out += t[i];
    seen++;
  }
  return open ? `${out}**` : out;
};

export const Caret: React.FC<{ on?: boolean; color?: string }> = ({ on = true, color = TERM.teks }) => {
  const frame = useCurrentFrame();
  const vis = on || Math.floor(frame / 15) % 2 === 0;
  return <span style={{ display: 'inline-block', width: '0.6em', height: '1.1em', verticalAlign: '-0.18em', marginLeft: 2, background: color, opacity: vis ? 0.9 : 0 }} />;
};

export type TermLine = {
  /** cmd = diketik setelah prompt; out/ok/err/info/dim = keluaran; progress = bilah ASCII */
  kind?: 'cmd' | 'out' | 'ok' | 'err' | 'info' | 'dim' | 'progress';
  text: string;
  /** frame absolut mulai baris ini (menimpa urutan otomatis) */
  at?: number;
  /** jeda (frame) sebelum baris ini pada urutan otomatis */
  gap?: number;
  /** karakter per detik untuk cmd (default 22) */
  cps?: number;
  /** progress: nilai akhir 0..1 dan lama pengisian */
  to?: number;
  dur?: number;
};

const COLOR: Record<NonNullable<TermLine['kind']>, string> = {
  cmd: TERM.teks, out: TERM.teks, ok: TERM.ok, err: TERM.galat, info: TERM.info, dim: TERM.redup, progress: TERM.teks,
};
const PREFIX: Partial<Record<NonNullable<TermLine['kind']>, string>> = { ok: '✓ ', err: '✗ ', info: '› ' };

/** Hitung frame mulai & selesai setiap baris (berguna untuk memicu visual lain saat baris tertentu muncul). */
export const termTimeline = (lines: TermLine[], at: number, fps = 30) => {
  let t = at;
  return lines.map((l) => {
    const start = l.at ?? t + (l.gap ?? (l.kind === 'cmd' ? 8 : 3));
    const len =
      l.kind === 'cmd' ? Math.ceil((visLen(l.text) / (l.cps ?? 22)) * fps) + 6 : l.kind === 'progress' ? (l.dur ?? 40) : 1;
    t = start + len;
    return { start, end: start + len };
  });
};

export type TermScriptProps = {
  lines: TermLine[];
  at?: number;
  prompt?: string;
  /** lebar bilah progres (karakter) */
  barWidth?: number;
};

/** Urutan baris terminal: perintah diketik, keluaran muncul, layar menggulir. Pakai di dalam <TerminalWindow>. */
export const TermScript: React.FC<TermScriptProps> = ({ lines, at = 0, prompt = '$', barWidth = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { size, rows } = React.useContext(TermCtx);
  const tl = termTimeline(lines, at, fps);
  const shown = lines.map((l, i) => ({ l, ...tl[i] })).filter((r) => frame >= r.start);
  const typing = shown.length > 0 && shown[shown.length - 1].l.kind === 'cmd' && frame < shown[shown.length - 1].end;
  // gulir halus: setiap baris baru di atas `rows` mendorong isi naik satu baris
  const over = Math.max(0, shown.length + (typing ? 0 : 1) - rows);
  const lastStart = shown.length ? shown[shown.length - 1].start : 0;
  const scroll = over - 1 + prog(frame, lastStart, 6, EASE.out);
  const lh = size * 1.5;
  return (
    <div style={{ transform: `translateY(${(-Math.max(0, over > 0 ? scroll : 0) * lh).toFixed(1)}px)` }}>
      {shown.map(({ l, start, end }, i) => {
        const kind = l.kind ?? 'out';
        const last = i === shown.length - 1;
        if (kind === 'cmd') {
          const n = Math.floor(((frame - start) / fps) * (l.cps ?? 22));
          return (
            <div key={i} style={{ whiteSpace: 'pre' }}>
              <span style={{ color: TERM.prompt, fontWeight: 700 }}>{prompt} </span>
              <TermText text={cut(l.text, n)} color={COLOR.cmd} />
              {last && frame < end ? <Caret /> : null}
            </div>
          );
        }
        if (kind === 'progress') {
          const p = (l.to ?? 1) * prog(frame, start, l.dur ?? 40, EASE.inOut);
          const fill = Math.round(p * barWidth);
          return (
            <div key={i} style={{ whiteSpace: 'pre' }}>
              <span style={{ color: TERM.redup }}>{l.text} [</span>
              <span style={{ color: p >= 0.999 ? TERM.ok : TERM.aksen }}>{'█'.repeat(fill)}</span>
              <span style={{ color: TERM.redup }}>{'░'.repeat(barWidth - fill)}] </span>
              <span style={{ color: TERM.teks, fontWeight: 700 }}>{String(Math.round(p * 100)).padStart(3)}%</span>
            </div>
          );
        }
        return (
          <div key={i} style={{ whiteSpace: 'pre', opacity: clamp01((frame - start + 1) / 3) }}>
            <TermText text={(PREFIX[kind] ?? '') + l.text} color={COLOR[kind]} />
          </div>
        );
      })}
      {!typing ? (
        <div>
          <span style={{ color: TERM.prompt, fontWeight: 700 }}>{prompt} </span>
          <Caret on={false} />
        </div>
      ) : null}
    </div>
  );
};

/** Satu baris besar yang diketik (judul/kesimpulan bergaya terminal), di luar jendela. */
export const TypeLine: React.FC<{ x: number; y: number; text: string; at: number; size?: number; cps?: number; color?: string; prefix?: string; caret?: boolean }> = ({
  x, y, text, at, size = 64, cps = 18, color = TERM.teks, prefix = '> ', caret = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const n = Math.floor(((frame - at) / fps) * cps);
  const done = n >= visLen(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: termFont(), fontSize: size, fontWeight: 700, color, whiteSpace: 'pre' }}>
      <span style={{ color: TERM.prompt }}>{prefix}</span>
      <TermText text={cut(text, n)} />
      {caret ? <Caret on={!done} color={color} /> : null}
    </div>
  );
};
