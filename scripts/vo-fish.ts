// Voice-over per scene lewat Fish Audio, lalu dinormalisasi ke -14 LUFS (true peak -1,5 dBTP).
//
//   npm run vo -- --brief=briefs/<episode>.json --dry-run      # cek teks, tanpa API/kredit
//   npm run vo -- --brief=briefs/<episode>.json                # buat scene yang belum ada / berubah
//   npm run vo -- --brief=... --scene=s3 --force               # buat ulang satu scene
//
// Kunci di .env: FISH_AUDIO_API_KEY (wajib), FISH_AUDIO_REFERENCE_ID (suara konsisten), FISH_AUDIO_MODEL, FISH_AUDIO_SPEED.
// Hasil: public/<projectId>/vo/<scene>.mp3 + public/<projectId>/manifest.json. API key tidak pernah ditulis ke file.
// Scene dibuat ulang otomatis bila teks/kecepatannya berubah (dideteksi lewat hash di manifest).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, rmSync } from 'node:fs';
import { basename } from 'node:path';
import { arg, flag, loadBrief, paths, textHash, durationSeconds, loudness, run, LUFS_TARGET, TRUE_PEAK } from './lib/episode.ts';

const API_URL = 'https://api.fish.audio/v1/tts';
const apiKey = process.env.FISH_AUDIO_API_KEY;
const referenceId = process.env.FISH_AUDIO_REFERENCE_ID || undefined;
const model = process.env.FISH_AUDIO_MODEL ?? 's2.1-pro-free';
const defaultSpeed = Number(process.env.FISH_AUDIO_SPEED ?? '1.25');
const dryRun = flag('dry-run');
const force = flag('force');
const only = arg('scene');

if (!Number.isFinite(defaultSpeed) || defaultSpeed < 0.5 || defaultSpeed > 2) throw new Error('FISH_AUDIO_SPEED harus 0.5–2.0');
if (!dryRun && !apiKey) throw new Error('FISH_AUDIO_API_KEY belum ada. Salin .env.example menjadi .env lalu isi key-nya.');

const { brief, path: briefPath } = loadBrief();
const P = paths(brief.projectId);
if (only && !brief.scenes.some((s) => s.id === only)) throw new Error(`Scene '${only}' tidak ada di brief.`);

type Entry = { id: string; file: string; text: string; speed: number; hash: string; audioSeconds: number; lufs: number; truePeak: number };
const old: { scenes?: Entry[] } = existsSync(P.manifest) ? JSON.parse(readFileSync(P.manifest, 'utf8')) : {};
const oldById = new Map((old.scenes ?? []).map((e) => [e.id, e]));

const synthesize = async (text: string, speed: number): Promise<Buffer> => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'audio/mpeg', model },
      body: JSON.stringify({ text, format: 'mp3', prosody: { speed }, ...(referenceId ? { reference_id: referenceId } : {}) }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const details = (await res.text()).slice(0, 300);
    if (!(res.status === 429 || res.status >= 500) || attempt === 3) throw new Error(`Fish Audio gagal (HTTP ${res.status}): ${details}`);
    await new Promise((r) => setTimeout(r, attempt * 1500));
  }
  throw new Error('Fish Audio gagal setelah tiga percobaan.');
};

/** Normalisasi loudness dua tahap (ffmpeg loudnorm) ke target LUFS dan true peak. */
const normalize = async (input: string, output: string) => {
  const target = `I=${LUFS_TARGET}:TP=${TRUE_PEAK}:LRA=11`;
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { maxBuffer: 16 * 1024 * 1024 });
  const m = JSON.parse(stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1));
  const second = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  await run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', input, '-af', `${second},aresample=48000`, '-ar', '48000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '192k', output]);
};

/** Cadangan untuk klip pendek: gain dulu, puncak ditahan limiter, lalu loudnorm (linear tidak bisa menaikkan tanpa
 *  melewati batas true peak). */
const normalizeWithLimiter = async (input: string, output: string, extraGainDb: number) => {
  const limit = (10 ** ((TRUE_PEAK - 0.5) / 20)).toFixed(3);
  await run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', input, '-af', `volume=${extraGainDb.toFixed(2)}dB,alimiter=limit=${limit}:level=false,loudnorm=I=${LUFS_TARGET}:TP=${TRUE_PEAK}:LRA=11,aresample=48000`, '-ar', '48000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '192k', output]);
};

if (!dryRun) mkdirSync(P.voDir, { recursive: true });
const entries: Entry[] = [];
let made = 0;
for (const scene of brief.scenes) {
  const speed = scene.voiceoverSpeed ?? defaultSpeed;
  const hash = textHash(scene.voiceoverText, speed);
  const file = P.vo(scene.id);
  const prev = oldById.get(scene.id);
  const upToDate = prev?.hash === hash && existsSync(file);
  const wanted = !only || only === scene.id;

  if (dryRun) {
    console.log(`• ${scene.id} [${speed}x]${upToDate ? ' (sudah ada)' : ''}: ${scene.voiceoverText}`);
    continue;
  }
  if (wanted && (force || !upToDate)) {
    console.log(`→ ${scene.id}: membuat voice-over${prev && prev.hash !== hash ? ' (teks berubah)' : ''}`);
    const raw = `${file}.raw.mp3`;
    writeFileSync(raw, await synthesize(scene.voiceoverText, speed));
    const tmp = `${file}.tmp.mp3`;
    await normalize(raw, tmp);
    const first = await loudness(tmp);
    if (Math.abs(first.lufs - LUFS_TARGET) > 0.3) {
      // klip pendek berpuncak tinggi: kuatkan hasil tahap pertama sebesar selisihnya, tahan puncak dengan limiter
      const second = `${file}.tmp2.mp3`;
      await normalizeWithLimiter(tmp, second, LUFS_TARGET - first.lufs);
      renameSync(second, tmp);
    }
    rmSync(raw);
    renameSync(tmp, file);
    made++;
  } else if (!existsSync(file)) {
    console.log(`! ${scene.id}: audio belum ada (jalankan tanpa --scene)`);
    continue;
  }
  const L = await loudness(file);
  entries.push({ id: scene.id, file: P.voStatic(scene.id), text: scene.voiceoverText, speed, hash, audioSeconds: Number((await durationSeconds(file)).toFixed(3)), lufs: L.lufs, truePeak: L.truePeak });
  console.log(`✓ ${scene.id}: ${entries.at(-1)!.audioSeconds.toFixed(2)} dtk · ${L.lufs} LUFS · TP ${L.truePeak} dBTP`);
}

if (dryRun) console.log('\nDry-run selesai: tidak ada panggilan API.');
else {
  const manifest = { projectId: brief.projectId, sourceBrief: basename(briefPath), provider: 'fish-audio', model, referenceId: referenceId ?? null, loudnessTarget: LUFS_TARGET, generatedAt: new Date().toISOString(), scenes: entries };
  writeFileSync(P.manifest, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n${made} scene dibuat. Manifest: public/${brief.projectId}/manifest.json`);
  if (made) console.log('Caption lama kini usang → jalankan: npm run align -- --brief=' + process.argv.find((a) => a.startsWith('--brief='))?.slice(8));
}
