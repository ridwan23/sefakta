// Timeline of the 2D version, locked to "VO v3 — narasi saja, 55,58 detik.wav" (public/matrix-effect/vo_v3_narasi.wav).
// 56 s story + 4 s CTA scene = 60 s @ 30 fps. Sentence spans and key-word times come from the VO report
// (measured word timings) plus the pauses detected in the file; every visual beat is pinned to its word.
import type { CaptionLine } from '../../../shared/captions/Overlay';

export const FPS = 30;
export const STORY_END = 1680; // 56.0 s
export const CTA_FRAMES = 120;
export const DURATION = STORY_END + CTA_FRAMES; // 60 s
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const VO_SRC = 'matrix-effect/vo_v3_narasi.wav'; // public/matrix-effect/

const s = (sec: number) => Math.round(sec * FPS);

export type Shot2D = { id: 1 | 2 | 3 | 4 | 5 | 6; from: number; to: number; label: string; warp: [number, number][] };
/** `warp`: [new local frame, original choreography frame] pairs — the shot's animation is time-remapped
 *  (piecewise linear) so each beat lands on its VO word. */
export const SHOTS: Shot2D[] = [
  // freeze on "berhenti" (3.4 s) · "3s" slams on "tiga" (5.78 s)
  { id: 1, from: 0, to: 240, label: 'THE ZERO-G SPILL', warp: [[0, 0], [102, 76], [174, 132], [240, 216]] },
  // "90 FT" on "sembilan puluh kaki" (9.58 s) · riders on "dua puluh tiga" (11.30 s) · drop on the question (15.2 s)
  { id: 2, from: 240, to: 576, label: '90-FOOT DROP TOWER', warp: [[0, 0], [48, 34], [99, 66], [210, 100], [216, 112], [258, 150], [336, 249]] },
  // strobing digits through S5 · "0" stamp on "nol" (25.72 s)
  { id: 3, from: 576, to: 876, label: 'CHRONOMETER & "0"', warp: [[0, 0], [160, 100], [188, 133], [196, 141], [300, 225]] },
  // blink on "anehnya" · skull on S9 · phone shakes on "smartfon" (32.64 s) · core on S10 · stomp on "menekan" ·
  // dial on "delapan puluh persen" (39.38 s)
  { id: 4, from: 876, to: 1272, label: 'AMYGDALA RED ALERT', warp: [[0, 0], [46, 38], [72, 54], [103, 80], [186, 176], [222, 222], [305, 270], [321, 282], [396, 360]] },
  // dizzy on "menipu" (~45.75 s) · "5X LONGER" on "lima kali" (48.62 s)
  { id: 5, from: 1272, to: 1515, label: 'PROYEKTOR 35MM', warp: [[0, 0], [100, 100], [187, 192], [243, 270]] },
  // world freezes on "melambat" (52.18 s), moves on at "Otakmu" (53.18 s), smile before the CTA
  { id: 6, from: 1515, to: STORY_END, label: 'PENUTUP', warp: [[0, 0], [50, 70], [80, 110], [120, 140], [165, 179]] },
];

export const warpFn = (pts: [number, number][]) => (x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++)
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  const [xl, yl] = pts[pts.length - 1];
  return yl + (x - xl);
};

/** On-screen captions = the v3 script (numbers as numerals). anchors: word index -> start time (frames). */
const L = (from: number, to: number, text: string, anchors: Record<number, number> = {}): CaptionLine => ({
  from: s(from),
  to: s(to),
  text,
  anchors: Object.fromEntries(Object.entries(anchors).map(([k, v]) => [k, s(v)])),
});
export const LINES: CaptionLine[] = [
  L(0.1, 3.93, 'Kamu terpeleset di lantai licin, semesta mendadak berhenti.', { 5: 2.36 }),
  L(4.53, 7.54, 'Cangkir kopimu melayang tiga detik, berputar lambat.', { 3: 5.78, 5: 6.71 }),
  L(8.15, 14.59, 'Dalam uji terjun bebas 90 kaki, 23 relawan dipasangi kronometer digital.', { 4: 9.58, 5: 10.06, 6: 11.3, 7: 11.68 }),
  L(15.19, 17.8, 'Apakah mata menangkap lebih banyak frame per detik?', { 5: 16.96, 6: 17.22 }),
  L(19.39, 24.42, 'Kalau waktu melambat, penerjun bisa membaca angka berkedip yang tak terlihat.', { 3: 21.06, 7: 22.8, 8: 23.3, 9: 23.52, 10: 23.82 }),
  L(25.02, 26.92, 'Mereka melihat nol angka ekstra.', { 2: 25.72, 3: 26.02 }),
  L(27.52, 28.68, 'Waktu tidak melambat.', { 2: 28.16 }),
  L(29.41, 31.28, 'Tapi inilah bagian anehnya.'),
  L(31.88, 34.95, 'Otakmu seperti smartphone overload yang mencadangkan data.', { 2: 32.64, 3: 33.04 }),
  L(35.64, 41.6, 'Saat bahaya, amigdala menekan tombol rekam darurat, mencatat 80% lebih banyak detail.', { 4: 37.1, 7: 38.64, 8: 39.38, 9: 40.42 }),
  L(42.63, 50.12, 'Saat memutar ulang ingatan itu, file masif menipu kesadaranmu: kejadian itu terasa lima kali lebih lama.', { 5: 44.95, 9: 47.3, 12: 48.62, 14: 49.32 }),
  L(50.72, 55.18, 'Jadi, waktu tidak pernah melambat. Otakmu hanya merekam lebih banyak.', { 4: 52.18, 5: 53.18 }),
];
