// Pemeriksa kesiapan episode (semua brief yang bukan arsip):
//   • VO ada untuk setiap scene dan sesuai naskah (hash), loudness -14 ±1 LUFS, true peak ≤ -1 dBTP
//   • caption (mode subtitle) hasil penyelarasan ada, sesuai audio, cakupan kata ≥ 90%
//   • durasi cerita (dihitung seperti template: max(durasi brief, audio + jeda)) 55–65 dtk
//   • VO CTA bersama (public/brand/cta-vo.mp3) ada, ≤ 3,5 dtk, loudness sesuai target (sekali untuk semua episode)
//   • komposisi terdaftar; visual per scene ada (placeholder = peringatan, error saat --publish)
//
//   npm run check:episodes               # draft: VO/caption/visual belum ada = peringatan
//   npm run check:episodes -- --publish  # siap tayang: semuanya wajib
//   npm run check:episodes -- --episode=<id>  # satu episode saja
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { CTA_VO_FILE, CTA_VO_MAX_SECONDS } from '../src/shared/brand/ctaVoice.ts';
import { arg, durationSeconds, storyRange, flag, paths, textHash, loudness, LUFS_TARGET, LUFS_TOLERANCE, SCENE_PAD_SECONDS } from './lib/episode.ts';

const publish = flag('publish');
const MIN_COVERAGE = 0.9;
const MAX_TRUE_PEAK = -1;
type Issue = { level: 'error' | 'warn'; msg: string };

