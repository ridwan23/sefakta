// Unduh model 3D glTF dari Poly Haven (semua aset CC0) ke public/models/<id>/ dan catat di public/models/models.json.
// Model di-host sendiri: render tidak butuh internet.
//
//   npm run model:add -- food_apple_01            # resolusi tekstur 1k (default, ringan)
//   npm run model:add -- food_apple_01 --res=2k
//
// Cari id di https://polyhaven.com/models (id = bagian URL, mis. polyhaven.com/a/food_apple_01).
// Pakai di kode: <Stage3D><Model id="food_apple_01" /></Stage3D> (src/shared/three).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { arg } from './lib/episode.ts';

const REGISTRY = 'public/models/models.json';
const UA = { 'User-Agent': 'remotion-asset-fetcher/1.0' }; // generik, tanpa data pribadi
type Entry = { name: string; license: 'CC0'; source: string; resolution: string; entry: string; bytes: number; authors: string[] };

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id || !/^[a-z0-9_]+$/.test(id)) {
  console.error('Pakai: npm run model:add -- <id-polyhaven> [--res=1k|2k]\nCari id di https://polyhaven.com/models');
  process.exit(1);
}
const res = arg('res') ?? '1k';
if (!['1k', '2k'].includes(res)) throw new Error('--res harus 1k atau 2k');

const getJson = async (url: string) => {
  const r = await fetch(url, { headers: UA });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Poly Haven API gagal (HTTP ${r.status}) untuk ${url}`);
  return r.json();
};

const info = (await getJson(`https://api.polyhaven.com/info/${id}`)) as { name: string; type: number; authors: Record<string, string> } | null;
if (!info) throw new Error(`Model "${id}" tidak ditemukan di Poly Haven. Cek id di https://polyhaven.com/models`);
if (info.type !== 2) throw new Error(`"${id}" bukan model 3D (mungkin HDRI/tekstur).`);
const files = (await getJson(`https://api.polyhaven.com/files/${id}`)) as { gltf?: Record<string, { gltf: { url: string; size: number; include?: Record<string, { url: string; size: number }> } }> } | null;
const pick = files?.gltf?.[res]?.gltf;
if (!pick) throw new Error(`"${id}" tidak punya glTF resolusi ${res}. Tersedia: ${Object.keys(files?.gltf ?? {}).join(', ') || '-'}`);

const dir = `public/models/${id}`;
const entry = pick.url.split('/').pop()!;
const all: [string, string][] = [[entry, pick.url], ...Object.entries(pick.include ?? {}).map(([rel, v]) => [rel, v.url] as [string, string])];
let bytes = 0;
for (const [rel, url] of all) {
  if (rel.includes('..')) throw new Error(`path tidak aman di daftar file: ${rel}`);
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`Unduh ${rel} gagal (HTTP ${r.status})`);
  const buf = Buffer.from(await r.arrayBuffer());
  const out = join(dir, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  bytes += buf.length;
}

mkdirSync('public/models', { recursive: true });
const registry: Record<string, Entry> = existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, 'utf8')) : {};
registry[id] = { name: info.name, license: 'CC0', source: `https://polyhaven.com/a/${id}`, resolution: res, entry, bytes, authors: Object.keys(info.authors ?? {}) };
writeFileSync(REGISTRY, JSON.stringify(Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');

console.log(`✓ ${info.name} (CC0, Poly Haven) → ${dir}/ · ${all.length} file, ${(bytes / 1024 / 1024).toFixed(2)} MB, tekstur ${res}`);
console.log(`  pakai: <Stage3D><Model id="${id}" /></Stage3D>  (import dari '../../shared/three')`);
