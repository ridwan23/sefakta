// Pemeriksa gerak per episode: agent tidak bisa "melihat" animasi dari still, jadi skrip ini mengukurnya.
//   • render cerita (tanpa CTA) beresolusi kecil, lalu hitung selisih piksel antar-frame di area isi
//     (y 180–1460: tanpa watermark dan zona caption, supaya caption yang berganti tidak menutupi visual yang beku)
//   • laporan per scene: % frame bergerak, segmen beku terlama, ada/tidaknya entrance, lompatan kasar, grafik energi per detik
//   • filmstrip per scene → out/<id>/motion/<scene>.png
//       baris atas  = entrance: frame 0, 2, 4, … 14 (0,5 dtk pertama, lihat kurva masuknya)
//       baris bawah = 8 frame merata sepanjang scene (lihat apa yang berubah tiap beat)
//
//   npm run motion:check -- <id>                     # seluruh cerita
//   npm run motion:check -- <id> --scene=<sceneId>   # satu scene (lebih cepat saat iterasi)
//   opsi: --comp=<CompositionId> (default: komposisi pertama di compositions.tsx), --keep (simpan frame mentah),
//         --gl=angle|swangle (bila scene 3D hitam di Linux/CI)
//
// Ambang (docs/TATA-GERAK.md): beku ≥ 1,5 dtk = peringatan, ≥ 3 dtk = error; scene tanpa gerak di 0,5 dtk pertama = peringatan.
// Beat per 60 dtk (lonjakan energi gerak) < 10 = peringatan, hanya untuk seluruh cerita; ambang masih perkiraan.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg, flag, FPS, paths, run, SCENE_PAD_SECONDS, type Brief } from './lib/episode.ts';

const SCALE = 0.25;
const STILL = 0.015; // rata-rata selisih luma (0–255) di bawah ini = frame identik/beku
const JUMP = 20; // selisih di atas ini dalam satu scene = lompatan/potong keras
const WARN_FROZEN = 1.5;
const ERR_FROZEN = 3;
const CROP = { top: 180, bottom: 1460 };
// beat = lonjakan energi gerak di atas dasar scene (perkiraan; docs/REFERENSI-GAYA-VISUAL.md § Prinsip lintas gaya)
const BEAT_SMOOTH = 5; // frame rata-rata bergerak
const BEAT_MIN = 0.4; // energi minimum sebuah beat
const BEAT_RATIO = 2; // × median energi scene (idle terus-menerus tidak dihitung)
const BEAT_GAP = 0.75; // dtk minimum antar-beat
// kalibrasi 2026-11-13: tambora-1816 11,3 · bersin-matahari 19,6 per 60 dtk. Scene dengan kamera/peta yang terus
// bergerak menaikkan median sehingga beat terhitung lebih sedikit; karena itu ambang bawah peringatan 10, bukan 12.
const BEATS_PER_MIN = { low: 10, high: 18 };

const id = arg('episode') ?? process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) {
  console.error('Pakai: npm run motion:check -- <id-episode> [--scene=<id>] [--comp=<CompositionId>] [--keep]');
  process.exit(1);
}
const briefFile = `briefs/${id}.json`;
if (!existsSync(briefFile)) throw new Error(`${briefFile} tidak ada`);
const brief: Brief = JSON.parse(readFileSync(briefFile, 'utf8'));
const compFile = `src/topics/${id}/compositions.tsx`;
const comp = arg('comp') ?? /\bid=["']([^"']+)["']/.exec(existsSync(compFile) ? readFileSync(compFile, 'utf8') : '')?.[1];
if (!comp) throw new Error(`Komposisi tidak ditemukan di ${compFile}; pakai --comp=<id>`);

// timeline dihitung sama seperti calculateEpisodeMetadata
const P = paths(id);
const manifest: { scenes: { id: string; audioSeconds: number }[] } | null = existsSync(P.manifest) ? JSON.parse(readFileSync(P.manifest, 'utf8')) : null;
let cursor = 0;
const scenes = brief.scenes.map((s) => {
  const vo = manifest?.scenes.find((e) => e.id === s.id);
  const frames = Math.ceil(Math.max(s.durationSeconds, vo ? vo.audioSeconds + SCENE_PAD_SECONDS : 0) * FPS);
  const r = { id: s.id, from: cursor, frames };
  cursor += frames;
  return r;
});
const only = arg('scene');
const targets = only ? scenes.filter((s) => s.id === only) : scenes;
if (!targets.length) throw new Error(`scene "${only}" tidak ada di brief`);
const first = targets[0].from;
const last = targets[targets.length - 1].from + targets[targets.length - 1].frames - 1;

const outDir = join('out', id, 'motion');
const framesDir = join(outDir, 'frames');
rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });

console.log(`Render ${comp} frame ${first}–${last} (skala ${SCALE}) …`);
await run('npx', ['remotion', 'render', 'src/index.ts', comp, framesDir, '--sequence', '--image-format=jpeg', `--scale=${SCALE}`, `--frames=${first}-${last}`, '--log=error', ...(arg('gl') ? [`--gl=${arg('gl')}`] : [])], { maxBuffer: 64 * 1024 * 1024 });

