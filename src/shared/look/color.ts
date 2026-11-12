// Utilitas warna bersama: campur, terang/gelap, luminans, dan kontras WCAG. Dipakai token palet dan shading objek.
export type RGB = [number, number, number];

export const hexToRgb = (hex: string): RGB => {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbToHex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Campur dua warna: t = 0 → a, t = 1 → b. */
export const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t) as RGB);
};
export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
export const darken = (c: string, t: number) => mix(c, '#000000', t);
export const alpha = (c: string, a: number) => {
  const [r, g, b] = hexToRgb(c);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** Gelapkan sambil menggeser rona sedikit ke biru-ungu (bayangan alami lebih dingin dari warna dasarnya). */
export const shadowOf = (c: string, t: number) => mix(darken(c, t), '#1b1f4a', t * 0.25);
/** Terangkan sambil menghangatkan sedikit (sisi yang kena cahaya). */
export const litOf = (c: string, t: number, light = '#fff6e0') => mix(c, light, t);

const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export const luminance = (c: string) => {
  const [r, g, b] = hexToRgb(c);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** Kejenuhan kasar (0..1) untuk memilih warna aksen dari palet. */
export const saturation = (c: string) => {
  const [r, g, b] = hexToRgb(c).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  return mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
};
/** Pilih dari kandidat yang kontrasnya terhadap `bg` ≥ `min`; bila tidak ada, kandidat dengan kontras tertinggi. */
export const readableOn = (bg: string, candidates: string[], min = 4.5) =>
  candidates.find((c) => contrast(c, bg) >= min) ?? [...candidates].sort((a, b) => contrast(b, bg) - contrast(a, bg))[0];
