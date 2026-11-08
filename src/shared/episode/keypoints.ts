// Waktu tampil keypoint (mode caption "keypoint") dan waktu tiap katanya, dari caption hasil alignment.
// Modul murni (tanpa JSX) supaya juga dipakai skrip Node (check-episodes: keypoint yang tampil terlalu singkat).
import type { TimelineScene } from './types';

/** Keypoint muncul paling cepat sekian frame setelah keypoint sebelumnya muncul (entrance + exit). */
const KEYPOINT_IN = 8;
const KEYPOINT_OUT = 5;
/** Lama tampil minimal yang disarankan (detik) agar keypoint sempat dibaca. */
export const KEYPOINT_MIN_SECONDS = 1.8;
export const KEYPOINT_LEAD = 2; // detik: kata keypoint paling awal yang boleh memunculkan keypoint sebelum kata pemicu
const WINDOW_BACK = 8; // kata naskah sebelum kata pemicu yang boleh dicocokkan
const WINDOW_AHEAD = 12; // kata naskah sesudah kata pemicu yang boleh dicocokkan
const MIN_ACTIVE_MS = 200; // sorotan minimal, supaya kata pendek tidak berkedip

export type KpToken = { text: string; emph: boolean; fromMs: number; toMs: number; spoken: boolean };
export type KpTimed = { start: number; end: number; tokens: KpToken[] };
type Word = { text: string; startMs: number; endMs: number };
const normWord = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
/** Sama, atau bentuk turunan (awalan ≥ 4 huruf): "ponsel" ≈ "ponselmu", "telinga" ≈ "telingamu". */
const sameWord = (a: string, b: string) => !!a && !!b && (a === b || (a.length >= 4 && b.startsWith(a)) || (b.length >= 4 && a.startsWith(b)));

/** Pecah teks keypoint jadi kata; bagian di antara *bintang* = penekanan. */
const tokenize = (text: string) => {
  let emph = false;
  return text.split(/\s+/).filter(Boolean).map((t) => {
    const opens = t.startsWith('*');
    const closes = t.replace(/[^\p{L}\p{N}*]+$/u, '').endsWith('*');
    const e = emph || opens;
    emph = e && !closes;
    return { text: t.replace(/\*/g, ''), emph: e, n: normWord(t) };
  });
};

/** Hitung waktu tampil tiap keypoint dan waktu tiap katanya dari caption hasil alignment (frame relatif awal scene).
 *  Kata pemicu di dalam teks menjadi jangkar: kata sebelumnya dicari mundur (kemunculan terdekat), kata sesudahnya
 *  dicari maju. Bila kata pemicu tidak ada di teks, semua kata dicari maju mulai beberapa kata sebelum pemicu. */
export const timeKeypoints = (scene: TimelineScene, fps: number): KpTimed[] => {
  const caps: Word[] = scene.captions ?? [];
  const words = caps.map((w) => normWord(w.text));
  const toFrame = (ms: number) => Math.round((ms / 1000) * fps);
  const out: (KpTimed & { cueMs: number; matched: (Word | null)[]; raw: ReturnType<typeof tokenize> })[] = [];
  for (const k of scene.keypoints ?? []) {
    const cue = normWord(k.cue);
    const ci = words.findIndex((w, j) => w === cue && words.slice(0, j).filter((x) => x === w).length === (k.nth ?? 0));
    const cueMs = ci >= 0 ? caps[ci].startMs : 0;
    const raw = tokenize(k.text);
    const matched: (Word | null)[] = raw.map(() => null);
    if (ci >= 0) {
      const lo = Math.max(0, ci - WINDOW_BACK), hi = Math.min(words.length - 1, ci + WINDOW_AHEAD);
      const ta = raw.findIndex((t) => sameWord(t.n, cue));
      const forward = (from: number, j0: number) => {
        let cur = from;
        for (let j = j0; j < raw.length; j++)
          for (let w = cur; w <= hi; w++)
            if (sameWord(raw[j].n, words[w])) { matched[j] = caps[w]; cur = w + 1; break; }
      };
      if (ta >= 0) {
        matched[ta] = caps[ci];
        let cur = ci - 1;
        for (let j = ta - 1; j >= 0; j--)
          for (let w = cur; w >= lo; w--)
            if (sameWord(raw[j].n, words[w])) { matched[j] = caps[w]; cur = w - 1; break; }
        forward(ci + 1, ta + 1);
      } else forward(lo, 0);
    }
    const firstMs = matched.find((m) => m)?.startMs ?? cueMs;
    const prevStart = out.at(-1)?.start ?? -Infinity;
    const early = firstMs < cueMs && cueMs - firstMs <= KEYPOINT_LEAD * 1000 && toFrame(firstMs) >= prevStart + KEYPOINT_IN + KEYPOINT_OUT;
    out.push({ start: early ? toFrame(firstMs) : toFrame(cueMs), end: scene.frames, tokens: [], cueMs, matched, raw });
  }
  out.forEach((k, j) => {
    k.end = Math.min(out[j + 1]?.start ?? scene.frames, scene.frames);
    const endMs = (k.end / fps) * 1000;
    let lastMs = (k.start / fps) * 1000;
    k.tokens = k.raw.map((t, i) => {
      const m = k.matched[i] && k.matched[i]!.startMs < endMs ? k.matched[i] : null; // diucapkan setelah keypoint hilang = tidak cocok
      if (m) {
        lastMs = Math.max(lastMs, m.startMs);
        return { text: t.text, emph: t.emph, fromMs: m.startMs, toMs: Math.max(m.endMs, m.startMs + MIN_ACTIVE_MS), spoken: true };
      }
      if (t.emph) return { text: t.text, emph: true, fromMs: Math.max(k.cueMs, lastMs), toMs: Math.max(k.cueMs, lastMs) + 400, spoken: true };
      return { text: t.text, emph: false, fromMs: lastMs, toMs: lastMs, spoken: false };
    });
  });
  return out.map(({ start, end, tokens }) => ({ start, end, tokens }));
};
