// Gerak fisik objek: gravitasi + pantulan, squash/stretch dari kecepatan, follow-through (pegas penyusul),
// ayunan bandul yang digerakkan titik gantungnya, inersia sesuai massa. Semua deterministik dari frame.
//
//   const b = fall(f, { at: q.jatuh, from: 300, to: 1100, fps });     // b.y, b.vy, b.impacts
//   const s = squashStretch(b, fps);                                    // s.sx, s.sy → transform scale
//   const tagAngle = swing(f, (k) => xBadan(k), { length: 120 });       // label menggantung ikut berayun
//   const lag = follow(f, (k) => rotasiLengan(k), { stiffness: 0.18 }); // bagian yang tertinggal
import { Easing } from 'remotion';

export type FallState = { y: number; vy: number; visible: boolean; landed: boolean; impacts: number[]; sinceImpact: number; impactSpeed: number };

/** Objek jatuh dari `from` ke lantai `to` (px layar, y ke bawah) mulai frame `at`, lalu memantul makin rendah.
 *  g dalam px/dtk² (3000 ≈ terasa seperti benda nyata seukuran tangan di frame 1080). bounce = koefisien pantul 0..0,8. */
export const fall = (frame: number, o: { at: number; from: number; to: number; fps: number; g?: number; bounce?: number; v0?: number }): FallState => {
  const g = o.g ?? 3000;
  const e = o.bounce ?? 0.35;
  const h = Math.max(1, o.to - o.from);
  const v0 = o.v0 ?? 0;
  const t = (frame - o.at) / o.fps;
  if (t < 0) return { y: o.from, vy: 0, visible: false, landed: false, impacts: [], sinceImpact: Infinity, impactSpeed: 0 };
  // jatuh pertama: h = v0 t + g t²/2
  const t1 = (-v0 + Math.sqrt(v0 * v0 + 2 * g * h)) / g;
  const impacts: number[] = [];
  let tImpact = t1;
  let v = v0 + g * t1; // kecepatan saat menyentuh lantai
  impacts.push(o.at + t1 * o.fps);
  if (t < t1) return { y: o.from + v0 * t + 0.5 * g * t * t, vy: v0 + g * t, visible: true, landed: false, impacts, sinceImpact: Infinity, impactSpeed: 0 };
  // pantulan berikutnya
  let lastSpeed = v;
  for (let k = 0; k < 12; k++) {
    const up = v * e;
    if (up < 60) break; // terlalu kecil untuk terlihat
    const dur = (2 * up) / g;
    if (t < tImpact + dur) {
      const u = t - tImpact;
      return { y: o.to - (up * u - 0.5 * g * u * u), vy: -up + g * u, visible: true, landed: false, impacts, sinceImpact: (t - tImpact) * o.fps, impactSpeed: lastSpeed };
    }
    tImpact += dur;
    impacts.push(o.at + tImpact * o.fps);
    lastSpeed = up;
    v = up;
  }
  return { y: o.to, vy: 0, visible: true, landed: true, impacts, sinceImpact: (t - tImpact) * o.fps, impactSpeed: lastSpeed };
};

/** Skala badan dari keadaan gerak: memanjang searah laju saat melaju cepat, memipih sesaat setelah benturan.
 *  Volume dijaga (sx · sy ≈ 1). `soft` 0..1: benda lunak (jeli, adonan) lebih besar deformasinya. */
export const squashStretch = (s: Pick<FallState, 'vy' | 'sinceImpact' | 'impactSpeed'>, fps: number, soft = 0.5) => {
  const stretch = 1 + Math.min(0.25, (Math.abs(s.vy) / 4000) * soft);
  let sy = stretch;
  if (Number.isFinite(s.sinceImpact) && s.sinceImpact >= 0) {
    const d = s.sinceImpact;
    const amp = Math.min(0.35, (s.impactSpeed / 3000) * 0.4 * soft * 2);
    sy *= 1 - amp * Math.exp(-d / (fps * 0.08)) * Math.cos(d * 0.9);
  }
  return { sx: 1 / sy, sy };
};

/** Pegas penyusul: nilai yang mengejar `target(frame)` dengan kelembaman (follow-through / overlapping action).
 *  stiffness 0.05 (lambat, berat) – 0.4 (cepat); damping 0.6 (memantul) – 0.9 (redam). Disimulasikan dari frame 0. */
export const follow = (frame: number, target: (f: number) => number, o: { stiffness?: number; damping?: number; from?: number } = {}) => {
  const k = o.stiffness ?? 0.18;
  const c = o.damping ?? 0.72;
  let x = o.from ?? target(0);
  let v = 0;
  const n = Math.max(0, Math.floor(frame));
  for (let i = 1; i <= n; i++) {
    v = (v + (target(i) - x) * k) * c;
    x += v;
  }
  return x;
};

/** Sudut (derajat) benda menggantung (label, daun, ekor, tali) yang titik gantungnya bergerak menurut `pivotX(frame)`.
 *  Saat titik gantung bergerak, benda tertinggal lalu berayun dan teredam. `length` px menentukan periode. */
export const swing = (frame: number, pivotX: (f: number) => number, o: { length?: number; damping?: number; fps?: number; rest?: number } = {}) => {
  const fps = o.fps ?? 30;
  const L = o.length ?? 120;
  const g = 3000;
  const c = o.damping ?? 2.2; // per detik
  const dt = 1 / fps;
  let th = 0;
  let w = 0;
  const n = Math.max(0, Math.floor(frame));
  for (let i = 1; i <= n; i++) {
    const ax = (pivotX(i + 1) - 2 * pivotX(i) + pivotX(i - 1)) / (dt * dt); // percepatan titik gantung
    const alpha = -(g / L) * Math.sin(th) - (ax / L) * Math.cos(th) - c * w;
    w += alpha * dt;
    th += w * dt;
  }
  return (th * 180) / Math.PI + (o.rest ?? 0);
};

/** Bandul teredam yang diberi dorongan di frame `at` (lonceng, papan nama, timbangan yang baru diberi beban). */
export const pendulum = (frame: number, o: { at: number; amp: number; period?: number; decay?: number; fps: number }) => {
  const t = (frame - o.at) / o.fps;
  if (t < 0) return 0;
  const p = o.period ?? 1.1;
  return o.amp * Math.exp(-t * (o.decay ?? 2)) * Math.sin((2 * Math.PI * t) / p);
};

/** Kurva inersia sesuai massa: ringan (0) cepat lepas & cepat berhenti, berat (1) lambat mulai & lambat berhenti. */
export const massEase = (mass: number) => Easing.inOut(Easing.poly(2 + Math.max(0, Math.min(1, mass)) * 3));

/** Timbangan/tuas menuju sudut keseimbangan baru dengan overshoot yang sesuai beban. */
export const settle = (frame: number, o: { at: number; from: number; to: number; fps: number; mass?: number }) => {
  const m = o.mass ?? 0.5;
  const t = (frame - o.at) / o.fps;
  if (t < 0) return o.from;
  const w = 7 - m * 3; // frekuensi
  const z = 0.35 + (1 - m) * 0.2; // redaman
  const env = Math.exp(-z * w * t);
  return o.to + (o.from - o.to) * env * (Math.cos(w * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(w * t));
};
