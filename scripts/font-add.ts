// Unduh font dari Fontsource (npm @fontsource/<id>) ke public/fonts/<id>/ dan catat di public/fonts/fonts.json.
// Font di-host sendiri: render tidak butuh internet. Hanya lisensi terbuka (OFL/Apache/MIT/UFL) yang diterima.
//
//   npm run font:add -- space-grotesk                         # bobot 400 + 700 (atau yang tersedia)
//   npm run font:add -- playfair-display --weights=700,900
//   npm run font:add -- plus-jakarta-sans --weights=700,800 --italic=800
//   opsi: --subsets=latin,latin-ext (default)
//
// Cari id di https://fontsource.org/fonts (id = bagian URL, mis. fontsource.org/fonts/space-grotesk).
// Menjalankan ulang untuk id yang sama menambah bobot baru tanpa menghapus yang lama.
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { arg, run } from './lib/episode.ts';

type FontFile = { file: string; weight: number; style: 'normal' | 'italic'; subset: string; unicodeRange: string };
type FontEntry = { family: string; category: string; license: string; attribution: string; source: string; version: string; files: FontFile[] };
const REGISTRY = 'public/fonts/fonts.json';
const OPEN_LICENSES = /^(OFL|Apache|MIT|UFL)/i;

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
  console.error('Pakai: npm run font:add -- <id-fontsource> [--weights=400,700] [--italic=700] [--subsets=latin,latin-ext]\nCari id di https://fontsource.org/fonts');
  process.exit(1);
}
const nums = (s?: string) => (s ? s.split(',').map((x) => Number(x.trim())).filter((n) => Number.isFinite(n)) : []);

const tmp = mkdtempSync(join(tmpdir(), 'fontsource-'));
try {
  try {
    await run('npm', ['pack', `@fontsource/${id}`, '--silent', '--pack-destination', tmp]);
  } catch {
    throw new Error(`@fontsource/${id} tidak ditemukan di npm. Cek id di https://fontsource.org/fonts (font variabel saja memakai @fontsource-variable, pilih font statis).`);
  }
  const tgz = readdirSync(tmp).find((f) => f.endsWith('.tgz'));
  if (!tgz) throw new Error('npm pack tidak menghasilkan arsip');
  await run('tar', ['-xzf', join(tmp, tgz), '-C', tmp]);
  const pkg = join(tmp, 'package');
  const meta = JSON.parse(readFileSync(join(pkg, 'metadata.json'), 'utf8')) as {
    family: string; category: string; weights: number[]; styles: string[]; subsets: string[]; version: string; license: { type: string; attribution: string };
  };
  const pkgVersion = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).version as string;
  const unicode = JSON.parse(readFileSync(join(pkg, 'unicode.json'), 'utf8')) as Record<string, string>;
  if (!OPEN_LICENSES.test(meta.license.type)) throw new Error(`Lisensi ${meta.license.type} bukan lisensi terbuka yang diizinkan (OFL/Apache/MIT/UFL). Pilih font lain.`);

  const asked = nums(arg('weights'));
  const weights = asked.length ? asked : [400, 700].filter((w) => meta.weights.includes(w)).length ? [400, 700].filter((w) => meta.weights.includes(w)) : meta.weights;
  const missing = weights.filter((w) => !meta.weights.includes(w));
  if (missing.length) throw new Error(`${meta.family} tidak punya bobot ${missing.join(', ')}. Tersedia: ${meta.weights.join(', ')}`);
  const italic = nums(arg('italic'));
  if (italic.length && !meta.styles.includes('italic')) throw new Error(`${meta.family} tidak punya italic`);
  const subsets = (arg('subsets') ?? 'latin,latin-ext').split(',').filter((s) => meta.subsets.includes(s));
  if (!subsets.includes('latin')) throw new Error(`${meta.family} tidak punya subset latin (dibutuhkan untuk bahasa Indonesia)`);

  const want: { weight: number; style: 'normal' | 'italic' }[] = [...weights.map((w) => ({ weight: w, style: 'normal' as const })), ...italic.map((w) => ({ weight: w, style: 'italic' as const }))];
  const dir = `public/fonts/${id}`;
  mkdirSync(dir, { recursive: true });
  const files: FontFile[] = [];
  for (const { weight, style } of want) {
    for (const subset of subsets) {
      const file = `${id}-${subset}-${weight}-${style}.woff2`;
      const src = join(pkg, 'files', file);
      if (!existsSync(src)) throw new Error(`File ${file} tidak ada di paket Fontsource`);
      copyFileSync(src, join(dir, file));
      files.push({ file, weight, style, subset, unicodeRange: unicode[subset] ?? '' });
    }
  }
  copyFileSync(join(pkg, 'LICENSE'), join(dir, 'LICENSE.txt'));

  const registry: Record<string, FontEntry> = existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, 'utf8')) : {};
  const old = registry[id]?.files ?? [];
  const merged = [...old.filter((o) => !files.some((f) => f.file === o.file)), ...files].sort((a, b) => a.file.localeCompare(b.file));
  registry[id] = { family: meta.family, category: meta.category, license: meta.license.type, attribution: meta.license.attribution, source: `fontsource @fontsource/${id}@${pkgVersion} (${meta.version})`, version: pkgVersion, files: merged };
  const sorted = Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(REGISTRY, JSON.stringify(sorted, null, 2) + '\n');

  const kb = Math.round(files.reduce((s, f) => s + readFileSync(join(dir, f.file)).length, 0) / 1024);
  console.log(`✓ ${meta.family} (${meta.category}, ${meta.license.type}) → ${dir}/`);
  console.log(`  bobot ${want.map((w) => `${w.weight}${w.style === 'italic' ? 'i' : ''}`).join(', ')} · subset ${subsets.join(', ')} · ${files.length} file, ${kb} KB`);
  console.log(`  pakai: import { font } from '../../shared/brand/fonts';  const DISPLAY = font('${id}');`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
