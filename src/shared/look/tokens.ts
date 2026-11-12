// Token palet berperan: dari visualStyle (tone + palette) diturunkan warna dengan peran tetap, sehingga agent tidak
// memilih hex acak per elemen. Kontras teks dijamin: ink ≥ 7:1, muted ≥ 4,5:1, accentInk ≥ 4,5:1 terhadap latarnya.
//
//   const T = tokens(style);
//   <div style={{ background: T.surface, color: T.ink, boxShadow: T.elevation(2) }}>…</div>
import type { VisualStyle } from '../episode/types';
import { alpha, contrast, darken, lighten, luminance, mix, readableOn, saturation, shadowOf } from './color';

export type Tokens = {
  tone: 'light' | 'dark';
  /** latar utama */
  bg: string;
  /** latar kedua untuk gradien/kedalaman */
  bg2: string;
  /** kartu, panel, objek datar di atas latar */
  surface: string;
  /** teks/garis utama di atas bg atau surface */
  ink: string;
  /** teks sekunder, label sumbu */
  muted: string;
  /** garis tipis, grid, pembatas */
  line: string;
  /** satu warna penekanan (angka kunci, sorotan) */
  accent: string;
  /** teks di atas accent */
  accentInk: string;
  /** warna kedua (pembanding, data seri ke-2) */
  accent2: string;
  /** penanda negatif/mitos/bahaya */
  danger: string;
  /** penanda positif/fakta/benar */
  good: string;
  /** warna bayangan (rgba) */
  shadow: string;
  /** box-shadow bertingkat 0–4 (0 = datar) */
  elevation: (level: number) => string;
  palette: string[];
};

const FALLBACK = { light: ['#F6F1E7', '#14213D', '#E07A1F'], dark: ['#0B1530', '#F4F1EA', '#FFB000'] };

export const tokens = (style: Pick<VisualStyle, 'tone' | 'palette'>): Tokens => {
  const tone = style.tone;
  const pal = style.palette && style.palette.length >= 2 ? style.palette : FALLBACK[tone];
  const byLum = [...pal].sort((a, b) => luminance(a) - luminance(b));
  const bg = tone === 'light' ? byLum[byLum.length - 1] : byLum[0];
  const inkCands = tone === 'light' ? [...byLum, '#10131C'] : [...byLum].reverse().concat('#FFFFFF');
  const ink = readableOn(bg, inkCands, 7);
  const rest = pal.filter((c) => c !== bg && c !== ink);
  const bySat = [...(rest.length ? rest : [tone === 'light' ? '#E07A1F' : '#FFB000'])].sort((a, b) => saturation(b) - saturation(a));
  const accent = bySat[0];
  const accent2 = bySat[1] ?? mix(accent, ink, 0.5);
  const surface = tone === 'light' ? lighten(bg, 0.55) : lighten(bg, 0.07);
  let muted = mix(ink, bg, 0.4);
  for (let t = 0.4; t > 0 && contrast(muted, bg) < 4.5; t -= 0.05) muted = mix(ink, bg, t);
  const accentInk = readableOn(accent, [ink, bg, '#10131C', '#FFFFFF'], 4.5);
  const shadowBase = tone === 'light' ? shadowOf(bg, 0.75) : '#000000';
  const sa = tone === 'light' ? 0.18 : 0.45;
  return {
    tone,
    bg,
    bg2: tone === 'light' ? darken(mix(bg, accent, 0.06), 0.05) : lighten(mix(bg, accent, 0.08), 0.04),
    surface,
    ink,
    muted,
    line: alpha(ink, tone === 'light' ? 0.16 : 0.2),
    accent,
    accentInk,
    accent2,
    danger: tone === 'light' ? '#C2362B' : '#FF6B5E',
    good: tone === 'light' ? '#1F7A4D' : '#4FD18B',
    shadow: alpha(shadowBase, sa),
    elevation: (level: number) =>
      level <= 0
        ? 'none'
        : `0 ${level * 2}px ${level * 4}px ${alpha(shadowBase, sa * 0.9)}, 0 ${level * 8}px ${level * 18}px ${alpha(shadowBase, sa * 0.7)}`,
    palette: pal,
  };
};