// nama berurutan absolut: f<frame>.jpeg (Remotion tidak selalu memberi padding yang bisa diurutkan)
for (const f of readdirSync(framesDir)) {
  const n = Number(/(\d+)\.jpe?g$/.exec(f)?.[1]);
  if (Number.isFinite(n)) renameSync(join(framesDir, f), join(framesDir, `f${String(n).padStart(6, '0')}.jpeg`));
}
const frameFile = (n: number) => join(framesDir, `f${String(n).padStart(6, '0')}.jpeg`);

// selisih antar-frame: diff[i] = perubahan dari frame (first+i) ke (first+i+1)
const H = 1920;
const crop = `crop=iw:ih*${(CROP.bottom - CROP.top) / H}:0:ih*${CROP.top / H}`;
const { stdout } = await run(
  'ffmpeg',
  ['-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-pattern_type', 'glob', '-i', join(framesDir, 'f*.jpeg'), '-vf', `${crop},tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`, '-f', 'null', '-'],
  { maxBuffer: 256 * 1024 * 1024 },
);
const diff = [...stdout.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
const d = (absFrame: number) => diff[absFrame - first] ?? 0; // perubahan absFrame → absFrame+1

const BARS = [[0, '·'], [0.05, '▁'], [0.15, '▂'], [0.4, '▃'], [1, '▄'], [2.5, '▅'], [6, '▆'], [15, '▇'], [Infinity, '█']] as const;
const bar = (v: number) => (v < STILL ? '·' : BARS.find(([t]) => v < t)?.[1] ?? '█');
const s1 = (x: number) => x.toFixed(1).replace('.', ',');

type Issue = { level: 'error' | 'warn' | 'info'; scene: string; msg: string };
const issues: Issue[] = [];
const report: Record<string, unknown>[] = [];
let totalBeats = 0;
let totalSec = 0;

for (const sc of targets) {
  const end = sc.from + sc.frames - 1; // diff di dalam scene: from … end-1
  const inner = Array.from({ length: sc.frames - 1 }, (_, i) => d(sc.from + i));
  const moving = inner.filter((v) => v >= STILL).length;
  // segmen beku terlama
  let run0 = 0, best = 0, bestAt = 0, cur = 0;
  inner.forEach((v, i) => {
    if (v < STILL) {
      if (cur === 0) run0 = i;
      cur++;
      if (cur > best) [best, bestAt] = [cur, run0];
    } else cur = 0;
  });
  const frozenSec = (best + 1) / FPS;
  const entrance = inner.slice(0, Math.round(0.5 * FPS)).some((v) => v >= STILL);
  const jumps = inner.map((v, i) => [v, i] as const).filter(([v]) => v > JUMP).map(([, i]) => i);
  const perSec = Array.from({ length: Math.ceil(inner.length / FPS) }, (_, k) => {
    const seg = inner.slice(k * FPS, (k + 1) * FPS);
    return seg.reduce((a, b) => a + b, 0) / Math.max(1, seg.length);
  });
  const boundary = sc.from > 0 && sc.from > first ? d(sc.from - 1) : null;
  // beat: awal lonjakan energi (rata-rata BEAT_SMOOTH frame) di atas max(BEAT_MIN, BEAT_RATIO × median)
  const smooth = inner.map((_, i) => {
    const seg = inner.slice(Math.max(0, i - (BEAT_SMOOTH >> 1)), i + (BEAT_SMOOTH >> 1) + 1);
    return seg.reduce((a, b) => a + b, 0) / seg.length;
  });
  const median = [...inner].sort((a, b) => a - b)[inner.length >> 1] ?? 0;
  const beatTh = Math.max(BEAT_MIN, BEAT_RATIO * median);
  const beats: number[] = [];
  smooth.forEach((v, i) => {
    const prev = i === 0 ? 0 : smooth[i - 1];
    if (v >= beatTh && prev < beatTh && (!beats.length || i - beats[beats.length - 1] >= BEAT_GAP * FPS)) beats.push(i);
  });
  totalBeats += beats.length;
  totalSec += sc.frames / FPS;

  if (best > 0 && frozenSec >= ERR_FROZEN) issues.push({ level: 'error', scene: sc.id, msg: `beku ${s1(frozenSec)} dtk (dtk ${s1(bestAt / FPS)}–${s1((bestAt + best) / FPS)} scene). Tambah Idle/Particles/kamera drift atau beat baru` });
  else if (best > 0 && frozenSec >= WARN_FROZEN) issues.push({ level: 'warn', scene: sc.id, msg: `beku ${s1(frozenSec)} dtk (dtk ${s1(bestAt / FPS)}–${s1((bestAt + best) / FPS)} scene)` });
  if (!entrance) issues.push({ level: 'warn', scene: sc.id, msg: 'tidak ada gerak di 0,5 dtk pertama (entrance hilang/terlambat)' });
  if (moving / inner.length < 0.4) issues.push({ level: 'warn', scene: sc.id, msg: `hanya ${Math.round((moving / inner.length) * 100)}% frame bergerak` });
  if (jumps.length) issues.push({ level: 'info', scene: sc.id, msg: `lompatan kasar di dtk ${jumps.slice(0, 5).map((i) => s1(i / FPS)).join(', ')}${jumps.length > 5 ? ' …' : ''} (sengaja? pakai Swap/exit bila tidak)` });
  if (boundary !== null && boundary > JUMP) issues.push({ level: 'info', scene: sc.id, msg: `potong keras dari scene sebelumnya (selisih ${boundary.toFixed(0)}); pertimbangkan kontinuitas kamera/exit` });

  console.log(
    `\n${sc.id.padEnd(14)} ${s1(sc.from / FPS)}–${s1((end + 1) / FPS)} dtk  gerak ${String(Math.round((moving / inner.length) * 100)).padStart(3)}%  beku terlama ${s1(best ? frozenSec : 0)} dtk  beat ${beats.length} (dtk ${beats.map((i) => s1(i / FPS)).join(', ') || '–'})\n  energi/dtk ${perSec.map(bar).join('')}`,
  );
  for (const i of issues.filter((x) => x.scene === sc.id)) console.log(`  ${i.level === 'error' ? '✖' : i.level === 'warn' ? '⚠' : 'ℹ'} ${i.msg}`);

  // filmstrip
  const top = Array.from({ length: 8 }, (_, k) => Math.min(end, sc.from + k * 2));
  const bottom = Array.from({ length: 8 }, (_, k) => Math.min(end, sc.from + Math.round(((k + 0.5) * sc.frames) / 8)));
  const inputs = [...top, ...bottom].flatMap((n) => ['-i', frameFile(n)]);
  const strip = join(outDir, `${sc.id}.png`);
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-filter_complex', `${top.map((_, k) => `[${k}]`).join('')}hstack=inputs=8[a];${bottom.map((_, k) => `[${k + 8}]`).join('')}hstack=inputs=8[b];[a][b]vstack`, strip]);
  report.push({ scene: sc.id, fromSec: sc.from / FPS, seconds: sc.frames / FPS, movingPct: Math.round((moving / inner.length) * 100), longestFrozenSec: best ? +frozenSec.toFixed(2) : 0, entrance, beatsAtSec: beats.map((i) => +(i / FPS).toFixed(2)),energyPerSec: perSec.map((v) => +v.toFixed(3)), filmstrip: strip, entranceFrames: top.map((n) => n - sc.from), overviewFrames: bottom.map((n) => n - sc.from) });
}

// beat per 60 dtk: hanya untuk seluruh cerita (bukan --scene), peringatan saja sampai ambang dikalibrasi
const beatsPerMin = totalSec ? (totalBeats * 60) / totalSec : 0;
if (!only && beatsPerMin < BEATS_PER_MIN.low) issues.push({ level: 'warn', scene: '*', msg: `${s1(beatsPerMin)} beat per 60 dtk (perkiraan; target ${BEATS_PER_MIN.low}–${BEATS_PER_MIN.high}). Tambah perkembangan visual yang mengikuti narasi` });
console.log(`\nBeat: ${totalBeats} dalam ${s1(totalSec)} dtk = ${s1(beatsPerMin)} per 60 dtk (perkiraan; target ${BEATS_PER_MIN.low}–${BEATS_PER_MIN.high})`);
for (const i of issues.filter((x) => x.scene === '*')) console.log(`  ⚠ ${i.msg}`);

writeFileSync(join(outDir, 'report.json'), JSON.stringify({ episode: id, composition: comp, thresholds: { still: STILL, jump: JUMP, warnFrozen: WARN_FROZEN, errFrozen: ERR_FROZEN, beatMin: BEAT_MIN, beatRatio: BEAT_RATIO, beatGapSec: BEAT_GAP, beatsPerMin: BEATS_PER_MIN }, beats: { total: totalBeats, seconds: +totalSec.toFixed(2), perMin: +beatsPerMin.toFixed(1) }, scenes: report, issues }, null, 2));
if (!flag('keep')) rmSync(framesDir, { recursive: true, force: true });

const errs = issues.filter((i) => i.level === 'error').length;
const warns = issues.filter((i) => i.level === 'warn').length;
console.log(`\nFilmstrip: ${outDir}/<scene>.png (atas: entrance frame 0–14 tiap 2; bawah: 8 frame merata). Laporan: ${outDir}/report.json`);
console.log(`Energi: · beku  ▁▂▃ halus  ▄▅ aktif  ▆▇█ sangat cepat/potong`);
console.log(errs ? `✖ ${errs} error, ${warns} peringatan` : warns ? `⚠ ${warns} peringatan` : '✓ gerak lolos');
process.exit(errs ? 1 : 0);
