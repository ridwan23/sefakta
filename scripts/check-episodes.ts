// Pemeriksa kesiapan episode (semua brief yang bukan arsip):
//   • VO ada untuk setiap scene dan sesuai naskah (hash), loudness -14 ±1 LUFS, true peak ≤ -1 dBTP
//   • caption (mode subtitle/keypoint) hasil penyelarasan ada, sesuai audio, cakupan kata ≥ 90%; kata pemicu keypoint terdengar
//   • durasi cerita (dihitung seperti template: max(durasi brief, audio + jeda)) 55–65 dtk
//   • VO CTA bersama (public/brand/cta-vo.mp3) ada, ≤ 3,5 dtk, loudness sesuai target (sekali untuk semua episode)
//   • komposisi terdaftar; visual per scene ada (placeholder = peringatan, error saat --publish)
//
//   npm run check:episodes               # draft: VO/caption/visual belum ada = peringatan
//   npm run check:episodes -- --publish  # siap tayang: semuanya wajib
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { CTA_VO_FILE, CTA_VO_MAX_SECONDS } from '../src/shared/brand/ctaVoice.ts';
import { KEYPOINT_MIN_SECONDS, timeKeypoints } from '../src/shared/episode/keypoints.ts';
import { durationSeconds, flag, paths, textHash, loudness, LUFS_TARGET, LUFS_TOLERANCE, SCENE_PAD_SECONDS } from './lib/episode.ts';

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
  if (story < 55 || story > 65) soft(`durasi cerita ${story.toFixed(1)} dtk di luar 55–65 dtk (tanpa CTA 4 dtk)`);

  // caption
  if ((b.captionMode === 'subtitle' || b.captionMode === 'keypoint') && manifest) {
    const caps = existsSync(P.captions) ? JSON.parse(readFileSync(P.captions, 'utf8')).scenes : null;
    if (!caps) soft('caption belum diselaraskan (npm run align)');
    else
      for (const s of b.scenes) {
        const c = caps[s.id], e = vo.get(s.id);
        if (!c) soft(`${s.id}: caption belum ada`);
        else if (e && c.hash !== e.hash) soft(`${s.id}: caption usang, audio sudah berubah (npm run align)`);
        else if (c.coverage < MIN_COVERAGE) soft(`${s.id}: hanya ${(c.coverage * 100).toFixed(0)}% kata naskah terdengar di audio (tidak terdengar: ${c.missing.join(', ')}). Dengarkan; buat ulang VO bila salah ucap.`);
        else if (b.captionMode === 'keypoint') {
          // poin kunci dipicu waktu kata: kata pemicunya harus benar-benar terdengar, bukan hasil interpolasi
          const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
          for (const k of s.keypoints ?? []) {
            const hit = c.captions.filter((w: { text: string }) => norm(w.text) === norm(k.cue))[k.nth ?? 0];
            if (!hit) soft(`${s.id}: kata pemicu keypoint "${k.cue}" tidak ada di caption`);
            else if (hit.confidence === null) soft(`${s.id}: kata pemicu keypoint "${k.cue}" tidak terdengar (waktunya diinterpolasi); pilih kata lain atau buat ulang VO`);
          }
          // lama tampil tiap keypoint (dihitung seperti di video: frame scene = max(durasi brief, audio + jeda))
          const frames = Math.ceil(Math.max(s.durationSeconds, (e?.audioSeconds ?? 0) + SCENE_PAD_SECONDS) * 30);
          timeKeypoints({ ...s, frames, from: 0, audio: null, captions: c.captions }, 30).forEach((t, i) => {
            const sec = (t.end - t.start) / 30;
            if (sec < KEYPOINT_MIN_SECONDS) soft(`${s.id}: keypoint "${s.keypoints[i].text}" hanya tampil ${sec.toFixed(1)} dtk (min ${KEYPOINT_MIN_SECONDS}); gabungkan dengan keypoint di dekatnya`);
          });
        }
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
