// Pemeriksa tata letak per episode: gerbang angka untuk teks yang keluar frame, masuk zona watermark/caption,
// saling tumpang tindih, terpotong overflow, atau jatuh ke font cadangan. Pasangan dari motion:check.
//   • bundle proyek, lalu renderFrames (tanpa screenshot) dengan input props { layoutCheck: true, captionMode }
//   • LayoutProbe (dipasang di Watermark) mengukur DOM tiap frame sampel dan menulis LAYOUTCHECK ke console browser
//   • pelanggaran dikelompokkan per scene + jenis + teks; yang muncul di ≥ 2 sampel berturut-turut = menetap
//
//   npm run layout:check -- <id>                      # seluruh cerita, sampel tiap 10 frame
//   npm run layout:check -- <id> --scene=<sceneId>    # satu scene
//   opsi: --every=<n> (default 10), --comp=<CompositionId>, --caption=<mode> (untuk komposisi tanpa brief),
//         --entry=<file> (entry Remotion lain; default src/index.ts)
//   tanpa brief: npm run layout:check -- --comp=KatalogGerak --caption=none
//
// Error (exit 1): out-of-frame, watermark-zone, caption-zone, overlap, font-fallback yang MENETAP.
// Peringatan: pelanggaran sesaat (1 sampel, biasanya animasi masuk/keluar), clipped (overflow terpotong), font-synthetic.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderFrames, selectComposition } from '@remotion/renderer';
import { arg, FPS, paths, SCENE_PAD_SECONDS, type Brief } from './lib/episode.ts';

type Rect = { x: number; y: number; w: number; h: number };
type Issue = { type: string; text: string; rect: Rect; detail?: string };
type Sample = { frame: number; texts?: number; issues?: Issue[]; error?: string };

const ERROR_TYPES = new Set(['out-of-frame', 'watermark-zone', 'caption-zone', 'overlap', 'font-fallback']);
const LABEL: Record<string, string> = {
  'out-of-frame': 'keluar frame/margin aman (x 40–1040)',
  'watermark-zone': 'di zona watermark (x > 800, y < 175)',
  'caption-zone': 'di zona caption',
  overlap: 'teks bertumpuk',
  clipped: 'teks terpotong overflow',
  'font-fallback': 'font cadangan (font tidak dimuat)',
  'font-synthetic': 'bobot/italic palsu',
};

const every = Math.max(1, Number(arg('every') ?? 10));
const id = arg('episode') ?? process.argv.slice(2).find((a) => !a.startsWith('--'));
const compArg = arg('comp');
if (!id && !compArg) {
  console.error('Pakai: npm run layout:check -- <id-episode> [--scene=<id>] [--every=10] [--comp=<CompositionId>]');
  process.exit(1);
}

// timeline (sama seperti calculateEpisodeMetadata / motion-check)
let brief: Brief | null = null;
let comp = compArg;
let scenes: { id: string; from: number; frames: number }[] = [];
if (id) {
  const briefFile = `briefs/${id}.json`;
  if (!existsSync(briefFile)) throw new Error(`${briefFile} tidak ada`);
  brief = JSON.parse(readFileSync(briefFile, 'utf8')) as Brief;
  const compFile = `src/topics/${id}/compositions.tsx`;
  comp ??= /\bid=["']([^"']+)["']/.exec(existsSync(compFile) ? readFileSync(compFile, 'utf8') : '')?.[1];
  if (!comp) throw new Error(`Komposisi tidak ditemukan di ${compFile}; pakai --comp=<id>`);
  const P = paths(id);
  const manifest: { scenes: { id: string; audioSeconds: number }[] } | null = existsSync(P.manifest) ? JSON.parse(readFileSync(P.manifest, 'utf8')) : null;
  let cursor = 0;
  scenes = brief.scenes.map((s) => {
    const vo = manifest?.scenes.find((e) => e.id === s.id);
    const frames = Math.ceil(Math.max(s.durationSeconds, vo ? vo.audioSeconds + SCENE_PAD_SECONDS : 0) * FPS);
    const r = { id: s.id, from: cursor, frames };
    cursor += frames;
    return r;
  });
}
const captionMode = arg('caption') ?? brief?.captionMode ?? 'none';

