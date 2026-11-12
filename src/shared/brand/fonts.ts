// Font di-host sendiri di public/fonts/<id>/ (diunduh dari Fontsource dengan `npm run font:add -- <id>`) dan dicatat
// di public/fonts/fonts.json. Dimuat lewat @remotion/fonts, bukan Google Fonts: render tidak butuh internet.
// Remotion menunggu font siap (delayRender) sebelum menangkap frame.
//
//   import { font, episodeFonts } from '../../shared/brand/fonts';
//   const { display, text } = episodeFonts(brief.visualStyle);   // dari visualStyle.fonts di brief
//   const HAND = font('caveat');                                  // langsung dengan id Fontsource
//
// Pemilihan font per episode: docs/WORKFLOW-AI-AGENT.md §7.6.
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import registry from '../../../public/fonts/fonts.json';
import type { VisualStyle } from '../episode/types';

type FontFile = { file: string; weight: number; style: string; subset: string; unicodeRange: string };
type FontEntry = { family: string; category: string; files: FontFile[] };
const REG = registry as Record<string, FontEntry>;

const GENERIC: Record<string, string> = { serif: 'serif', 'sans-serif': 'sans-serif', monospace: 'monospace', handwriting: 'cursive', display: 'sans-serif' };
const loaded = new Map<string, string>();

/** Font bawaan untuk teks dan caption SeFakta. */
export const DEFAULT_FONT_ID = 'plus-jakarta-sans';

/** Muat font terdaftar (semua bobot yang sudah diunduh) dan kembalikan nilai CSS fontFamily. */
export const font = (id: string): string => {
  const hit = loaded.get(id);
  if (hit) return hit;
  const entry = REG[id];
  if (!entry) throw new Error(`Font "${id}" belum diunduh. Jalankan: npm run font:add -- ${id}`);
  for (const f of entry.files) {
    loadFont({ family: entry.family, url: staticFile(`fonts/${id}/${f.file}`), weight: String(f.weight), style: f.style, unicodeRange: f.unicodeRange || undefined }).catch((err) => {
      console.error(`Font ${entry.family} (${f.file}) gagal dimuat`, err);
    });
  }
  const css = `"${entry.family}", ${GENERIC[entry.category] ?? 'sans-serif'}`;
  loaded.set(id, css);
  return css;
};

/** Font episode dari brief: `display` untuk judul/label/angka di visual, `text` untuk teks kecil di visual.
 *  Tanpa `visualStyle.fonts`, keduanya Plus Jakarta Sans. Caption template tetap memakai FONT_JAKARTA. */
export const episodeFonts = (style: VisualStyle) => ({
  display: font(style.fonts?.display ?? DEFAULT_FONT_ID),
  text: font(style.fonts?.text ?? DEFAULT_FONT_ID),
});

// Bobot tertinggi Plus Jakarta Sans = 800; teks berbobot 900 dirender dengan 800. Italic dipakai angka fakta 2D.
export const FONT_JAKARTA = font(DEFAULT_FONT_ID);
