// Dasar animasi bersama: kurva easing bernama, durasi standar, progres dari cue, keyframe angka, dan noise halus.
// Semua deterministik (diturunkan dari frame), jadi render selalu identik. Aturan pemakaian: docs/TATA-GERAK.md.
import { Easing, spring } from 'remotion';
import { clamp01, hash } from '../motion';

/** Kurva bernama. Pilih sesuai peran gerak, jangan linear untuk gerak objek. */
export const EASE = {
  /** entrance standar: cepat lalu mengendap */
  out: Easing.out(Easing.cubic),
  /** entrance tegas/cepat (slide, wipe): hampir seluruh jarak ditempuh di awal */
  snap: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)), // out-expo yang tepat berakhir di 1
  /** pindah posisi/ukuran dari A ke B */
  inOut: Easing.inOut(Easing.cubic),
  /** keluar: mulai pelan lalu cepat pergi */
  in: Easing.in(Easing.cubic),
  /** overshoot kecil di akhir (pop, stempel) */
  back: Easing.out(Easing.back(1.6)),
  /** anticipation + follow-through: mundur sedikit, melesat, melewati target, kembali */
  anticipate: Easing.inOut(Easing.back(1.7)),
  linear: (t: number) => t,
} as const;

/** Durasi standar dalam detik (dikonversi ke frame dengan fps). */
export const DUR = { micro: 0.15, fast: 0.27, base: 0.4, slow: 0.67, exit: 0.27 } as const;
export const sec = (s: number, fps: number) => Math.max(1, Math.round(s * fps));

/** Progres 0..1 dari frame `at` selama `dur` frame, sudah di-ease. */
export const prog = (frame: number, at: number, dur: number, ease: (t: number) => number = EASE.out) =>
  ease(clamp01((frame - at) / Math.max(1, dur)));

/** Pegas deterministik mulai di `at` (0 sebelum `at`). damping kecil = lebih memantul. */
export const springAt = (frame: number, at: number, fps: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  frame < at ? 0 : spring({ frame: frame - at, fps, config: { damping: cfg.damping ?? 11, stiffness: cfg.stiffness ?? 170, mass: cfg.mass ?? 0.9 } });

/** Keyframe angka: [[frame, nilai], [frame, nilai, ease?], ...]. Ease milik segmen yang BERAKHIR di keyframe itu.
 *  Contoh: x = track(f, [[0, 200], [q.kata, 540, EASE.anticipate], [q.kata + 40, 900]]) */
export type Key = [number, number] | [number, number, (t: number) => number];
export const track = (frame: number, keys: Key[]): number => {
  if (!keys.length) return 0;
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [fb, vb, eb] = keys[i];
    if (frame <= fb) {
      const [fa, va] = keys[i - 1];
      const t = (eb ?? EASE.inOut)(clamp01((frame - fa) / Math.max(1e-6, fb - fa)));
      return va + (vb - va) * t;
    }
  }
  return keys[keys.length - 1][1];
};

/** Noise halus 1D (-1..1), kontinu terhadap t. Untuk goyangan organik, bukan Math.random. */
export const noise1 = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const s = seed * 101.37;
  const a = hash(i + s) * 2 - 1;
  const b = hash(i + 1 + s) * 2 - 1;
  return a + (b - a) * (f * f * (3 - 2 * f));
};

/** Getaran yang meluruh setelah `at` (untuk benturan/penekanan). Kembalikan offset px. */
export const impact = (frame: number, at: number, amp: number, len: number, seed = 0) => {
  const d = frame - at;
  if (d < 0 || d > len) return { x: 0, y: 0, r: 0 };
  const k = amp * (1 - d / len) ** 2;
  return { x: noise1(d * 0.9, seed) * k, y: noise1(d * 0.9, seed + 7) * k, r: noise1(d * 0.7, seed + 13) * k * 0.08 };
};