const t0 = Date.now();
console.log('Bundle …');
// symlinkPublicDir: public/ tidak disalin (hemat ±50 MB per run); bundle dihapus di akhir
const serveUrl = await bundle({ entryPoint: resolve(arg('entry') ?? 'src/index.ts'), publicDir: resolve('public'), symlinkPublicDir: true });
process.on('exit', () => rmSync(serveUrl, { recursive: true, force: true }));
const inputProps = { layoutCheck: true, layoutEvery: 1, captionMode };
const composition = await selectComposition({ serveUrl, id: comp!, inputProps });
if (!scenes.length) scenes = [{ id: comp!, from: 0, frames: composition.durationInFrames }];
const only = arg('scene');
const targets = only ? scenes.filter((s) => s.id === only) : scenes;
if (!targets.length) throw new Error(`scene "${only}" tidak ada di brief`);
const first = targets[0].from;
const last = Math.min(composition.durationInFrames - 1, targets[targets.length - 1].from + targets[targets.length - 1].frames - 1);
// cerita saja (CTA dilewati): batas akhir = scene terakhir

const samples: Sample[] = [];
console.log(`Ukur ${comp} frame ${first}–${last}, sampel tiap ${every} frame, caption ${captionMode} …`);
await renderFrames({
  composition,
  serveUrl,
  inputProps,
  frameRange: [first, last],
  everyNthFrame: every,
  imageFormat: 'none',
  outputDir: null,
  onStart: () => undefined,
  onFrameUpdate: () => undefined,
  onBrowserLog: (log) => {
    if (log.text.startsWith('LAYOUTCHECK ')) samples.push(JSON.parse(log.text.slice('LAYOUTCHECK '.length)));
  },
  logLevel: 'error',
});
samples.sort((a, b) => a.frame - b.frame);

const sceneOf = (f: number) => targets.find((s) => f >= s.from && f < s.from + s.frames);
const s1 = (x: number) => x.toFixed(1).replace('.', ',');

type Group = { scene: string; type: string; text: string; detail?: string; frames: number[]; rect: Rect; persistent: boolean; level: 'error' | 'warn' };
const groups = new Map<string, Group>();
for (const s of samples) {
  if (s.error) console.log(`⚠ probe gagal di frame ${s.frame}: ${s.error}`);
  const sc = sceneOf(s.frame);
  for (const i of s.issues ?? []) {
    const key = `${sc?.id}|${i.type}|${i.text}`;
    const g = groups.get(key) ?? { scene: sc?.id ?? '?', type: i.type, text: i.text, detail: i.detail, frames: [], rect: i.rect, persistent: false, level: 'warn' as const };
    g.frames.push(s.frame - (sc?.from ?? 0));
    groups.set(key, g);
  }
}
for (const g of groups.values()) {
  g.frames.sort((a, b) => a - b);
  g.persistent = g.frames.some((f, i) => i > 0 && f - g.frames[i - 1] <= every);
  g.level = ERROR_TYPES.has(g.type) && g.persistent ? 'error' : 'warn';
}

const list = [...groups.values()];
const measured = samples.filter((s) => !s.error).length;
for (const sc of targets) {
  const mine = list.filter((g) => g.scene === sc.id).sort((a, b) => (a.level === b.level ? a.frames[0] - b.frames[0] : a.level === 'error' ? -1 : 1));
  const texts = samples.filter((s) => sceneOf(s.frame) === sc).map((s) => s.texts ?? 0);
  console.log(`\n${sc.id.padEnd(14)} ${s1(sc.from / FPS)}–${s1((sc.from + sc.frames) / FPS)} dtk  sampel ${texts.length}  teks/sampel maks ${Math.max(0, ...texts)}  ${mine.length ? '' : '✓'}`);
  for (const g of mine) {
    const when = `dtk ${s1(g.frames[0] / FPS)}${g.frames.length > 1 ? `–${s1(g.frames[g.frames.length - 1] / FPS)}` : ''} (${g.frames.length}× sampel${g.persistent ? '' : ', sesaat'})`;
    console.log(`  ${g.level === 'error' ? '✖' : '⚠'} ${LABEL[g.type] ?? g.type}: "${g.text}"${g.detail ? ` [${g.detail}]` : ''} · ${when} · kotak x${g.rect.x} y${g.rect.y} ${g.rect.w}×${g.rect.h}`);
  }
}

const outDir = join('out', id ?? comp!, 'layout');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'report.json'), JSON.stringify({ episode: id, composition: comp, captionMode, every, samples: measured, issues: list }, null, 2));
const errs = list.filter((g) => g.level === 'error').length;
const warns = list.length - errs;
console.log(`\n${measured} frame diukur dalam ${Math.round((Date.now() - t0) / 1000)} dtk. Laporan: ${outDir}/report.json`);
console.log('Abaikan elemen yang sengaja melanggar (dekorasi teks di tepi, efek glitch) dengan atribut data-layout-ignore.');
console.log(errs ? `✖ ${errs} error, ${warns} peringatan` : warns ? `⚠ ${warns} peringatan` : '✓ tata letak lolos');
process.exit(errs ? 1 : 0);