const checkBrief = async (file: string): Promise<Issue[] | null> => {
  const b = JSON.parse(readFileSync(`briefs/${file}`, 'utf8'));
  if (b.status === 'arsip') return null;
  const issues: Issue[] = [];
  const pub = publish || b.status === 'siap-publikasi';
  const soft = (msg: string) => issues.push({ level: pub ? 'error' : 'warn', msg });
  const err = (msg: string) => issues.push({ level: 'error', msg });
  const P = paths(b.projectId);

  // komposisi & visual
  const topic = `src/topics/${b.projectId}`;
  if (!existsSync(`${topic}/compositions.tsx`)) err(`komposisi belum ada (${topic}/compositions.tsx). Jalankan npm run new:episode`);
  else if (!readFileSync('src/Root.tsx', 'utf8').includes(`./topics/${b.projectId}/compositions`)) err('komposisi belum didaftarkan di src/Root.tsx');
  const visuals = existsSync(`${topic}/scenes.tsx`) ? readFileSync(`${topic}/scenes.tsx`, 'utf8') : '';
  const body = /VISUALS[^=]*=\s*\{([\s\S]*?)\};/.exec(visuals)?.[1] ?? '';
  const withVisual = new Set([...body.matchAll(/(?:^|,)\s*['"]?([a-z0-9_-]+)['"]?\s*:/gim)].map((m) => m[1])); // satu kunci per baris atau sebaris
  const placeholders = b.scenes.filter((s: { id: string }) => !withVisual.has(s.id)).map((s: { id: string }) => s.id);
  if (placeholders.length) soft(`scene masih memakai placeholder visual: ${placeholders.join(', ')}`);
  if (b.scenes.some((s: { voiceoverText: string }) => /\bTODO\b/.test(s.voiceoverText))) soft('naskah masih berisi TODO');

  // font episode (WORKFLOW §7.6): dipilih sesuai konsep, sudah diunduh dari Fontsource ke public/fonts/
  const fonts = b.visualStyle?.fonts as { display?: string; text?: string; reason?: string } | undefined;
  const registry: Record<string, { files: { file: string }[] }> = existsSync('public/fonts/fonts.json') ? JSON.parse(readFileSync('public/fonts/fonts.json', 'utf8')) : {};
  if (!fonts) issues.push({ level: 'warn', msg: 'visualStyle.fonts belum dipilih; visual memakai Plus Jakarta Sans ({ display, text?, reason }; lihat WORKFLOW §7.6)' });
  else {
    if (!fonts.reason || /\bTODO\b/.test(fonts.reason)) soft('visualStyle.fonts.reason belum diisi');
    for (const key of ['display', 'text'] as const) {
      const fid = fonts[key];
      if (!fid) continue;
      if (/\bTODO\b/.test(fid)) soft(`visualStyle.fonts.${key} masih TODO`);
      else if (!registry[fid]) err(`font "${fid}" belum diunduh. Jalankan: npm run font:add -- ${fid}`);
      else for (const f of registry[fid].files) if (!existsSync(`public/fonts/${fid}/${f.file}`)) err(`file font hilang: public/fonts/${fid}/${f.file} (jalankan ulang npm run font:add -- ${fid})`);
    }
  }

  // SFX (PANDUAN-AI-AGENT-PRODUKSI §7): file ada, tercatat lisensinya, jumlah 3–8 bila dipakai
  const topicCode = existsSync(topic) ? readdirSync(topic).filter((f) => /\.tsx?$/.test(f)).map((f) => readFileSync(`${topic}/${f}`, 'utf8')).join('\n') : '';
  const sfxUses = [...topicCode.matchAll(/<Sfx\b[^>]*\bfile=["'`]([^"'`]+)["'`]/g), ...topicCode.matchAll(/staticFile\(\s*["'`]sfx\/([^"'`]+)["'`]/g)].map((m) => m[1]);
  if (sfxUses.length) {
    const licFile = 'public/sfx/LICENSES.json';
    const lic: { file: string; lisensi?: string; sumber?: string }[] = existsSync(licFile) ? JSON.parse(readFileSync(licFile, 'utf8')) : [];
    for (const f of new Set(sfxUses)) {
      if (!existsSync(`public/sfx/${f}`)) err(`SFX ${f} tidak ada di public/sfx/`);
      const l = lic.find((x) => x.file === f);
      if (!l || !l.lisensi || !l.sumber) err(`SFX ${f} belum tercatat lisensinya di ${licFile} (file, sumber, lisensi wajib)`);
    }
    if (sfxUses.length > 8) soft(`${sfxUses.length} SFX (maks 8 per episode; hanya pada beat cerita)`);
  }

  // VO
  const manifest = existsSync(P.manifest) ? JSON.parse(readFileSync(P.manifest, 'utf8')) : null;
  const vo = new Map<string, { hash: string; audioSeconds: number; speed: number }>((manifest?.scenes ?? []).map((e: { id: string }) => [e.id, e]));
  if (!manifest) soft('VO belum dibuat (npm run vo)');
  else if (new Set(manifest.scenes.map((e: { voice?: string }) => e.voice ?? '')).size > 1) soft('VO memakai lebih dari satu suara (reference id berganti di tengah); jalankan npm run vo');
  let story = 0;
  for (const s of b.scenes) {
    const e = vo.get(s.id);
    story += Math.max(s.durationSeconds, e ? e.audioSeconds + SCENE_PAD_SECONDS : 0);
    if (!manifest) continue;
    if (!e || !existsSync(P.vo(s.id))) { soft(`${s.id}: audio VO belum ada`); continue; }
    if (e.hash !== textHash(s.voiceoverText, s.voiceoverSpeed ?? e.speed)) { soft(`${s.id}: audio usang, naskah sudah berubah (npm run vo)`); continue; }
    const L = await loudness(P.vo(s.id));
    if (Math.abs(L.lufs - LUFS_TARGET) > LUFS_TOLERANCE) soft(`${s.id}: loudness ${L.lufs} LUFS (target ${LUFS_TARGET} ±${LUFS_TOLERANCE})`);
    if (L.truePeak > MAX_TRUE_PEAK) soft(`${s.id}: true peak ${L.truePeak} dBTP (maks ${MAX_TRUE_PEAK})`);
  }
  const range = storyRange(b);
  if (range.problem) err(range.problem);
  if (range.exception) issues.push({ level: 'warn', msg: range.exception });
  if (story < range.min || story > range.max) soft(`durasi cerita ${story.toFixed(1)} dtk di luar ${range.min}–${range.max} dtk (tanpa CTA 4 dtk)`);

  // caption
  if (b.captionMode === 'subtitle' && manifest) {
    const caps = existsSync(P.captions) ? JSON.parse(readFileSync(P.captions, 'utf8')).scenes : null;
    if (!caps) soft('caption belum diselaraskan (npm run align)');
    else
      for (const s of b.scenes) {
        const c = caps[s.id], e = vo.get(s.id);
        if (!c) soft(`${s.id}: caption belum ada`);
        else if (e && c.hash !== e.hash) soft(`${s.id}: caption usang, audio sudah berubah (npm run align)`);
        else if (c.coverage < MIN_COVERAGE) soft(`${s.id}: hanya ${(c.coverage * 100).toFixed(0)}% kata naskah terdengar di audio (tidak terdengar: ${c.missing.join(', ')}). Dengarkan; buat ulang VO bila salah ucap.`);
      }
  }
  return issues;
};

// --episode=<id>: periksa satu episode saja (masalah di episode lain tidak ikut menggagalkan episode ini)
const episode = arg('episode');
const files = (existsSync('briefs') ? readdirSync('briefs').filter((f) => f.endsWith('.json') && !f.startsWith('_')) : []).filter((f) => !episode || f === `${episode}.json`);
if (episode && files.length === 0) { console.log(`Brief briefs/${episode}.json tidak ada.`); process.exit(1); }
let errors = 0, warns = 0, checked = 0;
for (const f of files) {
  const issues = await checkBrief(f);
  if (!issues) { console.log(`- ${f}  [arsip] dilewati`); continue; }
  checked++;
  const e = issues.filter((i) => i.level === 'error'), w = issues.filter((i) => i.level === 'warn');
  errors += e.length; warns += w.length;
  console.log(`${e.length ? '✗' : '✓'} ${f}  ${publish ? '[publish]' : '[draft]'}  ${e.length} error, ${w.length} peringatan`);
  for (const i of [...e, ...w]) console.log(`   ${i.level === 'error' ? 'ERROR ' : 'warn  '} ${i.msg}`);
}
// VO CTA bersama: satu rekaman untuk semua episode; tanpa file ini klip CTA memakai audio aslinya.
const ctaFile = `public/${CTA_VO_FILE}`;
if (!existsSync(ctaFile)) { console.log(`✗ VO CTA bersama tidak ada: ${ctaFile}`); errors++; }
else {
  const [sec, L] = [await durationSeconds(ctaFile), await loudness(ctaFile)];
  const bad = [sec > CTA_VO_MAX_SECONDS && `${sec.toFixed(2)} dtk > ${CTA_VO_MAX_SECONDS} dtk`, Math.abs(L.lufs - LUFS_TARGET) > LUFS_TOLERANCE && `loudness ${L.lufs} LUFS`].filter(Boolean);
  console.log(`${bad.length ? '✗' : '✓'} VO CTA bersama ${ctaFile}: ${sec.toFixed(2)} dtk · ${L.lufs} LUFS${bad.length ? ' · ' + bad.join(', ') : ''}`);
  errors += bad.length;
}
console.log(`\nEpisode diperiksa: ${checked}. Total: ${errors} error, ${warns} peringatan.`);
process.exitCode = errors ? 1 : 0;
