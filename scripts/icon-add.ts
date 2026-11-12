// Unduh ikon SVG berlisensi terbuka (npm) ke registri public/icons/icons.json, dipakai lewat <Icon name="set:nama" />
// dari src/shared/look/Icon.tsx. Ikon dibundel bersama kode: render tidak butuh internet, tidak ada file SVG terpisah.
//
//   npm run icon:add -- lucide:flask-conical lucide:candy phosphor:leaf
//   npm run icon:add -- phosphor:leaf --weight=fill          # → kunci phosphor:leaf-fill
//
// Set:
//   lucide    paket lucide-static (ISC), ikon garis (stroke) → bisa dianimasikan tergambar (draw)
//             cari nama di https://lucide.dev/icons
//   phosphor  paket @phosphor-icons/core (MIT), ikon isi (fill); --weight=regular|bold|fill|duotone|light|thin
//             cari nama di https://phosphoricons.com
// Menjalankan ulang untuk ikon yang sama menimpa entrinya (versi paket terbaru).
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { arg, run } from './lib/episode.ts';

type IconEntry = { set: string; name: string; license: string; source: string; viewBox: string; kind: 'stroke' | 'fill'; body: string };
const REGISTRY = 'public/icons/icons.json';
const SETS = {
  lucide: { pkg: 'lucide-static', license: 'ISC', kind: 'stroke' as const },
  phosphor: { pkg: '@phosphor-icons/core', license: 'MIT', kind: 'fill' as const },
};
type SetId = keyof typeof SETS;
const WEIGHTS = ['regular', 'bold', 'fill', 'duotone', 'light', 'thin'];

const names = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!names.length) {
  console.error('Pakai: npm run icon:add -- lucide:<nama> phosphor:<nama> [--weight=regular|bold|fill|duotone]\nCari nama: https://lucide.dev/icons · https://phosphoricons.com');
  process.exit(1);
}
const weight = arg('weight') ?? 'regular';
if (!WEIGHTS.includes(weight)) throw new Error(`--weight harus salah satu dari: ${WEIGHTS.join(', ')}`);

const req = names.map((n) => {
  const m = /^([a-z]+):([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(n);
  if (!m || !(m[1] in SETS)) throw new Error(`"${n}" tidak valid. Format: <set>:<nama>, set = ${Object.keys(SETS).join(' | ')}`);
  return { set: m[1] as SetId, name: m[2] };
});

/** Isi <svg> tanpa tag luar, dinormalisasi: tanpa komentar/width/height/class, warna → currentColor. */
const normalize = (svg: string, kind: 'stroke' | 'fill') => {
  const clean = svg.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
  const open = /<svg\b([^>]*)>/.exec(clean);
  if (!open) throw new Error('SVG tidak valid');
  const viewBox = /viewBox="([^"]+)"/.exec(open[1])?.[1] ?? '0 0 24 24';
  let body = clean.slice(open.index + open[0].length, clean.lastIndexOf('</svg>')).trim();
  body = body
    .replace(/\s(width|height|class)="[^"]*"/g, '')
    .replace(/(fill|stroke)="(?!none|currentColor)[^"]*"/g, '$1="currentColor"')
    .replace(/\s+\/>/g, '/>')
    .replace(/>\s+</g, '><');
  if (kind === 'stroke') body = body.replace(/<(path|line|polyline|polygon|circle|rect|ellipse)\b(?![^>]*pathLength)/g, '<$1 pathLength="1"');
  return { viewBox, body };
};

const registry: Record<string, IconEntry> = existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, 'utf8')) : {};
mkdirSync('public/icons/LICENSES', { recursive: true });

for (const set of [...new Set(req.map((r) => r.set))]) {
  const cfg = SETS[set];
  const tmp = mkdtempSync(join(tmpdir(), 'icons-'));
  try {
    await run('npm', ['pack', cfg.pkg, '--silent', '--pack-destination', tmp]);
    const tgz = readdirSync(tmp).find((f) => f.endsWith('.tgz'));
    if (!tgz) throw new Error(`npm pack ${cfg.pkg} tidak menghasilkan arsip`);
    await run('tar', ['-xzf', join(tmp, tgz), '-C', tmp]);
    const pkg = join(tmp, 'package');
    const version = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).version as string;
    const dir = set === 'lucide' ? join(pkg, 'icons') : join(pkg, 'assets', weight);
    const available = readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
    copyFileSync(join(pkg, 'LICENSE'), `public/icons/LICENSES/${set}.txt`);

    for (const { name } of req.filter((r) => r.set === set)) {
      // phosphor: berkas non-regular bernama <nama>-<weight>.svg; terima juga nama yang sudah bersufiks
      const base = set === 'phosphor' && weight !== 'regular' && !name.endsWith(`-${weight}`) ? `${name}-${weight}` : name;
      if (!available.includes(base)) {
        const stem = name.split('-')[0];
        const similar = available.filter((a) => a.includes(name) || a.includes(stem)).slice(0, 8);
        throw new Error(`Ikon ${set}:${base} tidak ada di ${cfg.pkg}@${version}.${similar.length ? ` Mirip: ${similar.map((s) => `${set}:${s}`).join(', ')}` : ''}`);
      }
      const { viewBox, body } = normalize(readFileSync(join(dir, `${base}.svg`), 'utf8'), cfg.kind);
      const key = `${set}:${base}`;
      registry[key] = { set, name: base, license: cfg.license, source: `${cfg.pkg}@${version}`, viewBox, kind: cfg.kind, body };
      console.log(`✓ ${key} (${cfg.kind}, ${cfg.license}, ${cfg.pkg}@${version})`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const sorted = Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(REGISTRY, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Registri: ${REGISTRY} (${Object.keys(sorted).length} ikon). Lisensi: public/icons/LICENSES/<set>.txt`);
console.log(`Pakai: import { Icon } from '../../shared/look/Icon';  <Icon name="${req[0].set}:${req[0].name}" size={120} />`);
