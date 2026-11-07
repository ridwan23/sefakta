// Pemeriksa kesiapan episode (semua brief yang bukan arsip):
//   • VO ada untuk setiap scene dan sesuai naskah (hash), loudness -14 ±1 LUFS, true peak ≤ -1 dBTP
//   • caption (mode subtitle) hasil penyelarasan ada, sesuai audio, dan cakupan kata ≥ 90%
//   • durasi cerita (dihitung seperti template: max(durasi brief, audio + jeda)) 55–65 dtk
//   • VO CTA ada, sesuai kalimat, kecepatan sama dengan narasi, ≤ 3,5 dtk
//   • komposisi terdaftar; visual per scene ada (placeholder = peringatan, error saat --publish)
//
//   npm run check:episodes               # draft: VO/caption/visual belum ada = peringatan
//   npm run check:episodes -- --publish  # siap tayang: semuanya wajib
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { CTA_VO_ID, CTA_VO_MAX_SECONDS, CTA_VO_TEXT } from '../src/shared/brand/ctaVoice.ts';
import { flag, paths, textHash, loudness, LUFS_TARGET, LUFS_TOLERANCE, SCENE_PAD_SECONDS } from './lib/episode.ts';

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

  // VO
  const manifest = existsSync(P.manifest) ? JSON.parse(readFileSync(P.manifest, 'utf8')) : null;
  const vo = new Map<string, { hash: string; audioSeconds: number; speed: number }>((manifest?.scenes ?? []).map((e: { id: string }) => [e.id, e]));
  if (!manifest) soft('VO belum dibuat (npm run vo)');
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
  if (manifest) {
    // VO CTA: suara & kecepatan sama dengan narasi; menggantikan audio asli klip CTA
    const c = manifest.scenes.find((e: { id: string }) => e.id === CTA_VO_ID);
    const text = (b.cta as { voiceoverText?: string } | undefined)?.voiceoverText ?? CTA_VO_TEXT;
    if (!c || !existsSync(P.vo(CTA_VO_ID))) soft('VO CTA belum dibuat; klip CTA memakai audio aslinya (npm run vo)');
    else if (c.text !== text) soft('VO CTA usang, kalimat CTA berubah (npm run vo)');
    else {
      if (c.speed !== vo.get(b.scenes[0].id)?.speed) soft(`VO CTA ${c.speed}x berbeda dengan narasi ${vo.get(b.scenes[0].id)?.speed}x (npm run vo -- --scene=cta --force)`);
      if (c.audioSeconds > CTA_VO_MAX_SECONDS) soft(`VO CTA ${c.audioSeconds.toFixed(2)} dtk > ${CTA_VO_MAX_SECONDS} dtk, terpotong`);
      const L = await loudness(P.vo(CTA_VO_ID));
      if (Math.abs(L.lufs - LUFS_TARGET) > LUFS_TOLERANCE) soft(`cta: loudness ${L.lufs} LUFS (target ${LUFS_TARGET} ±${LUFS_TOLERANCE})`);
    }
  }
  if (story < 55 || story > 65) soft(`durasi cerita ${story.toFixed(1)} dtk di luar 55–65 dtk (tanpa CTA 4 dtk)`);

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

const files = existsSync('briefs') ? readdirSync('briefs').filter((f) => f.endsWith('.json') && !f.startsWith('_')) : [];
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
console.log(`\nEpisode diperiksa: ${checked}. Total: ${errors} error, ${warns} peringatan.`);
process.exitCode = errors ? 1 : 0;
