// Dasar kolase: angka acak ber-seed, tepi sobek, dan gerak kertas (meluncur, jatuh, settle).
import { springAt } from '../anim/core';
import { clamp01, hash } from '../motion';

/** Angka acak 0..1 yang stabil untuk (seed, i). Tiap pasangan independen, bukan urutan berantai. */
export const rnd = (seed: number, i: number) => hash(seed * 97.13 + i * 13.71 + 0.5);

export type Edge = 'top' | 'right' | 'bottom' | 'left';

/**
 * Path persegi w×h dengan tepi sobek di sisi `torn` (sisi lain lurus/terpotong).
 * `rough` = amplitudo sobekan (px), `step` = jarak antartitik (px).
 */
export const tornRectPath = (w: number, h: number, seed = 1, torn: Edge[] = ['top', 'right', 'bottom', 'left'], rough = 7, step = 13) => {
  const pts: [number, number][] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, side: Edge, k: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / step));
    const nx = (y1 - y0) / len;
    const ny = -(x1 - x0) / len;
    const on = torn.includes(side);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      // dua frekuensi: gerigi kecil + gelombang panjang, selalu ke dalam (tidak keluar kotak)
      const j = on ? (rnd(seed + k, i) * 0.7 + (0.5 + 0.5 * Math.sin(u * 7 + seed * 3 + k)) * 0.3) * rough : 0;
      pts.push([x0 + (x1 - x0) * u - nx * j, y0 + (y1 - y0) * u - ny * j]);
    }
  };
  edge(0, 0, w, 0, 'top', 11);
  edge(w, 0, w, h, 'right', 23);
  edge(w, h, 0, h, 'bottom', 37);
  edge(0, h, 0, 0, 'left', 53);
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
};

/** Garis tangan bergoyang dari titik-titik: halus (kuadratik di titik tengah). */
export const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx.toFixed(1)} ${ly.toFixed(1)}`;
};

export type PaperMotion = { visible: boolean; transform: string; opacity: number; filter: string; settled: number };

/**
 * Kertas masuk: meluncur dari atas dengan sedikit putaran, jatuh, lalu settle. Bayangan mengecil saat menempel.
 * Tanpa `at` = sudah menempel. `from` menentukan arah datang.
 */
export const paperIn = (frame: number, at: number | undefined, fps: number, seed = 1, rotate = 0, from: 'top' | 'left' | 'right' | 'bottom' = 'top'): PaperMotion => {
  const shadow = (lift: number) => `drop-shadow(0 ${(3 + lift * 26).toFixed(1)}px ${(4 + lift * 22).toFixed(1)}px rgba(45,30,12,${(0.3 - lift * 0.12).toFixed(3)}))`;
  if (at === undefined) return { visible: true, transform: `rotate(${rotate}deg)`, opacity: 1, filter: shadow(0), settled: 1 };
  if (frame < at) return { visible: false, transform: '', opacity: 0, filter: '', settled: 0 };
  const p = springAt(frame, at, fps, { damping: 13, stiffness: 115, mass: 0.9 });
  const q = 1 - p;
  const dir = rnd(seed, 3) > 0.5 ? 1 : -1;
  const dist = 190;
  const [dx, dy] = from === 'top' ? [dir * 40, -dist] : from === 'bottom' ? [dir * 40, dist] : from === 'left' ? [-dist, -30] : [dist, -30];
  const lift = clamp01(Math.abs(q) * 1.4);
  return {
    visible: true,
    transform: `translate(${(dx * q).toFixed(1)}px, ${(dy * q).toFixed(1)}px) rotate(${(rotate + q * 12 * dir).toFixed(2)}deg) scale(${(1 + lift * 0.07).toFixed(4)})`,
    opacity: clamp01(p * 4),
    filter: shadow(lift),
    settled: clamp01(p),
  };
};
