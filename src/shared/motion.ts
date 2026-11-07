// Generic motion helpers shared by every topic (easing, slam-with-squash, impact kick, deterministic noise).
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
export const easeIn = (u: number) => clamp01(u) ** 2;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const range = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
/** Object dropped from height h landing at frame `at`, with a short squash bounce afterwards. */
export const slam = (f: number, at: number, fall = 10, h = 8) => {
  if (f < at - fall) return { y: h, squash: 1, landed: false, visible: false };
  if (f < at) {
    const u = (f - (at - fall)) / fall;
    return { y: h * (1 - u * u), squash: 1 + 0.15 * u, landed: false, visible: true };
  }
  const d = f - at;
  const bounce = Math.exp(-d / 5) * Math.cos(d * 0.9);
  return { y: Math.max(0, 0.15 * Math.exp(-d / 4) * Math.sin(d * 0.8)), squash: 1 - 0.22 * bounce, landed: true, visible: true };
};
/** Impact camera kick: decaying, sign flips every frame (reference grammar). */
export const kick = (f: number, at: number, amp = 0.12, len = 8) => {
  const d = f - at;
  if (d < 0 || d >= len) return 0;
  return amp * (1 - d / len) * (Math.floor(d) % 2 === 0 ? 1 : -1); // floor: works with time-remapped (fractional) frames
};
/** deterministic hash noise */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
